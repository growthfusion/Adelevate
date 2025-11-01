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
        logic: index === 0 ? "If" : "And ",
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
    // Bulk tokens: icon follows the selected platform
    if (id === BULK_ACTIVE || id === BULK_PAUSED) {
        switch (platform) {
            case "meta": return metaIcon;
            case "snap": return snapchatIcon;
            case "newsbreak": return nbIcon;
            case "tiktok": return tiktokIcon;
            case "google": return googleIcon;
            default: return metaIcon;
        }
    }
    if (id.startsWith("fb_")) return metaIcon;
    if (id.startsWith("snap_")) return snapchatIcon;
    if (id.startsWith("tiktok_")) return tiktokIcon;
    if (id.startsWith("google_") || id.startsWith("ggl_")) return googleIcon;
    if (id.startsWith("nb_")) return nbIcon;
    return platform === "meta" ? metaIcon : platform === "snap" ? snapchatIcon : snapchatIcon;
}

/* ---------- component ---------- */
export default function EditRuleFormExclusion() {
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

    const [showTrafficDropdown, setShowTrafficDropdown] = useState(false);

    // fetch live Snapchat campaigns from /api/campaigns on mount
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                setLoadingCatalog(true);
                setCatalogError("");
                const [snapRes, metaRes, nbRes] = await Promise.all([
                    fetch(`${API_BASE}/api/campaigns?platform=snap`, { cache: "no-store" }),
                    fetch(`${API_BASE}/api/campaigns?platform=meta`, { cache: "no-store" }),
                    fetch(`${API_BASE}/api/campaigns?platform=newsbreak`, { cache: "no-store" }),
                ]);
                const [snapJson, metaJson, nbJson] = await Promise.all([
                    snapRes.json(),
                    metaRes.json(),
                    nbRes.json(),
                ]);
                if (!snapRes.ok) throw new Error(snapJson?.error || "Failed to load Snap campaigns");
                if (!metaRes.ok) throw new Error(metaJson?.error || "Failed to load Meta campaigns");
                if (!nbRes.ok) throw new Error(nbJson?.error || "Failed to load NewsBreak campaigns");
                if (!isMounted) return;

                setCatalog({ snap: snapJson, meta: metaJson, newsbreak: nbJson });
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

    // Newbreak Campaign Fetch
    const newsbreakCampaignList = useMemo(() => {
        const nb = catalog.newsbreak;
        if (!nb?.accounts) return [];
        const rows = [];
        Object.entries(nb.accounts).forEach(([acctId, group]) => {
            (group?.campaigns || []).forEach((c) => {
                rows.push({
                    id: c.id,
                    name: c.name || c.id,
                    status: (c.status || "").toUpperCase(),
                    accountId: acctId,
                    accountName: group?.account_name || acctId,
                    icon: nbIcon, // NewsBreak icon
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
            newsbreak: newsbreakCampaignList,
        };
    }, [snapCampaignList, metaCampaignList, newsbreakCampaignList]);

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

        // pausedCount depends on platform
        let pausedCount = 0;
        if (selectedPlatform === "newsbreak") {
            pausedCount = list.filter((c) => c.status === "INACTIVE").length;
        } else {
            pausedCount = list.filter((c) => c.status === "PAUSED").length;
        }

        let platformIcon;
        switch (selectedPlatform) {
            case "meta": platformIcon = metaIcon; break;
            case "snap": platformIcon = snapchatIcon; break;
            case "newsbreak": platformIcon = nbIcon; break;
            case "tiktok": platformIcon = tiktokIcon; break;
            case "google": platformIcon = googleIcon; break;
            default: platformIcon = metaIcon;
        }

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
                    : selectedPlatform === "newsbreak"
                        ? `nb_${campaign.id}|${cleanName}`
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
            name: ruleName || "Unnamed Exclusion Campaign",
            status: "Running",
            type: "Exclusion Campaign",
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
            // 🔵 CHANGE: explicitly null out unrelated fields
            lookback: null,
            schedule: null,
            actionType: null,
            actionValue: null,
            actionUnit: null,
            actionTarget: null,
            minBudget: null,
            maxBudget: null,
        };

        try {
            await addConfig(uiPayload);
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
                                <span className="text-lg text-gray-600 font-medium">Exclusion Campaign</span>
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

                    {/* Apply Rule */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                                2
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
                                                {/* Use getCampaignIcon with null platform so it detects icon from ID */}
                                                <img
                                                    src={getCampaignIcon(storedValue, selectedPlatform)}
                                                    alt=""
                                                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                                />
                                                <span className="truncate max-w-[160px] sm:max-w-none">
                                                    {formatCampaignName(selectedPlatform, storedValue)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-blue-200 flex-shrink-0"
                                                    onClick={() => removeCampaign(index)}>
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add Campaigns multi-select (GRAY panel) */}
                              <div className="flex gap-10">
                               {/* =================== Add Campaigns =================== */}
                               <div className="relative">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto transition-colors ${
                                     selectedPlatform
                                       ? showCampaignDropdown
                                         ? "text-blue-600 border-blue-400 bg-blue-50"
                                         : "text-gray-600 bg-transparent"
                                       : "text-gray-400 bg-gray-50 cursor-not-allowed"
                                   }`}
                                   onClick={() => {
                                     if (selectedPlatform) {
                                       setShowCampaignDropdown((prev) => !prev);
                                       setShowTrafficDropdown(false); // close other dropdown
                                     }
                                   }}
                                   disabled={!selectedPlatform}
                                 >
                                   <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                   Add Campaigns
                                 </Button>
                             
                                 {showCampaignDropdown && (
                                   <div className="absolute z-50 mt-1 w-72 rounded-md shadow-md ring-1 ring-gray-200 bg-gray-50">
                                     <div className="px-3 py-2 border-t border-gray-100 flex justify-between">
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
                             
                                     <div className="max-h-60 overflow-y-auto">
                                       {getCampaignOptionsByPlatform(selectedPlatform).map((opt) => (
                                         <label
                                           key={opt.id}
                                           className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                                         >
                                           <input
                                             type="checkbox"
                                             className="mr-1"
                                             checked={selectedCampaignOptions.includes(opt.id)}
                                             onChange={(e) =>
                                               handleCampaignOptionChange(opt.id, e.target.checked)
                                             }
                                           />
                                           <img src={opt.icon} alt="" className="w-5 h-5" />
                                           <span className="text-sm">{opt.name}</span>
                                         </label>
                                       ))}
                                     </div>
                             
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
                             
                               {/* =================== Add Traffic =================== */}
                               <div className="relative">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto transition-colors ${
                                     selectedPlatform
                                       ? showTrafficDropdown
                                         ? "text-blue-600 border-blue-400 bg-blue-50"
                                         : "text-gray-600 bg-transparent"
                                       : "text-gray-400 bg-gray-50 cursor-not-allowed"
                                   }`}
                                   onClick={() => {
                                     if (selectedPlatform) {
                                       setShowTrafficDropdown((prev) => !prev);
                                       setShowCampaignDropdown(false); // close the other dropdown
                                     }
                                   }}
                                   disabled={!selectedPlatform}
                                 >
                                   <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                   Add Traffic
                                 </Button>
                             
                                 {showTrafficDropdown && (
                                   <div className="absolute z-50 mt-1 w-72 rounded-md shadow-md ring-1 ring-gray-200 bg-gray-50">
                                     <div className="px-3 py-2 border-t border-gray-100 flex justify-between">
                                       <span className="text-sm text-gray-600">Found:</span>
                                       <button className="text-sm px-3 py-1 rounded-md text-blue-600 hover:bg-gray-100">
                                         Add
                                       </button>
                                     </div>
                                     <div className="max-h-60 overflow-y-auto">
                                       {/* You can use a separate traffic options list here */}
                                       <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                         Traffic options go here
                                       </div>
                                     </div>
                                   </div>
                                 )}
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
