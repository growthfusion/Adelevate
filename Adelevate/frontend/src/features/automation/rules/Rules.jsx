import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, Plus, Copy, RotateCcw, FileText, Trash2,
  Search as SearchIcon
} from "lucide-react";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import Search from "@/components/search-bar";

import { logAction } from '@/utils/actionLog';
import { supabase } from '@/supabaseClient';

// Firestore imports
import { db } from "@/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

const comparisonSymbol = { gte: "≥", lte: "≤", eq: "=" };
const normalizeStatus = (s) => (s === "Paused" ? "Paused" : "Running");

// robust type→route mapper (handles different spellings)
function routeForType(t = "") {
  const s = String(t).toLowerCase().trim();
  if (s.includes("pause")) return "/editPause";
  if (s.includes("activate") || s.includes("active")) return "/editActivate";
  if (s.includes("budget")) return "/editBudget";
  if (s.includes("change_budget")) return "/editBudget";
  return "/editActivate"; // safe default
}

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
  return s; // fallback
}

const PlatformIcon = ({ platform }) => {
  const key = normalizePlatformKey(platform);
  const src = PLATFORM_ICONS[key];
  if (!src) return null;
  return <img src={src} alt={key} title={key} className="w-5 h-5" />;
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

  // Load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  // CHANGED: listen to Firestore instead of localStorage
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "configs"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRules(data);
      // reset selection when list changes
      setSelectedRules((prev) => prev.filter((id) => data.some((r) => r.id === id)));
    });
    return () => unsub();
  }, []); // CHANGED

  // Track scrolling position (unchanged)
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
    // CHANGED: keep friendly label, we just navigate to proper form
    { name: "Pause Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    { name: "Activate Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    { name: "Change Campaign Budget", platform: "facebook,google,snapchat,tiktok,newsbreak" },
  ];

  // Close dropdown when clicking outside (unchanged)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (checked) => {
    if (checked) setSelectedRules(rules.map((r) => r.id));
    else setSelectedRules([]);
  };

  const handleSelectRule = (ruleId, checked) => {
    setSelectedRules((prev) =>
        checked ? [...prev, ruleId] : prev.filter((id) => id !== ruleId)
    );
  };

  const getStatusColor = (status) =>
      status === "Running"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800";

  const getConditionColor = (_, index) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
    ];
    return colors[index % colors.length];
  };

  // Filter rule types by search
  const filteredRuleTypes = ruleTypes.filter((type) =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CHANGED: New rule goes straight to the correct route (no /editRules)
  const addNewRule = async (type) => {
    const target = routeForType(type.name); // CHANGED
    navigate(target, { state: { mode: "new" } }); // CHANGED
    setDropdownOpen(false);
    setSearchQuery("");

    if (user?.email) {
      await logAction({
        userEmail: user.email,
        action: 'add',
        details: `Added new rule: ${type.name}`
      });
    }
  };

  const deleteRule = async (ruleId) => {
    setRules((p) => p.filter((r) => r.id !== ruleId));
    setSelectedRules((p) => p.filter((id) => id !== ruleId));
    try {
      await deleteDoc(doc(db, "configs", ruleId));
      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: 'delete',
          details: `Deleted rule: ${rule.name || rule.id}`
        });
      }

    }
    catch (e) {
      console.error(e);
      setRules(prev); // revert
      alert(`Failed to delete: ${e.message}`);
    }
  };

  // CHANGED: Persist toggle to Firestore
  const toggleStatus = async (rule) => {
    const current = normalizeStatus(rule.status);

    const newStatus = current === "Running" ? "Paused" : "Running";

    // optimistic UI update
    setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, status: newStatus } : r))
    );
    try {
      await updateDoc(doc(db, "configs", rule.id), { status: newStatus });

      if (user?.email) {
        await logAction({
          userEmail: user.email,
          action: 'update',
          details: `Changed status of rule ${rule.name || rule.id} to ${newStatus}`
        });
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, status: current } : r))
      );
      alert("Failed to update status. Please try again.");
    }
  };

  // CHANGED: When clicking a rule name, route is decided by its type
  const openRuleForEdit = async (rule) => {
    const target = routeForType(rule.type);
    navigate(target, { state: { id: rule.id, mode: "edit" } });

    if(user?.email) {
      await logAction({
        userEmail: user.email,
        action: 'edit',
        details: `Edited rule: ${rule.name}`}
      )
    }
  };

  // Format conditions for chips (supports Firestore object schema)
  const renderConditions = (rule) => {
    const conds = rule.condition || rule.conditions || [];
    return conds.map((c, idx) => {
      if (typeof c === "string") return c;
      const m = (c.metric || "").toString().toUpperCase();
      const sym = comparisonSymbol[c.comparison] || "=";
      const thr = c.threshold ?? c.value ?? "";
      return `${m} ${sym} ${thr}`;
    });
  };

  const PlatformIcon = ({ platform }) => {
    const key = normalizePlatformKey(platform);
    const src = PLATFORM_ICONS[key];
    if (!src) return null;
    return <img src={src} alt={key} title={key} className="w-5 h-5" />;
  };

  // Platform display name mapping
  const getPlatformDisplayName = (platform) => {
    switch (platform) {
      case "facebook":
        return "Meta";
      case "google":
        return "Google";
      case "snapchat":
        return "Snap";
      case "tiktok":
        return "TikTok";
      case "newsbreak":
        return "News Break";
      default:
        return platform;
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

        {/* Main content with proper spacing */}
        <div className={`p-6 ${isScrolled ? "pt-16" : ""}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-cyan-600 pr-3">Rules</h1>
              </div>
            </div>

            {/* Original Action Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative" ref={dropdownRef}>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md"
                    onClick={() => setDropdownOpen(!dropdownOpen)}>
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
                                onClick={() => addNewRule(type)}>
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
                  <th className="w-32 font-medium text-gray-700 p-3 text-left">Frequency</th>
                  <th className="w-32 font-medium text-gray-700 p-3 text-left">Platform</th>
                </tr>
                </thead>
                <tbody>
                {rules.length > 0 ? (
                    rules.map((rule, index) => {
                      const displayStatus = normalizeStatus(rule.status); // NEW
                      return (
                          <tr
                              key={rule.id}
                              className={`hover:bg-gray-100 border-b ${
                                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }`}>
                            <td className="py-3 px-3 border-r border-gray-200">
                              <div className="flex items-center gap-2">
                                {/* Toggle (persists) */}
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      checked={displayStatus === "Running"} // CHANGED
                                      onChange={() => toggleStatus(rule)}
                                      className="sr-only peer"
                                  />
                                  <div
                                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                                  peer-checked:after:translate-x-full peer-checked:after:border-white
                                  after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                                  after:bg-white after:border-gray-300 after:border after:rounded-full
                                  after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"
                                  />
                                </label>

                                {/* quick actions */}
                                <div className="flex items-center gap-1 ml-2">
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <Copy className="w-4 h-4 text-blue-500" />
                                  </button>
                                  <button
                                      className="p-1 hover:bg-gray-100 rounded"
                                      onClick={() => deleteRule(rule.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 border-r border-gray-200">
                              <button
                                  onClick={() => openRuleForEdit(rule)}
                                  className="text-left hover:text-blue-600 transition-colors font-medium text-sm text-gray-900">
                                {rule.name || `Unnamed ${rule.type}`}
                              </button>
                            </td>

                            <td className="py-3 px-3 border-r border-gray-200">
                          <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  displayStatus
                              )}`}>
                            {displayStatus}
                          </span>
                            </td>

                            <td className="text-sm text-gray-600 py-3 px-3 border-r border-gray-200">
                              {rule.type}
                            </td>

                            <td className="py-3 px-3 border-r border-gray-200">
                              <div className="flex flex-wrap gap-1">
                                {renderConditions(rule).map((txt, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                                            txt,
                                            i
                                        )}`}
                                    >
                                {txt}
                              </span>
                                ))}
                              </div>
                            </td>

                            <td className="text-sm text-gray-600 py-3 px-3">
                              {rule.frequency}
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center">
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
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
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
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RulesDashboard;
