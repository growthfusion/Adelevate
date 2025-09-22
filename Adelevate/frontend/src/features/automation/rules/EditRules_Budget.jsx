import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Copy, ChevronDown, Search as SearchIcon } from "lucide-react";

import TopSearch from "@/components/search-bar";

// Images
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Firestore IO
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { addConfig } from "@/services/config.js";

/* ---------------- helpers ---------------- */

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta", icon: metaIcon },
  { value: "snap", label: "Snap", icon: snapchatIcon },
  { value: "tiktok", label: "TikTok", icon: tiktokIcon },
  { value: "google", label: "Google", icon: googleIcon },
  { value: "newsbreak", label: "News Break", icon: nbIcon },
];

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

  // Firestore object form
  if (typeof raw === "object" && (raw.metric || raw.comparison)) {
    const op =
        raw.operator ||
        (raw.comparison === "gte" ? "Greater or Equal" : raw.comparison === "lte" ? "Less or Equal" : "Equal to");

    return {
      ...base,
      metric: String(raw.metric || "").toLowerCase(),
      operator: op,
      value: raw.value ?? raw.threshold ?? "",
      unit: raw.unit || "none",
    };
  }

  // String form e.g. "ROI >= 1.5"
  if (typeof raw === "string") {
    const s = raw.trim();
    let operator = "Equal to";
    if (s.includes(">=")) operator = "Greater or Equal";
    else if (s.includes("<=")) operator = "Less or Equal";
    const metric = (s.split(" ")[0] || "").toLowerCase();
    const valueToken = s.split(" ").pop() || "";
    const hasPct = valueToken.includes("%");

    return { ...base, metric, operator, value: valueToken.replace("%", ""), unit: hasPct ? "%" : "none" };
  }

  return base;
}

function getMockCampaigns(platform) {
  switch (platform) {
    case "meta":
      return [
        { id: "fb_camp1", name: "atmt | atrz | RAM | Sep15 | $19 | c1", icon: metaIcon },
        { id: "fb_camp2", name: "atmt | $29 | atnk | sep09 | c3", icon: metaIcon },
        { id: "fb_camp3", name: "Auto | meta | atrz | LT | Aug16 | C4 | $19", icon: metaIcon },
        { id: "fb_camp4", name: "AUTO | Meta | DR | DMV | HV | VC | LD", icon: metaIcon },
        { id: "fb_camp5", name: "atmt | atrz | RAM | Sep09 | $29 | c2 | SP", icon: metaIcon },
        { id: "fb_camp6", name: "auto | meta | rt | sv1f | atnk | jan08 | c3", icon: metaIcon },
        { id: "fb_camp7", name: "Auto | Meta | $29 | atnk | aug04 | c1 | gw | sc2", icon: metaIcon },
      ];
    case "snap":
      return [
        { id: "snap_camp1", name: "Snap | Brand | Mar09 | c2", icon: snapchatIcon },
        { id: "snap_camp2", name: "Snap | Stories | May15 | Promo", icon: snapchatIcon },
        { id: "snap_camp3", name: "Snap | Discover | Jun22 | c3", icon: snapchatIcon },
      ];
    case "tiktok":
      return [
        { id: "tiktok_camp1", name: "TikTok | Trend | Apr23 | c1", icon: tiktokIcon },
        { id: "tiktok_camp2", name: "TikTok | Viral | Jul01 | c5", icon: tiktokIcon },
      ];
    case "google":
      return [
        { id: "google_camp1", name: "GGL | Search | Q2 | c4", icon: googleIcon },
        { id: "google_camp2", name: "GGL | Display | Jun15 | c2", icon: googleIcon },
      ];
    case "newsbreak":
      return [
        { id: "nb_camp1", name: "auto | NB | dl | vk | feb17 | C3", icon: nbIcon },
        { id: "nb_camp2", name: "NB | Local | Oct20 | c1", icon: nbIcon },
      ];
    default:
      return [];
  }
}

function getCampaignIcon(campaignId) {
  if (campaignId.startsWith("fb_")) return metaIcon;
  if (campaignId.startsWith("snap_")) return snapchatIcon;
  if (campaignId.startsWith("tiktok_")) return tiktokIcon;
  if (campaignId.startsWith("google_") || campaignId.startsWith("ggl_")) return googleIcon;
  if (campaignId.startsWith("nb_")) return nbIcon;
  return metaIcon;
}

function formatCampaignName(platform, campaignId) {
  const all = getMockCampaigns(platform);
  const match = all.find((c) => c.id === campaignId);
  if (match) return match.name;
  return campaignId.replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase());
}

function getCampaignOptionsByPlatform(selectedPlatform) {
  if (!selectedPlatform) return [];
  const byPlatform = {
    meta: [
      { id: "facebook_active", name: "Add Active (0)", icon: metaIcon, status: "active" },
      { id: "facebook_paused", name: "Add Paused (0)", icon: metaIcon, status: "paused" },
    ],
    // IMPORTANT: keys match your selectedPlatform values:
    snap: [
      { id: "snapchat_active", name: "Add Active (0)", icon: snapchatIcon, status: "active" },
      { id: "snapchat_paused", name: "Add Paused (0)", icon: snapchatIcon, status: "paused" },
    ],
    tiktok: [
      { id: "tiktok_active", name: "Add Active (0)", icon: tiktokIcon, status: "active" },
      { id: "tiktok_paused", name: "Add Paused (0)", icon: tiktokIcon, status: "paused" },
    ],
    google: [
      { id: "google_active", name: "Add Active (0)", icon: googleIcon, status: "active" },
      { id: "google_paused", name: "Add Paused (0)", icon: googleIcon, status: "paused" },
    ],
    newsbreak: [
      { id: "newsbreak_active", name: "Add Active (0)", icon: nbIcon, status: "active" },
      { id: "newsbreak_paused", name: "Add Paused (0)", icon: nbIcon, status: "paused" },
    ],
  };
  return byPlatform[selectedPlatform] || [];
}

/* ---------------- component ---------------- */

export default function EditRuleForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated with { id }, live-load from Firestore
  const ruleId = location.state?.id || null;

  // Basic state
  const [ruleName, setRuleName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("");

  // Conditions
  const [conditions, setConditions] = useState([
    { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" },
  ]);

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);

  // Action (budget) fields
  const [actionType, setActionType] = useState("");
  const [actionValue, setActionValue] = useState("");
  const [actionUnit, setActionUnit] = useState("%");
  const [actionTarget, setActionTarget] = useState("of Current Budget");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Campaign search dropdown (Apply Rule)
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState("");

  const filteredCampaigns = useMemo(() => {
    const list = getMockCampaigns(selectedPlatform);
    if (!campaignSearchTerm) return list;
    return list.filter((c) => c.name.toLowerCase().includes(campaignSearchTerm.toLowerCase()));
  }, [selectedPlatform, campaignSearchTerm]);

  // multi-select Add Campaigns dropdown
  const campaignDropdownRef = useRef(null);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [searchCampaign, setSearchCampaign] = useState("");
  const [selectedCampaignOptions, setSelectedCampaignOptions] = useState([]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target)) {
        setShowCampaignDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /* ------ load Firestore doc (edit mode) ------ */
  useEffect(() => {
    if (!ruleId) return;
    const ref = doc(db, "configs", ruleId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();

      const platform = (Array.isArray(d.platform) ? d.platform[0] : d.platform) || "meta";
      setSelectedPlatform(platform);
      setRuleName(d.name || "");
      setScheduleInterval(d.frequency || "");
      setCampaigns(d.campaigns || []);

      const rawConditions = Array.isArray(d.condition) ? d.condition : [];
      setConditions(
          rawConditions.length
              ? rawConditions.map(parseIncomingCondition)
              : [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }]
      );

      // Action fields (optional)
      setActionType(d.actionType || "");
      setActionValue(d.actionValue ?? "");
      setActionUnit(d.actionUnit || "%");
      setActionTarget(d.actionTarget || "of Current Budget");
      setMinBudget(d.minBudget ?? "");
      setMaxBudget(d.maxBudget ?? "");
    });
    return () => unsub();
  }, [ruleId]);

  // Close search dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* ------ conditions handlers ------ */
  const addConditionRow = () => {
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

  /* ------ campaign handlers ------ */
  const handleCampaignSelect = (campaign) => {
    setCampaigns((prev) => (prev.includes(campaign.id) ? prev : [...prev, campaign.id]));
    setIsSearchOpen(false);
    setCampaignSearchTerm("");
  };

  const handleAddSelectedCampaigns = () => {
    setCampaigns((prev) => {
      const next = [...prev];
      selectedCampaignOptions.forEach((id) => {
        if (!next.includes(id)) next.push(id);
      });
      return next;
    });
    setSelectedCampaignOptions([]);
    setShowCampaignDropdown(false);
  };

  const handleCampaignOptionChange = (optionId, checked) => {
    setSelectedCampaignOptions((prev) =>
        checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)
    );
  };

  const clearCampaignSelection = () => setSelectedCampaignOptions([]);

  const removeCampaign = (index) => {
    setCampaigns((prev) => prev.filter((_, i) => i !== index));
  };


  /* ------ save -> Firestore via services/config.js ------ */
  const handleSave = async () => {
    const uiPayload = {
      id: ruleId || crypto.randomUUID(),
      name: ruleName || "Unnamed Change Budget",
      status: "Running", // dashboard toggle can change later
      type: "Change_budget_campaign", // backend type
      platform: selectedPlatform || "meta",
      frequency: scheduleInterval,
      campaigns,

      // conditions in UI shape; services/config.js normalizes to {comparison, threshold, unit}
      conditions: conditions
          .filter((c) => c.metric && c.operator && c.value !== "")
          .map((c) => ({
            type: "value",
            metric: c.metric,
            operator: c.operator, // "Greater or Equal" | "Less or Equal" | "Equal to"
            value: c.value,
            unit: c.unit, // "none" | "%" | "$"
          })),

      // action fields
      actionType,
      actionValue: actionValue === "" ? "" : Number(actionValue),
      actionUnit,
      actionTarget,
      minBudget: minBudget === "" ? "" : Number(minBudget),
      maxBudget: maxBudget === "" ? "" : Number(maxBudget),
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
        <TopSearch />
        <div className="bg-gray-50">
          <div className="max-w-6xl xl:mx-auto 2xl:mx-auto p-[20px] pt-[60px] bg-gray-50">
            {/* 1. Rule header */}
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
                  <span className="text-lg text-gray-600 font-medium">Change budget campaign</span>
                </div>
              </div>

              {/* Rule section */}
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

            {/* 2. Conditions */}
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
                      <div
                          key={condition.id}
                          className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg"
                      >
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
                                className="sm:col-span-2">
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Option" />
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

                            {/* is */}
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
                                className="sm:col-span-1">
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Keep only operators supported by services/config.js */}
                                <SelectItem value="Equal to">Greater</SelectItem>
                                <SelectItem value="Greater or Equal">Greater or Equal</SelectItem>
                                <SelectItem value="Equal to">Less</SelectItem>
                                <SelectItem value="Less or Equal">Less or Equal</SelectItem>
                                <SelectItem value="Equal to">Equal to</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* than */}
                            <div className="flex items-center justify-center">
                              <span className="text-sm text-gray-600">than</span>
                            </div>

                            {/* value + unit */}
                            <div className="flex items-center gap-2 sm:col-span-1">
                              <Input
                                  value={condition.value}
                                  onChange={(e) => {
                                    const next = [...conditions];
                                    next[index].value = e.target.value;
                                    setConditions(next);
                                  }}
                                  className="w-full"
                              />
                              <Select
                                  value={condition.unit}
                                  onValueChange={(value) => {
                                    const next = [...conditions];
                                    next[index].unit = value;
                                    setConditions(next);
                                  }}>
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
                            </div>
                          </div>

                          {/* delete row */}
                          <div className="flex justify-end mt-3 sm:mt-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-gray-400 p-1 hover:bg-gray-200 ${conditions.length <= 1 ? "opacity-50" : ""}`}
                                onClick={() => removeCondition(condition.id)}
                                disabled={conditions.length <= 1}>
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
                      onClick={addConditionRow}>
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* 3. Rule Action */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-6">
                <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rule Action</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <Select value={actionType} onValueChange={setActionType}>
                      <SelectTrigger className="w-full sm:w-48 mb-2 sm:mb-0">
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Increase Budget By">Increase Budget By</SelectItem>
                        <SelectItem value="Decrease Budget By">Decrease Budget By</SelectItem>
                        <SelectItem value="Set Budget To">Set Budget To</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input
                          value={actionValue}
                          onChange={(e) => setActionValue(e.target.value)}
                          className="w-full sm:w-20"
                      />
                      <Select value={actionUnit} onValueChange={setActionUnit}>
                        <SelectTrigger className="w-20 sm:w-16">
                          <SelectValue placeholder="%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="$">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={actionTarget} onValueChange={setActionTarget} className="w-full sm:w-48 mt-2 sm:mt-0">
                      <SelectTrigger>
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="of Current Budget">of Current Budget</SelectItem>
                        <SelectItem value="of Original Budget">of Original Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Label className="text-sm text-gray-600 w-full sm:w-auto sm:whitespace-nowrap">
                        Do not allow the Budget to be lower than
                      </Label>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="w-24 sm:w-20" />
                        <span className="text-gray-600">$</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Label className="text-sm text-gray-600 w-full sm:w-auto sm:whitespace-nowrap">
                        Do not allow the Budget to be higher than
                      </Label>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="w-24 sm:w-20" />
                        <span className="text-gray-600">$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Apply Rule */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                  4
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
                      {selectedPlatform ? "Search campaign..." : "Select a platform to search"}
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
                                        onClick={() => handleCampaignSelect(c)}>
                                      <img src={c.icon} alt="" className="w-5 h-5 mr-2" />
                                      <span className="text-sm">{c.name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                  {!selectedPlatform
                                      ? "Select a platform to see available campaigns"
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
                        {campaigns.map((cid, index) => (
                            <Badge
                                key={cid}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                              <img src={getCampaignIcon(cid)} alt="" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate max-w-[160px] sm:max-w-none">
                          {formatCampaignName(selectedPlatform, cid)}
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
                        disabled={!selectedPlatform}>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Add Campaigns
                    </Button>

                    {showCampaignDropdown && (
                        <div className="absolute z-50 mt-1 w-72 rounded-md shadow-md ring-1 ring-gray-200 bg-gray-50">
                          {/* Search */}
                          <div className="p-3">
                            <div className="relative">
                              <input
                                  type="text"
                                  placeholder="Search..."
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-white"
                                  value={searchCampaign}
                                  onChange={(e) => setSearchCampaign(e.target.value)}
                              />
                              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                          </div>

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
                                  disabled={selectedCampaignOptions.length === 0}>
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Options */}
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
                                        className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer">
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
                                onClick={clearCampaignSelection}>
                              Clear
                            </button>
                          </div>
                        </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* 5. Schedule */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                  5
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

            {/* Footer */}
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
