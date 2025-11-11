// LogsDataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabaseClient";

/**
 * Enhanced LogsDataTable with premium UI, platform icons, and fully responsive design
 * Optimized for all screen sizes with breakpoints: xs, ss, sm, md, lg, xl, 2xl
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
  )}&background=random&size=100`;
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

  // Helper to render action badge
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
              className="h-3 w-3 ss:h-4 ss:w-4"
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
          color: "bg-green-100 text-green-800 border-green-300",
          gradient: "from-green-50 to-green-100",
          text: "Add",
        };
        break;
      case "edit":
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          ),
          color: "bg-amber-100 text-amber-800 border-amber-300",
          gradient: "from-amber-50 to-amber-100",
          text: "Edit",
        };
        break;
      case "delete":
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
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
          color: "bg-rose-100 text-rose-800 border-rose-300",
          gradient: "from-rose-50 to-rose-100",
          text: "Delete",
        };
        break;
      case "update":
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
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
          color: "bg-sky-100 text-sky-800 border-sky-300",
          gradient: "from-sky-50 to-sky-100",
          text: "Update",
        };
        break;
      case "view":
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
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
          color: "bg-violet-100 text-violet-800 border-violet-300",
          gradient: "from-violet-50 to-violet-100",
          text: "View",
        };
        break;
      case "draft":
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          ),
          color: "bg-gray-100 text-gray-800 border-gray-300",
          gradient: "from-gray-50 to-gray-100",
          text: "Draft",
        };
        break;
      default:
        badge = {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4"
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
          color: "bg-slate-100 text-slate-800 border-slate-300",
          gradient: "from-slate-50 to-slate-100",
          text: action,
        };
    }

    return (
      <span
        className={`inline-flex items-center gap-1 ss:gap-1.5 px-2 py-1 ss:px-3 ss:py-1.5 rounded-full text-[10px] ss:text-xs font-medium border ${badge.color} bg-gradient-to-r ${badge.gradient}`}
      >
        {badge.icon}
        <span className="hidden ss:inline">{badge.text}</span>
      </span>
    );
  };

  // Helper to render platform with icon
  const renderPlatform = (log) => {
    if (!log.platform) return <span className="text-gray-400">N/A</span>;

    const iconUrl = log.platformIcon || getPlatformIcon(log.platform);

    return (
      <div className="flex items-center space-x-1.5 ss:space-x-2">
        <div className="flex-shrink-0 h-5 w-5 ss:h-6 ss:w-6 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm flex items-center justify-center overflow-hidden">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={log.platform}
              className="h-4 w-4 ss:h-5 ss:w-5 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icons/platform-generic.svg";
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ss:h-4 ss:w-4 text-gray-400"
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
        <span className="text-xs ss:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {log.platform}
        </span>
      </div>
    );
  };

  // Card View Component for Mobile
  const LogCard = ({ log }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 ss:p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 ss:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {log.avatarUrl ? (
              <img
                src={log.avatarUrl}
                alt={log.email}
                className="h-8 w-8 ss:h-10 ss:w-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    log.email?.charAt(0) || "U"
                  )}&background=random`;
                }}
              />
            ) : (
              <div className="h-8 w-8 ss:h-10 ss:w-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center">
                <span className="text-xs ss:text-sm font-semibold">
                  {log.email ? log.email.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs ss:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {log.email || "N/A"}
            </p>
            <p className="text-[10px] ss:text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
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
      <div className="grid grid-cols-2 gap-2 ss:gap-3 mb-3">
        <div>
          <p className="text-[10px] ss:text-xs text-gray-500 dark:text-gray-400 mb-1">
            Platform
          </p>
          {renderPlatform(log)}
        </div>
        <div>
          <p className="text-[10px] ss:text-xs text-gray-500 dark:text-gray-400 mb-1">
            Rule
          </p>
          <p className="text-xs ss:text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
            {log.rule_name || "N/A"}
          </p>
        </div>
      </div>

      {/* Conditions */}
      {log.rule_conditions && (
        <div className="mb-3">
          <p className="text-[10px] ss:text-xs text-gray-500 dark:text-gray-400 mb-1">
            Conditions
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
            <code className="text-[10px] ss:text-xs text-gray-700 dark:text-gray-300 break-words">
              {log.formattedConditions}
            </code>
          </div>
        </div>
      )}

      {/* Details */}
      <div>
        <p className="text-[10px] ss:text-xs text-gray-500 dark:text-gray-400 mb-1">
          Details
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-[10px] ss:text-xs text-gray-700 dark:text-gray-300 break-words line-clamp-2">
            {typeof log.details === "string"
              ? log.details
              : JSON.stringify(log.details ?? "")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <button
          onClick={() => copyToClipboard(log.email)}
          className="text-[10px] ss:text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
        >
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy Email
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-2 xs:p-3 ss:p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-lg ss:rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mt-4 ss:mt-6 sm:mt-0">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-2 right-2 ss:top-4 ss:right-4 z-50 flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 ss:px-4 rounded-md shadow-lg transition-opacity duration-300 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ss:h-5 ss:w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs ss:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 px-3 py-3 ss:px-4 ss:py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 rounded-t-lg ss:rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ss:gap-3 sm:gap-4">
          <h2 className="text-base ss:text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
            Action Logs
          </h2>

          {/* Total counter and export button */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 ss:space-x-3">
            <div className="flex items-center gap-1.5 ss:gap-2 bg-white dark:bg-gray-800 px-2 py-1.5 ss:px-4 ss:py-2 rounded-md ss:rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-[10px] ss:text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Total:
              </span>
              <span className="text-[10px] ss:text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {logs.length}
              </span>
            </div>

            {/* View mode toggle (visible on sm and up) */}
            <div className="hidden sm:flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
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
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "card"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
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

            <button
              onClick={exportCsv}
              className="flex items-center justify-center px-2 py-1.5 ss:px-4 ss:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md ss:rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 ss:h-4 ss:w-4 sm:mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline text-sm">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters section */}
      <div className="px-3 py-3 ss:px-4 ss:py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col gap-2 ss:gap-3">
          {/* Search bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-2 ss:pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 ss:h-5 ss:w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
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
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 ss:pl-10 pr-3 py-1.5 ss:py-2 text-xs ss:text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-200"
              placeholder="Search logs..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 ss:gap-3">
            {/* Action filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 ss:py-2 px-2 ss:px-3 text-xs ss:text-sm"
            >
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all"
                    ? "All Actions"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Page size selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 ss:py-2 px-2 ss:px-3 text-xs ss:text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content section */}
      {loading ? (
        <div className="p-8 ss:p-12 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 ss:h-16 ss:w-16 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xs ss:text-sm text-gray-500 dark:text-gray-400">
              Loading action logs...
            </p>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="p-8 ss:p-12 flex justify-center items-center">
          <div className="flex flex-col items-center text-center max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 ss:h-20 ss:w-20 text-gray-300 dark:text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg ss:text-xl font-medium text-gray-900 dark:text-white">
              No logs found
            </h3>
            <p className="mt-2 text-xs ss:text-sm text-gray-500 dark:text-gray-400">
              {query || actionFilter !== "all"
                ? "Try changing your search or filter criteria."
                : "There are no action logs to display yet."}
            </p>
            {(query || actionFilter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setActionFilter("all");
                }}
                className="mt-4 px-3 py-1.5 ss:px-4 ss:py-2 bg-indigo-600 text-white rounded-md text-xs ss:text-sm font-medium hover:bg-indigo-700 transition-colors duration-150"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Card view for mobile (xs, ss), table view for larger screens or user preference */}
          <div className="sm:hidden">
            <div className="p-3 space-y-3">
              {pageItems.map((log, idx) => (
                <LogCard key={log.id ?? `log-${idx}`} log={log} />
              ))}
            </div>
          </div>

          {/* Table view for sm and up (or when user selects table view) */}
          <div
            className={`hidden sm:block ${
              viewMode === "card"
                ? "sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden"
                : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Action
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Platform
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Rule Name
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Conditions
                    </th>
                    <th
                      scope="col"
                      className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Details
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => toggleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Time
                        {sortBy.key === "created_at" &&
                          (sortBy.dir === "asc" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
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
                              className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {pageItems.map((log, idx) => (
                    <tr
                      key={log.id ?? `log-${idx}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 overflow-hidden rounded-full">
                            {log.avatarUrl ? (
                              <img
                                src={log.avatarUrl}
                                alt={log.email}
                                className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    log.email?.charAt(0) || "U"
                                  )}&background=random`;
                                }}
                              />
                            ) : (
                              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-semibold">
                                  {log.email
                                    ? log.email.charAt(0).toUpperCase()
                                    : "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-2 sm:ml-3 max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {log.email || "N/A"}
                            </div>
                            <button
                              onClick={() => copyToClipboard(log.email)}
                              className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1"
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

                      <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap">
                        {renderActionBadge(log.action)}
                      </td>

                      <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap">
                        {renderPlatform(log)}
                      </td>

                      <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
                        <div className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer truncate max-w-[150px] lg:max-w-[200px]">
                          {log.rule_name || "N/A"}
                        </div>
                      </td>

                      <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
                        {log.rule_conditions ? (
                          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-1.5 sm:p-2 rounded-md border border-gray-200 dark:border-gray-700 max-w-[200px] xl:max-w-[300px] overflow-hidden">
                            <code className="whitespace-pre-wrap break-words">
                              {log.formattedConditions}
                            </code>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
                        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words max-w-[200px] xl:max-w-[300px] bg-gray-50 dark:bg-gray-800 p-1.5 sm:p-2 rounded-md border border-gray-200 dark:border-gray-700 line-clamp-2">
                          {typeof log.details === "string"
                            ? log.details
                            : JSON.stringify(log.details ?? "")}
                        </div>
                      </td>

                      <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-400"
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
                          <span className="hidden sm:inline">
                            {formatDate(log.created_at)}
                          </span>
                          <span className="sm:hidden">
                            {new Date(log.created_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
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
            <div className="hidden sm:block p-3 ss:p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 ss:gap-4">
                {pageItems.map((log, idx) => (
                  <LogCard key={log.id ?? `log-${idx}`} log={log} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="px-3 py-3 ss:px-4 ss:py-4 sm:px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg ss:rounded-b-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 ss:gap-3">
            <div className="text-[10px] ss:text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">
                {Math.min(startIndex + 1, total)}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(startIndex + pageSize, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </div>

            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-1.5 ss:px-2 py-1.5 ss:py-2 rounded-l-md border ${
                  page === 1
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-xs ss:text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ss:h-5 ss:w-5"
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

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-1.5 ss:px-2 py-1.5 ss:py-2 border ${
                  page === 1
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-xs ss:text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
              >
                <svg
                  className="h-4 w-4 ss:h-5 ss:w-5"
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

              {/* Page numbers - hidden on xs, visible from ss */}
              <div className="hidden ss:flex">
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
                      className={`relative inline-flex items-center px-2 ss:px-3 sm:px-4 py-1.5 ss:py-2 border text-[10px] ss:text-xs sm:text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-600 dark:text-indigo-300"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Current page indicator for xs */}
              <span className="ss:hidden relative inline-flex items-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                {page}/{totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-1.5 ss:px-2 py-1.5 ss:py-2 border ${
                  page === totalPages
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-xs ss:text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
              >
                <svg
                  className="h-4 w-4 ss:h-5 ss:w-5"
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

              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-1.5 ss:px-2 py-1.5 ss:py-2 rounded-r-md border ${
                  page === totalPages
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-xs ss:text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ss:h-5 ss:w-5"
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
  );
}
