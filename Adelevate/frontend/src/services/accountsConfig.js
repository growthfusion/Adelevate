// src/services/accountsConfig.js
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

/* ------------------------ CONSTANTS ------------------------ */

const PLATFORMS = ["meta", "newsbreak", "snapchat", "tiktok", "google"];

/* ------------------------ HELPERS ------------------------ */

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
    snapchat: "snap",
    snap: "snap",
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

/**
 * Get collection name for a platform
 */
function getCollectionName(platform) {
  const p = normalizePlatform(platform);
  return `${p}_ad_account`;
}

/**
 * Convert Firestore document to UI object
 */
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
    status: d.status || "active",
    createdAt: d.createdAt || null,
    updatedAt: d.updatedAt || null,
    lastSync: d.lastSyncedAt || d.lastSync || null,
    lastSyncedAt: d.lastSyncedAt || d.lastSync || null,
    metadata: d.metadata || {},
  };
}

/**
 * Convert UI payload to Firestore document format
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
  if (ui.lastSyncedAt || ui.lastSync) {
    baseDoc.lastSyncedAt = ui.lastSyncedAt || ui.lastSync;
  }

  // Add optional metadata
  if (ui.metadata) {
    baseDoc.metadata = ui.metadata;
  }

  return baseDoc;
}

/* ------------------------ FIRESTORE OPERATIONS ------------------------ */

/**
 * Add or update an account in Firestore
 * @param {Object} uiPayload - Account data from UI form
 * @returns {Promise<string>} - Document ID
 */
export async function addAccount(uiPayload) {
  try {
    // Validate data
    const errors = validateAccountData(uiPayload);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // Generate unique ID using Firebase
    const id = uiPayload.id ?? generateId();
    const colName = getCollectionName(uiPayload.platform);
    const docData = toFirestoreDoc(uiPayload, id);

    console.log("✅ Saving to collection:", colName);
    console.log("✅ Document ID:", id);
    console.log("✅ Document data:", docData);

    await setDoc(doc(db, colName, id), docData, { merge: true });

    return id;
  } catch (error) {
    console.error("❌ Error adding account:", error);
    throw error;
  }
}

/**
 * Update an existing account (by account ID from the data object)
 * @param {string} accountId - Document/Firestore ID
 * @param {Object} updates - Fields to update
 */
export async function updateAccount(accountId, updates) {
  try {
    // If updates contain the full account object, extract platform
    const platform = updates.platform;

    if (!platform) {
      throw new Error("Platform is required to update account");
    }

    const colName = getCollectionName(platform);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Remove id from updates to avoid overwriting
    delete updateData.id;

    console.log("✅ Updating account:", accountId);
    console.log("✅ Collection:", colName);
    console.log("✅ Update data:", updateData);

    await updateDoc(doc(db, colName, accountId), updateData);
  } catch (error) {
    console.error("❌ Error updating account:", error);
    throw error;
  }
}

/**
 * Delete an account
 * @param {string} accountId - Document/Firestore ID (can also accept platform if needed)
 */
export async function deleteAccount(accountId) {
  try {
    // Try to find and delete from all platform collections
    let deleted = false;

    for (const platform of PLATFORMS) {
      const colName = getCollectionName(platform);
      const docRef = doc(db, colName, accountId);

      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await deleteDoc(docRef);
          console.log("✅ Deleted account from:", colName);
          deleted = true;
          break;
        }
      } catch (err) {
        // Continue to next platform
        console.log(`Account not found in ${colName}`);
      }
    }

    if (!deleted) {
      throw new Error("Account not found in any platform collection");
    }
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    throw error;
  }
}

/**
 * Get all accounts across ALL platforms (unified)
 * @returns {Promise<Array>} - Array of all account objects
 */
export async function getAllAccounts() {
  try {
    const allAccounts = [];

    // Fetch from all platform collections
    for (const platform of PLATFORMS) {
      const colName = getCollectionName(platform);

      try {
        const snapshot = await getDocs(collection(db, colName));
        const accounts = snapshot.docs
          .map((docSnap) => fromFirestoreDoc(docSnap))
          .filter(Boolean);

        allAccounts.push(...accounts);
        console.log(`✅ Loaded ${accounts.length} accounts from ${colName}`);
      } catch (err) {
        console.warn(`⚠️ Could not fetch from ${colName}:`, err.message);
        // Continue with other platforms
      }
    }

    // Sort by createdAt (newest first)
    allAccounts.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    console.log(`✅ Total accounts loaded: ${allAccounts.length}`);
    return allAccounts;
  } catch (error) {
    console.error("❌ Error getting all accounts:", error);
    throw error;
  }
}

/**
 * Get all accounts for a specific platform
 * @param {string} platform - Platform name
 * @returns {Promise<Array>} - Array of account objects
 */
export async function getAccountsByPlatform(platform) {
  try {
    const colName = getCollectionName(platform);
    const snapshot = await getDocs(collection(db, colName));

    const accounts = snapshot.docs
      .map((docSnap) => fromFirestoreDoc(docSnap))
      .filter(Boolean);

    console.log(`✅ Loaded ${accounts.length} accounts from ${platform}`);
    return accounts;
  } catch (error) {
    console.error(`❌ Error getting accounts for ${platform}:`, error);
    throw error;
  }
}

/**
 * Get a single account by ID
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} - Account object or null
 */
export async function getAccount(platform, id) {
  try {
    const colName = getCollectionName(platform);
    const docRef = doc(db, colName, id);
    const docSnap = await getDoc(docRef);

    return fromFirestoreDoc(docSnap);
  } catch (error) {
    console.error("❌ Error getting account:", error);
    throw error;
  }
}

/**
 * Delete an account (alternative version with platform parameter)
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 */
export async function removeAccount(platform, id) {
  try {
    const colName = getCollectionName(platform);
    await deleteDoc(doc(db, colName, id));
    console.log(`✅ Deleted account ${id} from ${platform}`);
  } catch (error) {
    console.error("❌ Error removing account:", error);
    throw error;
  }
}

/**
 * Update account status (active, inactive, error)
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 * @param {string} status - New status value
 */
export async function setAccountStatus(platform, id, status) {
  try {
    const colName = getCollectionName(platform);
    await updateDoc(doc(db, colName, id), {
      status,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Updated status for ${id} to ${status}`);
  } catch (error) {
    console.error("❌ Error updating status:", error);
    throw error;
  }
}

/**
 * Update last synced timestamp
 * @param {string} platform - Platform name
 * @param {string} id - Document ID
 */
export async function updateLastSynced(platform, id) {
  try {
    const colName = getCollectionName(platform);
    await updateDoc(doc(db, colName, id), {
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Updated last synced for ${id}`);
  } catch (error) {
    console.error("❌ Error updating last synced:", error);
    throw error;
  }
}

/**
 * Check if an account ID already exists for a platform
 * @param {string} platform - Platform name
 * @param {string} accountId - Account ID to check
 * @returns {Promise<boolean>} - True if exists
 */
export async function accountExists(platform, accountId) {
  try {
    const colName = getCollectionName(platform);
    const q = query(
      collection(db, colName),
      where("accountId", "==", accountId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("❌ Error checking account existence:", error);
    throw error;
  }
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
      console.error("❌ Error watching accounts:", error);
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
 * Batch delete multiple accounts
 * @param {Array<{platform: string, id: string}>} accounts - Array of account objects
 */
export async function batchDeleteAccounts(accounts) {
  try {
    const deletePromises = accounts.map((account) =>
      removeAccount(account.platform, account.id)
    );

    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${accounts.length} accounts`);
  } catch (error) {
    console.error("❌ Error batch deleting accounts:", error);
    throw error;
  }
}

/**
 * Search accounts across all platforms
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Matching accounts
 */
export async function searchAccounts(searchTerm) {
  try {
    const allAccounts = await getAllAccounts();
    const term = searchTerm.toLowerCase();

    return allAccounts.filter(
      (account) =>
        account.accountLabel?.toLowerCase().includes(term) ||
        account.accountId?.toLowerCase().includes(term) ||
        account.bmName?.toLowerCase().includes(term) ||
        account.platform?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error("❌ Error searching accounts:", error);
    throw error;
  }
}

// Export helper functions
export {
  getCollectionName,
  normalizePlatform,
  validateAccountData,
  generateId,
  PLATFORMS,
};

// Default export with all functions
export default {
  addAccount,
  updateAccount,
  deleteAccount,
  getAllAccounts,
  getAccountsByPlatform,
  getAccount,
  removeAccount,
  setAccountStatus,
  updateLastSynced,
  accountExists,
  watchAccounts,
  watchAllAccounts,
  batchDeleteAccounts,
  searchAccounts,
  normalizePlatform,
  validateAccountData,
};
