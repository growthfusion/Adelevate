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

// normalize AND/OR joiner; first row is always "If"
function normalizeLogic(val, index) {
    if (index === 0) return "If";
    const s = String(val || "AND").toUpperCase();
    return s === "OR" ? "OR" : "AND";
}

/* ------------------------ collection resolver ------------------------ */

function getCollectionName(platform, type) {
    const p = (platform || "meta").toLowerCase();
    const t = (type || "").toLowerCase();

    if (t.includes("pause")) return `${p}_pause_campaign`;
    if (t.includes("activate")) return `${p}_active_campaign`;
    if (t.includes("budget") || t.includes("change"))
        return `${p}_change_budget_campaign`;
    if (t.includes("exclusion")) return `${p}_exclusion_campaign`;

    return `${p}_configs`; // fallback
}

/* ------------------------ Firestore mappers ------------------------ */

/** Normalize a Firestore doc into a UI-friendly object */
export function fromFirestoreDoc(docSnap) {
    const d = docSnap.data() || {};
    const rawConds = Array.isArray(d.condition) ? d.condition : [];

    const schedule = d.schedule ?? null;
    const lookback = d.lookback ?? null;

    const readableConditions = rawConds.map((c, i) => {
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

        // 🆕 include joiner text (skip "If" word if you prefer)
        const joinTxt = i === 0 ? "IF " : normalizeLogic(c.logic || c.join, i) + " ";
        return `${metric} ${sym} ${thr}${unit}`;
    });

    return {
        id: docSnap.id,
        name: d.name || "",
        type: d.type || "",
        platform: Array.isArray(d.platform) ? d.platform[0] : d.platform, // single for UI
        status: d.status || "Running",

        // normalized conditions array
        condition: rawConds.map((c, i) => ({
            logic: normalizeLogic(c.logic || c.join, i),
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
        schedule,
        lookback,
        campaigns: d.campaigns || [],

        actionType: d.actionType ?? null,
        actionValue: d.actionValue ?? null,
        actionUnit: d.actionUnit ?? null,
        actionTarget: d.actionTarget ?? null,
        minBudget: d.minBudget ?? null,
        maxBudget: d.maxBudget ?? null,
    };
}

/** Convert a UI payload to a Firestore doc */
export function toFirestoreDoc(ui, id) {
    const platformArray = ensureArray(ui.platform);
    const incoming = ui.condition || ui.conditions || [];

    const normalizedCondition = incoming
        .filter((c) => c && c.metric && (c.value ?? c.threshold ?? "") !== "")
        .map((c, i) => {
            const comparison = normalizeComparison(c.comparison || c.operator);
            const threshold = c.threshold !== undefined ? c.threshold : c.value;
            const logic = normalizeLogic(c.logic, i);

            return {
                logic,
                type: c.type || "value",
                metric: String(c.metric || "").toLowerCase(),
                comparison,
                threshold: normalizeThreshold(threshold),
                unit: normalizeUnit(c.unit),
                target: c.target || "",
            };
        });

    const isExclusion = /exclusion/i.test(ui.type || "");

    if (isExclusion) {
        // 🔵 CHANGE: Return a minimal document for Exclusion Campaigns
        return {
            id,
            name: ui.name || "",
            type: "Exclusion Campaign",
            platform: platformArray.length ? platformArray : ["meta"],
            status: ui.status || "Running",
            frequency: ui.frequency || "",
            campaigns: (ui.campaigns || []).map(String),
            condition: normalizedCondition,

            // Explicitly null out unrelated fields so downstream code won't assume them
            schedule: null,
            lookback: null,
            actionType: null,
            actionValue: null,
            actionUnit: null,
            actionTarget: null,
            minBudget: null,
            maxBudget: null,
        };
    }

    const base = {
        id,
        name: ui.name || "",
        type: ui.type || "Activate Campaign",
        platform: platformArray.length ? platformArray : ["meta"],
        status: ui.status || "Paused",
        frequency: ui.frequency || "",

        // === ADDED: schedule & root lookback
        lookback: ui.lookback ? {
            period: ui.lookback.period || "",
            start: ui.lookback.start || "",
            end: ui.lookback.end || "",
            display: ui.lookback.display || "",
        } : undefined,

        schedule: ui.schedule ? {
            mode: ui.schedule.mode,
            preset: ui.schedule.preset || "",
            timezone: ui.schedule.timezone || "UTC",
            time: ui.schedule.time || "",
            frequency: ui.schedule.frequency || "",
            days: ui.schedule.days || [],
            cron: ui.schedule.cron || "",
            rrule: ui.schedule.rrule || "",
            summary: ui.schedule.summary || "",
        } : undefined,

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