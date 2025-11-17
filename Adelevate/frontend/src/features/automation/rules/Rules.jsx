import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  Copy,
  Trash2,
  Search as SearchIcon,
  Edit2,
} from "lucide-react";
import { SquarePen } from "lucide-react";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import { logAction } from "@/utils/actionLog";
import { supabase } from "@/supabaseClient";

// Firestore
import { db } from "@/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const normalizeStatus = (s) => {
  const v = typeof s === "string" ? s.trim().toLowerCase() : s;
  if (v === true || v === "running" || v === "active") return "Running";
  if (v === false || v === "paused") return "Paused";
  return "Running";
};

function routeForType(t = "") {
  const s = String(t).toLowerCase().trim();
  if (s.includes("pause")) return "/editPause";
  if (s.includes("activate") || s.includes("active")) return "/editActivate";
  if (s.includes("budget")) return "/editBudget";
  if (s.includes("change_budget")) return "/editBudget";
  if (s.includes("exclusion")) return "/editExclusion";
  return "/editActivate";
}

const getComparisonSymbol = (operator) => {
  let symbol = "";
  let colorClass = "";

  switch (operator) {
    case "gt":
    case "Greater":
      symbol = ">";
      colorClass = "text-emerald-600";
      break;
    case "gte":
    case "Greater or Equal":
      symbol = "≥";
      colorClass = "text-emerald-600";
      break;
    case "lt":
    case "Less":
      symbol = "<";
      colorClass = "text-rose-600";
      break;
    case "lte":
    case "Less or Equal":
      symbol = "≤";
      colorClass = "text-rose-600";
      break;
    case "eq":
    case "Equal to":
      symbol = "=";
      colorClass = "text-blue-600";
      break;
    default:
      symbol = "=";
      colorClass = "text-slate-600";
  }

  return (
    <span className={`font-semibold text-base ${colorClass}`}>{symbol}</span>
  );
};

// Platform icons
const PLATFORM_ICONS = {
  meta: fb,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nb,
};

function normalizePlatformKey(p) {
  const raw = Array.isArray(p) ? p[0] : p;
  if (!raw) return "";
  const s = String(raw).toLowerCase().trim();
  if (["meta", "facebook", "fb"].includes(s)) return "meta";
  if (["snap", "snapchat"].includes(s)) return "snap";
  if (["tiktok", "tt"].includes(s)) return "tiktok";
  if (["google", "ggl", "adwords", "ads"].includes(s)) return "google";
  if (["newsbreak", "nb"].includes(s)) return "newsbreak";
  return s;
}

const PlatformIcon = ({ platform }) => {
  const key = normalizePlatformKey(platform);
  const src = PLATFORM_ICONS[key];
  if (!src) return null;
  return (
    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
      <img src={src} alt={key} title={key} className="w-4 h-4 object-contain" />
    </div>
  );
};

const ruleKey = (r) => `${r.__colName}::${r.id}`;

const COLLECTION_ORDER = [
  "meta_pause_campaign",
  "meta_active_campaign",
  "meta_change_budget_campaign",
  "meta_exclusion_campaign",
  "snap_pause_campaign",
  "snap_active_campaign",
  "snap_change_budget_campaign",
  "snap_exclusion_campaign",
  "tiktok_pause_campaign",
  "tiktok_active_campaign",
  "tiktok_change_budget_campaign",
  "tiktok_exclusion_campaign",
  "google_pause_campaign",
  "google_active_campaign",
  "google_change_budget_campaign",
  "google_exclusion_campaign",
  "newsbreak_pause_campaign",
  "newsbreak_active_campaign",
  "newsbreak_change_budget_campaign",
  "newsbreak_exclusion_campaign",
];

const sortRulesStable = (a, b) => {
  const ai = COLLECTION_ORDER.indexOf(a.__colName);
  const bi = COLLECTION_ORDER.indexOf(b.__colName);
  if (ai !== bi) return ai - bi;

  const at = String(a.type || "").toLowerCase();
  const bt = String(b.type || "").toLowerCase();
  if (at !== bt) return at.localeCompare(bt);

  const an = String(a.name || a.id || "");
  const bn = String(b.name || b.id || "");
  return an.localeCompare(bn);
};

const RulesDashboard = () => {
  const navigate = useNavigate();
  const [selectedRules, setSelectedRules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rules, setRules] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [pendingKeys, setPendingKeys] = useState([]);
  const isPending = (k) => pendingKeys.includes(k);

  // Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  // Live Firestore
  useEffect(() => {
    const colNames = COLLECTION_ORDER;
    const unsubs = colNames.map((col) =>
      onSnapshot(collection(db, col), (snap) => {
        setRules((prev) => {
          const others = prev.filter((r) => r.__colName !== col);
          const fresh = snap.docs.map((d) => ({
            id: d.id,
            __colName: col,
            ...d.data(),
          }));
          const merged = [...others, ...fresh];
          merged.sort(sortRulesStable);
          return merged;
        });
      })
    );
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  // Scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setIsScrolled(headerBottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ruleTypes = [
    {
      name: "Pause Campaign",
      platform: "facebook,google,snapchat,tiktok,newsbreak",
    },
    {
      name: "Activate Campaign",
      platform: "facebook,google,snapchat,tiktok,newsbreak",
    },
    {
      name: "Change Campaign Budget",
      platform: "facebook,google,snapchat,tiktok,newsbreak",
    },
    {
      name: "Exclusion Campaign",
      platform: "facebook,google,snapchat,tiktok,newsbreak",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = (status) =>
    status === "Running"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-amber-50 border-amber-200 text-amber-700";

  const getConditionColor = (_, index) => {
    const colors = [
      "bg-blue-50 border-blue-200 text-blue-700",
      "bg-violet-50 border-violet-200 text-violet-700",
      "bg-purple-50 border-purple-200 text-purple-700",
      "bg-pink-50 border-pink-200 text-pink-700",
    ];
    return colors[index % colors.length];
  };

  const filteredRuleTypes = ruleTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatConditionsForLog = (rule) => {
    const conds = rule.condition || rule.conditions || [];
    return conds
      .map((c) => {
        if (typeof c === "string") return c;
        const metric = (c.metric || "").toString().toUpperCase();
        const operator = c.comparison || c.operator || "eq";
        const threshold = c.threshold ?? c.value ?? "";
        let symbol = "=";
        switch (operator) {
          case "gt":
          case "Greater":
            symbol = ">";
            break;
          case "gte":
          case "Greater or Equal":
            symbol = "≥";
            break;
          case "lt":
          case "Less":
            symbol = "<";
            break;
          case "lte":
          case "Less or Equal":
            symbol = "≤";
            break;
          case "eq":
          case "Equal to":
            symbol = "=";
            break;
        }
        return `${metric} ${symbol} ${threshold}`;
      })
      .join(", ");
  };

  const getPlatformIconUrl = (platform) => {
    const key = normalizePlatformKey(platform);
    return PLATFORM_ICONS[key] || "";
  };

  const getRuleName = (rule) => {
    return rule.name || `${rule.type} Rule (${rule.id})` || `Rule ${rule.id}`;
  };

  const addNewRule = async (type) => {
    const target = routeForType(type.name);
    navigate(target, { state: { mode: "new" } });
    setDropdownOpen(false);
    setSearchQuery("");

    if (user?.email) {
      const platforms = type.platform || "";
      const firstPlatform = platforms.split(",")[0];
      await logAction({
        userEmail: user.email,
        action: "add",
        details: `Created new ${type.name} rule`,
        platform: firstPlatform,
        ruleName: `New ${type.name}`,
        platformIcon: getPlatformIconUrl(firstPlatform),
      });
    }
  };

  const deleteRule = async (rule) => {
    const key = ruleKey(rule);
    const ruleName = getRuleName(rule);

    if (!window.confirm(`Are you sure you want to delete "${ruleName}"?`)) {
      return;
    }

    setRules((prev) => prev.filter((r) => ruleKey(r) !== key));
    setSelectedRules((prev) => prev.filter((k) => k !== key));

    try {
      await deleteDoc(doc(db, rule.__colName, rule.id));
      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: "delete",
          details: `Deleted rule: "${ruleName}" from ${rule.__colName}`,
          platform: normalizePlatformKey(rule.platform),
          ruleName: ruleName,
          ruleConditions: formatConditionsForLog(rule),
          platformIcon: getPlatformIconUrl(rule.platform),
        });
      }
    } catch (e) {
      console.error(e);
      alert(`Failed to delete: ${e.message}`);
      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: "delete",
          details: `Failed to delete rule: "${ruleName}"`,
          platform: normalizePlatformKey(rule.platform),
          ruleName: ruleName,
          ruleConditions: formatConditionsForLog(rule),
          platformIcon: getPlatformIconUrl(rule.platform),
          status: "failed",
        });
      }
    }
  };

  const toggleStatus = async (rule) => {
    const current = normalizeStatus(rule.status);
    const newStatus = current === "Running" ? "Paused" : "Running";
    const k = ruleKey(rule);
    const ruleName = getRuleName(rule);

    setPendingKeys((p) => (p.includes(k) ? p : [...p, k]));
    try {
      await updateDoc(doc(db, rule.__colName, rule.id), { status: newStatus });
      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: "update",
          details: `Changed status of rule "${ruleName}" to ${newStatus}`,
          platform: normalizePlatformKey(rule.platform),
          ruleName: ruleName,
          ruleConditions: formatConditionsForLog(rule),
          platformIcon: getPlatformIconUrl(rule.platform),
          status: "running",
        });
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      alert("Failed to update status. Please try again.");
      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: "update",
          details: `Failed to change status of rule "${ruleName}"`,
          platform: normalizePlatformKey(rule.platform),
          ruleName: ruleName,
          ruleConditions: formatConditionsForLog(rule),
          platformIcon: getPlatformIconUrl(rule.platform),
          status: "failed",
        });
      }
    } finally {
      setPendingKeys((p) => p.filter((x) => x !== k));
    }
  };

  const ruleEdit = async (rule) => {
    const target = routeForType(rule.type);
    const ruleName = getRuleName(rule);

    navigate(target, {
      state: { id: rule.id, colName: rule.__colName, mode: "edit" },
    });

    if (user?.email) {
      await logAction({
        userEmail: user.email,
        action: "edit",
        details: `Edited rule: "${ruleName}"`,
        platform: normalizePlatformKey(rule.platform),
        ruleName: ruleName,
        ruleConditions: formatConditionsForLog(rule),
        platformIcon: getPlatformIconUrl(rule.platform),
      });
    }
  };

  const renderConditions = (rule) => {
    const conds = rule.condition || rule.conditions || [];
    return conds.map((c, idx) => {
      if (typeof c === "string") return <span key={idx}>{c}</span>;

      const m = (c.metric || "").toString().toUpperCase();
      const operator = c.comparison || c.operator || "eq";
      const thr = c.threshold ?? c.value ?? "";

      return (
        <div key={idx} className="inline-flex items-center gap-1">
          <span>{m}</span>
          <span className="mx-1">{getComparisonSymbol(operator)}</span>
          <span>{thr}</span>
        </div>
      );
    });
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);
  const rowsDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rowsDropdownRef.current &&
        !rowsDropdownRef.current.contains(event.target)
      ) {
        setRowsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.ceil(rules.length / rowsPerPage);
  const paginatedRules = rules.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const duplicateRule = (rule) => {
    alert(`Duplicate feature for "${getRuleName(rule)}" coming soon!`);
  };

  return (
    <div className="min-h-screen bg-white pb-12 max-sm:pt-[20%] pt-0">
      <div ref={headerRef}></div>

      {/* Fixed action bar when scrolled */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto flex items-center gap-3 px-6 py-4">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden ss:inline">New Rule</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                  <div className="p-3">
                    <div className="relative mb-3">
                      <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        placeholder="Search rule types..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredRuleTypes.map((type) => (
                        <button
                          key={type.name}
                          className="flex items-center w-full py-2.5 px-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => addNewRule(type)}
                        >
                          <span className="text-sm text-slate-700 font-medium">
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`px-6 sm:px-8 lg:px-12 ${isScrolled ? "pt-20" : "pt-8"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Rules
            </h1>
           
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-sky-700 transition-all shadow-sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden ss:inline">New Rule</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                  <div className="p-3">
                    <div className="relative mb-3">
                      <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        placeholder="Search rule types..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredRuleTypes.map((type) => (
                        <button
                          key={type.name}
                          className="flex items-center w-full py-2.5 px-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => addNewRule(type)}
                        >
                          <span className="text-sm text-slate-700 font-medium">
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Name
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Type
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Conditions
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Frequency
                      </span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Platform
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedRules.length > 0 ? (
                    paginatedRules.map((rule) => {
                      const displayStatus = normalizeStatus(rule.status);
                      const k = ruleKey(rule);
                      return (
                        <tr
                          key={k}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-6 py-4 border-r border-slate-100">
                            <div className="flex items-center gap-3">
                              {/* Toggle */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    normalizeStatus(rule.status) === "Running"
                                  }
                                  onChange={() => toggleStatus(rule)}
                                  disabled={isPending(k)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:border-white" />
                              </label>

                              <div className="flex items-center gap-1">
                                {/* Edit Button with Tooltip */}
                                <div className="relative group/edit">
                                  <button
                                    className="p-2 hover:bg-cyan-50 rounded-lg transition-colors"
                                    onClick={() => ruleEdit(rule)}
                                  >
                                    <SquarePen className="w-4 h-4 text-cyan-600" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/edit:opacity-100 group-hover/edit:visible transition-all duration-200 pointer-events-none shadow-lg">
                                    Edit
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>

                                {/* Duplicate Button with Tooltip */}
                                <div className="relative group/duplicate">
                                  <button
                                    className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
                                    onClick={() => duplicateRule(rule)}
                                  >
                                    <Copy className="w-4 h-4 text-violet-600" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/duplicate:opacity-100 group-hover/duplicate:visible transition-all duration-200 pointer-events-none shadow-lg">
                                    Duplicate
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>

                                {/* Delete Button with Tooltip */}
                                <div className="relative group/delete">
                                  <button
                                    className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                                    onClick={() => deleteRule(rule)}
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 pointer-events-none shadow-lg">
                                    Delete
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 border-r border-slate-100">
                            <button
                              onClick={() => ruleEdit(rule)}
                              className="text-left hover:text-slate-900 transition-colors font-medium text-sm text-slate-700"
                            >
                              {rule.name || `Unnamed ${rule.type}`}
                            </button>
                          </td>

                          <td className="px-6 py-4 border-r border-slate-100">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                displayStatus
                              )}`}
                            >
                              {displayStatus}
                            </span>
                          </td>

                          <td className="px-6 py-4 border-r border-slate-100">
                            <span className="text-sm text-slate-600">
                              {rule.type}
                            </span>
                          </td>

                          <td className="px-6 py-4 border-r border-slate-100">
                            <div className="flex flex-wrap gap-1.5">
                              {renderConditions(rule).map((txt, i) => (
                                <span
                                  key={`${k}-c${i}`}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getConditionColor(
                                    txt,
                                    i
                                  )}`}
                                >
                                  {txt}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4 border-r border-slate-100">
                            <span className="text-sm text-slate-600">
                              {rule.frequency}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <PlatformIcon platform={rule.platform} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-slate-900">
                              No rules yet
                            </p>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                              Get started by creating your first automation rule
                            </p>
                          </div>
                          <button
                            className="mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-sm flex items-center gap-2"
                            onClick={() => setDropdownOpen(true)}
                          >
                            <Plus className="w-4 h-4" />
                            Create Rule
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedRules.length > 0 ? (
                paginatedRules.map((rule) => {
                  const displayStatus = normalizeStatus(rule.status);
                  const k = ruleKey(rule);
                  return (
                    <div
                      key={k}
                      className="p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <PlatformIcon platform={rule.platform} />
                          <div>
                            <h3 className="font-medium text-slate-900 text-sm">
                              {rule.name || `Unnamed ${rule.type}`}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {rule.type}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            displayStatus
                          )}`}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">
                            Conditions
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {renderConditions(rule).map((txt, i) => (
                              <span
                                key={`${k}-c${i}`}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getConditionColor(
                                  txt,
                                  i
                                )}`}
                              >
                                {txt}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">
                            Frequency
                          </p>
                          <p className="text-sm text-slate-900">
                            {rule.frequency}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={normalizeStatus(rule.status) === "Running"}
                            onChange={() => toggleStatus(rule)}
                            disabled={isPending(k)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:border-white" />
                          <span className="ml-3 text-sm text-slate-700 font-medium">
                            {normalizeStatus(rule.status) === "Running"
                              ? "Active"
                              : "Paused"}
                          </span>
                        </label>

                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors"
                            onClick={() => ruleEdit(rule)}
                            aria-label="Edit rule"
                          >
                            <Edit2 className="w-4 h-4 text-cyan-600" />
                          </button>

                          <button
                            className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
                            onClick={() => duplicateRule(rule)}
                            aria-label="Duplicate rule"
                          >
                            <Copy className="w-4 h-4 text-violet-600" />
                          </button>

                          <button
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                            onClick={() => deleteRule(rule)}
                            aria-label="Delete rule"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-900">
                        No rules yet
                      </p>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                        Get started by creating your first automation rule
                      </p>
                    </div>
                    <button
                      className="mt-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-sm flex items-center gap-2"
                      onClick={() => setDropdownOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Create Rule
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {paginatedRules.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600 mb-3 sm:mb-0">
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {(currentPage - 1) * rowsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900">
                    {Math.min(currentPage * rowsPerPage, rules.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900">
                    {rules.length}
                  </span>{" "}
                  rules
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Rows:</span>
                    <div className="relative" ref={rowsDropdownRef}>
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                        onClick={() => setRowsDropdownOpen(!rowsDropdownOpen)}
                      >
                        {rowsPerPage}
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      {rowsDropdownOpen && (
                        <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-10">
                          {[5, 10, 25, 50, 100].map((num) => (
                            <button
                              key={num}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                                rowsPerPage === num
                                  ? "bg-cyan-50 text-cyan-700 font-medium"
                                  : "text-slate-700"
                              }`}
                              onClick={() => {
                                setRowsPerPage(num);
                                setCurrentPage(1);
                                setRowsDropdownOpen(false);
                              }}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className={`p-2 border rounded-lg transition-colors ${
                        currentPage === 1
                          ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from(
                        { length: Math.min(totalPages, 3) },
                        (_, i) => {
                          let pageNum = currentPage;
                          if (totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage <= 2) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      className={`p-2 border rounded-lg transition-colors ${
                        currentPage === totalPages || totalPages === 0
                          ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesDashboard;
