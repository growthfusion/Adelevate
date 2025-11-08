// LogsDataTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/supabaseClient";

/**
 * Enhanced LogsDataTable with premium UI, platform icons, and running/stopped status focus
 * Includes a dedicated column for rule conditions
 */

function formatDate(ts) {
  try {
    if (!ts) return "N/A";
    
    const date = new Date(ts);
    
    // Format date: Jan 12, 2023
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Format time: 2:30 PM
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
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
    // If it's already a string, just return it
    if (typeof condition === "string") return condition;

    // Handle metric/operator/value format
    if (
      condition.metric ||
      condition.operator ||
      condition.threshold ||
      condition.value
    ) {
      const metric = condition.metric?.toUpperCase() || "";
      let operator = condition.operator || condition.comparison || "eq";
      const value = condition.threshold ?? condition.value ?? "";

      // Convert operator to symbol
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
          symbol = operator; // Keep original if not recognized
      }

      return `${metric} ${symbol} ${value}`;
    }

    // Fallback: stringify the object
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
  
  // Platform icons mapping
  const icons = {
    // Social media platforms
    'facebook': '/icons/facebook.svg',
    'fb': '/icons/facebook.svg',
    'instagram': '/icons/instagram.svg',
    'ig': '/icons/instagram.svg',
    'twitter': '/icons/twitter.svg',
    'x': '/icons/twitter.svg',
    'linkedin': '/icons/linkedin.svg',
    'youtube': '/icons/youtube.svg',
    'tiktok': '/icons/tiktok.svg',
    'pinterest': '/icons/pinterest.svg',
    'snapchat': '/icons/snapchat.svg',
    
    // E-commerce platforms
    'amazon': '/icons/amazon.svg',
    'shopify': '/icons/shopify.svg',
    'ebay': '/icons/ebay.svg',
    'etsy': '/icons/etsy.svg',
    'woocommerce': '/icons/woocommerce.svg',
    'magento': '/icons/magento.svg',
    
    // Analytics platforms
    'google analytics': '/icons/google-analytics.svg',
    'ga': '/icons/google-analytics.svg',
    'google ads': '/icons/google-ads.svg',
    'facebook ads': '/icons/facebook-ads.svg',
    'mixpanel': '/icons/mixpanel.svg',
    'amplitude': '/icons/amplitude.svg',
    
    // CRMs and marketing
    'hubspot': '/icons/hubspot.svg',
    'salesforce': '/icons/salesforce.svg',
    'mailchimp': '/icons/mailchimp.svg',
    'intercom': '/icons/intercom.svg',
    'zendesk': '/icons/zendesk.svg',
    
    // Cloud platforms
    'aws': '/icons/aws.svg',
    'google cloud': '/icons/google-cloud.svg',
    'azure': '/icons/azure.svg',
    'firebase': '/icons/firebase.svg',
    'heroku': '/icons/heroku.svg',
    
    // Default fallbacks for common categories
    'social': '/icons/social-media.svg',
    'ecommerce': '/icons/ecommerce.svg',
    'analytics': '/icons/analytics.svg',
    'crm': '/icons/crm.svg',
    'cloud': '/icons/cloud.svg',
    'payment': '/icons/payment.svg',
    'email': '/icons/email.svg',
  };
  
  // Try to find exact match first
  for (const [key, url] of Object.entries(icons)) {
    if (platformLower === key || platformLower.includes(key)) {
      return url;
    }
  }
  
  // If we can't find an exact match, return a generic icon
  return '/icons/platform-generic.svg';
}

// Generate avatar based on email
function generateAvatarUrl(email) {
  if (!email) return null;
  
  // List of avatar services you can use
  const avatarServices = [
    // Return Gravatar URL
    `https://www.gravatar.com/avatar/${md5(email.toLowerCase().trim())}?d=identicon&s=100`,
    // Return UI Avatars URL (generates based on initials)
    `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random&size=100`
  ];
  
  // Return one of the avatar services
  return avatarServices[1];
}

// Utility function for MD5 hash (for Gravatar)
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function addUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }

  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }

  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  function convertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  function wordToHex(lValue) {
    let wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  function utf8Encode(string) {
    let utftext = "";

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };

  let x = Array();
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = utf8Encode(string);
  x = convertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toLowerCase();
}

// Helper to format rule conditions in a readable way
const formatRuleConditions = (conditionsStr) => {
  if (!conditionsStr) return "N/A";

  try {
    // If it's already a formatted string, just display it
    if (
      typeof conditionsStr === "string" &&
      !conditionsStr.startsWith("[") &&
      !conditionsStr.startsWith("{")
    ) {
      return conditionsStr;
    }

    // Try to parse JSON if it's a JSON string
    const conditions =
      typeof conditionsStr === "string"
        ? JSON.parse(conditionsStr)
        : conditionsStr;

    if (Array.isArray(conditions)) {
      return conditions.map(renderCondition).join(", ");
    }

    return renderCondition(conditions);
  } catch (e) {
    return conditionsStr; // Return as-is if parsing fails
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
          // Process logs to identify view and draft actions
          const processedData = (Array.isArray(data) ? data : []).map((log) => {
            const iconUrl = log.platform_icon || getPlatformIcon(log.platform);
            const avatarUrl = generateAvatarUrl(log.email);

            // Format rule conditions for display
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

    // Realtime subscription to new inserts
    try {
      channel = supabase
        .channel("public:Adelevate_Action_Log")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Adelevate_Action_Log" },
          (payload) => {
            // Process the new log
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

            // Prepend new log
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

  // Get unique action types for filtering
  const actionTypes = useMemo(() => {
    const types = new Set(["add", "edit", "delete", "update", "view", "draft"]);
    logs.forEach((log) => {
      if (log.action) types.add(log.action.toLowerCase());
    });
    return ["all", ...Array.from(types)].sort();
  }, [logs]);

  // Filtering + searching + sorting (memoized)
  const filteredSorted = useMemo(() => {
    let arr = logs.slice();

    // Global search across email, action, details, rule_name, platform
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

    // Action filter
    if (actionFilter !== "all") {
      arr = arr.filter((r) => {
        const action = (r.action || "").toString().toLowerCase();
        return action === actionFilter.toLowerCase();
      });
    }

    // Sorting
    const { key, dir } = sortBy;
    arr.sort((a, b) => {
      const va = a?.[key];
      const vb = b?.[key];

      // created_at sort: compare dates
      if (key === "created_at") {
        const da = va ? new Date(va).getTime() : 0;
        const db = vb ? new Date(vb).getTime() : 0;
        return dir === "asc" ? da - db : db - da;
      }

      // fallback string compare
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
    // Build CSV rows (headers + all filtered results)
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

    // Show toast
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

  // Helper to render the correct badge for action type
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
              className="h-4 w-4"
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
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${badge.color} bg-gradient-to-r ${badge.gradient}`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  // Helper to render a platform with icon
  const renderPlatform = (log) => {
    if (!log.platform) return <span className="text-gray-400">N/A</span>;

    const iconUrl = log.platformIcon || getPlatformIcon(log.platform);

    return (
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0 h-6 w-6 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm flex items-center justify-center overflow-hidden">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={log.platform}
              className="h-5 w-5 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icons/platform-generic.svg"; // fallback icon
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
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {log.platform}
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section with title and action count */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 rounded-t-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            Action Logs
          </h2>

          {/* Total counter and export button */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total:
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {logs.length}
              </span>
            </div>

            <button
              onClick={exportCsv}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters section */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-200"
              placeholder="Search logs by email, rule, platform..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Action filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-3 text-sm"
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
              className="border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-3 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table section */}
      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading action logs...
            </p>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="p-12 flex justify-center items-center">
          <div className="flex flex-col items-center text-center max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-4"
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
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              No logs found
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-150"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-400"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Rule Name
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Rule Conditions
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSort("created_at")}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-400"
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
                    Time
                    {sortBy.key === "created_at" ? (
                      sortBy.dir === "asc" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
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
                          className="h-4 w-4 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )
                    ) : null}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-full">
                        {log.avatarUrl ? (
                          <img
                            src={log.avatarUrl}
                            alt={log.email}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                log.email?.charAt(0) || "U"
                              )}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {log.email
                                ? log.email.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 max-w-[200px]">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {log.email || "N/A"}
                        </div>
                        <button
                          onClick={() => copyToClipboard(log.email)}
                          className="mt-1 text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
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
                          Copy
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderActionBadge(log.action)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderPlatform(log)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                      {log.rule_name || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {log.rule_conditions ? (
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 max-w-[250px] md:max-w-[300px] lg:max-w-[350px] overflow-hidden">
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

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 break-words max-w-[200px] md:max-w-[250px] lg:max-w-[300px] bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                      {typeof log.details === "string"
                        ? log.details
                        : JSON.stringify(log.details ?? "")}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5 text-gray-400"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
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
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  page === 1
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <span className="sr-only">First Page</span>
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

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 border ${
                  page === 1
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="hidden md:flex">
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-600 dark:text-indigo-300"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      } focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Current page indicator for mobile */}
              <span className="md:hidden relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 border ${
                  page === totalPages
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
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
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                  page === totalPages
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                } text-sm font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <span className="sr-only">Last Page</span>
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
  );
}
