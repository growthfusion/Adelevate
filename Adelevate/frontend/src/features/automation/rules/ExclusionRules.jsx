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
  SelectGroup
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Search as SearchIcon, ChevronDown } from "lucide-react";

// Icons
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Firestore
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { addConfig } from "@/services/config.js";

// Supabase to fetch my role & platform access
import { supabase } from "@/supabaseClient";

// Import ad accounts service
import { getAllAccounts } from "@/services/accountsConfig";

/* ---------- helpers ---------- */

// Helper function to get API base URL - avoids mixed content issues in production
const getApiBaseUrl = () => {
  // Check for environment variable first (for production)
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CAMPAIGNS_API_URL;
  
  if (apiUrl) {
    // Remove trailing slash and ensure it ends with /v1/campaigns
    const base = apiUrl.replace(/\/$/, '');
    return base.endsWith('/v1/campaigns') ? base : `${base}/v1/campaigns`;
  }
  
  if (import.meta.env.PROD) {
    // In production, use relative path that goes through proxy/backend
    // IMPORTANT: Your web server (nginx/Apache/Cloudflare) must be configured to proxy
    // /api/campaigns/* requests to https://65.109.65.93:8080/v1/campaigns/*
    // This avoids mixed content errors (HTTPS page calling HTTP API)
    return "/api/campaigns";
  }
  
  // In development, use the direct backend URL
  return "http://65.109.65.93:8080/v1/campaigns";
};

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta", icon: metaIcon },
  { value: "snap", label: "Snap", icon: snapchatIcon },
  { value: "tiktok", label: "TikTok", icon: tiktokIcon },
  { value: "google", label: "Google", icon: googleIcon },
  { value: "newsbreak", label: "News Break", icon: nbIcon }
];

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const BULK_ACTIVE = "All_Active_Campaigns";
const BULK_PAUSED = "All_Pause_Campaigns";

// Helper functions for ad accounts
const normalizePlatformFromDB = (p) => {
  if (!p) return "";
  const v = String(p).toLowerCase();
  if (v === "facebook") return "meta";
  if (v === "snapchat") return "snap";
  return v;
};

const extractCampaignsFromResponse = (data) => {
  let campaigns = [];
  if (Array.isArray(data)) {
    campaigns = data;
  } else if (data?.data && Array.isArray(data.data)) {
    campaigns = data.data;
  } else if (data?.campaigns && Array.isArray(data.campaigns)) {
    campaigns = data.campaigns;
  } else if (data?.results && Array.isArray(data.results)) {
    campaigns = data.results;
  } else if (typeof data === "object") {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        campaigns = data[key];
        break;
      }
    }
  }
  return campaigns;
};

const platformIconsMap = {
  meta: metaIcon,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nbIcon
};

const platformDisplayNames = {
  meta: "Meta",
  snap: "Snap",
  tiktok: "TikTok",
  google: "Google",
  newsbreak: "NewsBreak"
};

// Rule type mapping: Display format (with spaces) ↔ Storage format (with hyphens/underscores)
const RULE_TYPE_MAPPING = {
  // Display → Storage
  "Pause Campaign": "Pause-Campaign",
  "Activate Campaign": "Activate-Campaign",
  "Change Budget Campaign": "Change-Budget-Campaign"
};

// Reverse mapping: Storage → Display
const RULE_TYPE_DISPLAY_MAP = {
  "Pause_Campaign": "Pause Campaign",
  "Activate-Campaign": "Activate Campaign",
  "Change-Budget-Campaign": "Change Budget Campaign"
};

// Helper function to convert display format to storage format
const toStorageFormat = (displayValue) => {
  return RULE_TYPE_MAPPING[displayValue] || displayValue;
};

// Helper function to convert storage format to display format
const toDisplayFormat = (storageValue) => {
  return RULE_TYPE_DISPLAY_MAP[storageValue] || storageValue;
};

function parseIncomingCondition(raw, index) {
  const base = {
    id: index + 1,
    logic: index === 0 ? "If" : "And ",
    metric: "",
    operator: "",
    value: "",
    unit: "none",
    target: ""
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
      target: raw.target || ""
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
    return {
      ...base,
      metric,
      operator,
      value: valueToken.replace("%", ""),
      unit: hasPct ? "%" : "none"
    };
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
  { value: "profit", label: "PROFIT" }
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
  { value: "fb_impressions", label: "Impressions (FB)" }
];

function getCampaignIcon(campaignId, platform) {
  const id = String(campaignId || "");
  // Bulk tokens: icon follows the selected platform
  if (id === BULK_ACTIVE || id === BULK_PAUSED) {
    switch (platform) {
      case "meta":
        return metaIcon;
      case "snap":
        return snapchatIcon;
      case "newsbreak":
        return nbIcon;
      case "tiktok":
        return tiktokIcon;
      case "google":
        return googleIcon;
      default:
        return metaIcon;
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

  // my session role & platforms ===
  const [myRole, setMyRole] = useState("user");
  const [allowedPlatforms, setAllowedPlatforms] = useState([]); // ['meta','snap',...]
  const [accessLoaded, setAccessLoaded] = useState(false);

  // read-only mode if role === 'user'
  const isReadOnly = myRole === "user";

  // UI state
  const [ruleName, setRuleName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedRuleType, setSelectedRuleType] = useState(""); // Filter by rule type: "Pause Campaign", "Activate Campaign", "Change Budget Campaign"
  const [scheduleInterval, setScheduleInterval] = useState("");
  const [conditions, setConditions] = useState([
    { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }
  ]);

  const [campaigns, setCampaigns] = useState([]);
  const [catalog, setCatalog] = useState({ snap: null, meta: null }); // { snap: { accounts: {...}, total_campaigns, fetched_at } }
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

  // Ad Accounts state
  const [adAccounts, setAdAccounts] = useState({});
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    meta: true,
    snap: true,
    tiktok: true,
    google: true,
    newsbreak: true
  });

  // Date / Lookback and schedule defaults (keeps parity with other rule forms)
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [startDateTime, setStartDateTime] = useState(null); // For hourly periods
  const [endDateTime, setEndDateTime] = useState(null); // For hourly periods
  const [lookBackPeriod, setLookBackPeriod] = useState("7_days");
  const [activeLookBack, setActiveLookBack] = useState("Last 7 days");
  const [showLookBack, setShowLookBack] = useState(false);
  const [selectionMode, setSelectionMode] = useState(null);

  const [customScheduleTime, setCustomScheduleTime] = useState("12:00");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [scheduleFrequency, setScheduleFrequency] = useState("daily");
  const [scheduleDays, setScheduleDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ]);

  const formatDateForDisplay = (dateString, includeTime = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (includeTime) {
      const options = { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      };
      return date.toLocaleString("en-US", options);
    }
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const calculateDaysBetween = (startD, endD) => {
    const s = new Date(startD);
    const e = new Date(endD);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  // Calculate hours between two dates
  const calculateHoursBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };

  // Check if lookback period is hourly
  const isHourlyPeriod = (period) => {
    return period && period.includes("_hour");
  };

  // fetch my access (role + platforms) ===
  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!mounted) return;

      let role = "user";
      let platforms = [];

      if (session?.user?.id) {
        const { data: me, error: meErr } = await supabase
          .from("user_roles")
          .select("role, platforms")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!meErr && me) {
          role = me.role || "user";
          platforms = Array.from(new Set((me.platforms || []).map((v) => String(v).toLowerCase())));
        }
      }

      // SuperAdmin can access all platforms
      if (role === "SuperAdmin") {
        platforms = ["meta", "snap", "newsbreak", "google", "tiktok"];
      }

      setMyRole(role);
      setAllowedPlatforms(platforms);
      setAccessLoaded(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch ad accounts from Firestore (like Integration section)
  useEffect(() => {
    let mounted = true;

    const fetchAdAccounts = async () => {
      try {
        setAccountsLoading(true);
        setAccountsError(null);

        console.log("📡 Fetching ad accounts from Firestore...");

        const allAccounts = await getAllAccounts();
        console.log("📦 Ad accounts from Firestore:", allAccounts);

        // Group accounts by platform
        const accountsByPlatform = {};

        allAccounts.forEach((account) => {
          // Normalize platform name
          const platform = normalizePlatformFromDB(account.platform);
          if (!platform || !account.accountId) return;

          if (!accountsByPlatform[platform]) {
            accountsByPlatform[platform] = [];
          }

          // Check for duplicates
          const exists = accountsByPlatform[platform].some(
            (acc) => acc.id === account.accountId
          );

          if (!exists) {
            accountsByPlatform[platform].push({
              id: account.accountId,
              name: account.accountLabel || account.accountId,
              platform: platform
            });
          }
        });

        // Sort each platform's accounts by name
        Object.keys(accountsByPlatform).forEach((platform) => {
          accountsByPlatform[platform].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });

        console.log("✅ Formatted ad accounts by platform:", accountsByPlatform);

        if (mounted) {
          setAdAccounts(accountsByPlatform);
          setAccountsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error fetching ad accounts:", error);
        if (mounted) {
          setAccountsError(error.message);
          setAccountsLoading(false);
        }
      }
    };

    fetchAdAccounts();
    return () => {
      mounted = false;
    };
  }, []);

  // Toggle account selection - store with platform and accountId
  const toggleAccount = (accountId, platform, accountName) => {
    setSelectedAccounts((prev) => {
      // Check if account already exists (handle both old string format and new object format)
      const exists = prev.some((acc) => {
        if (typeof acc === "string") {
          return acc === accountId;
        }
        return acc.accountId === accountId && acc.platform === platform;
      });
      
      if (exists) {
        // Remove the account
        return prev.filter((acc) => {
          if (typeof acc === "string") {
            return acc !== accountId;
          }
          return !(acc.accountId === accountId && acc.platform === platform);
        });
      } else {
        // Add the account with platform and accountId
        return [...prev, { platform, accountId, accountLabel: accountName || accountId }];
      }
    });
  };

  // Toggle platform section
  const toggleSection = (platform) => {
    setExpandedSections((prev) => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // === 🔵 ADDED: filter platform options by allowedPlatforms ===
  const visiblePlatformOptions = useMemo(() => {
    if (!accessLoaded) return [];
    const set = new Set(allowedPlatforms);
    return PLATFORM_OPTIONS.filter((p) => set.has(p.value));
  }, [accessLoaded, allowedPlatforms]);

  // fetch live Snapchat campaigns from /api/campaigns on mount
  useEffect(() => {
    if (!accessLoaded) return;
    let isMounted = true;
    (async () => {
      try {
        setLoadingCatalog(true);
        setCatalogError("");
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/all-with-status`, {
          cache: "no-store"
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load campaigns");

        const items = Array.isArray(payload) ? payload : payload.campaigns || [];

        const snapAccounts = {};
        const metaBMs = {};
        const nbAccounts = {};

        items.forEach((c) => {
          const platform = String(c.platform || c.source || "").toLowerCase();
          const status = String(c.status || c.state || "").toUpperCase();
          const id = c.id || c.campaign_id || c.campaignId || c.name || "";
          const name = c.campaignName || c.campaign_name || c.name || id;

          if (platform === "snap" || id.startsWith("snap_")) {
            const acct = c.account_id || c.account || "default";
            if (!snapAccounts[acct])
              snapAccounts[acct] = { account_name: c.account_name || acct, campaigns: [] };
            snapAccounts[acct].campaigns.push({ id, name, status });
          } else if (platform === "meta" || platform === "facebook" || id.startsWith("fb_")) {
            const bm = c.business_manager || c.bm || "default_bm";
            const acct = c.account_id || c.account || "default";
            if (!metaBMs[bm]) metaBMs[bm] = { accounts: {} };
            if (!metaBMs[bm].accounts[acct])
              metaBMs[bm].accounts[acct] = { account_name: c.account_name || acct, campaigns: [] };
            metaBMs[bm].accounts[acct].campaigns.push({ id, name, status });
          } else if (platform === "newsbreak" || platform === "nb" || id.startsWith("nb_")) {
            const acct = c.account_id || c.account || "default";
            if (!nbAccounts[acct])
              nbAccounts[acct] = { account_name: c.account_name || acct, campaigns: [] };
            nbAccounts[acct].campaigns.push({ id, name, status });
          }
        });

        if (!isMounted) return;
        setCatalog({
          snap: { accounts: snapAccounts },
          meta: { business_managers: metaBMs },
          newsbreak: { accounts: nbAccounts }
        });
      } catch (e) {
        if (isMounted) setCatalogError(String(e?.message || e));
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [accessLoaded, allowedPlatforms]);

  //SNAP flatten helpers from catalog
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
          icon: snapchatIcon
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
            icon: metaIcon
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
          icon: nbIcon // NewsBreak icon
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
      newsbreak: newsbreakCampaignList
    };
  }, [snapCampaignList, metaCampaignList, newsbreakCampaignList]);

  // searchable list uses live data
  const filteredCampaigns = useMemo(() => {
    if (!selectedPlatform) return [];
    const list = campaignsByPlatform[selectedPlatform] || [];
    if (!campaignSearchTerm) return list;
    return list.filter((c) =>
      (c.name || "").toLowerCase().includes(campaignSearchTerm.toLowerCase())
    );
  }, [selectedPlatform, campaignSearchTerm, campaignsByPlatform]);

  const nameLookup = useMemo(() => {
    const map = new Map();
    Object.values(campaignsByPlatform).forEach((arr) => {
      (arr || []).forEach((c) => {
        const key = String(c.id || "");
        map.set(key, c.name);
        const u = key.indexOf("_");
        if (u > 0) {
          const stripped = key.slice(u + 1);
          if (stripped) map.set(stripped, c.name);
        }
      });
    });
    return map;
  }, [campaignsByPlatform]);

  function formatCampaignName(_platform, storedValue) {
    if (storedValue === BULK_ACTIVE || storedValue === BULK_PAUSED) return storedValue;
    const s = String(storedValue ?? "");
    const firstBar = s.indexOf("|");
    if (firstBar >= 0) {
      const namePart = s.slice(firstBar + 1).trim();
      if (namePart) return namePart;
    }
    const left = firstBar >= 0 ? s.slice(0, firstBar).trim() : s.trim();
    if (nameLookup && nameLookup.has(left)) return nameLookup.get(left);
    const underscore = left.indexOf("_");
    if (underscore >= 0) {
      const stripped = left.slice(underscore + 1);
      if (nameLookup.has(stripped)) return nameLookup.get(stripped);
    }
    return firstBar >= 0 ? s.slice(firstBar + 1).trim() || left : left;
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
      case "meta":
        platformIcon = metaIcon;
        break;
      case "snap":
        platformIcon = snapchatIcon;
        break;
      case "newsbreak":
        platformIcon = nbIcon;
        break;
      case "tiktok":
        platformIcon = tiktokIcon;
        break;
      case "google":
        platformIcon = googleIcon;
        break;
      default:
        platformIcon = metaIcon;
    }

    return [
      {
        id: BULK_ACTIVE,
        name: `Add Active (${activeCount})`,
        icon: platformIcon,
        status: "active"
      },
      { id: BULK_PAUSED, name: `Add Paused (${pausedCount})`, icon: platformIcon, status: "paused" }
    ];
  }

  // Load from Firestore when editing
  useEffect(() => {
    if (!ruleId || !colName || !accessLoaded) return;
    const ref = doc(db, colName, ruleId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const platform = (Array.isArray(d.platform) ? d.platform[0] : d.platform) || "meta";

      // If user is not SuperAdmin and platform not allowed, force read-only via state
      // (We still show it but cannot switch to disallowed platform)
      if (myRole !== "SuperAdmin" && !allowedPlatforms.includes(platform)) {
        // Auto-fallback to first allowed platform for safety in UI
        const fallback = allowedPlatforms[0] || "";
        setSelectedPlatform(fallback);
      } else {
        setSelectedPlatform(platform);
      }

      setRuleName(d.name || "");
      // Convert storage format (with hyphens/underscores) to display format (with spaces) for UI
      const storedRuleType = d.ruleType || "";
      setSelectedRuleType(toDisplayFormat(storedRuleType));

      if (d.schedule?.mode === "custom") {
        setScheduleInterval("Custom");
      } else if (d.schedule?.mode === "preset") {
        setScheduleInterval(d.schedule.preset || "");
      } else {
        setScheduleInterval(d.frequency || "");
      }

      setCampaigns(d.campaigns || []);
      setSelectedAccounts(d.selectedAccounts || []);
      const raw = Array.isArray(d.condition) ? d.condition : [];
      const rows =
        raw.length > 0
          ? raw.map((c, i) => ({
              ...parseIncomingCondition(c, i),
              id: i + 1,
              logic: i === 0 ? "If" : String(c?.logic).toUpperCase() === "OR" ? "OR" : "AND"
            }))
          : [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }];
      setConditions(rows);

      if (d.lookback?.start) setStartDate(d.lookback.start);
      if (d.lookback?.end) setEndDate(d.lookback.end);
      if (d.lookback?.period) setLookBackPeriod(d.lookback.period);
      if (d.lookback?.display) setActiveLookBack(d.lookback.display);

      if (d.schedule) {
        if (d.schedule.time) setCustomScheduleTime(d.schedule.time);
        if (d.schedule.timezone === "Asia/Kolkata") setScheduleTimezone("Local");
        else if (d.schedule.timezone === "UTC") setScheduleTimezone("UTC");
        if (d.schedule.frequency) setScheduleFrequency(d.schedule.frequency);
        if (Array.isArray(d.schedule.days)) setScheduleDays(d.schedule.days);
      }
    });
    return () => unsub();
  }, [ruleId, colName, accessLoaded, allowedPlatforms, myRole]);

  // close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target))
        setIsSearchOpen(false);
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target))
        setShowCampaignDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ----- conditions CRUD ----- */
  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        logic: "And",
        metric: "",
        operator: "",
        value: "",
        unit: "none",
        target: ""
      }
    ]);
  };
  const removeCondition = (id) => {
    setConditions((prev) => {
      if (prev.length <= 1) {
        return [
          { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }
        ];
      }
      return prev
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, id: i + 1, logic: i === 0 ? "If" : "And" }));
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
    setSelectedCampaignOptions((prev) =>
      checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)
    );
  };
  const clearCampaignSelection = () => setSelectedCampaignOptions([]);

  const removeCampaign = (index) => setCampaigns((prev) => prev.filter((_, i) => i !== index));

  /* ----- Save ----- */
  const handleSave = async () => {
    if (isReadOnly) return;

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
        target: c.target || ""
      })),
      selectedAccounts: selectedAccounts,
      // Convert display format (with spaces) to storage format (with hyphens/underscores) for saving
      ruleType: selectedRuleType ? toStorageFormat(selectedRuleType) : "",
      // 🔵 CHANGE: explicitly null out unrelated fields
      lookback: null,
      schedule: null,
      actionType: null,
      actionValue: null,
      actionUnit: null,
      actionTarget: null,
      minBudget: null,
      maxBudget: null
    };

    try {
      await addConfig(uiPayload);
      navigate("/rules");
    } catch (e) {
      alert(`Error saving: ${e.message}`);
    }
  };

  useEffect(() => {
    if (!accessLoaded) return;
    if (!selectedPlatform) {
      setSelectedPlatform(allowedPlatforms[0] || "");
    } else if (selectedPlatform && !allowedPlatforms.includes(selectedPlatform)) {
      setSelectedPlatform(allowedPlatforms[0] || "");
    }
  }, [accessLoaded, allowedPlatforms, selectedPlatform]);

  return (
    <>
      <div className="bg-gray-50">
        <div className="max-w-6xl xl:mx-auto 2xl:mx-auto p-[20px] pt-[60px] bg-gray-50">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-blue-600 mb-4 pt-5">
              {ruleId ? "Edit Rule" : "Create New Rule"}
            </h1>
            {/* === 🔵 ADDED: read-only banner for 'user' role === */}
            {isReadOnly && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3">
                You have <strong>view-only</strong> access. Contact an admin to create or modify
                rules.
              </div>
            )}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-sm font-medium text-gray-700">
                    Platform
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedPlatform}
                      onValueChange={setSelectedPlatform}
                      disabled={isReadOnly || visiblePlatformOptions.length === 0}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Platform..." />
                      </SelectTrigger>
                      <SelectContent>
                        {visiblePlatformOptions.map((p) => (
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
                <div className="space-y-2">
                  <Label htmlFor="rule-type" className="text-sm font-medium text-gray-700">
                    Rules
                  </Label>
                  <Select
                    value={selectedRuleType}
                    onValueChange={(displayValue) => {
                      // Store display format in state (for UI), convert to storage format when saving
                      setSelectedRuleType(displayValue);
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Rule Type...">
                        {selectedRuleType || "Select Rule Type..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pause Campaign">Pause Campaign</SelectItem>
                      <SelectItem value="Activate Campaign">Activate Campaign</SelectItem>
                      <SelectItem value="Change Budget Campaign">Change Budget Campaign</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label className="text-sm font-medium text-gray-700 block">
                  Apply Rule to Campaigns
                </Label>

                {/* Campaign Search Dropdown */}
                <div ref={searchInputRef} className="relative">
                  <div
                    className="border border-gray-300 rounded-md flex items-center px-3 py-2 cursor-pointer"
                    onClick={() => selectedPlatform && setIsSearchOpen((s) => !s)}
                  >
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
                        className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
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
                          onClick={() => removeCampaign(index)}
                        >
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

                  {/* =================== Ad Accounts =================== */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto transition-colors ${
                        selectedPlatform
                          ? showAccountMenu
                            ? "text-blue-600 border-blue-400 bg-blue-50"
                            : "text-gray-600 bg-transparent"
                          : "text-gray-400 bg-gray-50 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (selectedPlatform) {
                          setShowAccountMenu((prev) => !prev);
                          setShowCampaignDropdown(false); // close the other dropdown
                        }
                      }}
                      disabled={!selectedPlatform || accountsLoading}
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Ad Accounts
                      {selectedAccounts.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-bold text-white">
                          {selectedAccounts.length}
                        </span>
                      )}
                    </Button>
                    {showAccountMenu && !accountsLoading && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowAccountMenu(false)} />
                        <div className="absolute z-50 mt-1 w-96 lg:w-[32rem] xl:w-[40rem] max-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-10">
                          <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500 p-2 shadow-sm">
                                  <svg
                                    className="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                                    Ad Accounts
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    {selectedAccounts.length === 0
                                      ? "No selection = All campaigns"
                                      : "Select accounts to filter"}
                                  </p>
                                </div>
                              </div>
                              {selectedAccounts.length > 0 && (
                                <span className="rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                                  {selectedAccounts.length} selected
                                </span>
                              )}
                            </div>
                          </div>

                          {accountsError && (
                            <div className="mx-4 mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 sm:mx-6">
                              <div className="flex items-start gap-2">
                                <svg
                                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-sm text-red-800">
                                  <span className="font-semibold">Error:</span> {accountsError}
                                </div>
                              </div>
                            </div>
                          )}

                          {Object.keys(adAccounts).length === 0 && !accountsError && (
                            <div className="px-4 py-12 text-center sm:px-6">
                              <svg
                                className="mx-auto h-16 w-16 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                              </svg>
                              <p className="mt-4 text-base font-medium text-gray-900">
                                No ad accounts available
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Check your platform access permissions
                              </p>
                            </div>
                          )}

                          <div className="max-h-[calc(70vh-140px)] overflow-y-auto">
                            <div className="space-y-3 p-4 sm:p-6">
                              {Object.entries(adAccounts)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([platform, accounts]) => (
                                  <div
                                    key={platform}
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleSection(platform)}
                                      className="flex w-full items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 transition-all hover:from-gray-100 hover:to-gray-200"
                                    >
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={platformIconsMap[platform]}
                                          alt={`${platform} icon`}
                                          className="h-6 w-6"
                                        />
                                        <span className="text-sm font-bold uppercase tracking-wide text-gray-800 sm:text-base">
                                          {platformDisplayNames[platform] || platform}
                                        </span>
                                        <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                          {accounts.length}
                                        </span>
                                      </div>
                                      <svg
                                        className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                                          expandedSections[platform] ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </button>

                                    {expandedSections[platform] && (
                                      <div className="divide-y divide-gray-100 bg-white">
                                        {accounts.map((account) => (
                                          <label
                                            key={account.id}
                                            className="group flex cursor-pointer items-start gap-3 px-4 py-3 transition-all hover:bg-blue-50 sm:px-5"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={selectedAccounts.some((acc) => {
                                                if (typeof acc === "string") {
                                                  return acc === account.id;
                                                }
                                                return acc.accountId === account.id && acc.platform === platform;
                                              })}
                                              onChange={() => toggleAccount(account.id, platform, account.name)}
                                              className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-blue-600 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                              <div className="break-words text-sm font-semibold text-gray-900 group-hover:text-blue-700 sm:text-base">
                                                {account.name}
                                              </div>
                                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                <code
                                                  className="break-all rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-800 sm:text-sm"
                                                  title={`Full ID: ${account.id}`}
                                                >
                                                  {account.id}
                                                </code>
                                              </div>
                                            </div>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>

                          {selectedAccounts.length > 0 && (
                            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                              <button
                                type="button"
                                onClick={() => setSelectedAccounts([])}
                                className="w-full rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-md"
                              >
                                Clear all ({selectedAccounts.length})
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-9 pt-6 pb-[70px]">
            <Button
              variant="outline"
              className="text-gray-600 bg-transparent"
              onClick={() => navigate("/rules")}
            >
              Back
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={isReadOnly}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
