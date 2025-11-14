import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

/* ------------------------ helpers ------------------------ */

/**
 * Generate a unique ID using Firebase's built-in method
 * This replaces crypto.randomUUID() which is not supported in all environments
 */
function generateId() {
  return doc(collection(db, "_")).id;
}

/**
 * Normalize platform value to lowercase
 */
function normalizePlatform(platform) {
  if (!platform) return "meta";
  const p = String(platform).toLowerCase();

  const platformMap = {
    facebook: "meta",
    fb: "meta",
    meta: "meta",
    newsbreak: "newsbreak",
    nb: "newsbreak",
    snapchat: "snapchat",
    tiktok: "tiktok",
    google: "google",
  };

  return platformMap[p] || p;
}

/**
 * Ensure value is a non-empty string
 */
function normalizeString(value, defaultValue = "") {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  return String(value).trim();
}

/**
 * Validate required fields based on platform
 */
function validateAccountData(data) {
  const errors = [];

  if (!data.platform) errors.push("Platform is required");
  if (!data.accessToken) errors.push("Access Token is required");
  if (!data.accountId) errors.push("Account ID is required");
  if (!data.accountLabel) errors.push("Account Label is required");

  // Facebook-specific validation
  if (normalizePlatform(data.platform) === "meta" && !data.bmName) {
    errors.push("Business Management Name is required for Meta/Facebook");
  }

  return errors;
}


function getCollectionName(platform) {
  const p = normalizePlatform(platform);
  return `${p}__ad_accounts`;
}


export function fromFirestoreDoc(docSnap) {
  if (!docSnap.exists()) return null;

  const d = docSnap.data();

  return {
    id: docSnap.id,
    platform: d.platform || "meta",
    bmName: d.bmName || "",
    accessToken: d.accessToken || "",
    accountId: d.accountId || "",
    accountLabel: d.accountLabel || "",
    status: d.status || "active", // active, inactive, error
    createdAt: d.createdAt || null,
    updatedAt: d.updatedAt || null,
    lastSyncedAt: d.lastSyncedAt || null,
    metadata: d.metadata || {},
  };
}

/**
 * Convert UI payload to Firestore document format
 * Prepares data for saving to Firestore
 */
export function toFirestoreDoc(ui, id) {
  const platform = normalizePlatform(ui.platform);
  const timestamp = new Date().toISOString();

  const baseDoc = {
    id,
    platform,
    accessToken: normalizeString(ui.accessToken),
    accountId: normalizeString(ui.accountId),
    accountLabel: normalizeString(ui.accountLabel),
    status: ui.status || "active",
    updatedAt: timestamp,
  };

  // Add Meta/Facebook-specific fields
  if (platform === "meta") {
    baseDoc.bmName = normalizeString(ui.bmName);
  }

  // Add createdAt only for new documents
  if (!ui.createdAt) {
    baseDoc.createdAt = timestamp;
  } else {
    baseDoc.createdAt = ui.createdAt;
  }

  // Preserve lastSyncedAt if it exists
  if (ui.lastSyncedAt) {
    baseDoc.lastSyncedAt = ui.lastSyncedAt;
  }

  // Add optional metadata
  if (ui.metadata) {
    baseDoc.metadata = ui.metadata;
  }

  return baseDoc;
}

/* ------------------------ Firestore operations ------------------------ */

/**
 * Add or update an account in Firestore
 * @param {Object} uiPayload - Account data from UI form
 * @returns {Promise<string>} - Document ID
 */
export async function addAccount(uiPayload) {
  // Validate data
  const errors = validateAccountData(uiPayload);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  // Generate unique ID using Firebase (fixes crypto.randomUUID error)
  const id = uiPayload.id ?? generateId();
  const colName = getCollectionName(uiPayload.platform);
  const docData = toFirestoreDoc(uiPayload, id);

  console.log("Saving to collection:", colName);
  console.log("Document ID:", id);
  console.log("Document data:", docData);

  await setDoc(doc(db, colName, id), docData, { merge: true });

  return id;
}

/**
 * Update an existing account
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 */
export async function updateAccount(platform, id, updates) {
  const colName = getCollectionName(platform);
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, colName, id), updateData);
}

/**
 * Watch all accounts for a specific platform (real-time updates)
 * @param {string} platform - Platform name
 * @param {Function} callback - Callback function with accounts array
 * @returns {Function} - Unsubscribe function
 */
export function watchAccounts(platform, callback) {
  const colName = getCollectionName(platform);

  return onSnapshot(
    collection(db, colName),
    (snapshot) => {
      const accounts = snapshot.docs
        .map((docSnap) => fromFirestoreDoc(docSnap))
        .filter(Boolean);
      callback(accounts);
    },
    (error) => {
      console.error("Error watching accounts:", error);
      callback([]);
    }
  );
}

/**
 * Watch all accounts across multiple platforms
 * @param {Array<string>} platforms - Array of platform names
 * @param {Function} callback - Callback function with all accounts
 * @returns {Function} - Unsubscribe function
 */
export function watchAllAccounts(platforms, callback) {
  const unsubscribers = [];
  const accountsByPlatform = {};

  platforms.forEach((platform) => {
    const unsub = watchAccounts(platform, (accounts) => {
      accountsByPlatform[platform] = accounts;
      const allAccounts = Object.values(accountsByPlatform).flat();
      callback(allAccounts);
    });

    unsubscribers.push(unsub);
  });

  // Return function that unsubscribes from all
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Get a single account by ID
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} - Account object or null
 */
export async function getAccount(platform, id) {
  const colName = getCollectionName(platform);
  const docRef = doc(db, colName, id);
  const docSnap = await getDoc(docRef);

  return fromFirestoreDoc(docSnap);
}

/**
 * Delete an account
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 */
export async function removeAccount(platform, id) {
  const colName = getCollectionName(platform);
  await deleteDoc(doc(db, colName, id));
}

/**
 * Update account status (active, inactive, error)
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 * @param {string} status - New status value
 */
export async function setAccountStatus(platform, id, status) {
  const colName = getCollectionName(platform);
  await updateDoc(doc(db, colName, id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update last synced timestamp
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 */
export async function updateLastSynced(platform, id) {
  const colName = getCollectionName(platform);
  await updateDoc(doc(db, colName, id), {
    lastSyncedAt: new Date().toISOString(),
  });
}

/**
 * Check if an account ID already exists for a platform
 * @param {string} platform - Platform name
 * @param {string} accountId - Account ID to check
 * @returns {Promise<boolean>} - True if exists
 */
export async function accountExists(platform, accountId) {
  const colName = getCollectionName(platform);
  const q = query(collection(db, colName), where("accountId", "==", accountId));

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Get all accounts for a platform (one-time fetch)
 * @param {string} platform - Platform name
 * @returns {Promise<Array>} - Array of account objects
 */
export async function getAllAccounts(platform) {
  const colName = getCollectionName(platform);
  const snapshot = await getDocs(collection(db, colName));

  return snapshot.docs
    .map((docSnap) => fromFirestoreDoc(docSnap))
    .filter(Boolean);
}

// Export helper functions
export { getCollectionName, normalizePlatform, validateAccountData };
