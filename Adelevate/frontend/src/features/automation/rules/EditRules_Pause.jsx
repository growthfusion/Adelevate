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
  SelectSeparator
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ChevronDown, Search as SearchIcon } from "lucide-react";

// Images
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

/* ---------------- helpers ---------------- */

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

function parseIncomingCondition(raw, index) {
  const base = {
    id: index + 1,
    logic: index === 0 ? "If" : "AND",
    metric: "",
    operator: "",
    value: "",
    unit: "none",
    target: ""
  };
  if (!raw) return base;

  // Firestore object form
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
      logic: index === 0 ? "If" : String(raw.logic || "AND").toUpperCase() === "OR" ? "OR" : "AND",
      metric: String(raw.metric || "").toLowerCase(),
      operator: op,
      value: raw.value ?? raw.threshold ?? "",
      unit: raw.unit || "none",
      target: raw.target || "",
      // === ADDED === propagate lookback if present on doc
      lookBackPeriod: raw.lookback?.period || undefined,
      lookBackStart: raw.lookback?.start || undefined,
      lookBackEnd: raw.lookback?.end || undefined
    };
  }

  // String form e.g. "ROI >= 1.5"
  if (typeof raw === "string") {
    const s = raw.trim();
    let operator = "Equal to";
    if (s.includes(">=")) operator = "Greater or Equal";
    else if (s.includes("<=")) operator = "Less or Equal";
    else if (s.includes(">")) operator = "Greater";
    else if (s.includes("<")) operator = "Less";
    const metric = (s.split(" ")[0] || "").toLowerCase();
    const valueToken = s.split(" ").pop() || "";
    const hasPct = valueToken.includes("%");
    return {
      ...base,
      logic: index === 0 ? "If" : "AND",
      metric,
      operator,
      value: valueToken.replace("%", ""),
      unit: hasPct ? "%" : "none",
      target: ""
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

/* ---------------- component ---------------- */

export default function EditRuleFormPause() {
  const navigate = useNavigate();
  const location = useLocation();

  // From navigator
  const ruleId = location.state?.id || null;
  const colName = location.state?.colName || null;

  // my session role & platforms ===
  const [myRole, setMyRole] = useState("user");
  const [allowedPlatforms, setAllowedPlatforms] = useState([]); // ['meta','snap',...]
  const [accessLoaded, setAccessLoaded] = useState(false);

  // read-only mode if role === 'user'
  const isReadOnly = myRole === "user";

  // State
  const [ruleName, setRuleName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("");
  const [conditions, setConditions] = useState([
    { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }
  ]);
  const [campaigns, setCampaigns] = useState([]);

  const [catalog, setCatalog] = useState({ snap: null, meta: null });
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  // Campaign search dropdown
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState("");
  const lookbackButtonRef = useRef(null);
  const lookbackDropdownRef = useRef(null);

  const [enableLookback, setEnableLookback] = useState(false);

  // multi-select Add Campaigns dropdown
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

  const [showLookBack, setShowLookBack] = useState(false);
  const [lookBackPeriod, setLookBackPeriod] = useState("7_days");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null); // 'start' or 'end'

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

  // Helper function to format dates for display
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

  // Calculate day count between two dates
  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
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

  // Set default dates for the last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [startDateTime, setStartDateTime] = useState(null); // For hourly periods
  const [endDateTime, setEndDateTime] = useState(null); // For hourly periods
  const [activeLookBack, setActiveLookBack] = useState("Last 7 days");
  // Calendar days generation
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month days
    const prevMonthDays = [];
    if (firstDay > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

      for (let i = 0; i < firstDay; i++) {
        prevMonthDays.push({
          date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - (firstDay - i - 1)),
          isCurrentMonth: false
        });
      }
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingCells = 6 * 7 - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = [];
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Current month and year state
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  // Days of the week
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Date selection handler
  const handleDateSelect = (date) => {
    const dateString = date.toISOString().split("T")[0];

    if (selectionMode === "start" || (!selectionMode && new Date(dateString) < new Date(endDate))) {
      setStartDate(dateString);
      setSelectionMode("end");
    } else {
      setEndDate(dateString);
      setSelectionMode(null);
    }
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return dateString === startDate || dateString === endDate;
  };

  // Check if a date is in the selected range
  const isDateInRange = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return dateString > startDate && dateString < endDate;
  };

  // Month names for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  // Generate calendar days
  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  // === 🔵 ADDED: fetch my access (role + platforms) ===
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

  // === 🔵 ADDED: filter platform options by allowedPlatforms ===
  const visiblePlatformOptions = useMemo(() => {
    if (!accessLoaded) return [];
    const set = new Set(allowedPlatforms);
    return PLATFORM_OPTIONS.filter((p) => set.has(p.value));
  }, [accessLoaded, allowedPlatforms]);

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

        // response may be an array or { campaigns: [...] }
        const items = Array.isArray(payload) ? payload : payload.campaigns || [];

        // normalize into expected catalog shapes
        const snapAccounts = {};
        const metaBMs = {};
        const nbAccounts = {};

        items.forEach((c) => {
          const platform = String(c.platform || c.source || "").toLowerCase();
          const status = String(c.status || c.state || "").toUpperCase();
          const id =
            c.id || c.campaign_id || c.campaignId || c.campaignId || c.campaignId || c.name || "";
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

  //SNAP flatten helpers from catalog ***
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

  // derive a general list by platform (for future Meta) ***
  const campaignsByPlatform = useMemo(() => {
    return {
      snap: snapCampaignList,
      meta: metaCampaignList,
      newsbreak: newsbreakCampaignList
    };
  }, [snapCampaignList, metaCampaignList, newsbreakCampaignList]);

  // searchable list uses live data instead of mocks ***
  const filteredCampaigns = useMemo(() => {
    if (!selectedPlatform) return [];
    const list = campaignsByPlatform[selectedPlatform] || [];
    if (!campaignSearchTerm) return list;
    return list.filter((c) =>
      (c.name || "").toLowerCase().includes(campaignSearchTerm.toLowerCase())
    );
  }, [selectedPlatform, campaignSearchTerm, campaignsByPlatform]);

  // name lookup for badges (so we can display real names by id)
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

  // Load Firestore doc if editing (use colName passed from dashboard; DO NOT wait for platform)
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

      if (d.schedule?.mode === "custom") {
        setScheduleInterval("Custom");
      } else if (d.schedule?.mode === "preset") {
        setScheduleInterval(d.schedule.preset || "");
      } else {
        setScheduleInterval(d.frequency || "");
      }

      setCampaigns(d.campaigns || []);
      // Normalize selectedAccounts - convert old string format to new object format
      const normalizedAccounts = (d.selectedAccounts || []).map((acc) => {
        if (typeof acc === "object" && acc.platform && acc.accountId) {
          return acc; // Already in correct format
        }
        // Legacy format: string accountId, use rule's platform
        const platform = normalizePlatformFromDB(Array.isArray(d.platform) ? d.platform[0] : d.platform);
        return {
          platform: platform || "meta",
          accountId: typeof acc === "string" ? acc : String(acc),
          accountLabel: typeof acc === "string" ? acc : String(acc),
        };
      });
      setSelectedAccounts(normalizedAccounts);
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

      // Turn ON if doc has a non-empty lookback; else OFF
      const hasLookback =
        d.lookback &&
        (d.lookback.period || d.lookback.start || d.lookback.end || d.lookback.display);
      setEnableLookback(Boolean(hasLookback));

      if (d.lookback?.start) {
        setStartDate(d.lookback.start);
        // If it's a full ISO string (includes time), also set startDateTime
        if (d.lookback.start.includes("T")) {
          setStartDateTime(d.lookback.start);
        }
      }
      if (d.lookback?.end) {
        setEndDate(d.lookback.end);
        // If it's a full ISO string (includes time), also set endDateTime
        if (d.lookback.end.includes("T")) {
          setEndDateTime(d.lookback.end);
        }
      }
      if (d.lookback?.period) {
        setLookBackPeriod(d.lookback.period);
        // If it's an hourly period, ensure dateTime values are set
        if (isHourlyPeriod(d.lookback.period)) {
          if (d.lookback.start && d.lookback.start.includes("T")) {
            setStartDateTime(d.lookback.start);
          }
          if (d.lookback.end && d.lookback.end.includes("T")) {
            setEndDateTime(d.lookback.end);
          }
        }
      }
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

  // Close search dropdowns on outside click
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

  /* ------ Conditions ------ */
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
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c, i) => ({
        ...c,
        id: i + 1,
        logic: i === 0 ? "If" : String(c.logic).toUpperCase() === "OR" ? "OR" : "AND"
      }));
    });
  };

  /* ------ Campaigns ------ */

  // when a user clicks an item in the search dropdown, use the real id ***
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

  // "Add Active/Paused" bulk add using the dynamic options ***
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

  const removeCampaign = (index) => {
    setCampaigns((prev) => prev.filter((_, i) => i !== index));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on SelectContent (it's portaled outside)
      // Check for Radix Select components
      const isSelectContent = event.target.closest('[role="listbox"]') || 
                              event.target.closest('[data-radix-portal]') ||
                              event.target.closest('[data-radix-select-content]') ||
                              event.target.closest('[data-radix-select-viewport]');
      if (isSelectContent) {
        return;
      }

      // Close lookback dropdown
      if (
        lookbackButtonRef.current &&
        lookbackDropdownRef.current &&
        !lookbackButtonRef.current.contains(event.target) &&
        !lookbackDropdownRef.current.contains(event.target)
      ) {
        setShowLookBack(false);
      }

      // Close campaign dropdown
      if (
        campaignDropdownRef.current &&
        !campaignDropdownRef.current.contains(event.target)
      ) {
        setShowCampaignDropdown(false);
      }

      // Close search dropdown
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ------ Save (Firestore) ------ */
  const handleSave = async () => {
    if (isReadOnly) return;

    // === CHANGED === map "Local" explicitly to Asia/Kolkata
    const tzResolved = scheduleTimezone === "Local" ? "Asia/Kolkata" : "UTC"; // IST region string

    // === ADDED === build schedule payload (cron + rrule + meta)
    function buildSchedulePayload() {
      const [hh = "12", mm = "00"] = (customScheduleTime || "12:00").split(":");

      if (scheduleInterval !== "Custom") {
        return {
          mode: "preset",
          preset: scheduleInterval,
          timezone: tzResolved,
          summary: scheduleInterval
        };
      }

      let rrule = "";
      let summary = `Run ${scheduleFrequency} at ${customScheduleTime} ${tzResolved}`;
      let byDay = [];

      const dayMap = {
        Sunday: "SU",
        Monday: "MO",
        Tuesday: "TU",
        Wednesday: "WE",
        Thursday: "TH",
        Friday: "FR",
        Saturday: "SA"
      };

      if (scheduleFrequency === "daily") {
        rrule = `FREQ=DAILY;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else if (scheduleFrequency === "weekdays") {
        rrule = `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else if (scheduleFrequency === "weekends") {
        rrule = `FREQ=WEEKLY;BYDAY=SA,SU;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else {
        // custom days
        byDay = (scheduleDays || []).map((d) => dayMap[d]).filter(Boolean);
        const by = byDay.length ? byDay.join(",") : "MO,TU,WE,TH,FR,SA,SU"; // fallback all days
        rrule = `FREQ=WEEKLY;BYDAY=${by};BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
        summary = `Run on ${byDay.length ? scheduleDays.join(", ") : "all days"} at ${customScheduleTime} ${tzResolved}`;
      }

      const cron = `${mm} ${hh} * * *`; // daily cron (workers can further gate by RRULE)

      return {
        mode: "custom",
        timezone: tzResolved,
        time: customScheduleTime,
        frequency: scheduleFrequency, // daily | weekdays | weekends | custom
        days: scheduleFrequency === "custom" ? scheduleDays : [],
        cron,
        rrule,
        summary
      };
    }

    const schedulePayload = buildSchedulePayload(); // === ADDED ===

    // === ADDED === root-level lookback payload
    const lookbackPayload = enableLookback
      ? {
          period: lookBackPeriod,
          start: startDate,
          end: endDate,
          display: activeLookBack
        }
      : null;

    // existing campaigns normalization
    const campaignsToPersist = campaigns.map(toPlainCampaignName);

    // === CHANGED === conditions now carry per-condition lookback context
    const serializedConditions = conditions.map((c, i) => ({
      logic: i === 0 ? "If" : String(c.logic).toUpperCase() === "OR" ? "OR" : "AND",
      metric: c.metric,
      operator: c.operator,
      value: c.value,
      unit: c.unit,
      type: "value",
      target: c.target || ""
    }));

    const uiPayload = {
      id: ruleId || crypto.randomUUID(),
      name: ruleName || "Unnamed Pause Campaign",
      status: "Running",
      type: "Pause campaigns",
      platform: selectedPlatform || "meta",
      frequency: schedulePayload.mode === "preset" ? scheduleInterval : schedulePayload.summary, // === CHANGED ===

      schedule: schedulePayload, // === ADDED ===
      lookback: lookbackPayload, // === ADDED ===

      campaigns: campaignsToPersist,
      conditions: serializedConditions,
      selectedAccounts: selectedAccounts
    };

    try {
      await addConfig(uiPayload); // service will route to the correct collection
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
            <h1 className="text-2xl font-semibold text-blue-700 mb-4 pt-5">
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
                <span className="text-lg text-gray-600 font-medium">Pause campaign</span>
              </div>
            </div>

            {/* Rule Section */}
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
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rule Conditions</h2>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white overflow-visible">
              <div className="space-y-6">
                {conditions.map((condition, index) => (
                  <div
                    key={condition.id}
                    className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-full sm:w-24 mb-2 sm:mb-0">
                      {index === 0 ? (
                        <span className="text-sm font-medium text-gray-600">If</span>
                      ) : (
                        // 🆕 ADDED: AND/OR Select
                        <Select
                          value={condition.logic === "OR" ? "OR" : "AND"}
                          onValueChange={(value) => {
                            const next = [...conditions];
                            next[index].logic = value; // "AND" or "OR"
                            setConditions(next);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="AND/OR" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/*<span className="text-sm font-medium text-gray-600 w-full sm:w-12 mb-2 sm:mb-0">*/}
                    {/*  {condition.logic}*/}
                    {/*</span>*/}

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
                          className="sm:col-span-2"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Traffic Source Metrics</SelectLabel>
                              <SelectItem value="days_since_creation">
                                Days since creation
                              </SelectItem>
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
                              <SelectItem value="lpcpc">LPCPC</SelectItem>
                              <SelectItem value="epc">EPC</SelectItem>
                              <SelectItem value="spend">COST</SelectItem>
                              <SelectItem value="revenue">REVENUE</SelectItem>
                              <SelectItem value="profit">PROFIT</SelectItem>
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

                        {/* 'is' */}
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
                          className="sm:col-span-1"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Greater">Greater</SelectItem>
                            <SelectItem value="Greater or Equal">Greater or Equal</SelectItem>
                            <SelectItem value="Less">Less</SelectItem>
                            <SelectItem value="Less or Equal">Less or Equal</SelectItem>
                            <SelectItem value="Equal to">Equal to</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* 'than' */}
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-gray-600">than</span>
                        </div>

                        {/* value + unit (+ optional target metric when unit is %) */}
                        <div className="flex items-center gap-2 sm:col-span-2">
                          {/* numeric / percent value */}
                          <Input
                            value={condition.value}
                            onChange={(e) => {
                              const next = [...conditions];
                              next[index].value = e.target.value;
                              setConditions(next);
                            }}
                            className="w-full"
                            placeholder=""
                          />

                          {/* unit select */}
                          <Select
                            value={condition.unit}
                            onValueChange={(value) => {
                              const next = [...conditions];
                              next[index].unit = value;
                              if (value !== "%") next[index].target = "";
                              setConditions(next);
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="$">$</SelectItem>
                              <SelectItem value="days">days</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* When unit = "%", show "of [metric]" */}
                          {condition.unit === "%" && (
                            <>
                              <span className="text-sm text-gray-600">of</span>
                              <Select
                                value={condition.target}
                                onValueChange={(value) => {
                                  const next = [...conditions];
                                  next[index].target = value;
                                  setConditions(next);
                                }}
                              >
                                <SelectTrigger className="w-56">
                                  <SelectValue placeholder="Select Option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Metrics</SelectLabel>
                                    {ALL_METRICS.map((m) => (
                                      <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </>
                          )}
                        </div>

                        {/* Inline validation */}
                        {condition.unit === "%" && !condition.target && (
                          <div className="sm:col-span-6 mt-1">
                            <p className="text-[12px] text-red-500">
                              Type is not valid. Please choose the target metric for “% of”.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* delete row */}
                      <div className="flex justify-end mt-3 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-gray-400 p-1 hover:bg-gray-200 ${
                            conditions.length <= 1 ? "opacity-50" : ""
                          }`}
                          onClick={() => removeCondition(condition.id)}
                          disabled={conditions.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 bg-transparent border-gray-300 w-full sm:w-auto"
                    onClick={addCondition}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  {/* === ADDED === Lookback enable toggle */}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={enableLookback}
                      onChange={(e) => setEnableLookback(e.target.checked)}
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-gray-700">Enable Lookback</span>
                  </label>
                  <div className="relative" ref={lookbackButtonRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 bg-transparent border-gray-300 w-full sm:w-auto flex items-center gap-2"
                      onClick={() => enableLookback && setShowLookBack(!showLookBack)} // === CHANGED === guard by toggle
                      disabled={!enableLookback}
                    >
                      <span>Look Back:</span>
                      <span className="font-medium whitespace-nowrap">
                        {enableLookback ? activeLookBack : "Disabled"}
                      </span>
                      {enableLookback && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded px-1.5 py-0.5 ml-1">
                          {calculateDaysBetween(startDate, endDate)}d
                        </span>
                      )}
                    </Button>
                    {enableLookback && showLookBack && (
                      <div ref={lookbackDropdownRef} className="absolute z-[99999] mt-2 left-0 w-96 max-h-[85vh] overflow-y-auto rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-3 px-4 flex justify-between items-center border-b border-gray-200 sticky top-0 bg-white z-10">
                          <span className="text-base font-medium text-gray-800">
                            Look Back Period
                          </span>
                          <button
                            className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full flex items-center justify-center"
                            onClick={() => setShowLookBack(false)}
                          >
                            <span className="text-gray-500 text-lg">×</span>
                          </button>
                        </div>

                        <div className="p-4 pb-6" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={lookBackPeriod}
                            onValueChange={(value) => {
                              setLookBackPeriod(value);
                              const today = new Date();
                              let start = new Date();
                              let displayText = "";

                              // Handle hourly periods
                              if (value === "1_hour") {
                                start = new Date(today);
                                start.setHours(start.getHours() - 1);
                                displayText = "Last 1 hour";
                              } else if (value === "3_hours") {
                                start = new Date(today);
                                start.setHours(start.getHours() - 3);
                                displayText = "Last 3 hours";
                              } else if (value === "6_hours") {
                                start = new Date(today);
                                start.setHours(start.getHours() - 6);
                                displayText = "Last 6 hours";
                              } else if (value === "12_hours") {
                                start = new Date(today);
                                start.setHours(start.getHours() - 12);
                                displayText = "Last 12 hours";
                              } else if (value === "24_hours") {
                                start = new Date(today);
                                start.setHours(start.getHours() - 24);
                                displayText = "Last 24 hours";
                              } else if (value === "today") {
                                start = today;
                                displayText = "Today";
                              } else if (value === "yesterday") {
                                start = new Date(today);
                                start.setDate(start.getDate() - 1);
                                setEndDate(start.toISOString().split("T")[0]);
                                displayText = "Yesterday";
                              } else if (value === "7_days") {
                                start = new Date(today);
                                start.setDate(start.getDate() - 7);
                                displayText = "Last 7 days";
                              } else if (value === "14_days") {
                                start = new Date(today);
                                start.setDate(start.getDate() - 14);
                                displayText = "Last 14 days";
                              } else if (value === "30_days") {
                                start = new Date(today);
                                start.setDate(start.getDate() - 30);
                                displayText = "Last 30 days";
                              } else if (value === "90_days") {
                                start = new Date(today);
                                start.setDate(start.getDate() - 90);
                                displayText = "Last 90 days";
                              } else if (value === "this_month") {
                                start = new Date(today.getFullYear(), today.getMonth(), 1);
                                displayText = "This month";
                              } else if (value === "last_month") {
                                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                const end = new Date(today.getFullYear(), today.getMonth(), 0);
                                setEndDate(end.toISOString().split("T")[0]);
                                displayText = "Last month";
                              } else if (value === "this_year") {
                                start = new Date(today.getFullYear(), 0, 1);
                                displayText = "This year";
                              } else if (value === "last_year") {
                                start = new Date(today.getFullYear() - 1, 0, 1);
                                const end = new Date(today.getFullYear(), 0, 0);
                                setEndDate(end.toISOString().split("T")[0]);
                                displayText = "Last year";
                              } else if (value === "custom") {
                                displayText = "Custom range";
                              }

                              // For hourly periods, set date/time to current time
                              if (isHourlyPeriod(value)) {
                                setStartDateTime(start.toISOString());
                                setEndDateTime(today.toISOString());
                                setStartDate(start.toISOString().split("T")[0]);
                                setEndDate(today.toISOString().split("T")[0]);
                                setActiveLookBack(displayText);
                              } else if (
                                value !== "yesterday" &&
                                value !== "last_month" &&
                                value !== "last_year" &&
                                !isHourlyPeriod(value)
                              ) {
                                setEndDate(today.toISOString().split("T")[0]);
                                setStartDateTime(null);
                                setEndDateTime(null);
                              }

                              if (value !== "custom") {
                                if (!isHourlyPeriod(value)) {
                                  setStartDate(start.toISOString().split("T")[0]);
                                  setStartDateTime(null);
                                  setEndDateTime(null);
                                }
                                setActiveLookBack(displayText);
                              }

                              // Apply the look back period to all conditions dynamically
                              const updatedConditions = conditions.map((condition) => ({
                                ...condition,
                                lookBackPeriod: value,
                                lookBackStart: isHourlyPeriod(value) 
                                  ? start.toISOString() 
                                  : start.toISOString().split("T")[0],
                                lookBackEnd: isHourlyPeriod(value)
                                  ? today.toISOString()
                                  : value !== "yesterday" &&
                                    value !== "last_month" &&
                                    value !== "last_year"
                                    ? today.toISOString().split("T")[0]
                                    : value === "yesterday"
                                      ? start.toISOString().split("T")[0]
                                      : value === "last_month"
                                        ? new Date(today.getFullYear(), today.getMonth(), 0)
                                            .toISOString()
                                            .split("T")[0]
                                        : new Date(today.getFullYear(), 0, 0)
                                            .toISOString()
                                            .split("T")[0]
                              }));
                              setConditions(updatedConditions);
                            }}
                          >
                            <SelectTrigger className="w-full mb-3">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent className="z-[999999] max-h-[300px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                              <SelectGroup>
                                <SelectLabel>Hourly</SelectLabel>
                                <SelectItem value="1_hour">Last 1 hour</SelectItem>
                                <SelectItem value="3_hours">Last 3 hours</SelectItem>
                                <SelectItem value="6_hours">Last 6 hours</SelectItem>
                                <SelectItem value="12_hours">Last 12 hours</SelectItem>
                                <SelectItem value="24_hours">Last 24 hours</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectLabel>Daily</SelectLabel>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="1_days">Last 1 day</SelectItem>
                                <SelectItem value="7_days">Last 7 days</SelectItem>
                                <SelectItem value="14_days">Last 14 days</SelectItem>
                                <SelectItem value="30_days">Last 30 days</SelectItem>
                                <SelectItem value="90_days">Last 90 days</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectLabel>Monthly & Yearly</SelectLabel>
                                <SelectItem value="this_month">This month</SelectItem>
                                <SelectItem value="last_month">Last month</SelectItem>
                                <SelectItem value="this_year">This year</SelectItem>
                                <SelectItem value="last_year">Last year</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectItem value="custom">Custom date range</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Display selected date range with day/hour count */}
                          <div className="flex flex-col mb-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex flex-col">
                                <span className="text-xs text-blue-600 font-medium">From</span>
                                <span className="text-sm text-blue-800 font-medium">
                                  {isHourlyPeriod(lookBackPeriod) && startDateTime
                                    ? formatDateForDisplay(startDateTime, true)
                                    : formatDateForDisplay(startDate)}
                                </span>
                              </div>

                              <div className="h-8 flex items-center">
                                <span className="px-2 text-gray-400">→</span>
                              </div>

                              <div className="flex flex-col text-right">
                                <span className="text-xs text-blue-600 font-medium">To</span>
                                <span className="text-sm text-blue-800 font-medium">
                                  {isHourlyPeriod(lookBackPeriod) && endDateTime
                                    ? formatDateForDisplay(endDateTime, true)
                                    : formatDateForDisplay(endDate)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end">
                              <div className="text-xs px-2 py-0.5 bg-white rounded border border-blue-200 text-blue-700 font-medium">
                                {isHourlyPeriod(lookBackPeriod) ? (
                                  <>
                                    {(() => {
                                      const hours = lookBackPeriod === "1_hour" ? 1 :
                                                   lookBackPeriod === "3_hours" ? 3 :
                                                   lookBackPeriod === "6_hours" ? 6 :
                                                   lookBackPeriod === "12_hours" ? 12 :
                                                   lookBackPeriod === "24_hours" ? 24 : 0;
                                      return `${hours} hour${hours !== 1 ? "s" : ""}`;
                                    })()}
                                  </>
                                ) : (
                                  <>
                                    {calculateDaysBetween(startDate, endDate)} day
                                    {calculateDaysBetween(startDate, endDate) !== 1 ? "s" : ""}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {lookBackPeriod === "custom" && (
                            <div className="mt-4 space-y-4">
                              {/* Calendar */}
                              <div className="border rounded-lg overflow-hidden shadow-sm">
                                {/* Calendar Header */}
                                <div className="bg-blue-50 p-3 border-b flex justify-between items-center">
                                  <button
                                    className="p-1 hover:bg-blue-100 rounded flex items-center justify-center h-7 w-7"
                                    onClick={goToPreviousMonth}
                                  >
                                    <span className="text-blue-600">←</span>
                                  </button>
                                  <span className="font-medium text-blue-700">
                                    {monthNames[currentMonth]} {currentYear}
                                  </span>
                                  <button
                                    className="p-1 hover:bg-blue-100 rounded flex items-center justify-center h-7 w-7"
                                    onClick={goToNextMonth}
                                  >
                                    <span className="text-blue-600">→</span>
                                  </button>
                                </div>
                                {/* Calendar Grid */}
                                <div className="p-3 bg-white">
                                  {/* Days of Week */}
                                  <div className="grid grid-cols-7 mb-1">
                                    {daysOfWeek.map((day, index) => (
                                      <div
                                        key={index}
                                        className="text-center text-xs font-medium text-gray-500 py-1"
                                      >
                                        {day}
                                      </div>
                                    ))}
                                  </div>
                                  {/* Calendar Days */}
                                  <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        className={`
                                                                            h-9 w-full flex items-center justify-center text-sm rounded-full
                                                                            ${!day.isCurrentMonth ? "text-gray-400" : "text-gray-700"}
                                                                            ${isDateSelected(day.date) ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100"}
                                                                            ${isDateInRange(day.date) ? "bg-blue-100 hover:bg-blue-200" : ""}
                                                                          `}
                                        onClick={() => handleDateSelect(day.date)}
                                      >
                                        {day.date.getDate()}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {/* Helper text for selection mode */}
                              <div className="text-xs text-gray-500 italic mt-2 flex items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-600 mr-1.5"></div>
                                {selectionMode === "start"
                                  ? "Select start date"
                                  : selectionMode === "end"
                                    ? "Now select end date"
                                    : "Click dates to select a range"}
                              </div>
                            </div>
                          )}
                          <div></div>
                          <div className="mt-4">
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                // Apply the date range to all conditions
                                const updatedConditions = conditions.map((condition) => ({
                                  ...condition,
                                  lookBackPeriod: lookBackPeriod,
                                  lookBackStart: isHourlyPeriod(lookBackPeriod) && startDateTime
                                    ? startDateTime
                                    : startDate,
                                  lookBackEnd: isHourlyPeriod(lookBackPeriod) && endDateTime
                                    ? endDateTime
                                    : endDate
                                }));
                                setConditions(updatedConditions);

                                // For custom range, update the display text
                                if (lookBackPeriod === "custom") {
                                  if (isHourlyPeriod(lookBackPeriod)) {
                                    const hourCount = calculateHoursBetween(startDate, endDate);
                                    setActiveLookBack(`Custom range (${hourCount} hour${hourCount !== 1 ? "s" : ""})`);
                                  } else {
                                    const dayCount = calculateDaysBetween(startDate, endDate);
                                    setActiveLookBack(`Custom range (${dayCount} day${dayCount !== 1 ? "s" : ""})`);
                                  }
                                }

                                setShowLookBack(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Rule */}
          <div className="mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                3
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
                              onClick={() => handleCampaignSelect(c)} // 🔵 live id/name
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

          {/* Schedule */}
          <div className="mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                4
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Schedule Rule</h2>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-medium text-gray-700">Run this rule every</Label>
                    <Select
                      value={scheduleInterval}
                      onValueChange={(value) => {
                        setScheduleInterval(value);
                        // Reset custom time if not custom
                        if (value !== "Custom") {
                          setCustomScheduleTime("12:00");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[33rem]">
                        <SelectValue placeholder="Select interval..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPlatform !== "snap" && (
                          <SelectItem value="Every 10 Minutes">Every 10 Minutes</SelectItem>
                        )}
                        <SelectItem value="Every 20 Minutes">Every 20 Minutes</SelectItem>
                        <SelectItem value="Every 30 Minutes">Every 30 Minutes</SelectItem>
                        <SelectItem value="Every 1 Hour">Every 1 Hour</SelectItem>
                        <SelectItem value="Every 3 Hours">Every 3 Hours</SelectItem>
                        <SelectItem value="Every 6 Hours">Every 6 Hours</SelectItem>
                        <SelectItem value="Every 12 Hours">Every 12 Hours</SelectItem>
                        <SelectItem value="Once Daily (As soon as conditions are met)">
                          Once Daily (As soon as conditions are met)
                        </SelectItem>
                        <SelectItem value="Daily (At 12:00 PM UTC)">
                          Daily (At 12:00 PM UTC)
                        </SelectItem>
                        <SelectItem value="Daily (At 12:00 PM Local)">
                          Daily (At 12:00 PM IST)
                        </SelectItem>
                        <SelectItem value="Custom">Custom Schedule...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {scheduleInterval === "Custom" && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Run at specific time
                        </Label>
                        <input
                          type="time"
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-48"
                          value={customScheduleTime}
                          onChange={(e) => setCustomScheduleTime(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                        <Select value={scheduleTimezone} onValueChange={setScheduleTimezone}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Local">IST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                        <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekdays">Weekdays only</SelectItem>
                            <SelectItem value="weekends">Weekends only</SelectItem>
                            <SelectItem value="custom">Custom days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {scheduleFrequency === "custom" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Select days</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday"
                          ].map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={scheduleDays.includes(day) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (scheduleDays.includes(day)) {
                                  setScheduleDays(scheduleDays.filter((d) => d !== day));
                                } else {
                                  setScheduleDays([...scheduleDays, day]);
                                }
                              }}
                              className={scheduleDays.includes(day) ? "bg-blue-600" : ""}
                            >
                              {day.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2">
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="font-medium text-blue-800 mb-1">Schedule Summary</div>
                        <p>
                          {scheduleFrequency === "daily" && "Run every day"}
                          {scheduleFrequency === "weekdays" && "Run on weekdays (Mon-Fri)"}
                          {scheduleFrequency === "weekends" && "Run on weekends (Sat-Sun)"}
                          {scheduleFrequency === "custom" && `Run on ${scheduleDays.join(", ")}`}
                          {` at ${customScheduleTime} ${scheduleTimezone}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
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
