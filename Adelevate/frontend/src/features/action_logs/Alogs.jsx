// src/features/logs/LogsDataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { supabase } from "@/supabaseClient";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

/**
 * Premium SaaS LogsDataTable Component
 * Enhanced Dark Theme Design with Container Scroll
 */

// ============ AVATAR COLORS ============
const avatarColors = [
  { bg: "linear-gradient(135deg, #3B82F6, #1D4ED8)", color: "#FFFFFF" }, // Blue
  { bg: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#FFFFFF" }, // Purple
  { bg: "linear-gradient(135deg, #10B981, #059669)", color: "#FFFFFF" }, // Green
  { bg: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#FFFFFF" }, // Amber
  { bg: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#FFFFFF" }, // Red
  { bg: "linear-gradient(135deg, #EC4899, #DB2777)", color: "#FFFFFF" }, // Pink
  { bg: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "#FFFFFF" }, // Cyan
  { bg: "linear-gradient(135deg, #F97316, #EA580C)", color: "#FFFFFF" }, // Orange
  { bg: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#FFFFFF" }, // Teal
  { bg: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#FFFFFF" }, // Indigo
  { bg: "linear-gradient(135deg, #A855F7, #9333EA)", color: "#FFFFFF" }, // Violet
  { bg: "linear-gradient(135deg, #84CC16, #65A30D)", color: "#FFFFFF" }, // Lime
];

// Get consistent color based on email
const getAvatarColor = (email) => {
  if (!email) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

// Get avatar background color for UI Avatars API
const getAvatarBgColor = (email) => {
  const colors = [
    "3B82F6", "8B5CF6", "10B981", "F59E0B", "EF4444", 
    "EC4899", "06B6D4", "F97316", "14B8A6", "6366F1",
    "A855F7", "84CC16"
  ];
  if (!email) return colors[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// ============ UTILITY FUNCTIONS ============

function formatDate(ts) {
  try {
    if (!ts) return "N/A";
    const date = new Date(ts);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return String(ts);
  }
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) =>
          typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell ?? ""
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderCondition(condition) {
  if (!condition) return null;

  try {
    if (typeof condition === "string") return condition;

    if (
      condition.metric ||
      condition.operator ||
      condition.threshold ||
      condition.value
    ) {
      const metric = condition.metric?.toUpperCase() || "";
      let operator = condition.operator || condition.comparison || "eq";
      const value = condition.threshold ?? condition.value ?? "";

      let symbol = "=";
      switch (operator.toLowerCase()) {
        case "gt":
        case "greater":
          symbol = ">";
          break;
        case "gte":
        case "greater or equal":
          symbol = "≥";
          break;
        case "lt":
        case "less":
          symbol = "<";
          break;
        case "lte":
        case "less or equal":
          symbol = "≤";
          break;
        case "eq":
        case "equal":
        case "equal to":
          symbol = "=";
          break;
        default:
          symbol = operator;
      }

      return `${metric} ${symbol} ${value}`;
    }

    return JSON.stringify(condition);
  } catch (err) {
    console.error("Error rendering condition:", err);
    return String(condition);
  }
}

function getPlatformIcon(platform) {
  if (!platform) return null;

  const platformLower = String(platform).toLowerCase();

  const icons = {
    facebook: "/icons/facebook.svg",
    fb: "/icons/facebook.svg",
    instagram: "/icons/instagram.svg",
    ig: "/icons/instagram.svg",
    twitter: "/icons/twitter.svg",
    x: "/icons/twitter.svg",
    linkedin: "/icons/linkedin.svg",
    youtube: "/icons/youtube.svg",
    tiktok: "/icons/tiktok.svg",
    pinterest: "/icons/pinterest.svg",
    snapchat: "/icons/snapchat.svg",
    amazon: "/icons/amazon.svg",
    shopify: "/icons/shopify.svg",
    "google analytics": "/icons/google-analytics.svg",
    "google ads": "/icons/google-ads.svg",
    "facebook ads": "/icons/facebook-ads.svg",
    hubspot: "/icons/hubspot.svg",
    salesforce: "/icons/salesforce.svg",
    aws: "/icons/aws.svg",
    firebase: "/icons/firebase.svg",
  };

  for (const [key, url] of Object.entries(icons)) {
    if (platformLower === key || platformLower.includes(key)) {
      return url;
    }
  }

  return "/icons/platform-generic.svg";
}

function generateAvatarUrl(email) {
  if (!email) return null;
  const bgColor = getAvatarBgColor(email);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    email.split("@")[0]
  )}&background=${bgColor}&color=fff&bold=true&size=128`;
}

const formatRuleConditions = (conditionsStr) => {
  if (!conditionsStr) return "N/A";

  try {
    if (
      typeof conditionsStr === "string" &&
      !conditionsStr.startsWith("[") &&
      !conditionsStr.startsWith("{")
    ) {
      return conditionsStr;
    }

    const conditions =
      typeof conditionsStr === "string" ? JSON.parse(conditionsStr) : conditionsStr;

    if (Array.isArray(conditions)) {
      return conditions.map(renderCondition).join(", ");
    }

    return renderCondition(conditions);
  } catch (e) {
    return conditionsStr;
  }
};

// ============ MAIN COMPONENT ============

export default function LogsDataTable() {
  // Redux theme
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  // Premium minimal theme colors
  const colors = {
    // Backgrounds
    bgMain: isDark ? "#09090B" : "#F9FAFB",
    bgCard: isDark ? "#111113" : "#FFFFFF",
    bgCardHover: isDark ? "#16161A" : "#F3F4F6",
    bgSecondary: isDark ? "#0D0D0F" : "#F9FAFB",
    bgTertiary: isDark ? "#18181B" : "#F3F4F6",
    bgInput: isDark ? "#16161A" : "#FFFFFF",
    bgTableRow: isDark ? "#111113" : "#FFFFFF",
    bgTableRowAlt: isDark ? "#0D0D0F" : "#F9FAFB",
    bgTableRowHover: isDark ? "#16161A" : "#F3F4F6",
    bgBadge: isDark ? "#18181B" : "#F3F4F6",

    // Borders - more subtle
    border: isDark ? "#1F1F23" : "#E5E7EB",
    borderHover: isDark ? "#27272A" : "#D1D5DB",
    borderInput: isDark ? "#1F1F23" : "#F3F4F6",
    borderFocus: "#3B82F6",

    // Text
    textPrimary: isDark ? "#FAFAFA" : "#111827",
    textSecondary: isDark ? "#A1A1AA" : "#4B5563",
    textTertiary: isDark ? "#71717A" : "#6B7280",
    textMuted: isDark ? "#52525B" : "#9CA3AF",

    // Accents - Professional Blue
    accent: "#3B82F6",
    accentHover: "#2563EB",
    accentLight: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.05)",
    accentGlow: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",

    // Status colors
    success: "#22C55E",
    successLight: isDark ? "rgba(34, 197, 94, 0.12)" : "#ECFDF5",
    warning: "#F59E0B",
    warningLight: isDark ? "rgba(245, 158, 11, 0.12)" : "#FFFBEB",
    error: "#EF4444",
    errorLight: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2",
    info: "#3B82F6",
    infoLight: isDark ? "rgba(59, 130, 246, 0.12)" : "#EFF6FF",

    // Shadows - subtle
    shadow: isDark ? "0 1px 3px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.06)",
    shadowMd: isDark ? "0 4px 12px rgba(0, 0, 0, 0.25)" : "0 4px 12px rgba(0, 0, 0, 0.08)",
    shadowHover: isDark ? "0 4px 12px rgba(0, 0, 0, 0.25)" : "0 4px 12px rgba(0, 0, 0, 0.08)"
  };

  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortBy, setSortBy] = useState({ key: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState("table");

  // Fetch from Supabase
  useEffect(() => {
    let channel;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Adelevate_Action_Log")
          .select(
            "id, email, action, details, created_at, platform, rule_name, rule_conditions, platform_icon"
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch Error:", error);
          displayToast("Failed to load logs. Please try again.");
        } else {
          const processedData = (Array.isArray(data) ? data : []).map((log) => {
            const iconUrl = log.platform_icon || getPlatformIcon(log.platform);
            const avatarUrl = generateAvatarUrl(log.email);
            const formattedConditions = formatRuleConditions(log.rule_conditions);
            const avatarColor = getAvatarColor(log.email);

            return {
              ...log,
              platformIcon: iconUrl,
              formattedConditions,
              avatarUrl,
              avatarColor
            };
          });

          setLogs(processedData);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        displayToast("An error occurred while loading logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Realtime subscription
    try {
      channel = supabase
        .channel("public:Adelevate_Action_Log")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Adelevate_Action_Log" },
          (payload) => {
            const iconUrl = payload.new.platform_icon || getPlatformIcon(payload.new.platform);
            const formattedConditions = formatRuleConditions(payload.new.rule_conditions);
            const avatarUrl = generateAvatarUrl(payload.new.email);
            const avatarColor = getAvatarColor(payload.new.email);

            const newLog = {
              ...payload.new,
              platformIcon: iconUrl,
              formattedConditions,
              avatarUrl,
              avatarColor
            };

            setLogs((prev) => [newLog, ...prev]);
            displayToast("New log received");
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime channel creation error", err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Get unique action types
  const actionTypes = useMemo(() => {
    const types = new Set(["add", "edit", "delete", "update", "view", "draft"]);
    logs.forEach((log) => {
      if (log.action) types.add(log.action.toLowerCase());
    });
    return ["all", ...Array.from(types)].sort();
  }, [logs]);

  // Filtering + searching + sorting
  const filteredSorted = useMemo(() => {
    let arr = logs.slice();

    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter((r) => {
        return (
          (r.email || "").toString().toLowerCase().includes(q) ||
          (r.action || "").toString().toLowerCase().includes(q) ||
          (r.details || "").toString().toLowerCase().includes(q) ||
          (r.rule_name || "").toString().toLowerCase().includes(q) ||
          (r.platform || "").toString().toLowerCase().includes(q) ||
          (r.rule_conditions || "").toString().toLowerCase().includes(q)
        );
      });
    }

    if (actionFilter !== "all") {
      arr = arr.filter((r) => {
        const action = (r.action || "").toString().toLowerCase();
        return action === actionFilter.toLowerCase();
      });
    }

    const { key, dir } = sortBy;
    arr.sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];

      if (key === "created_at") {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        return dir === "asc" ? da - db : db - da;
      }

      const sa = (va ?? "").toString().toLowerCase();
      const sb = (vb ?? "").toString().toLowerCase();
      if (sa < sb) return dir === "asc" ? -1 : 1;
      if (sa > sb) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [logs, query, actionFilter, sortBy]);

  // Pagination
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageItems = filteredSorted.slice(startIndex, startIndex + pageSize);

  // UI actions
  const toggleSort = (key) => {
    setSortBy((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  const exportCsv = () => {
    const headers = [
      "id",
      "email",
      "action",
      "details",
      "platform",
      "rule_name",
      "rule_conditions",
      "created_at"
    ];

    const rows = [headers].concat(
      filteredSorted.map((r) => [
        r.id ?? "",
        r.email ?? "",
        r.action ?? "",
        typeof r.details === "string" ? r.details : JSON.stringify(r.details ?? ""),
        r.platform ?? "",
        r.rule_name ?? "",
        r.rule_conditions ?? "",
        formatDate(r.created_at)
      ])
    );

    downloadCSV(`adelevate_logs_${new Date().toISOString().split("T")[0]}.csv`, rows);
    displayToast("CSV exported successfully!");
  };

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed", err);
      displayToast("Failed to copy to clipboard");
    }
  };

  // Get action badge config
  const getActionBadge = (action) => {
    if (!action) return null;

    const actionType = String(action).toLowerCase();

    const badges = {
      add: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: colors.success,
        bg: colors.successLight,
        text: "Add"
      },
      edit: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        ),
        color: colors.warning,
        bg: colors.warningLight,
        text: "Edit"
      },
      delete: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: colors.error,
        bg: colors.errorLight,
        text: "Delete"
      },
      update: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: colors.info,
        bg: colors.infoLight,
        text: "Update"
      },
      view: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: colors.purple,
        bg: colors.purpleLight,
        text: "View"
      },
      draft: {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        ),
        color: colors.textSecondary,
        bg: colors.bgTertiary,
        text: "Draft"
      }
    };

    return (
      badges[actionType] || {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        ),
        color: colors.textSecondary,
        bg: colors.bgTertiary,
        text: action
      }
    );
  };

  // Render action badge
  const renderActionBadge = (action) => {
    const badge = getActionBadge(action);
    if (!badge) return null;

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={{
          background: badge.bg,
          color: badge.color
        }}
      >
        {badge.icon}
        <span className="hidden sm:inline">{badge.text}</span>
      </span>
    );
  };

  // Render platform
  const renderPlatform = (log) => {
    if (!log.platform) {
      return (
        <span className="text-sm" style={{ color: colors.textTertiary }}>
          —
        </span>
      );
    }

    const iconUrl = log.platformIcon || getPlatformIcon(log.platform);

    return (
      <div className="flex items-center gap-2.5">
        <div
          className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ background: colors.bgTertiary }}
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={log.platform}
              className="h-5 w-5 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icons/platform-generic.svg";
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              style={{ color: colors.textTertiary }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
          {log.platform}
        </span>
      </div>
    );
  };

  // Render Avatar with unique colors
  const renderAvatar = (log, size = "md") => {
    const sizeClasses = {
      sm: "h-9 w-9",
      md: "h-11 w-11",
      lg: "h-12 w-12"
    };

    const avatarColor = log.avatarColor || getAvatarColor(log.email);

    if (log.avatarUrl) {
      return (
        <img
          src={log.avatarUrl}
          alt={log.email}
          className={`${sizeClasses[size]} rounded-xl object-cover`}
          onError={(e) => {
            e.target.onerror = null;
            const bgColor = getAvatarBgColor(log.email);
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              log.email?.charAt(0) || "U"
            )}&background=${bgColor}&color=fff&bold=true`;
          }}
        />
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center`}
        style={{
          background: avatarColor.bg,
          color: avatarColor.color
        }}
      >
        <span className="text-sm font-bold">
          {log.email ? log.email.charAt(0).toUpperCase() : "?"}
        </span>
      </div>
    );
  };

  // Log Card Component
  const LogCard = ({ log }) => {
    const avatarColor = log.avatarColor || getAvatarColor(log.email);

    return (
      <div
        className="rounded-2xl p-5"
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 relative">
              {renderAvatar(log, "md")}
              {/* Online indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
                style={{
                  background: colors.success,
                  boxShadow: `0 0 0 2px ${colors.bgCard}`
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                {log.email || "N/A"}
              </p>
              <p
                className="text-xs flex items-center gap-1.5 mt-1"
                style={{ color: colors.textTertiary }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDate(log.created_at)}
              </p>
            </div>
          </div>
          <div className="ml-2">{renderActionBadge(log.action)}</div>
        </div>

        {/* Platform & Rule */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-xl" style={{ background: colors.bgSecondary }}>
            <p className="text-xs font-medium mb-2" style={{ color: colors.textTertiary }}>
              Platform
            </p>
            {renderPlatform(log)}
          </div>
          <div className="p-3 rounded-xl" style={{ background: colors.bgSecondary }}>
            <p className="text-xs font-medium mb-2" style={{ color: colors.textTertiary }}>
              Rule
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: colors.accent }}>
              {log.rule_name || "—"}
            </p>
          </div>
        </div>

        {/* Conditions */}
        {log.rule_conditions && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: colors.textTertiary }}>
              Conditions
            </p>
            <div className="px-3 py-2.5 rounded-xl" style={{ background: colors.bgSecondary }}>
              <code
                className="text-xs break-words font-mono"
                style={{ color: colors.textSecondary }}
              >
                {log.formattedConditions}
              </code>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: colors.textTertiary }}>
            Details
          </p>
          <div className="px-3 py-2.5 rounded-xl" style={{ background: colors.bgSecondary }}>
            <p className="text-xs break-words line-clamp-2" style={{ color: colors.textSecondary }}>
              {typeof log.details === "string" ? log.details : JSON.stringify(log.details ?? "")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={() => copyToClipboard(log.email)}
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              color: colors.accent,
              background: colors.accentLight
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Email
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col transition-colors duration-300"
      style={{ background: colors.bgMain }}
    >
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.shadowMd
            }}
          >
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: colors.successLight }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                style={{ color: colors.success }}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Main Container with Container Scroll */}
      <div
        className="flex-1 rounded-3xl overflow-hidden m-4 sm:m-6 flex flex-col transition-all duration-300"
        style={{
          background: colors.bgCard,
          boxShadow: colors.shadow
        }}
      >
        {/* Header section - Fixed */}
        <div
          className="flex-shrink-0 px-6 py-5"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Action Logs
              </h2>
              <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                Track and monitor all system activities
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Total badge */}
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                style={{ background: colors.bgSecondary }}
              >
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: colors.accentLight }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    style={{ color: colors.accent }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: colors.textTertiary }}
                  >
                    Total
                  </span>
                  <span
                    className="text-lg font-bold leading-none"
                    style={{ color: colors.textPrimary }}
                  >
                    {logs.length}
                  </span>
                </div>
              </div>

              {/* View mode toggle */}
              <div
                className="hidden sm:flex items-center rounded-xl p-1"
                style={{ background: colors.bgSecondary }}
              >
                <button
                  onClick={() => setViewMode("table")}
                  className="p-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: viewMode === "table" ? colors.bgCard : "transparent",
                    color: viewMode === "table" ? colors.accent : colors.textTertiary,
                    boxShadow: viewMode === "table" ? colors.shadow : "none"
                  }}
                  title="Table View"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className="p-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: viewMode === "card" ? colors.bgCard : "transparent",
                    color: viewMode === "card" ? colors.accent : colors.textTertiary,
                    boxShadow: viewMode === "card" ? colors.shadow : "none"
                  }}
                  title="Card View"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>

              {/* Export button */}
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{
                  backgroundColor: colors.accent,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters section - Fixed */}
        <div
          className="flex-shrink-0 px-6 py-4"
          style={{
            background: colors.bgSecondary,
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5"
                  style={{ color: colors.textTertiary }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 text-sm rounded-xl focus:outline-none"
                style={{
                  background: colors.bgInput,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderInput}`
                }}
                placeholder="Search by email, action, platform, or details..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${colors.accent}`;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.accentLight}`;
                }}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${colors.borderInput}`;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Action filter */}
              <div className="relative">
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="pl-4 pr-10 py-3 text-sm rounded-xl focus:outline-none transition-all duration-200 cursor-pointer font-medium appearance-none"
                  style={{
                    background: colors.bgInput,
                    color: colors.textPrimary,
                    minWidth: "140px"
                  }}
                >
                  {actionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Actions"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4"
                    style={{ color: colors.textTertiary }}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Page size selector */}
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="pl-4 pr-10 py-3 text-sm rounded-xl focus:outline-none transition-all duration-200 cursor-pointer font-medium appearance-none"
                  style={{
                    background: colors.bgInput,
                    color: colors.textPrimary,
                    minWidth: "120px"
                  }}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4"
                    style={{ color: colors.textTertiary }}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div
          className="flex-1 overflow-auto custom-scrollbar"
          style={{ background: colors.bgCard }}
        >
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div
                    className="animate-spin rounded-full h-16 w-16"
                    style={{
                      border: `3px solid ${colors.bgTertiary}`,
                      borderTopColor: colors.accent
                    }}
                  ></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center"
                      style={{ background: colors.accentLight }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        style={{ color: colors.accent }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Loading action logs...
                </p>
              </div>
            </div>
          ) : total === 0 ? (
            <div className="h-full flex justify-center items-center">
              <div className="flex flex-col items-center text-center max-w-md px-6">
                <div
                  className="h-24 w-24 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: colors.bgSecondary }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    style={{ color: colors.textTertiary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                  No logs found
                </h3>
                <p className="text-sm mb-5" style={{ color: colors.textSecondary }}>
                  {query || actionFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "There are no action logs to display yet."}
                </p>
                {(query || actionFilter !== "all") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setActionFilter("all");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: colors.accent,
                      color: "#FFFFFF",
                      border: "none"
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Card view for mobile */}
              <div className="sm:hidden">
                <div className="p-4 space-y-4">
                  {pageItems.map((log, idx) => (
                    <LogCard key={log.id ?? `log-${idx}`} log={log} />
                  ))}
                </div>
              </div>

              {/* Table view for sm and up */}
              <div className={`hidden sm:block ${viewMode === "card" ? "sm:hidden" : ""}`}>
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10" style={{ background: colors.bgSecondary }}>
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        User
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        Action
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        Platform
                      </th>
                      <th
                        className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        Rule Name
                      </th>
                      <th
                        className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        Conditions
                      </th>
                      <th
                        className="hidden xl:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        Details
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200"
                        style={{ color: colors.textTertiary }}
                        onClick={() => toggleSort("created_at")}
                      >
                        <div className="flex items-center gap-2">
                          Timestamp
                          {sortBy.key === "created_at" && (
                            <span>
                              {sortBy.dir === "asc" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageItems.map((log, idx) => (
                      <tr
                        key={log.id ?? `log-${idx}`}
                        style={{
                          background: idx % 2 === 0 ? colors.bgTableRow : colors.bgTableRowAlt,
                          borderBottom: `1px solid ${colors.border}`
                        }}
                      >
                        {/* User */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 relative">{renderAvatar(log, "sm")}</div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-sm font-semibold truncate max-w-[180px]"
                                style={{ color: colors.textPrimary }}
                              >
                                {log.email || "N/A"}
                              </div>
                              <button
                                onClick={() => copyToClipboard(log.email)}
                                className="mt-0.5 text-xs flex items-center gap-1"
                                style={{ color: colors.textTertiary }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                Copy
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderActionBadge(log.action)}
                        </td>

                        {/* Platform */}
                        <td className="px-6 py-4 whitespace-nowrap">{renderPlatform(log)}</td>

                        {/* Rule name */}
                        <td className="hidden md:table-cell px-6 py-4">
                          <div
                            className="text-sm font-semibold truncate max-w-[180px]"
                            style={{ color: colors.accent }}
                          >
                            {log.rule_name || "—"}
                          </div>
                        </td>

                        {/* Conditions */}
                        <td className="hidden lg:table-cell px-6 py-4">
                          {log.rule_conditions ? (
                            <div
                              className="text-xs px-3 py-2 rounded-lg max-w-[240px] font-mono"
                              style={{
                                background: colors.bgSecondary,
                                color: colors.textSecondary
                              }}
                            >
                              <code className="whitespace-pre-wrap break-words">
                                {log.formattedConditions}
                              </code>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: colors.textTertiary }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Details */}
                        <td className="hidden xl:table-cell px-6 py-4">
                          <div
                            className="text-xs break-words max-w-[280px] px-3 py-2 rounded-lg line-clamp-2"
                            style={{
                              background: colors.bgSecondary,
                              color: colors.textSecondary
                            }}
                          >
                            {typeof log.details === "string"
                              ? log.details
                              : JSON.stringify(log.details ?? "")}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: colors.bgSecondary }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              style={{ color: colors.textTertiary }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span
                              className="text-xs font-medium whitespace-nowrap"
                              style={{ color: colors.textSecondary }}
                            >
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card view for larger screens when selected */}
              {viewMode === "card" && (
                <div className="hidden sm:block p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {pageItems.map((log, idx) => (
                      <LogCard key={log.id ?? `log-${idx}`} log={log} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination - Fixed at bottom */}
        {!loading && total > 0 && (
          <div
            className="flex-shrink-0 px-6 py-4"
            style={{
              background: colors.bgSecondary,
              borderTop: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Showing{" "}
                <span className="font-bold" style={{ color: colors.textPrimary }}>
                  {Math.min(startIndex + 1, total)}
                </span>{" "}
                to{" "}
                <span className="font-bold" style={{ color: colors.textPrimary }}>
                  {Math.min(startIndex + pageSize, total)}
                </span>{" "}
                of{" "}
                <span className="font-bold" style={{ color: colors.textPrimary }}>
                  {total}
                </span>{" "}
                results
              </div>

              <nav className="flex items-center gap-1.5">
                {/* First page */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl"
                  style={{
                    color: page === 1 ? colors.textMuted : colors.textSecondary,
                    background: "transparent",
                    cursor: page === 1 ? "not-allowed" : "pointer"
                  }}
                  title="First page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Previous page */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl"
                  style={{
                    color: page === 1 ? colors.textMuted : colors.textSecondary,
                    background: "transparent",
                    cursor: page === 1 ? "not-allowed" : "pointer"
                  }}
                  title="Previous page"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className="min-w-[40px] px-3 py-2 text-sm font-semibold rounded-xl"
                        style={{
                          backgroundColor: page === pageNum ? colors.accent : "transparent",
                          color: page === pageNum ? "#FFFFFF" : colors.textSecondary,
                          border: "none"
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Current page indicator for mobile */}
                <div
                  className="sm:hidden px-4 py-2 text-sm font-semibold rounded-xl"
                  style={{
                    background: colors.bgTertiary,
                    color: colors.textPrimary
                  }}
                >
                  {page} / {totalPages}
                </div>

                {/* Next page */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2.5 rounded-xl"
                  style={{
                    color: page === totalPages ? colors.textMuted : colors.textSecondary,
                    background: "transparent",
                    cursor: page === totalPages ? "not-allowed" : "pointer"
                  }}
                  title="Next page"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Last page */}
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2.5 rounded-xl"
                  style={{
                    color: page === totalPages ? colors.textMuted : colors.textSecondary,
                    background: "transparent",
                    cursor: page === totalPages ? "not-allowed" : "pointer"
                  }}
                  title="Last page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm7 0a1 1 0 010-1.414L15.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom scrollbar for container scroll */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.bgSecondary};
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.bgTertiary};
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.borderHover};
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${colors.bgTertiary} ${colors.bgSecondary};
        }

        /* Select dropdown styling */
        select option {
          background: ${colors.bgCard};
          color: ${colors.textPrimary};
          padding: 12px;
        }

        /* Focus visible styling */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid ${colors.accent};
          outline-offset: 2px;
        }


        /* Loading spinner */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Hide scrollbar on mobile but keep functionality */
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }


        /* Input placeholder styling */
        input::placeholder {
          color: ${colors.textTertiary};
          opacity: 1;
        }

        /* Select arrow custom styling */
        select {
          background-image: none;
        }




        /* Responsive adjustments */
        @media (max-width: 640px) {
          .custom-scrollbar {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          table {
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
          }
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button,
          input,
          select {
            border: 2px solid currentColor;
          }
        }

        /* Dark mode scrollbar for webkit */
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${colors.bgSecondary};
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${colors.bgTertiary};
          }
        }
      `}</style>
    </div>
  );
}