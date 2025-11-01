import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Copy, Trash2, Search as SearchIcon } from "lucide-react";
import { SquarePen } from 'lucide-react';


import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import Search from "@/components/search-bar";
import { logAction } from "@/utils/actionLog";
import { supabase } from "@/supabaseClient";


// Firestore
import { db } from "@/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

const comparisonSymbol = { gte: "≥", lte: "≤", eq: "=" };

const normalizeStatus = (s) => {
    const v = typeof s === "string" ? s.trim().toLowerCase() : s;
    if (v === true || v === "running" || v === "active") return "Running";
    if (v === false || v === "paused") return "Paused";
    return "Running"; // default
};

// type → route
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
  
  switch(operator) {
    case "gt":
    case "Greater":
      symbol = ">";
      colorClass = "text-green-600";
      break;
    case "gte":
    case "Greater or Equal":
      symbol = "≥";
      colorClass = "text-green-600";
      break;
    case "lt":
    case "Less":
      symbol = "<";
      colorClass = "text-red-600";
      break;
    case "lte":
    case "Less or Equal":
      symbol = "≤";
      colorClass = "text-red-600";
      break;
    case "eq":
    case "Equal to":
      symbol = "=";
      colorClass = "text-blue-600";
      break;
    default:
      symbol = "=";
      colorClass = "text-gray-600";
  }
  
  return <span className={`font-bold text-lg ${colorClass}`}>{symbol}</span>;
};

// platform icons
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
    return <img src={src} alt={key} title={key} className="w-5 h-5" />;
};

// helper: unique key for a rule across collections
const ruleKey = (r) => `${r.__colName}::${r.id}`;

// fixed order for collections
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

    // NEW: track pending write per row to avoid re-click and flicker
    const [pendingKeys, setPendingKeys] = useState([]);
    const isPending = (k) => pendingKeys.includes(k);

    // session
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setUser(data.session.user);
        });
    }, []);

    // live Firestore
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

    // scroll tracker
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
        { name: "Pause Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
        { name: "Activate Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
        { name: "Change Campaign Budget", platform: "facebook,google,snapchat,tiktok,newsbreak" },
        { name: "Exclusion Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    ];

    // close dropdown on outside
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
        status === "Running" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

    const getConditionColor = (_, index) => {
        const colors = [
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
            "bg-purple-100 text-purple-800",
            "bg-orange-100 text-orange-800",
        ];
        return colors[index % colors.length];
    };

    const filteredRuleTypes = ruleTypes.filter((type) =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addNewRule = async (type) => {
        const target = routeForType(type.name);
        navigate(target, { state: { mode: "new" } });
        setDropdownOpen(false);
        setSearchQuery("");
        if (user?.email) {
            await logAction({
                userEmail: user.email,
                action: "add",
                details: `Added new rule: ${type.name}`,
            });
        }
    };

    const deleteRule = async (rule) => {
        const key = ruleKey(rule);
        setRules((prev) => prev.filter((r) => ruleKey(r) !== key));
        setSelectedRules((prev) => prev.filter((k) => k !== key));
        try {
            await deleteDoc(doc(db, rule.__colName, rule.id));
            if (user?.email) {
                await logAction({
                    userEmail: user.email,
                    action: "delete",
                    details: `Deleted rule: ${rule.id} from ${rule.__colName}`,
                });
            }
        } catch (e) {
            console.error(e);
            alert(`Failed to delete: ${e.message}`);
        }
    };

    const toggleStatus = async (rule) => {
        const current = normalizeStatus(rule.status);
        const newStatus = current === "Running" ? "Paused" : "Running";
        const k = ruleKey(rule);

        setPendingKeys((p) => (p.includes(k) ? p : [...p, k]));
        try {
            await updateDoc(doc(db, rule.__colName, rule.id), { status: newStatus });
            if (user?.email) {
                await logAction({
                    userEmail: user.email,
                    action: "update",
                    details: `Changed status of rule ${rule.name || rule.id} to ${newStatus}`,
                });
            }
            // no local setRules() here; let onSnapshot update the row
        } catch (e) {
            console.error("Failed to update status:", e);
            alert("Failed to update status. Please try again.");
        } finally {
            setPendingKeys((p) => p.filter((x) => x !== k));
        }
    };

 const ruleEdit = async (rule) => {
        const target = routeForType(rule.type);
        navigate(target, { state: { id: rule.id, colName: rule.__colName, mode: "edit" } });
        if (user?.email) {
            await logAction({
                userEmail: user.email,
                action: "edit",
                details: `Edited rule: ${rule.name}`,
            });
        }
    };


    // const renderConditions = (rule) => {
    //     const conds = rule.condition || rule.conditions || [];
    //     return conds.map((c) => {
    //         if (typeof c === "string") return c;
    //         const m = (c.metric || "").toString().toUpperCase();
    //         const sym = comparisonSymbol[c.comparison] || "=";
    //         const thr = c.threshold ?? c.value ?? "";
    //         return `${m} ${sym} ${thr}`;
    //     });
    // };


   const renderConditions = (rule) => {
        const conds = rule.condition || rule.conditions || [];
        return conds.map((c) => {
            if (typeof c === "string") return c;
            
            const m = (c.metric || "").toString().toUpperCase();
            const operator = c.comparison || c.operator || "eq";
            const thr = c.threshold ?? c.value ?? "";
            
            return (
                <div className="inline-flex items-center gap-1">
                    <span>{m}</span> 
                    <span className="mx-1">{getComparisonSymbol(operator)}</span> 
                    <span>{thr}</span>
                </div>
            );
        });


        
    };
//footer

const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);
const rowsDropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(event.target)) {
      setRowsDropdownOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const totalPages = Math.ceil(rules.length / rowsPerPage);
const paginatedRules = rules.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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




    return (
        <div className="min-h-screen bg-gray-50">
            <div ref={headerRef}>
                <Search />
            </div>

            <div className="pt-6">
                <h1>Rules</h1>
            </div>

            {/* Fixed action bar when scrolled */}
            {isScrolled && (
                <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto flex items-center gap-3 px-6 py-3">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <Plus className="w-4 h-4" />
                                New Rule
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute left-0 top-full mt-1 w-64 bg-white border shadow-lg rounded-md z-50 max-h-80 overflow-y-auto">
                                    <div className="p-2">
                                        <div className="relative mb-3">
                                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                placeholder="Search for rules"
                                                className="pl-10 border border-gray-300 rounded-md w-full py-1"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        {filteredRuleTypes.map((type) => (
                                            <button
                                                key={type.name}
                                                className="flex items-center w-full py-2 px-2 text-left hover:bg-gray-50 rounded-md"
                                                onClick={() => addNewRule(type)}
                                            >
                                                <span className="text-sm text-gray-700">{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className={`p-6 ${isScrolled ? "pt-16" : ""}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-semibold text-cyan-600 pr-3">Rules</h1>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <Plus className="w-4 h-4" />
                                New Rule
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute left-0 top-full mt-1 w-64 bg-white border shadow-lg rounded-md z-50">
                                    <div className="p-2">
                                        <div className="relative mb-3">
                                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                placeholder="Search for rules"
                                                className="pl-10 border border-gray-300 rounded-md w-full py-1"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        {filteredRuleTypes.map((type) => (
                                            <button
                                                key={type.name}
                                                className="flex items-center w-full py-2 px-2 text-left hover:bg-gray-50 rounded-md"
                                                onClick={() => addNewRule(type)}
                                            >
                                                <span className="text-sm text-gray-700">{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="w-32 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Actions</th>
                                <th className="w-64 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Name</th>
                                <th className="w-24 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Status</th>
                                <th className="w-40 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Type</th>
                                <th className="w-80 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Conditions</th>
                                <th className="w-32 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Frequency</th>
                                <th className="w-32 font-medium text-gray-700 border-r border-gray-200 p-3 text-left">Platform</th>
                            </tr>
                            </thead>
                            
<tbody>
{paginatedRules.length > 0 ? (
    paginatedRules.map((rule, index) => {
                                    const displayStatus = normalizeStatus(rule.status);
                                    const k = ruleKey(rule);
                                    return (
                                        <tr
                                            key={k}
                                            className={`hover:bg-gray-100 border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                                        >
                                            <td className="py-3 px-3 border-r border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    {/* Toggle */}
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={normalizeStatus(rule.status) === "Running"}
                                                            onChange={() => toggleStatus(rule)}
                                                            disabled={isPending(k)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                                                    </label>

                                                    {/* quick actions */}
                                                    {/* <div className="flex items-center gap-1 ml-2">
                                                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => ruleEdit(rule)}>
                                                           <SquarePen  className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <button className="p-1 hover:bg-gray-100 rounded">
                                                            <Copy className="w-4 h-4 text-blue-500" />
                                                        </button>
                                                        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => deleteRule(rule)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div> */}

                                                        <div className="flex items-center gap-1 ml-2">
  <div className="relative group">
    <button
      className="p-1 hover:bg-gray-100 rounded"
      onClick={() => ruleEdit(rule)}
    >
      <SquarePen className="w-4 h-4 text-gray-600" />
    </button>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 
                     bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded 
                     shadow opacity-0 group-hover:opacity-100 
                     pointer-events-none transition-all duration-150 
                     scale-95 group-hover:scale-100">
      Edit
    </span>
  </div>

  <div className="relative group">
    <button 
    className="p-1 hover:bg-gray-100 rounded"
    >
      <Copy className="w-4 h-4 text-blue-500" />
    </button>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 
                     bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded 
                     shadow opacity-0 group-hover:opacity-100 
                     pointer-events-none transition-all duration-150 
                     scale-95 group-hover:scale-100">
      Clone
    </span>
  </div>

  <div className="relative group">
    <button
      className="p-1 hover:bg-gray-100 rounded"
      onClick={() => deleteRule(rule)}
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 
                     bg-red-100 text-red-800 text-xs px-2 py-1 rounded 
                     shadow opacity-0 group-hover:opacity-100 
                     pointer-events-none transition-all duration-150 
                     scale-95 group-hover:scale-100">
      Delete
    </span>
  </div>
</div>

                                                </div>
                                            </td>

                                            <td className="py-3 px-3 border-r border-gray-200">
                                                <button
                                                    // onClick={() => openRuleForEdit(rule)}
                                                    className="text-left hover:text-blue-600 transition-colors font-medium text-sm text-gray-900"
                                                >
                                                    {rule.name || `Unnamed ${rule.type}`}
                                                </button>
                                            </td>

                                            <td className="py-3 px-3 border-r border-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                            {displayStatus}
                          </span>
                                            </td>

                                            <td className="text-sm text-gray-600 py-3 px-3 border-r border-gray-200">{rule.type}</td>

                                            <td className="py-3 px-3 border-r border-gray-200">
                                                <div className="flex flex-wrap gap-1">
                                                    {renderConditions(rule).map((txt, i) => (
                                                        <span
                                                            key={`${k}-c${i}`}
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(txt, i)}`}
                                                        >
                                {txt}
                              </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="text-sm text-gray-600 border-r border-gray-200 py-3 px-3">{rule.frequency}</td>

                                            <td className="py-3 px-3 border-r border-gray-200">
                                                <div className="flex items-center justify-center">
                                                    <PlatformIcon platform={rule.platform} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
        <td colSpan="9" className="py-6 text-center text-gray-500">
            No rules found. Create a new rule to get started.
        </td>
    </tr>
)}
</tbody>
                        </table>

                        {/* Footer */}
                        {/* <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-600">Total: {rules.length}</div>
                            <div className="flex items-center gap-2">
                                <div></div>
                                <span className="text-sm text-gray-600">0 Rows</span>
                                <div className="relative group">
                                    <button className="flex items-center gap-1 px-12 py-1 bg-white border border-gray-300 rounded-md text-sm">
                                        0 <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 bg-white border shadow-lg rounded-md hidden group-hover:block z-10 p-2">
                                        <button className="block w-full text-left px-3 py-1 hover:bg-gray-50">10</button>
                                        <button className="block w-full text-left px-3 py-1 hover:bg-gray-50">25</button>
                                        <button className="block w-full text-left px-3 py-1 hover:bg-gray-50">50</button>
                                        <button className="block w-full text-left px-3 py-1 hover:bg-gray-50">100</button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 ml-4">
                                    <button className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm" disabled>
                                        ‹
                                    </button>
                                    <button className="px-2 py-1 bg-blue-600 text-white border border-blue-600 rounded-full text-sm">1</button>
                                    <button className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm">›</button>
                                </div>
                            </div>
                        </div> */}
{/* Footer */}
<div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
  <div className="text-sm text-gray-600">Total: {rules.length}</div>
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Rows per page:</span>
    <div className="relative" ref={rowsDropdownRef}>
      <button 
        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm"
        onClick={() => setRowsDropdownOpen(!rowsDropdownOpen)}
      >
        {rowsPerPage} <ChevronDown className="w-3 h-3" />
      </button>
      {rowsDropdownOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border shadow-lg rounded-md z-10 p-2">
          {[5, 10, 25, 50, 100].map((num) => (
            <button 
              key={num}
              className={`block w-full text-left px-3 py-1 hover:bg-gray-50 ${
                rowsPerPage === num ? 'bg-blue-50 text-blue-600' : ''
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
    <div className="flex items-center gap-1 ml-4">
      <button 
        className={`px-3 py-1 border rounded-md text-sm flex items-center justify-center ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        onClick={goToPrevPage}
        disabled={currentPage === 1}
      >
        &#8249;
      </button>
      
      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Show pages around current page
          let pageNum = currentPage;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              className={`px-3 py-1 border ${
                currentPage === pageNum 
                  ? 'bg-blue-600 text-white border-blue-600 rounded-full' 
                  : 'bg-white text-gray-700 border-gray-300 rounded-md hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button 
        className={`px-3 py-1 border rounded-md text-sm flex items-center justify-center ${
          currentPage === totalPages || totalPages === 0 
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        onClick={goToNextPage}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        &#8250;
      </button>
    </div>
  </div>
</div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesDashboard;
