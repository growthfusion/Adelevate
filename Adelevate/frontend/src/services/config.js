import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

/* ------------------------ helpers ------------------------ */

// Map UI → internal codes
const UI_TO_CODE = {
    "Greater": "gt",
    "Greater or Equal": "gte",
    "Less": "lt",
    "Less or Equal": "lte",
    "Equal to": "eq",
};

// Map words → internal codes
const WORD_TO_CODE = {
    greater: "gt",
    greater_or_equal: "gte",
    less: "lt",
    less_or_equal: "lte",
    equal: "eq",
    equals: "eq",
};

// Map codes → symbols
const CODE_TO_SYMBOL = {
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    eq: "=",
};

function normalizeComparison(cmp) {
    if (!cmp) return "eq";
    const s = String(cmp).toLowerCase();
    if (UI_TO_CODE[cmp]) return UI_TO_CODE[cmp];
    if (WORD_TO_CODE[s]) return WORD_TO_CODE[s];
    if (["gt", "gte", "lt", "lte", "eq"].includes(s)) return s;
    return "eq";
}

function normalizeThreshold(thrLike) {
    if (thrLike === "na" || String(thrLike).toLowerCase() === "na") return "na";
    if (thrLike === "" || thrLike === undefined || thrLike === null) return "";
    const n = Number(thrLike);
    return Number.isFinite(n) ? n : "na";
}

function normalizeUnit(unit) {
    if (!unit || unit === "none") return "";
    return unit;
}

function ensureArray(x) {
    return Array.isArray(x) ? x : (x ? [x] : []);
}

/* ------------------------ collection resolver ------------------------ */

function getCollectionName(platform, type) {
    const p = (platform || "meta").toLowerCase();
    const t = (type || "").toLowerCase();

    if (t.includes("pause")) return `${p}_pause_campaign`;
    if (t.includes("activate")) return `${p}_active_campaign`;
    if (t.includes("budget") || t.includes("change"))
        return `${p}_change_budget_campaign`;

    return `${p}_configs`; // fallback
}

/* ------------------------ Firestore mappers ------------------------ */

/** Normalize a Firestore doc into a UI-friendly object */
export function fromFirestoreDoc(docSnap) {
    const d = docSnap.data() || {};
    const rawConds = Array.isArray(d.condition) ? d.condition : [];

    const readableConditions = rawConds.map((c) => {
        const cmp = normalizeComparison(c.comparison);
        const sym = CODE_TO_SYMBOL[cmp] ?? "=";
        const thr =
            c.threshold === "na"
                ? "na"
                : typeof c.threshold === "number"
                    ? c.threshold
                    : Number(c.threshold || 0);
        const unit = c.unit ? c.unit : "";
        const metric = String(c.metric || "").toUpperCase();
        return `${metric} ${sym} ${thr}${unit}`;
    });

    return {
        id: docSnap.id,
        name: d.name || "",
        type: d.type || "",
        platform: Array.isArray(d.platform) ? d.platform[0] : d.platform, // single for UI
        status: d.status || "Running",

        // normalized conditions array
        condition: rawConds.map((c) => ({
            metric: String(c.metric || "").toLowerCase(),
            comparison: normalizeComparison(c.comparison || c.operator),
            threshold:
                c.threshold === "na" ? "na" : normalizeThreshold(c.threshold ?? c.value),
            type: c.type || "value",
            unit: c.unit || "",
            target: c.target || "",
        })),

        // optional stringified version
        conditions: readableConditions,
        frequency: d.frequency || "",
        campaigns: d.campaigns || [],

        actionType: d.actionType,
        actionValue: d.actionValue,
        actionUnit: d.actionUnit,
        actionTarget: d.actionTarget,
        minBudget: d.minBudget,
        maxBudget: d.maxBudget,
    };
}

/** Convert a UI payload to a Firestore doc */
export function toFirestoreDoc(ui, id) {
    const platformArray = ensureArray(ui.platform);
    const incoming = ui.condition || ui.conditions || [];

    const normalizedCondition = incoming
        .filter((c) => c && c.metric && (c.value ?? c.threshold ?? "") !== "")
        .map((c) => {
            const comparison = normalizeComparison(c.comparison || c.operator);
            const threshold = c.threshold !== undefined ? c.threshold : c.value;
            return {
                type: c.type || "value",
                metric: String(c.metric || "").toLowerCase(),
                comparison,
                threshold: normalizeThreshold(threshold),
                unit: normalizeUnit(c.unit),
                target: c.target || "",
            };
        });

    const base = {
        id,
        name: ui.name || "",
        type: ui.type || "Activate Campaign",
        platform: platformArray.length ? platformArray : ["meta"],
        status: ui.status || "Paused",
        frequency: ui.frequency || "",
        campaigns: (ui.campaigns || []).map(String),
        condition: normalizedCondition,
    };

    // Optional action fields
    if (
        ui.actionType ||
        ui.actionValue !== undefined ||
        ui.minBudget !== undefined ||
        ui.maxBudget !== undefined
    ) {
        base.actionType = ui.actionType || "";
        base.actionValue = ui.actionValue === "" ? "" : Number(ui.actionValue);
        base.actionUnit = ui.actionUnit || "%";
        base.actionTarget = ui.actionTarget || "of Current Budget";
        base.minBudget = ui.minBudget === "" ? "" : Number(ui.minBudget);
        base.maxBudget = ui.maxBudget === "" ? "" : Number(ui.maxBudget);
    }

    return base;
}

/* ------------------------ Firestore ops ------------------------ */

export async function addConfig(uiPayload) {
    const id = uiPayload.id ?? crypto.randomUUID();
    const colName = getCollectionName(uiPayload.platform, uiPayload.type);
    await setDoc(doc(db, colName, id), toFirestoreDoc(uiPayload, id), {
        merge: true,
    });
    return id;
}

export function watchConfigs(platform, type, cb) {
    const colName = getCollectionName(platform, type);
    return onSnapshot(collection(db, colName), (snap) => {
        cb(snap.docs.map((docSnap) => fromFirestoreDoc(docSnap)));
    });
}

export async function removeConfig(platform, type, id) {
    const colName = getCollectionName(platform, type);
    await deleteDoc(doc(db, colName, id));
}

export async function setStatus(platform, type, id, status) {
    const colName = getCollectionName(platform, type);
    await updateDoc(doc(db, colName, id), { status });
}

export { getCollectionName };