import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const COL = "configs";

/* ------------------------ helpers ------------------------ */

const UI_TO_CODE = {
    "Greater": "gt",
    "Greater or Equal": "gte",
    "Less": "less",
    "Less or Equal": "lte",
    "Equal to": "eq",
};

const WORD_TO_CODE = {
    greater: "gt",
    greater_or_equal: "gte",
    less: "less",
    less_or_equal: "lte",
    equal: "eq",
    equals: "eq",
};

const CODE_TO_SYMBOL = {
    gt: ">",
    gte: ">=",
    less: "<",
    lte: "<=",
    eq: "=",
};

function normalizeComparison(cmp) {
    if (!cmp) return "eq";
    const s = String(cmp).toLowerCase();
    if (UI_TO_CODE[cmp]) return UI_TO_CODE[cmp];
    if (WORD_TO_CODE[s]) return WORD_TO_CODE[s];
    if (["gt", "gte", "less", "lte", "eq"].includes(s)) return s;
    return "eq";
}

function normalizeThreshold(thrLike) {
    if (thrLike === "na" || String(thrLike).toLowerCase() === "na") return "na";
    // allow empty
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

/* --------------------- Firestore mappers --------------------- */

/** Normalize a Firestore doc into a UI-friendly object */
export function fromFirestoreDoc(docSnap) {
    const d = docSnap.data() || {};
    const rawConds = Array.isArray(d.condition) ? d.condition : [];

    const readableConditions = rawConds.map((c) => {
        const cmp = normalizeComparison(c.comparison);
        const sym = CODE_TO_SYMBOL[cmp] ?? "=";
        const thr = c.threshold === "na" ? "na" : (typeof c.threshold === "number" ? c.threshold : Number(c.threshold || 0));
        const unit = c.unit ? c.unit : "";
        const metric = String(c.metric || "").toUpperCase();
        return `${metric} ${sym} ${thr}${unit}`;
    });

    // groups may be saved as d.condition_groups (new) or d.groups (legacy)
    const groups = d.condition_groups || d.groups || "";

    return {
        id: docSnap.id,
        name: d.name || "",
        type: d.type || "",
        platform: Array.isArray(d.platform) ? d.platform[0] : d.platform, // single for UI
        status: d.status || "Running",
        // raw condition objects (normalized)
        condition: rawConds.map((c) => ({
            metric: String(c.metric || "").toLowerCase(),
            comparison: normalizeComparison(c.comparison),
            threshold: c.threshold === "na" ? "na" : normalizeThreshold(c.threshold),
            type: c.type || "value",
            unit: c.unit || "",
            target: c.target || "",
        })),
        // readable strings (handy for quick display)
        conditions: readableConditions,
        groups,
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

    // allow either `ui.condition` or `ui.conditions` (array of objects)
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

    // NEW: accept grouped “percent-of” conditions
    // You can pass either `ui.condition_groups` (preferred) or `ui.groups`
    const incomingGroups = ui.condition_groups || ui.groups || null;
    let normalizedGroups = null;

    if (incomingGroups && typeof incomingGroups === "object") {
        normalizedGroups = {};
        Object.entries(incomingGroups).forEach(([gk, gval]) => {
            if (!gval || typeof gval !== "object") return;

            const left = gval["1"] || gval["left"];
            const right = gval["2"] || gval["right"];
            const meta = gval.meta || {};

            // normalize each side
            const nLeft = left
                ? {
                    comparison: normalizeComparison(left.comparison),
                    metric: String(left.metric || "").toLowerCase(),
                    threshold: normalizeThreshold(left.threshold),
                    type: left.type || "value",
                    unit: normalizeUnit(left.unit),
                }
                : undefined;

            const nRight = right
                ? {
                    comparison: normalizeComparison(right.comparison),
                    metric: String(right.metric || "").toLowerCase(),
                    threshold: normalizeThreshold(right.threshold),
                    type: right.type || "value",
                    unit: normalizeUnit(right.unit),
                }
                : undefined;

            normalizedGroups[gk] = {};
            if (nLeft) normalizedGroups[gk]["1"] = nLeft;
            if (nRight) normalizedGroups[gk]["2"] = nRight;
            if (meta && (meta.percent !== undefined || meta.note)) {
                normalizedGroups[gk].meta = { ...meta, percent: Number(meta.percent ?? meta.pct ?? meta.percent) || Number(meta.percent) === 0 ? Number(meta.percent) : meta.percent };
            }
        });
    }

    const base = {
        id,
        name: ui.name || "",
        type: ui.type || "Activate Campaign",
        platform: platformArray.length ? platformArray : ["meta"],
        status: ui.status || "Paused",
        frequency: ui.frequency || "",
        campaigns: ui.campaigns || [],
        condition: normalizedCondition,
    };

    // save groups in a consistent field (and keep legacy 'groups' for compatibility)
    if (normalizedGroups) {
        base.condition_groups = normalizedGroups;
        base.groups = normalizedGroups; // keep this until all readers are migrated
    } else if (ui.groups) {
        base.groups = ui.groups;
    }

    // Optional rule-action fields (budget rules, etc.)
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

export async function addConfig(uiPayload) {
    const id = uiPayload.id ?? crypto.randomUUID();
    await setDoc(doc(db, COL, id), toFirestoreDoc(uiPayload, id), { merge: true });
    return id;
}

export function watchConfigs(cb) {
    return onSnapshot(collection(db, COL), (snap) => {
        cb(snap.docs.map((docSnap) => fromFirestoreDoc(docSnap)));
    });
}

export async function removeConfig(id) {
    await deleteDoc(doc(db, COL, id));
}

export async function setStatus(id, status) {
    await updateDoc(doc(db, COL, id), { status });
}
