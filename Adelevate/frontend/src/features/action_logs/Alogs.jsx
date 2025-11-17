// LogsDataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabaseClient";

/**
 * Premium SaaS LogsDataTable Component - Full Screen
 * Modern, clean design inspired by Linear, Vercel, and Stripe
 */

function formatDate(ts) {
  try {
    if (!ts) return "N/A";

    const date = new Date(ts);

    // Format date: Jan 12, 2023
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Format time: 2:30 PM
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
          typeof cell === "string"
            ? `"${cell.replace(/"/g, '""')}"`
            : cell ?? ""
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

// Helper to render condition values nicely
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

// Get platform icon based on platform name
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
    ebay: "/icons/ebay.svg",
    etsy: "/icons/etsy.svg",
    woocommerce: "/icons/woocommerce.svg",
    magento: "/icons/magento.svg",
    "google analytics": "/icons/google-analytics.svg",
    ga: "/icons/google-analytics.svg",
    "google ads": "/icons/google-ads.svg",
    "facebook ads": "/icons/facebook-ads.svg",
    mixpanel: "/icons/mixpanel.svg",
    amplitude: "/icons/amplitude.svg",
    hubspot: "/icons/hubspot.svg",
    salesforce: "/icons/salesforce.svg",
    mailchimp: "/icons/mailchimp.svg",
    intercom: "/icons/intercom.svg",
    zendesk: "/icons/zendesk.svg",
    aws: "/icons/aws.svg",
    "google cloud": "/icons/google-cloud.svg",
    azure: "/icons/azure.svg",
    firebase: "/icons/firebase.svg",
    heroku: "/icons/heroku.svg",
    social: "/icons/social-media.svg",
    ecommerce: "/icons/ecommerce.svg",
    analytics: "/icons/analytics.svg",
    crm: "/icons/crm.svg",
    cloud: "/icons/cloud.svg",
    payment: "/icons/payment.svg",
    email: "/icons/email.svg",
  };

  for (const [key, url] of Object.entries(icons)) {
    if (platformLower === key || platformLower.includes(key)) {
      return url;
    }
  }

  return "/icons/platform-generic.svg";
}

// Generate avatar based on email
function generateAvatarUrl(email) {
  if (!email) return null;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    email.split("@")[0]
  )}&background=6366f1&color=fff&bold=true&size=128`;
}

// Helper to format rule conditions
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
      typeof conditionsStr === "string"
        ? JSON.parse(conditionsStr)
        : conditionsStr;

    if (Array.isArray(conditions)) {
      return conditions.map(renderCondition).join(", ");
    }

    return renderCondition(conditions);
  } catch (e) {
    return conditionsStr;
  }
};

export default function LogsDataTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortBy, setSortBy] = useState({ key: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // fetch from Supabase
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
          showToastMessage("Failed to load logs. Please try again.");
        } else {
          const processedData = (Array.isArray(data) ? data : []).map((log) => {
            const iconUrl = log.platform_icon || getPlatformIcon(log.platform);
            const avatarUrl = generateAvatarUrl(log.email);
            const formattedConditions = formatRuleConditions(
              log.rule_conditions
            );

            return {
              ...log,
              platformIcon: iconUrl,
              formattedConditions,
              avatarUrl,
            };
          });

          setLogs(processedData);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        showToastMessage("An error occurred while loading logs.");
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
            const iconUrl =
              payload.new.platform_icon ||
              getPlatformIcon(payload.new.platform);
            const formattedConditions = formatRuleConditions(
              payload.new.rule_conditions
            );
            const avatarUrl = generateAvatarUrl(payload.new.email);

            const newLog = {
              ...payload.new,
              platformIcon: iconUrl,
              formattedConditions,
              avatarUrl,
            };

            setLogs((prev) => [newLog, ...prev]);
            showToastMessage("New log received");
          }
        )
        .subscribe();
    } catch (err) {
      console.warn(
        "Realtime channel creation may differ by supabase-js version",
        err
      );
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
      "created_at",
    ];

    const rows = [headers].concat(
      filteredSorted.map((r) => [
        r.id ?? "",
        r.email ?? "",
        r.action ?? "",
        typeof r.details === "string"
          ? r.details
          : JSON.stringify(r.details ?? ""),
        r.platform ?? "",
        r.rule_name ?? "",
        r.rule_conditions ?? "",
        formatDate(r.created_at),
      ])
    );

    downloadCSV(
      `adelevate_logs_${new Date().toISOString().split("T")[0]}.csv`,
      rows
    );

    showToastMessage("CSV exported successfully!");
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed", err);
      showToastMessage("Failed to copy to clipboard");
    }
  };

  // Helper to render action badge - PREMIUM STYLE WITH ALL ICONS
  const renderActionBadge = (action) => {
    if (!action) return null;

    const actionType = String(action).toLowerCase();
    let badge;

    switch (actionType) {
      case "add":
        badge = {
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
          color: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          dotColor: "bg-emerald-500",
          text: "Add",
        };
        break;
      case "edit":
        badge = {
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
          color: "bg-amber-50 text-amber-700 border-amber-200/50",
          dotColor: "bg-amber-500",
          text: "Edit",
        };
        break;
      case "delete":
        badge = {
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
          color: "bg-rose-50 text-rose-700 border-rose-200/50",
          dotColor: "bg-rose-500",
          text: "Delete",
        };
        break;
      case "update":
        badge = {
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
          color: "bg-blue-50 text-blue-700 border-blue-200/50",
          dotColor: "bg-blue-500",
          text: "Update",
        };
        break;
      case "view":
        badge = {
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
          color: "bg-violet-50 text-violet-700 border-violet-200/50",
          dotColor: "bg-violet-500",
          text: "View",
        };
        break;
      case "draft":
        badge = {
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
          color: "bg-slate-50 text-slate-600 border-slate-200/50",
          dotColor: "bg-slate-400",
          text: "Draft",
        };
        break;
      default:
        badge = {
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
          color: "bg-gray-50 text-gray-600 border-gray-200/50",
          dotColor: "bg-gray-400",
          text: action,
        };
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color} shadow-sm`}
      >
        {badge.icon}
        <span className="hidden sm:inline">{badge.text}</span>
      </span>
    );
  };

  // Helper to render platform with icon - PREMIUM STYLE WITH ALL PLATFORM ICONS
  const renderPlatform = (log) => {
    if (!log.platform) return <span className="text-gray-400 text-sm">—</span>;

    const iconUrl = log.platformIcon || getPlatformIcon(log.platform);

    return (
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 h-7 w-7 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
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
              className="h-4 w-4 text-gray-400"
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
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {log.platform}
        </span>
      </div>
    );
  };

  // Card View Component for Mobile - PREMIUM STYLE WITH ALL ICONS
  const LogCard = ({ log }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {log.avatarUrl ? (
              <img
                src={log.avatarUrl}
                alt={log.email}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    log.email?.charAt(0) || "U"
                  )}&background=6366f1&color=fff&bold=true`;
                }}
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                <span className="text-sm font-semibold">
                  {log.email ? log.email.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {log.email || "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Platform
          </p>
          {renderPlatform(log)}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Rule
          </p>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
            {log.rule_name || "—"}
          </p>
        </div>
      </div>

      {/* Conditions */}
      {log.rule_conditions && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Conditions
          </p>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
            <code className="text-xs text-gray-700 dark:text-gray-300 break-words font-mono">
              {log.formattedConditions}
            </code>
          </div>
        </div>
      )}

      {/* Details */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Details
        </p>
        <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-700 dark:text-gray-300 break-words line-clamp-2">
            {typeof log.details === "string"
              ? log.details
              : JSON.stringify(log.details ?? "")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <button
          onClick={() => copyToClipboard(log.email)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* FULL SCREEN CONTAINER - NO MAX WIDTH */}
      <div className="w-full h-full">
        {/* Toast notification - PREMIUM STYLE WITH ICON */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-lg">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
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
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {toastMessage}
              </span>
            </div>
          </div>
        )}

        {/* Main Container - PREMIUM STYLE FULL WIDTH */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden m-4 sm:m-6 lg:m-8">
          {/* Header section - PREMIUM STYLE WITH ALL ICONS */}
          <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Activity Icon */}
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
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
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Action Logs
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Track and monitor all system activities
                  </p>
                </div>
              </div>

              {/* Total counter and controls */}
              <div className="flex items-center gap-3">
                {/* Total badge with icon */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
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
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {logs.length}
                  </span>
                </div>

                {/* View mode toggle with icons (visible on sm and up) */}
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "table"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
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
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "card"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
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

                {/* Export button with icon */}
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 font-medium text-sm"
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

          {/* Search and filters section - PREMIUM STYLE WITH ICONS */}
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search bar with icon */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Search by email, action, platform, or details..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Filters with icons */}
              <div className="flex gap-3">
                {/* Action filter with icon */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </div>
                  <select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none"
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
                      className="h-4 w-4 text-gray-400"
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

                {/* Page size selector with icon */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="pl-9 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
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

          {/* Content section */}
          {loading ? (
            <div className="p-16 flex justify-center items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loading action logs...
                </p>
              </div>
            </div>
          ) : total === 0 ? (
            <div className="p-16 flex justify-center items-center">
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400 dark:text-gray-600"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No logs found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
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
              {/* Card view for mobile (xs, ss), table view for larger screens or user preference */}
              <div className="sm:hidden">
                <div className="p-4 space-y-3">
                  {pageItems.map((log, idx) => (
                    <LogCard key={log.id ?? `log-${idx}`} log={log} />
                  ))}
                </div>
              </div>

              {/* Table view for sm and up (or when user selects table view) - FULL WIDTH */}
              <div
                className={`hidden sm:block ${
                  viewMode === "card" ? "sm:hidden" : ""
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {/* PREMIUM STICKY HEADER WITH ICONS */}
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            User
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Action
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            Platform
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="hidden md:table-cell px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                              />
                            </svg>
                            Rule Name
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="hidden lg:table-cell px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                            Conditions
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="hidden xl:table-cell px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Details
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors rounded-lg"
                          onClick={() => toggleSort("created_at")}
                        >
                          <div className="flex items-center gap-2">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Timestamp
                            {sortBy.key === "created_at" && (
                              <span className="ml-1">
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
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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

                    {/* PREMIUM TABLE BODY WITH ZEBRA STRIPES AND ALL ICONS */}
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                      {pageItems.map((log, idx) => (
                        <tr
                          key={log.id ?? `log-${idx}`}
                          className={`transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                            idx % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50/30 dark:bg-gray-800/50"
                          }`}
                        >
                          {/* User column - PREMIUM STYLE WITH AVATAR */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {log.avatarUrl ? (
                                  <img
                                    src={log.avatarUrl}
                                    alt={log.email}
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        log.email?.charAt(0) || "U"
                                      )}&background=6366f1&color=fff&bold=true`;
                                    }}
                                  />
                                ) : (
                                  <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                                    <span className="text-xs font-semibold">
                                      {log.email
                                        ? log.email.charAt(0).toUpperCase()
                                        : "?"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                  {log.email || "N/A"}
                                </div>
                                <button
                                  onClick={() => copyToClipboard(log.email)}
                                  className="mt-0.5 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
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

                          {/* Action badge with icon */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderActionBadge(log.action)}
                          </td>

                          {/* Platform with icon */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderPlatform(log)}
                          </td>

                          {/* Rule name */}
                          <td className="hidden md:table-cell px-6 py-4">
                            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer truncate max-w-[200px] transition-colors">
                              {log.rule_name || "—"}
                            </div>
                          </td>

                          {/* Conditions */}
                          <td className="hidden lg:table-cell px-6 py-4">
                            {log.rule_conditions ? (
                              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 max-w-[280px] font-mono">
                                <code className="whitespace-pre-wrap break-words">
                                  {log.formattedConditions}
                                </code>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600 text-sm">
                                —
                              </span>
                            )}
                          </td>

                          {/* Details */}
                          <td className="hidden xl:table-cell px-6 py-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400 break-words max-w-[320px] bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 line-clamp-2">
                              {typeof log.details === "string"
                                ? log.details
                                : JSON.stringify(log.details ?? "")}
                            </div>
                          </td>

                          {/* Timestamp - PREMIUM CHIP STYLE WITH ICON */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
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
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card view for larger screens when selected */}
              {viewMode === "card" && (
                <div className="hidden sm:block p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {pageItems.map((log, idx) => (
                      <LogCard key={log.id ?? `log-${idx}`} log={log} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination - PREMIUM STYLE WITH ALL ICONS */}
          {!loading && total > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Showing{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(startIndex + 1, total)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(startIndex + pageSize, total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {total}
                  </span>{" "}
                  results
                </div>

                <nav
                  className="flex items-center gap-1"
                  aria-label="Pagination"
                >
                  {/* First page */}
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={`p-2 rounded-lg transition-all ${
                      page === 1
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="First page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                    className={`p-2 rounded-lg transition-all ${
                      page === 1
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="Previous page"
                  >
                    <svg
                      className="h-5 w-5"
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
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
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
                            className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              page === pageNum
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Current page indicator for mobile */}
                  <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {page} / {totalPages}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`p-2 rounded-lg transition-all ${
                      page === totalPages
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="Next page"
                  >
                    <svg
                      className="h-5 w-5"
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
                    className={`p-2 rounded-lg transition-all ${
                      page === totalPages
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title="Last page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm7 0a1 1 0 010-1.414L15.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
