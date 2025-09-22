import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const COL = "configs";

/** Normalize a Firestore doc into a UI-friendly object */
export function fromFirestoreDoc(docSnap) {
    const d = docSnap.data() || {};
    return {
        id: docSnap.id,
        name: d.name || "",
        type: d.type || "",
        platform: Array.isArray(d.platform) ? d.platform[0] : d.platform, // single for UI
        status: d.status || "Running",
        // keep both the raw condition and a readable string version (handy if you ever need it)
        condition: (d.condition || []).map((c) => ({
            metric: String(c.metric || "").toLowerCase(),
            comparison: c.comparison || "eq",
            threshold: typeof c.threshold === "number" ? c.threshold : Number(c.threshold || 0),
            type: c.type || "value",
            unit: c.unit || "",
        })),
        conditions: (d.condition || []).map(
            (c) =>
                `${String(c.metric || "").toUpperCase()} ${
                    c.comparison === "gte" ? ">=" : c.comparison === "lte" ? "<=" : "="
                } ${c.threshold}${c.unit ? c.unit : ""}`
        ),
        groups: d.groups || "",
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
    const platformArray = Array.isArray(ui.platform)
        ? ui.platform
        : [ui.platform].filter(Boolean);

    // allow either `ui.condition` (array of objects) or `ui.conditions` (same)
    const incoming = ui.condition || ui.conditions || [];

    const normalizedCondition = incoming
        .filter((c) => c && c.metric && (c.value ?? c.threshold) !== "")
        .map((c) => {
            const op =
                c.comparison ||
                (c.operator === "Greater or Equal"
                    ? "gte"
                    : c.operator === "Less or Equal"
                        ? "lte"
                        : "eq");
            const thr = Number(c.threshold ?? c.value);
            return {
                type: c.type || "value",
                metric: String(c.metric || "").toLowerCase(),
                comparison: op,
                threshold: thr,
                unit: c.unit === "none" ? "" : c.unit || "",
            };
        });

    const base = {
        id,
        name: ui.name || "",
        type: ui.type || "Activate Campaign",
        platform: platformArray.length ? platformArray : ["meta"],
        status: ui.status || "Paused",
        groups: ui.groups || "",
        frequency: ui.frequency || "",
        campaigns: ui.campaigns || [],
        condition: normalizedCondition,
    };

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
