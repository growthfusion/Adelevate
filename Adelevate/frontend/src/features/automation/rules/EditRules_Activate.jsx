import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel,
    SelectSeparator,
    SelectGroup,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Search as SearchIcon, ChevronDown } from "lucide-react";
import Search from "@/components/search-bar";

// Icons
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Firestore
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { addConfig } from "@/services/config.js"; // ⬅️ no getCollectionName here

/* ---------- helpers ---------- */
const PLATFORM_OPTIONS = [
    { value: "meta", label: "Meta", icon: metaIcon },
    { value: "snap", label: "Snap", icon: snapchatIcon },
    { value: "tiktok", label: "TikTok", icon: tiktokIcon },
    { value: "google", label: "Google", icon: googleIcon },
    { value: "newsbreak", label: "News Break", icon: nbIcon },
];

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const BULK_ACTIVE = "All_Active_Campaigns";
const BULK_PAUSED = "All_Pause_Campaigns";

function parseIncomingCondition(raw, index) {
    const base = {
        id: index + 1,
        logic: index === 0 ? "If" : "And",
        metric: "",
        operator: "",
        value: "",
        unit: "none",
        target: "",
    };
    if (!raw) return base;
    // object form
    if (typeof raw === "object" && (raw.metric || raw.comparison || raw.operator)) {
        const op =
            raw.operator ||
            (raw.comparison === "gte"
                ? "Greater or Equal"
                : raw.comparison === "lte"
                    ? "Less or Equal"
                    : raw.comparison === "gt"
                        ? "Greater"
                        : raw.comparison === "lt"
                            ? "Less"
                            : "Equal to");
        return {
            ...base,
            metric: String(raw.metric || "").toLowerCase(),
            operator: op,
            value: raw.value ?? raw.threshold ?? "",
            unit: raw.unit || "none",
            target: raw.target || "",
        };
    }
    // string form e.g. "CTR <= 2%"
    if (typeof raw === "string") {
        const s = raw.trim();
        const metric = (s.split(" ")[0] || "").toLowerCase();
        let operator = "Equal to";
        if (s.includes(">=")) operator = "Greater or Equal";
        else if (s.includes("<=")) operator = "Less or Equal";
        else if (s.includes(">")) operator = "Greater";
        else if (s.includes("<")) operator = "Less";
        const valueToken = s.split(" ").pop() || "";
        const hasPct = valueToken.includes("%");
        return { ...base, metric, operator, value: valueToken.replace("%", ""), unit: hasPct ? "%" : "none" };
    }
    return base;
}

const TRACKER_METRICS = [
    { value: "impressions", label: "Impressions" },
    { value: "clicks", label: "Clicks" },
    { value: "ctr", label: "CTR" },
    { value: "conversions", label: "Conversions" },
    { value: "roi", label: "ROI" },
    { value: "roas", label: "ROAS" },
    { value: "cpr", label: "CPR" },
    { value: "epc", label: "EPC" },
    { value: "lpcpc", label: "LPCPC" },
    { value: "cost", label: "COST" },
    { value: "revenue", label: "REVENUE" },
    { value: "profit", label: "PROFIT" },
];

const ALL_METRICS = [
    { value: "days_since_creation", label: "Days since creation" },
    { value: "days_since_started", label: "Days since started" },
    { value: "days_until_end", label: "Days until end" },
    { value: "created_date", label: "Created Date" },
    { value: "start_date", label: "Start Date" },
    { value: "end_date", label: "End Date" },
    { value: "tags", label: "Tags" },
    { value: "campaign_status", label: "Campaign Status" },
    { value: "budget", label: "Budget" },
    ...TRACKER_METRICS,
    { value: "fb_engagement", label: "Engagement" },
    { value: "fb_reach", label: "Reach" },
    { value: "fb_impressions", label: "Impressions (FB)" },
];

function getCampaignIcon(campaignId, platform) {
    const id = String(campaignId || "");
    // Bulk tokens: icon follows the *currently* selected platform
    if (id === BULK_ACTIVE || id === BULK_PAUSED) {
        return platform === "meta" ? metaIcon : snapchatIcon;
    }
    if (id.startsWith("fb_")) return metaIcon;
    if (id.startsWith("snap_")) return snapchatIcon;
    if (id.startsWith("tiktok_")) return tiktokIcon;
    if (id.startsWith("google_") || id.startsWith("ggl_")) return googleIcon;
    if (id.startsWith("nb_")) return nbIcon;
    // Fallback respects platform
    return platform === "meta" ? metaIcon : platform === "snap" ? snapchatIcon : snapchatIcon;
}

/* ---------- component ---------- */
export default function EditRuleFormActivate() {
    const navigate = useNavigate();
    const location = useLocation();

    // Expect { id, colName } in state when editing
    const ruleId = location.state?.id || null;
    const colName = location.state?.colName || null;

    // UI state
    const [ruleName, setRuleName] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [scheduleInterval, setScheduleInterval] = useState("");
    const [conditions, setConditions] = useState([
        { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" },
    ]);

    const [campaigns, setCampaigns] = useState([]);
    const [catalog, setCatalog] = useState({ snap: null, meta:null }); // { snap: { accounts: {...}, total_campaigns, fetched_at } }
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [catalogError, setCatalogError] = useState("");

    // campaigns search dropdowns
    const searchInputRef = useRef(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [campaignSearchTerm, setCampaignSearchTerm] = useState("");

    // Add-campaigns dropdown (multi-select)
    const campaignDropdownRef = useRef(null);
    const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
    const [searchCampaign, setSearchCampaign] = useState("");
    const [selectedCampaignOptions, setSelectedCampaignOptions] = useState([]);

    // fetch live Snapchat campaigns from /api/campaigns on mount
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                setLoadingCatalog(true);
                setCatalogError("");
                const [snapRes, metaRes] = await Promise.all([
                    fetch(`${API_BASE}/api/campaigns?platform=snap`, { cache: "no-store" }),
                    fetch(`${API_BASE}/api/campaigns?platform=meta`, { cache: "no-store" }),
                ]);
                const [snapJson, metaJson] = await Promise.all([snapRes.json(), metaRes.json()]);
                if (!snapRes.ok) throw new Error(snapJson?.error || "Failed to load Snap campaigns");
                if (!metaRes.ok) throw new Error(metaJson?.error || "Failed to load Meta campaigns");
                if (!isMounted) return;
                // Shapes:
                // Snap: { accounts:{[acctId]:{account_name, campaigns:[...] }}, ... }
                // Meta: { business_managers:{ [bmName]: { accounts:{ [actId]:{ account_name, label, campaigns:[...] } } } }, ... }
                setCatalog({ snap: snapJson, meta: metaJson });
            } catch (e) {
                if (isMounted) setCatalogError(String(e?.message || e));
            } finally {
                if (isMounted) setLoadingCatalog(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    // flatten helpers from catalog
    const snapCampaignList = useMemo(() => {
        const snap = catalog.snap;
        if (!snap?.accounts) return [];
        const rows = [];
        Object.entries(snap.accounts).forEach(([acctId, group]) => {
            (group?.campaigns || []).forEach((c) => {
                rows.push({
                    id: c.id,
                    name: c.name || c.id,
                    status: (c.status || "").toUpperCase(),
                    accountId: acctId,
                    accountName: group?.account_name || acctId,
                    icon: snapchatIcon,
                });
            });
        });
        return rows;
    }, [catalog]);

    // Meta (BM → accounts → campaigns)
    const metaCampaignList = useMemo(() => {
        const meta = catalog.meta;
        if (!meta?.business_managers) return [];
        const rows = [];
        Object.entries(meta.business_managers).forEach(([bmName, bmObj]) => {
            const accounts = bmObj?.accounts || {};
            Object.entries(accounts).forEach(([actId, accObj]) => {
                (accObj?.campaigns || []).forEach((c) => {
                    rows.push({
                        id: c.id, // raw campaign id from Meta
                        name: c.name || c.id,
                        status: (c.status || "").toUpperCase(),
                        accountId: actId,
                        accountName: accObj?.account_name || actId,
                        bmName,
                        icon: metaIcon,
                    });
                });
            });
        });
        return rows;
    }, [catalog]);

    // derive a general list by platform (for future Meta)
    const campaignsByPlatform = useMemo(() => {
        return {
            snap: snapCampaignList,
            meta: metaCampaignList,
        };
    }, [snapCampaignList, metaCampaignList]);

    // searchable list uses live data
    const filteredCampaigns = useMemo(() => {
        if (!selectedPlatform) return [];
        const list = campaignsByPlatform[selectedPlatform] || [];
        if (!campaignSearchTerm) return list;
        return list.filter((c) => (c.name || "").toLowerCase().includes(campaignSearchTerm.toLowerCase()));
    }, [selectedPlatform, campaignSearchTerm, campaignsByPlatform]);

    function formatCampaignName(_platform, storedValue) {
        if (storedValue === BULK_ACTIVE || storedValue === BULK_PAUSED) return storedValue;
        const s = String(storedValue ?? "");
        const firstBar = s.indexOf("|");
        if (firstBar >= 0) {
            // keep EVERYTHING after the first pipe so names with additional pipes render fully
            return s.slice(firstBar + 1).trim();
        }
        return s;
    }

    function toPlainCampaignName(value) {
        const s = String(value ?? "");
        if (s === BULK_ACTIVE || s === BULK_PAUSED) return s; // keep bulk tokens
        const firstBar = s.indexOf("|");
        return firstBar >= 0 ? s.slice(firstBar + 1).trim() : s;
    }

    // dynamic "Add Active / Add Paused" from live data
    function getCampaignOptionsByPlatform(selectedPlatform) {
        if (!selectedPlatform) return [];
        const list = campaignsByPlatform[selectedPlatform] || [];
        const activeCount = list.filter((c) => c.status === "ACTIVE").length;
        const pausedCount = list.filter((c) => c.status === "PAUSED").length;
        const platformIcon = selectedPlatform === "meta" ? metaIcon : snapchatIcon;

        return [
            { id: BULK_ACTIVE, name: `Add Active (${activeCount})`, icon: platformIcon, status: "active" },
            { id: BULK_PAUSED, name: `Add Paused (${pausedCount})`, icon: platformIcon, status: "paused" },
        ];
    }

    // Load from Firestore when editing
    useEffect(() => {
        if (!ruleId || !colName) return;
        const ref = doc(db, colName, ruleId);
        const unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) return;
            const d = snap.data();
            const platform = (Array.isArray(d.platform) ? d.platform[0] : d.platform) || "meta";
            setSelectedPlatform(platform);
            setRuleName(d.name || "");
            setScheduleInterval(d.frequency || "");
            setCampaigns(d.campaigns || []);
            const raw = Array.isArray(d.condition) ? d.condition : [];
            const rows =
                raw.length > 0
                    ? raw.map((c, i) => ({ ...parseIncomingCondition(c, i), id: i + 1, logic: i === 0 ? "If" : "And" }))
                    : [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }];
            setConditions(rows);
        });
        return () => unsub();
    }, [ruleId, colName]);

    // close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (searchInputRef.current && !searchInputRef.current.contains(e.target)) setIsSearchOpen(false);
            if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target)) setShowCampaignDropdown(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ----- conditions CRUD ----- */
    const addCondition = () => {
        setConditions((prev) => [
            ...prev,
            { id: prev.length + 1, logic: "And", metric: "", operator: "", value: "", unit: "none", target: "" },
        ]);
    };
    const removeCondition = (id) => {
        setConditions((prev) => {
            if (prev.length <= 1) {
                return [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }];
            }
            return prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, id: i + 1, logic: i === 0 ? "If" : "And" }));
        });
    };

    /* ----- campaigns (search) ----- */
    const handleCampaignSelect = (campaign) => {
        const cleanName = campaign.name || campaign.id;
        const token =
            selectedPlatform === "meta"
                ? `fb_${campaign.id}|${cleanName}`
                : selectedPlatform === "snap"
                    ? `snap_${campaign.id}|${cleanName}`
                    : cleanName;
        setCampaigns((prev) => {
            const displayName = toPlainCampaignName(token);
            const already = prev.some((v) => toPlainCampaignName(v) === displayName);
            return already ? prev : [...prev, token];
        });
        setIsSearchOpen(false);
        setCampaignSearchTerm("");
    };

    const handleAddSelectedCampaigns = () => {
        const tokensToAdd = new Set();
        selectedCampaignOptions.forEach((optId) => {
            if (optId === BULK_ACTIVE) tokensToAdd.add(BULK_ACTIVE);
            if (optId === BULK_PAUSED) tokensToAdd.add(BULK_PAUSED);
        });
        setCampaigns((prev) => {
            const next = new Set(prev);
            tokensToAdd.forEach((token) => next.add(token));
            return Array.from(next);
        });
        setSelectedCampaignOptions([]);
        setShowCampaignDropdown(false);
    };

    const handleCampaignOptionChange = (optionId, checked) => {
        setSelectedCampaignOptions((prev) => (checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)));
    };
    const clearCampaignSelection = () => setSelectedCampaignOptions([]);

    const removeCampaign = (index) => setCampaigns((prev) => prev.filter((_, i) => i !== index));

    /* ----- Save ----- */
    const handleSave = async () => {
        const campaignsToPersist = campaigns.map(toPlainCampaignName);

        const uiPayload = {
            id: ruleId || crypto.randomUUID(),
            name: ruleName || "Unnamed Active Campaign",
            status: "Running",
            type: "Activate Campaign",
            platform: selectedPlatform || "meta",
            frequency: scheduleInterval,
            campaigns: campaignsToPersist,
            conditions: conditions.map((c) => ({
                metric: c.metric,
                operator: c.operator,
                value: c.value,
                unit: c.unit,
                type: "value",
                target: c.target || "",
            })),
        };
        try {
            await addConfig(uiPayload); // service decides collection
            navigate("/rules");
        } catch (e) {
            alert(`Error saving: ${e.message}`);
        }
    };

    return (
        <>
            <Search />
            <div className="bg-gray-50">
                <div className="max-w-6xl xl:mx-auto 2xl:mx-auto p-[20px] pt-[60px] bg-gray-50">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-blue-600 mb-4 pt-5">
                            {ruleId ? "Edit Rule" : "Create New Rule"}
                        </h1>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                                1
                            </div>
                            <div>
                                <span className="text-lg font-medium text-gray-900">Rule: </span>
                                <span className="text-lg text-gray-600 font-medium">Activate Campaign</span>
                            </div>
                        </div>
                        {/* Rule Section */}
                        <div className="border border-gray-200 rounded-lg p-6 bg-white mb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="rule-name" className="text-sm font-medium text-gray-700">
                                        Rule Name
                                    </Label>
                                    <Input
                                        id="rule-name"
                                        value={ruleName}
                                        onChange={(e) => setRuleName(e.target.value)}
                                        className="w-full"
                                        placeholder=""
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="platform" className="text-sm font-medium text-gray-700">
                                        Platform
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select Platform..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PLATFORM_OPTIONS.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        <div className="flex items-center gap-2">
                                                            <img src={p.icon} alt="" className="w-4 h-4" />
                                                            <span>{p.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-6">
                            <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                                2
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rule Conditions</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                            <div className="space-y-6">
                                {conditions.map((condition, index) => (
                                    <div key={condition.id} className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600 w-full sm:w-12 mb-2 sm:mb-0">
                                          {condition.logic}
                                        </span>
                                        <div className="flex flex-col sm:flex-row w-full gap-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 w-full items-center">
                                                {/* Metric */}
                                                <Select
                                                    value={condition.metric}
                                                    onValueChange={(value) => {
                                                        const next = [...conditions];
                                                        next[index].metric = value;
                                                        setConditions(next);
                                                    }}
                                                    className="sm:col-span-2"
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Metric" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Traffic Source Metrics</SelectLabel>
                                                            <SelectItem value="days_since_creation">Days since creation</SelectItem>
                                                            <SelectItem value="days_since_started">Days since started</SelectItem>
                                                            <SelectItem value="days_until_end">Days until end</SelectItem>
                                                            <SelectItem value="created_date">Created Date</SelectItem>
                                                            <SelectItem value="start_date">Start Date</SelectItem>
                                                            <SelectItem value="end_date">End Date</SelectItem>
                                                            <SelectItem value="tags">Tags</SelectItem>
                                                            <SelectItem value="campaign_status">Campaign Status</SelectItem>
                                                            <SelectItem value="budget">Budget</SelectItem>
                                                        </SelectGroup>
                                                        <SelectSeparator />
                                                        <SelectGroup>
                                                            <SelectLabel>Tracker Metrics</SelectLabel>
                                                            <SelectItem value="impressions">Impressions</SelectItem>
                                                            <SelectItem value="clicks">Clicks</SelectItem>
                                                            <SelectItem value="ctr">CTR</SelectItem>
                                                            <SelectItem value="conversions">Conversions</SelectItem>
                                                            <SelectItem value="roi">ROI</SelectItem>
                                                            <SelectItem value="roas">ROAS</SelectItem>
                                                            <SelectItem value="cpr">CPR</SelectItem>
                                                            <SelectItem value="lpcpc">LPCPC</SelectItem>
                                                            <SelectItem value="epc">EPC</SelectItem>
                                                            <SelectItem value="spend">COST</SelectItem>
                                                            <SelectItem value="revenue">REVENUE</SelectItem>
                                                            <SelectItem value="profit">PROFIT</SelectItem>
                                                        </SelectGroup>
                                                        <SelectSeparator />
                                                        <SelectGroup>
                                                            <SelectLabel>Facebook Metrics</SelectLabel>
                                                            <SelectItem value="fb_engagement">Engagement</SelectItem>
                                                            <SelectItem value="fb_reach">Reach</SelectItem>
                                                            <SelectItem value="fb_impressions">Impressions</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {/* 'is' */}
                                                <div className="flex items-center justify-center">
                                                    <span className="text-sm text-gray-600">is</span>
                                                </div>
                                                {/* Operator */}
                                                <Select
                                                    value={condition.operator}
                                                    onValueChange={(value) => {
                                                        const next = [...conditions];
                                                        next[index].operator = value;
                                                        setConditions(next);
                                                    }}
                                                    className="sm:col-span-1"
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Operator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Greater">Greater</SelectItem>
                                                        <SelectItem value="Greater or Equal">Greater or Equal</SelectItem>
                                                        <SelectItem value="Less">Less</SelectItem>
                                                        <SelectItem value="Less or Equal">Less or Equal</SelectItem>
                                                        <SelectItem value="Equal to">Equal to</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {/* 'than' */}
                                                <div className="flex items-center justify-center">
                                                    <span className="text-sm text-gray-600">than</span>
                                                </div>
                                                {/* value + unit (+ optional target when %) */}
                                                <div className="flex items-center gap-2 sm:col-span-2">
                                                    <Input
                                                        value={condition.value}
                                                        onChange={(e) => {
                                                            const next = [...conditions];
                                                            next[index].value = e.target.value;
                                                            setConditions(next);
                                                        }}
                                                        className="w-full"
                                                        placeholder=""
                                                    />
                                                    <Select
                                                        value={condition.unit}
                                                        onValueChange={(value) => {
                                                            const next = [...conditions];
                                                            next[index].unit = value;
                                                            if (value !== "%") next[index].target = "";
                                                            setConditions(next);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-16">
                                                            <SelectValue placeholder="%" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">—</SelectItem>
                                                            <SelectItem value="%">%</SelectItem>
                                                            <SelectItem value="$">$</SelectItem>
                                                            <SelectItem value="days">days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {condition.unit === "%" && (
                                                        <>
                                                            <span className="text-sm text-gray-600">of</span>
                                                            <Select
                                                                value={condition.target}
                                                                onValueChange={(value) => {
                                                                    const next = [...conditions];
                                                                    next[index].target = value;
                                                                    setConditions(next);
                                                                }}
                                                            >
                                                                <SelectTrigger className="w-56">
                                                                    <SelectValue placeholder="Select Option" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Metrics</SelectLabel>
                                                                        {ALL_METRICS.map((m) => (
                                                                            <SelectItem key={m.value} value={m.value}>
                                                                                {m.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </>
                                                    )}
                                                </div>
                                                {condition.unit === "%" && !condition.target && (
                                                    <div className="sm:col-span-6 mt-1">
                                                        <p className="text-[12px] text-red-500">
                                                            Type is not valid. Please choose the target metric for “% of”.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* delete row */}
                                            <div className="flex justify-end mt-3 sm:mt-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`text-gray-400 p-1 hover:bg-gray-200 ${conditions.length <= 1 ? "opacity-50" : ""}`}
                                                    onClick={() => removeCondition(condition.id)}
                                                    disabled={conditions.length <= 1}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 bg-transparent border-gray-300 w-full sm:w-auto"
                                    onClick={addCondition}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Apply Rule */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                                3
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Apply Rule</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700 block">Apply Rule to Campaigns</Label>

                                {/* Campaign Search Dropdown */}
                                <div ref={searchInputRef} className="relative">
                                    <div
                                        className="border border-gray-300 rounded-md flex items-center px-3 py-2 cursor-pointer"
                                        onClick={() => selectedPlatform && setIsSearchOpen((s) => !s)}>
                                        <SearchIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-500">
                                          {selectedPlatform ? "Search campaigns..." : "Select a platform to search"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                                    </div>
                                    {isSearchOpen && (
                                        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                                            <div className="p-2 border-b border-gray-100">
                                                <div className="relative">
                                                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
                                                        value={campaignSearchTerm}
                                                        onChange={(e) => setCampaignSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredCampaigns.length > 0 ? (
                                                    filteredCampaigns.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                                                            onClick={() => handleCampaignSelect(c)} // live name
                                                        >
                                                            <img src={c.icon || snapchatIcon} alt="" className="w-5 h-5 mr-2" />
                                                            <span className="text-sm">{c.name}</span>
                                                            <span className="ml-auto text-xs text-gray-500">{c.status}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                                        {!selectedPlatform
                                                            ? "Select a platform to see available campaigns"
                                                            : loadingCatalog
                                                                ? "Loading…"
                                                                : "No campaigns match your search"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Selected campaigns */}
                                {campaigns.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {campaigns.map((storedValue, index) => (
                                            <Badge
                                                key={storedValue}
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                                <img src={getCampaignIcon(storedValue,selectedPlatform)} alt="" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="truncate max-w-[160px] sm:max-w-none">
                                                  {formatCampaignName(selectedPlatform, storedValue)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-blue-200 flex-shrink-0"
                                                    onClick={() => removeCampaign(index)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add Campaigns multi-select (GRAY panel) */}
                                <div className="relative" ref={campaignDropdownRef}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto ${
                                            selectedPlatform ? "text-gray-600 bg-transparent" : "text-gray-400 bg-gray-50"
                                        }`}
                                        onClick={() => {
                                            if (selectedPlatform) setShowCampaignDropdown((s) => !s);
                                        }}
                                        disabled={!selectedPlatform}
                                    >
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        Add Campaigns
                                    </Button>
                                    {showCampaignDropdown && (
                                        <div className="absolute z-50 mt-1 w-72 rounded-md shadow-md ring-1 ring-gray-200 bg-gray-50">
                                            {/* Header */}
                                            <div className="px-3 py-2 border-t border-gray-100">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Found:</span>
                                                    <button
                                                        className={`text-sm px-3 py-1 rounded-md ${
                                                            selectedCampaignOptions.length > 0
                                                                ? "text-blue-600 hover:bg-gray-100"
                                                                : "text-gray-400 cursor-not-allowed"
                                                        }`}
                                                        onClick={handleAddSelectedCampaigns}
                                                        disabled={selectedCampaignOptions.length === 0}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Options (ACTIVE/PAUSED counts from live data) */}
                                            <div className="max-h-60 overflow-y-auto">
                                                {getCampaignOptionsByPlatform(selectedPlatform)
                                                    .filter(
                                                        (opt) =>
                                                            searchCampaign === "" ||
                                                            (opt.name || "").toLowerCase().includes(searchCampaign.toLowerCase())
                                                    )
                                                    .map((opt) => (
                                                        <label
                                                            key={opt.id}
                                                            className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="mr-1"
                                                                checked={selectedCampaignOptions.includes(opt.id)}
                                                                onChange={(e) => handleCampaignOptionChange(opt.id, e.target.checked)}
                                                            />
                                                            <img src={opt.icon} alt="" className="w-5 h-5" />
                                                            <span className="text-sm">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                {getCampaignOptionsByPlatform(selectedPlatform).length === 0 && (
                                                    <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                                        Select a platform to see available campaigns
                                                    </div>
                                                )}
                                            </div>
                                            {/* Footer */}
                                            <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
                                                <button
                                                    className="text-sm text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100"
                                                    onClick={clearCampaignSelection}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                                4
                            </div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Schedule Rule</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                            <div className="space-y-5 sm:space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Run this rule every</Label>
                                        <Select value={scheduleInterval} onValueChange={setScheduleInterval}>
                                            <SelectTrigger className="w-full sm:w-[33rem]">
                                                <SelectValue placeholder="Select interval..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Every 10 Minutes">Every 10 Minutes</SelectItem>
                                                <SelectItem value="Every 20 Minutes">Every 20 Minutes</SelectItem>
                                                <SelectItem value="Every 30 Minutes">Every 30 Minutes</SelectItem>
                                                <SelectItem value="Every 1 Hour">Every 1 Hour</SelectItem>
                                                <SelectItem value="Every 3 Hours">Every 3 Hours</SelectItem>
                                                <SelectItem value="Every 6 Hours">Every 6 Hours</SelectItem>
                                                <SelectItem value="Every 12 Hours">Every 12 Hours</SelectItem>
                                                <SelectItem value="Once Daily (As soon as conditions are met)">
                                                    Once Daily (As soon as conditions are met)
                                                </SelectItem>
                                                <SelectItem value="Daily (At 12:00 PM UTC)">Daily (At 12:00 PM UTC)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex justify-end gap-9 pt-6 pb-[70px]">
                        <Button variant="outline" className="text-gray-600 bg-transparent" onClick={() => navigate("/rules")}>
                            Back
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
