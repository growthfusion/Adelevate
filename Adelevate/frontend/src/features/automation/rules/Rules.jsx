import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Copy, Trash2, Search as SearchIcon, Edit2 } from "lucide-react";
import { SquarePen } from "lucide-react";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import { logAction } from "@/utils/actionLog";
import { supabase } from "@/supabaseClient";
import { useTheme } from "@/context/ThemeContext";

// Firestore
import { db } from "@/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

// ============================================
// PREMIUM SAAS THEME CONFIGURATION
// ============================================
const createPremiumTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // Backgrounds - Deep Rich Blacks
      bgMain: "#050505",
      bgCard: "#0A0A0A",
      bgCardHover: "#0E0E0E",
      bgCardElevated: "#111111",
      bgTable: "#070707",
      bgTableRowHover: "rgba(255, 255, 255, 0.025)",
      bgMuted: "#0F0F0F",
      bgInput: "#0A0A0A",
      bgButton: "#111111",
      bgButtonHover: "#1A1A1A",
      bgDropdown: "#0C0C0C",

      // Borders
      borderSubtle: "rgba(255, 255, 255, 0.06)",
      borderMedium: "rgba(255, 255, 255, 0.1)",
      borderInput: "rgba(255, 255, 255, 0.08)",
      borderInputFocus: "#3B82F6",
      dividerSubtle: "rgba(255, 255, 255, 0.04)",

      // Text
      textPrimary: "#FAFAFA",
      textSecondary: "#B0B0B0",
      textTertiary: "#707070",
      textMuted: "#505050",

      // Accent (Primary Blue)
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      accentLight: "rgba(59, 130, 246, 0.12)",
      accentLighter: "rgba(59, 130, 246, 0.06)",
      accentGlow: "rgba(59, 130, 246, 0.3)",
      accentGradientStart: "#3B82F6",
      accentGradientEnd: "#1D4ED8",

      // Status Colors with Glow
      success: "#10B981",
      successLight: "rgba(16, 185, 129, 0.12)",
      successGlow: "rgba(16, 185, 129, 0.25)",

      warning: "#F59E0B",
      warningLight: "rgba(245, 158, 11, 0.12)",
      warningGlow: "rgba(245, 158, 11, 0.25)",

      error: "#EF4444",
      errorLight: "rgba(239, 68, 68, 0.12)",
      errorGlow: "rgba(239, 68, 68, 0.25)",

      info: "#3B82F6",
      infoLight: "rgba(59, 130, 246, 0.12)",
      infoGlow: "rgba(59, 130, 246, 0.25)",

      // Premium Shadows
      shadowSm: "0 1px 2px rgba(0, 0, 0, 0.5)",
      shadowMd: "0 4px 16px rgba(0, 0, 0, 0.4)",
      shadowLg: "0 12px 40px rgba(0, 0, 0, 0.5)",
      shadowXl: "0 24px 60px rgba(0, 0, 0, 0.6)",
      shadowGlow: "0 0 50px rgba(59, 130, 246, 0.15)",
      shadowInner: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",

      // Condition Tag Colors (Neon accents)
      conditionColors: [
        {
          bg: "rgba(59, 130, 246, 0.15)",
          border: "rgba(59, 130, 246, 0.25)",
          color: "#60A5FA",
          glow: "rgba(59, 130, 246, 0.2)"
        },
        {
          bg: "rgba(168, 85, 247, 0.15)",
          border: "rgba(168, 85, 247, 0.25)",
          color: "#C084FC",
          glow: "rgba(168, 85, 247, 0.2)"
        },
        {
          bg: "rgba(236, 72, 153, 0.15)",
          border: "rgba(236, 72, 153, 0.25)",
          color: "#F472B6",
          glow: "rgba(236, 72, 153, 0.2)"
        },
        {
          bg: "rgba(20, 184, 166, 0.15)",
          border: "rgba(20, 184, 166, 0.25)",
          color: "#2DD4BF",
          glow: "rgba(20, 184, 166, 0.2)"
        },
        {
          bg: "rgba(251, 146, 60, 0.15)",
          border: "rgba(251, 146, 60, 0.25)",
          color: "#FB923C",
          glow: "rgba(251, 146, 60, 0.2)"
        }
      ],

      // Gradients
      gradientSubtle: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
      gradientCard: "linear-gradient(180deg, #0C0C0C 0%, #0A0A0A 100%)"
    };
  } else {
    return {
      // ============================================
      // PREMIUM LIGHT THEME - Clean & Sophisticated
      // ============================================

      // Backgrounds - Warm, Soft Whites
      bgMain: "#F8F9FC",
      bgCard: "#FFFFFF",
      bgCardHover: "#FAFBFD",
      bgCardElevated: "#FFFFFF",
      bgTable: "#FEFEFE",
      bgTableRowHover: "#F7F8FA",
      bgMuted: "#F3F4F8",
      bgInput: "#FFFFFF",
      bgButton: "#F5F6FA",
      bgButtonHover: "#EBEDF3",
      bgDropdown: "#FFFFFF",

      // Borders - Subtle & Refined
      borderSubtle: "#E8EAF0",
      borderMedium: "#DDE0E9",
      borderInput: "#E2E5ED",
      borderInputFocus: "#3B82F6",
      dividerSubtle: "#F0F1F5",

      // Text - Rich & Readable
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textTertiary: "#64748B",
      textMuted: "#94A3B8",

      // Accent (Primary Blue)
      accent: "#3B82F6",
      accentHover: "#2563EB",
      accentLight: "rgba(59, 130, 246, 0.08)",
      accentLighter: "rgba(59, 130, 246, 0.04)",
      accentGlow: "rgba(59, 130, 246, 0.12)",
      accentGradientStart: "#3B82F6",
      accentGradientEnd: "#2563EB",

      // Status Colors - Vibrant but Refined
      success: "#059669",
      successLight: "#ECFDF5",
      successGlow: "rgba(5, 150, 105, 0.1)",
      successBorder: "#A7F3D0",

      warning: "#D97706",
      warningLight: "#FFFBEB",
      warningGlow: "rgba(217, 119, 6, 0.1)",
      warningBorder: "#FDE68A",

      error: "#DC2626",
      errorLight: "#FEF2F2",
      errorGlow: "rgba(220, 38, 38, 0.1)",
      errorBorder: "#FECACA",

      info: "#2563EB",
      infoLight: "#EFF6FF",
      infoGlow: "rgba(37, 99, 235, 0.1)",
      infoBorder: "#BFDBFE",

      // Shadows - Soft & Layered
      shadowSm: "0 1px 2px rgba(15, 23, 42, 0.04)",
      shadowMd: "0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
      shadowLg: "0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
      shadowXl: "0 24px 56px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.06)",
      shadowGlow: "0 0 0 3px rgba(59, 130, 246, 0.12)",
      shadowInner: "inset 0 1px 2px rgba(15, 23, 42, 0.06)",

      // Condition Tag Colors - Pastel & Clear
      conditionColors: [
        { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", glow: "transparent" },
        { bg: "#F5F3FF", border: "#DDD6FE", color: "#7C3AED", glow: "transparent" },
        { bg: "#FDF2F8", border: "#FBCFE8", color: "#BE185D", glow: "transparent" },
        { bg: "#F0FDFA", border: "#99F6E4", color: "#0D9488", glow: "transparent" },
        { bg: "#FFF7ED", border: "#FED7AA", color: "#C2410C", glow: "transparent" }
      ],

      // Gradients
      gradientSubtle: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)",
      gradientCard: "linear-gradient(180deg, #FFFFFF 0%, #FEFEFE 100%)"
    };
  }
};

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

// Platform icons
const PLATFORM_ICONS = {
  meta: fb,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nb
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

const PlatformIcon = ({ platform, theme, isDarkMode }) => {
  const key = normalizePlatformKey(platform);
  const src = PLATFORM_ICONS[key];
  if (!src) return null;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : theme.bgMuted,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: isDarkMode
          ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.02)"
          : theme.shadowSm
      }}
    >
      <img src={src} alt={key} title={key} className="w-5 h-5 object-contain" />
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
  "newsbreak_exclusion_campaign"
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
  const { isDarkMode } = useTheme();

  // Use premium theme
  const theme = createPremiumTheme(isDarkMode);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsDropdownOpen, setRowsDropdownOpen] = useState(false);
  const rowsDropdownRef = useRef(null);

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
            ...d.data()
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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(event.target)) {
        setRowsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ruleTypes = [
    { name: "Pause Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    { name: "Activate Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    { name: "Change Campaign Budget", platform: "facebook,google,snapchat,tiktok,newsbreak" },
    { name: "Exclusion Campaign", platform: "facebook,google,snapchat,tiktok,newsbreak" }
  ];

  // Premium status styles
  const getStatusStyles = (status) => {
    if (status === "Running") {
      return isDarkMode
        ? {
            backgroundColor: theme.successLight,
            borderColor: "rgba(16, 185, 129, 0.3)",
            color: theme.success,
            boxShadow: `0 0 16px ${theme.successGlow}`
          }
        : {
            backgroundColor: theme.successLight,
            borderColor: theme.successBorder,
            color: theme.success,
            boxShadow: "none"
          };
    }
    return isDarkMode
      ? {
          backgroundColor: theme.warningLight,
          borderColor: "rgba(245, 158, 11, 0.3)",
          color: theme.warning,
          boxShadow: `0 0 16px ${theme.warningGlow}`
        }
      : {
          backgroundColor: theme.warningLight,
          borderColor: theme.warningBorder,
          color: theme.warning,
          boxShadow: "none"
        };
  };

  // Premium condition styles
  const getConditionStyles = (index) => {
    const colorSet = theme.conditionColors[index % theme.conditionColors.length];
    return {
      backgroundColor: colorSet.bg,
      borderColor: colorSet.border,
      color: colorSet.color,
      boxShadow: isDarkMode ? `0 0 12px ${colorSet.glow}` : "none"
    };
  };

  // Comparison symbol
  const getComparisonSymbol = (operator) => {
    let symbol = "";
    let color = "";

    switch (operator) {
      case "gt":
      case "Greater":
        symbol = ">";
        color = theme.success;
        break;
      case "gte":
      case "Greater or Equal":
        symbol = "≥";
        color = theme.success;
        break;
      case "lt":
      case "Less":
        symbol = "<";
        color = theme.error;
        break;
      case "lte":
      case "Less or Equal":
        symbol = "≤";
        color = theme.error;
        break;
      case "eq":
      case "Equal to":
        symbol = "=";
        color = theme.info;
        break;
      default:
        symbol = "=";
        color = theme.textTertiary;
    }

    return (
      <span
        className="font-bold text-sm"
        style={{
          color,
          textShadow: isDarkMode ? `0 0 8px ${color}40` : "none"
        }}
      >
        {symbol}
      </span>
    );
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
        platformIcon: getPlatformIconUrl(firstPlatform)
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
          platformIcon: getPlatformIconUrl(rule.platform)
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
          status: "running"
        });
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      alert("Failed to update status. Please try again.");
    } finally {
      setPendingKeys((p) => p.filter((x) => x !== k));
    }
  };

  const ruleEdit = async (rule) => {
    const target = routeForType(rule.type);
    const ruleName = getRuleName(rule);

    navigate(target, {
      state: { id: rule.id, colName: rule.__colName, mode: "edit" }
    });

    if (user?.email) {
      await logAction({
        userEmail: user.email,
        action: "edit",
        details: `Edited rule: "${ruleName}"`,
        platform: normalizePlatformKey(rule.platform),
        ruleName: ruleName,
        ruleConditions: formatConditionsForLog(rule),
        platformIcon: getPlatformIconUrl(rule.platform)
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
          <span className="font-medium">{m}</span>
          <span className="mx-0.5">{getComparisonSymbol(operator)}</span>
          <span className="font-semibold">{thr}</span>
        </div>
      );
    });
  };

  const duplicateRule = (rule) => {
    alert(`Duplicate feature for "${getRuleName(rule)}" coming soon!`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(rules.length / rowsPerPage);
  const paginatedRules = rules.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ============================================
  // PREMIUM TOGGLE SWITCH COMPONENT
  // ============================================
  const ToggleSwitch = ({ checked, onChange, disabled }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <label
        className="relative inline-flex items-center cursor-pointer select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className="w-12 h-7 rounded-full transition-all duration-300 relative"
          style={{
            backgroundColor: checked ? theme.success : isDarkMode ? "#1F1F1F" : "#E2E5ED",
            boxShadow: checked
              ? isDarkMode
                ? `0 0 ${isHovered ? "20px" : "14px"} ${theme.successGlow}, inset 0 1px 1px rgba(255,255,255,0.1)`
                : `0 2px 8px ${theme.successGlow}`
              : isDarkMode
                ? "inset 0 2px 4px rgba(0,0,0,0.3)"
                : `inset 0 2px 4px rgba(0,0,0,0.08)`
          }}
        >
          {/* Knob */}
          <div
            className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-all duration-300 flex items-center justify-center"
            style={{
              left: checked ? "calc(100% - 25px)" : "3px",
              backgroundColor: "#FFFFFF",
              boxShadow: isDarkMode
                ? `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)`
                : `0 2px 6px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)`,
              transform: isHovered && !disabled ? "scale(1.05)" : "scale(1)"
            }}
          >
            {/* Inner dot indicator */}
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: checked ? theme.success : isDarkMode ? "#555" : "#C0C0C0",
                opacity: checked ? 1 : 0.6
              }}
            />
          </div>
        </div>
      </label>
    );
  };

  // ============================================
  // PREMIUM ACTION BUTTON COMPONENT
  // ============================================
  const ActionButton = ({ icon: Icon, onClick, color, hoverBg, tooltip }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div className="relative group">
        <button
          className="p-2.5 rounded-xl transition-all duration-200"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: isHovered ? hoverBg : "transparent",
            transform: isHovered ? "translateY(-1px) scale(1.02)" : "translateY(0) scale(1)",
            boxShadow: isHovered
              ? isDarkMode
                ? `0 4px 16px ${color}25`
                : `0 4px 12px ${color}15`
              : "none"
          }}
        >
          <Icon
            className="w-[18px] h-[18px] transition-all duration-200"
            style={{
              color,
              filter: isHovered && isDarkMode ? `drop-shadow(0 0 6px ${color}80)` : "none"
            }}
          />
        </button>
        {/* Premium Tooltip */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50"
          style={{
            backgroundColor: isDarkMode ? "#1A1A1A" : theme.bgCard,
            color: theme.textSecondary,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowLg
          }}
        >
          {tooltip}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${theme.borderSubtle}`
            }}
          />
        </div>
      </div>
    );
  };

  // ============================================
  // PREMIUM NEW RULE DROPDOWN COMPONENT
  // ============================================
  const NewRuleDropdown = ({ isFixed = false }) => {
    const [buttonHovered, setButtonHovered] = useState(false);

    return (
      <div className="relative" ref={!isFixed ? dropdownRef : undefined}>
        <button
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`,
            color: "#FFFFFF",
            boxShadow: buttonHovered
              ? isDarkMode
                ? `0 8px 32px ${theme.accentGlow}, 0 0 0 1px rgba(255,255,255,0.1) inset`
                : `0 8px 24px rgba(59, 130, 246, 0.35), 0 0 0 1px rgba(255,255,255,0.2) inset`
              : isDarkMode
                ? `0 4px 16px ${theme.accentGlow}, 0 0 0 1px rgba(255,255,255,0.1) inset`
                : `0 4px 14px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.2) inset`,
            transform: buttonHovered ? "translateY(-2px)" : "translateY(0)"
          }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden ss:inline tracking-tight">New Rule</span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute left-0 top-full mt-3 w-80 rounded-2xl z-50 overflow-hidden"
            style={{
              backgroundColor: theme.bgDropdown,
              border: `1px solid ${theme.borderSubtle}`,
              boxShadow: isDarkMode
                ? `${theme.shadowXl}, 0 0 60px rgba(59, 130, 246, 0.08)`
                : theme.shadowXl
            }}
          >
            <div className="p-4">
              {/* Premium Search Input */}
              <div className="relative mb-4">
                <SearchIcon
                  className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: theme.textMuted }}
                />
                <input
                  placeholder="Search rule types..."
                  className="pl-11 pr-4 py-3 rounded-xl w-full text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    backgroundColor: theme.bgMuted,
                    border: `1px solid ${theme.borderInput}`,
                    color: theme.textPrimary
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.borderInputFocus;
                    e.target.style.boxShadow = theme.shadowGlow;
                    e.target.style.backgroundColor = theme.bgInput;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.borderInput;
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = theme.bgMuted;
                  }}
                />
              </div>

              {/* Rule Type Options */}
              <div className="space-y-1">
                {filteredRuleTypes.map((type, idx) => (
                  <button
                    key={type.name}
                    className="flex items-center w-full py-3 px-4 text-left rounded-xl transition-all duration-200 group"
                    style={{ color: theme.textSecondary }}
                    onClick={() => addNewRule(type)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? theme.bgCardHover
                        : theme.bgMuted;
                      e.currentTarget.style.color = theme.textPrimary;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = theme.textSecondary;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200"
                      style={{
                        backgroundColor: theme.accentLighter,
                        border: `1px solid ${isDarkMode ? "rgba(59,130,246,0.2)" : theme.accentLight}`
                      }}
                    >
                      <Plus className="w-4 h-4" style={{ color: theme.accent }} />
                    </div>
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
                {filteredRuleTypes.length === 0 && (
                  <p className="text-sm py-6 text-center" style={{ color: theme.textMuted }}>
                    No rule types found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen pb-12 max-sm:pt-[20%] pt-0 transition-colors duration-300"
      style={{ backgroundColor: theme.bgMain }}
    >
      <div ref={headerRef}></div>

      {/* Fixed action bar when scrolled - Premium Glass Effect */}
      {isScrolled && (
        <div
          className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
          style={{
            backgroundColor: isDarkMode ? "rgba(5, 5, 5, 0.8)" : "rgba(248, 249, 252, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: `1px solid ${theme.borderSubtle}`,
            boxShadow: isDarkMode
              ? "0 4px 30px rgba(0, 0, 0, 0.4)"
              : "0 4px 20px rgba(0, 0, 0, 0.06)"
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3 px-6 py-4">
            <NewRuleDropdown isFixed />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`px-6 sm:px-8 lg:px-12 ${isScrolled ? "pt-20" : "pt-8"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
             
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{
                  color: theme.textPrimary
                }}
              >
                Rules
              </h1>
            </div>
          
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 mb-8">
            <NewRuleDropdown />
          </div>

          {/* Premium Table Card */}
          <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              boxShadow: isDarkMode ? `${theme.shadowLg}` : theme.shadowMd
            }}
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead
                  className="sticky top-0 z-10"
                  style={{
                    backgroundColor: isDarkMode ? theme.bgTable : "#FAFBFC"
                  }}
                >
                  <tr style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}>
                    {[
                      "Actions",
                      "Name",
                      "Status",
                      "Type",
                      "Conditions",
                      "Frequency",
                      "Platform"
                    ].map((header, idx) => (
                      <th
                        key={header}
                        className={`px-6 py-4 text-left ${idx < 6 ? "border-r" : ""}`}
                        style={{ borderColor: theme.dividerSubtle }}
                      >
                        <span
                          className="text-[11px] font-semibold uppercase tracking-widest"
                          style={{ color: theme.textMuted }}
                        >
                          {header}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedRules.length > 0 ? (
                    paginatedRules.map((rule) => {
                      const displayStatus = normalizeStatus(rule.status);
                      const k = ruleKey(rule);
                      const statusStyles = getStatusStyles(displayStatus);

                      return (
                        <tr
                          key={k}
                          className="transition-all duration-200"
                          style={{
                            borderBottom: `1px solid ${theme.dividerSubtle}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.bgTableRowHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          {/* Actions */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <div className="flex items-center gap-4">
                              <ToggleSwitch
                                checked={displayStatus === "Running"}
                                onChange={() => toggleStatus(rule)}
                                disabled={isPending(k)}
                              />
                              <div
                                className="flex items-center gap-0.5 p-1.5 rounded-xl"
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "rgba(255,255,255,0.02)"
                                    : theme.bgMuted,
                                  border: `1px solid ${theme.dividerSubtle}`
                                }}
                              >
                                <ActionButton
                                  icon={SquarePen}
                                  onClick={() => ruleEdit(rule)}
                                  color={theme.accent}
                                  hoverBg={theme.accentLight}
                                  tooltip="Edit"
                                />
                                <ActionButton
                                  icon={Copy}
                                  onClick={() => duplicateRule(rule)}
                                  color={isDarkMode ? "#60A5FA" : theme.info}
                                  hoverBg={theme.infoLight}
                                  tooltip="Duplicate"
                                />
                                <ActionButton
                                  icon={Trash2}
                                  onClick={() => deleteRule(rule)}
                                  color={theme.error}
                                  hoverBg={theme.errorLight}
                                  tooltip="Delete"
                                />
                              </div>
                            </div>
                          </td>

                          {/* Name */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <button
                              onClick={() => ruleEdit(rule)}
                              className="text-left font-semibold text-sm transition-all duration-200 hover:underline decoration-2 underline-offset-2"
                              style={{
                                color: theme.textPrimary,
                                textDecorationColor: theme.accent
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = theme.accent;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = theme.textPrimary;
                              }}
                            >
                              {rule.name || `Unnamed ${rule.type}`}
                            </button>
                          </td>

                          {/* Status */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <span
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border tracking-wide"
                              style={statusStyles}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full mr-2 animate-pulse"
                                style={{
                                  backgroundColor: statusStyles.color,
                                  boxShadow: isDarkMode ? `0 0 8px ${statusStyles.color}` : "none"
                                }}
                              />
                              {displayStatus}
                            </span>
                          </td>

                          {/* Type */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <span
                              className="text-sm font-medium px-3 py-1.5 rounded-lg"
                              style={{
                                color: theme.textSecondary,
                                backgroundColor: isDarkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : theme.bgMuted
                              }}
                            >
                              {rule.type}
                            </span>
                          </td>

                          {/* Conditions */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <div className="flex flex-wrap gap-2">
                              {renderConditions(rule).map((txt, i) => (
                                <span
                                  key={`${k}-c${i}`}
                                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200"
                                  style={getConditionStyles(i)}
                                >
                                  {txt}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Frequency */}
                          <td
                            className="px-6 py-5 border-r"
                            style={{ borderColor: theme.dividerSubtle }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: theme.textTertiary }}
                            >
                              {rule.frequency}
                            </span>
                          </td>

                          {/* Platform */}
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <PlatformIcon
                                platform={rule.platform}
                                theme={theme}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-6">
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accentLighter})`,
                              border: `1px solid ${isDarkMode ? "rgba(59,130,246,0.2)" : theme.accentLight}`,
                              boxShadow: isDarkMode
                                ? `0 8px 32px ${theme.accentGlow}`
                                : theme.shadowMd
                            }}
                          >
                            <Plus
                              className="w-10 h-10"
                              style={{
                                color: theme.accent,
                                filter: isDarkMode
                                  ? `drop-shadow(0 0 8px ${theme.accent}60)`
                                  : "none"
                              }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-xl font-semibold mb-2"
                              style={{ color: theme.textPrimary }}
                            >
                              No rules yet
                            </p>
                            <p
                              className="text-sm max-w-sm mx-auto"
                              style={{ color: theme.textTertiary }}
                            >
                              Get started by creating your first automation rule to optimize your
                              campaigns
                            </p>
                          </div>
                          <button
                            className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`,
                              color: "#FFFFFF",
                              boxShadow: isDarkMode
                                ? `0 4px 20px ${theme.accentGlow}`
                                : `0 4px 14px rgba(59, 130, 246, 0.3)`
                            }}
                            onClick={() => setDropdownOpen(true)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? `0 8px 30px ${theme.accentGlow}`
                                : `0 8px 24px rgba(59, 130, 246, 0.4)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = isDarkMode
                                ? `0 4px 20px ${theme.accentGlow}`
                                : `0 4px 14px rgba(59, 130, 246, 0.3)`;
                            }}
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            Create Your First Rule
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="md:hidden">
              {paginatedRules.length > 0 ? (
                paginatedRules.map((rule) => {
                  const displayStatus = normalizeStatus(rule.status);
                  const k = ruleKey(rule);
                  const statusStyles = getStatusStyles(displayStatus);

                  return (
                    <div
                      key={k}
                      className="p-6 transition-all duration-200"
                      style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.bgCardHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <PlatformIcon
                            platform={rule.platform}
                            theme={theme}
                            isDarkMode={isDarkMode}
                          />
                          <div>
                            <h3
                              className="font-semibold text-sm"
                              style={{ color: theme.textPrimary }}
                            >
                              {rule.name || `Unnamed ${rule.type}`}
                            </h3>
                            <p className="text-xs mt-1" style={{ color: theme.textTertiary }}>
                              {rule.type}
                            </p>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
                          style={statusStyles}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-2"
                            style={{
                              backgroundColor: statusStyles.color,
                              boxShadow: isDarkMode ? `0 0 6px ${statusStyles.color}` : "none"
                            }}
                          />
                          {displayStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-5">
                        {/* Conditions Card */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            backgroundColor: isDarkMode ? theme.bgMuted : theme.bgMuted,
                            border: `1px solid ${theme.borderSubtle}`
                          }}
                        >
                          <p
                            className="text-[10px] mb-3 font-semibold uppercase tracking-widest"
                            style={{ color: theme.textMuted }}
                          >
                            Conditions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {renderConditions(rule).map((txt, i) => (
                              <span
                                key={`${k}-c${i}`}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border"
                                style={getConditionStyles(i)}
                              >
                                {txt}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Frequency Card */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            backgroundColor: isDarkMode ? theme.bgMuted : theme.bgMuted,
                            border: `1px solid ${theme.borderSubtle}`
                          }}
                        >
                          <p
                            className="text-[10px] mb-2 font-semibold uppercase tracking-widest"
                            style={{ color: theme.textMuted }}
                          >
                            Frequency
                          </p>
                          <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            {rule.frequency}
                          </p>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div
                        className="flex items-center justify-between pt-4"
                        style={{ borderTop: `1px solid ${theme.dividerSubtle}` }}
                      >
                        <div className="flex items-center gap-4">
                          <ToggleSwitch
                            checked={displayStatus === "Running"}
                            onChange={() => toggleStatus(rule)}
                            disabled={isPending(k)}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: theme.textSecondary }}
                          >
                            {displayStatus === "Running" ? "Active" : "Paused"}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-1 p-1.5 rounded-xl"
                          style={{
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : theme.bgMuted,
                            border: `1px solid ${theme.dividerSubtle}`
                          }}
                        >
                          <button
                            className="p-2.5 rounded-xl transition-all duration-200"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => ruleEdit(rule)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.accentLight;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <Edit2 className="w-4 h-4" style={{ color: theme.accent }} />
                          </button>
                          <button
                            className="p-2.5 rounded-xl transition-all duration-200"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => duplicateRule(rule)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.infoLight;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <Copy
                              className="w-4 h-4"
                              style={{ color: isDarkMode ? "#60A5FA" : theme.info }}
                            />
                          </button>
                          <button
                            className="p-2.5 rounded-xl transition-all duration-200"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => deleteRule(rule)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.errorLight;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <Trash2 className="w-4 h-4" style={{ color: theme.error }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accentLighter})`,
                        border: `1px solid ${isDarkMode ? "rgba(59,130,246,0.2)" : theme.accentLight}`,
                        boxShadow: isDarkMode ? `0 8px 32px ${theme.accentGlow}` : theme.shadowMd
                      }}
                    >
                      <Plus
                        className="w-10 h-10"
                        style={{
                          color: theme.accent,
                          filter: isDarkMode ? `drop-shadow(0 0 8px ${theme.accent}60)` : "none"
                        }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xl font-semibold mb-2"
                        style={{ color: theme.textPrimary }}
                      >
                        No rules yet
                      </p>
                      <p className="text-sm max-w-sm mx-auto" style={{ color: theme.textTertiary }}>
                        Get started by creating your first automation rule
                      </p>
                    </div>
                    <button
                      className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`,
                        color: "#FFFFFF",
                        boxShadow: `0 4px 20px ${theme.accentGlow}`
                      }}
                      onClick={() => setDropdownOpen(true)}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                      Create Rule
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Pagination Footer */}
            {paginatedRules.length > 0 && (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5"
                style={{
                  backgroundColor: isDarkMode ? theme.bgTable : "#FAFBFC",
                  borderTop: `1px solid ${theme.borderSubtle}`
                }}
              >
                <div className="text-sm mb-3 sm:mb-0" style={{ color: theme.textTertiary }}>
                  Showing{" "}
                  <span style={{ color: theme.textPrimary, fontWeight: 600 }}>
                    {(currentPage - 1) * rowsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span style={{ color: theme.textPrimary, fontWeight: 600 }}>
                    {Math.min(currentPage * rowsPerPage, rules.length)}
                  </span>{" "}
                  of{" "}
                  <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{rules.length}</span>{" "}
                  rules
                </div>

                <div className="flex items-center gap-5">
                  {/* Rows per page */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
                      Rows:
                    </span>
                    <div className="relative" ref={rowsDropdownRef}>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                          backgroundColor: isDarkMode ? theme.bgButton : theme.bgButton,
                          border: `1px solid ${theme.borderSubtle}`,
                          color: theme.textSecondary
                        }}
                        onClick={() => setRowsDropdownOpen(!rowsDropdownOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = theme.borderMedium;
                          e.currentTarget.style.backgroundColor = theme.bgButtonHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.borderSubtle;
                          e.currentTarget.style.backgroundColor = theme.bgButton;
                        }}
                      >
                        {rowsPerPage}
                        <ChevronDown
                          className="w-4 h-4 transition-transform duration-200"
                          style={{
                            color: theme.textMuted,
                            transform: rowsDropdownOpen ? "rotate(180deg)" : "rotate(0)"
                          }}
                        />
                      </button>
                      {rowsDropdownOpen && (
                        <div
                          className="absolute right-0 bottom-full mb-2 rounded-xl overflow-hidden z-10"
                          style={{
                            backgroundColor: theme.bgDropdown,
                            border: `1px solid ${theme.borderSubtle}`,
                            boxShadow: theme.shadowLg
                          }}
                        >
                          {[5, 10, 25, 50, 100].map((num) => (
                            <button
                              key={num}
                              className="block w-full text-left px-5 py-2.5 text-sm font-medium transition-all duration-150"
                              style={{
                                backgroundColor:
                                  rowsPerPage === num ? theme.accentLight : "transparent",
                                color: rowsPerPage === num ? theme.accent : theme.textSecondary,
                                fontWeight: rowsPerPage === num ? 600 : 500
                              }}
                              onClick={() => {
                                setRowsPerPage(num);
                                setCurrentPage(1);
                                setRowsDropdownOpen(false);
                              }}
                              onMouseEnter={(e) => {
                                if (rowsPerPage !== num) {
                                  e.currentTarget.style.backgroundColor = theme.bgCardHover;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (rowsPerPage !== num) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }
                              }}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div
                    className="flex items-center gap-1 p-1.5 rounded-xl"
                    style={{
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : theme.bgMuted,
                      border: `1px solid ${theme.dividerSubtle}`
                    }}
                  >
                    {/* Previous Button */}
                    <button
                      className="p-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: "transparent",
                        color: currentPage === 1 ? theme.textMuted : theme.textSecondary,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.backgroundColor = theme.bgButtonHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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

                        const isActive = currentPage === pageNum;

                        return (
                          <button
                            key={pageNum}
                            className="min-w-[2rem] h-8 px-2 rounded-lg text-sm font-semibold transition-all duration-200"
                            style={{
                              background: isActive
                                ? `linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`
                                : "transparent",
                              color: isActive ? "#FFFFFF" : theme.textSecondary,
                              boxShadow: isActive
                                ? isDarkMode
                                  ? `0 4px 12px ${theme.accentGlow}`
                                  : `0 2px 8px rgba(59, 130, 246, 0.25)`
                                : "none"
                            }}
                            onClick={() => setCurrentPage(pageNum)}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = theme.bgButtonHover;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      className="p-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: "transparent",
                        color:
                          currentPage === totalPages || totalPages === 0
                            ? theme.textMuted
                            : theme.textSecondary,
                        cursor:
                          currentPage === totalPages || totalPages === 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1
                      }}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages && totalPages !== 0) {
                          e.currentTarget.style.backgroundColor = theme.bgButtonHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
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

      {/* Global CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default RulesDashboard;
