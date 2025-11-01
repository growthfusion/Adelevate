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
  SelectSeparator,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ChevronDown, Search as SearchIcon } from "lucide-react";
import TopSearch from "@/components/search-bar";

// Images
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Firestore IO
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { addConfig } from "@/services/config.js"; // ⬅️ no getCollectionName here

/* ---------------- helpers ---------------- */
const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta", icon: metaIcon },
  { value: "snap", label: "Snap", icon: snapchatIcon },
  { value: "tiktok", label: "TikTok", icon: tiktokIcon },
  { value: "google", label: "Google", icon: googleIcon },
  { value: "newsbreak", label: "News Break", icon: nbIcon },
];

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const BULK_ACTIVE = "All_Active_Campaigns";
const BULK_PAUSED = "All_Pause_Campaigns";

function parseIncomingCondition(raw, index) {
  const base = {
    id: index + 1,
    logic: index === 0 ? "If" : "AND",
    metric: "",
    operator: "",
    value: "",
    unit: "none",
    target: "",
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
      logic: index === 0 ? "If" : (String(raw.logic || "AND").toUpperCase() === "OR" ? "OR" : "AND"),
      metric: String(raw.metric || "").toLowerCase(),
      operator: op,
      value: raw.value ?? raw.threshold ?? "",
      unit: raw.unit || "none",
      target: raw.target || "",
      // === ADDED === propagate lookback if present on doc
      lookBackPeriod: raw.lookback?.period || undefined,
      lookBackStart: raw.lookback?.start || undefined,
      lookBackEnd: raw.lookback?.end || undefined,
    };
  }

  // string form (e.g. "ROI >= 1.5", "CTR < 2%")
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
    return { ...base,logic: index === 0 ? "If" : "AND", metric, operator, value: valueToken.replace("%", ""), unit: hasPct ? "%" : "none" };
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
  { value: "profit", label: "PROFIT" },
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
  { value: "fb_impressions", label: "Impressions (FB)" },
];

function getCampaignIcon(campaignId, platform) {
  const id = String(campaignId || "");
  // Bulk tokens: icon follows the selected platform
  if (id === BULK_ACTIVE || id === BULK_PAUSED) {
    switch (platform) {
      case "meta": return metaIcon;
      case "snap": return snapchatIcon;
      case "newsbreak": return nbIcon;
      case "tiktok": return tiktokIcon;
      case "google": return googleIcon;
      default: return metaIcon;
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
export default function EditRuleForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Expect these from the list page when editing
  const ruleId = location.state?.id || null;
  const colName = location.state?.colName || null; // ⬅️ crucial

  // Basic state
  const [ruleName, setRuleName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("");

  // Conditions
  const [conditions, setConditions] = useState([
    { id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" },
  ]);

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [catalog, setCatalog] = useState({ snap: null, meta:null }); // { snap: { accounts: {...}, total_campaigns, fetched_at } }
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  // Action (budget) fields
  const [actionType, setActionType] = useState("");
  const [actionValue, setActionValue] = useState("");
  const [actionUnit, setActionUnit] = useState("%");
  const [actionTarget, setActionTarget] = useState("of Current Budget");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Campaign search dropdown (Apply Rule)
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState("");

  // multi-select Add Campaigns dropdown
  const campaignDropdownRef = useRef(null);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [searchCampaign, setSearchCampaign] = useState("");
  const [selectedCampaignOptions, setSelectedCampaignOptions] = useState([]);


  const [showTrafficDropdown, setShowTrafficDropdown] = useState(false);

  const [showLookBack, setShowLookBack] = useState(false);
  const [lookBackPeriod, setLookBackPeriod] = useState("7_days");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null); // 'start' or 'end'

  const [customScheduleTime, setCustomScheduleTime] = useState("12:00");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [scheduleFrequency, setScheduleFrequency] = useState("daily");
  const [scheduleDays, setScheduleDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate day count between two dates
  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  // Set default dates for the last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
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
  const remainingCells = (6 * 7) - (prevMonthDays.length + currentMonthDays.length);
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
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
    const dateString = date.toISOString().split('T')[0];

    if (selectionMode === 'start' || (!selectionMode && new Date(dateString) < new Date(endDate))) {
      setStartDate(dateString);
      setSelectionMode('end');
    } else {
      setEndDate(dateString);
      setSelectionMode(null);
    }
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString === startDate || dateString === endDate;
  };

  // Check if a date is in the selected range
  const isDateInRange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString > startDate && dateString < endDate;
  };

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days
  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) setIsSearchOpen(false);
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target)) setShowCampaignDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // fetch live Snapchat campaigns from /api/campaigns on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingCatalog(true);
        setCatalogError("");
        const [snapRes, metaRes, nbRes] = await Promise.all([
          fetch(`${API_BASE}/api/campaigns?platform=snap`, { cache: "no-store" }),
          fetch(`${API_BASE}/api/campaigns?platform=meta`, { cache: "no-store" }),
          fetch(`${API_BASE}/api/campaigns?platform=newsbreak`, { cache: "no-store" }),
        ]);
        const [snapJson, metaJson, nbJson] = await Promise.all([
          snapRes.json(),
          metaRes.json(),
          nbRes.json(),
        ]);
        if (!snapRes.ok) throw new Error(snapJson?.error || "Failed to load Snap campaigns");
        if (!metaRes.ok) throw new Error(metaJson?.error || "Failed to load Meta campaigns");
        if (!nbRes.ok) throw new Error(nbJson?.error || "Failed to load NewsBreak campaigns");
        if (!isMounted) return;

        setCatalog({ snap: snapJson, meta: metaJson, newsbreak: nbJson });
      } catch (e) {
        if (isMounted) setCatalogError(String(e?.message || e));
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

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
          icon: snapchatIcon,
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
            icon: metaIcon,
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
          icon: nbIcon, // NewsBreak icon
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
      newsbreak: newsbreakCampaignList,
    };
  }, [snapCampaignList, metaCampaignList, newsbreakCampaignList]);

  // searchable list uses live data instead of mocks ***
  const filteredCampaigns = useMemo(() => {
    if (!selectedPlatform) return [];
    const list = campaignsByPlatform[selectedPlatform] || [];
    if (!campaignSearchTerm) return list;
    return list.filter((c) => (c.name || "").toLowerCase().includes(campaignSearchTerm.toLowerCase()));
  }, [selectedPlatform, campaignSearchTerm, campaignsByPlatform]);

  function formatCampaignName(_platform, storedValue) {
    if (storedValue === BULK_ACTIVE || storedValue === BULK_PAUSED) return storedValue;
    const s = String(storedValue ?? "");
    const firstBar = s.indexOf("|");
    if (firstBar >= 0) {
      // keep EVERYTHING after the first pipe so names with additional pipes render fully
      return s.slice(firstBar + 1).trim();
    }
    return s;
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
      case "meta": platformIcon = metaIcon; break;
      case "snap": platformIcon = snapchatIcon; break;
      case "newsbreak": platformIcon = nbIcon; break;
      case "tiktok": platformIcon = tiktokIcon; break;
      case "google": platformIcon = googleIcon; break;
      default: platformIcon = metaIcon;
    }

    return [
      { id: BULK_ACTIVE, name: `Add Active (${activeCount})`, icon: platformIcon, status: "active" },
      { id: BULK_PAUSED, name: `Add Paused (${pausedCount})`, icon: platformIcon, status: "paused" },
    ];
  }

  /* ------ load Firestore doc (edit mode) ------ */
  useEffect(() => {
    if (!ruleId || !colName) return;
    const ref = doc(db, colName, ruleId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const platform = (Array.isArray(d.platform) ? d.platform[0] : d.platform) || "meta";
      setSelectedPlatform(platform);
      setRuleName(d.name || "");

      // === CHANGED: show literal "Custom" in the select when mode is custom
      if (d.schedule?.mode === "custom") {
        setScheduleInterval("Custom");
      } else if (d.schedule?.mode === "preset") {
        setScheduleInterval(d.schedule.preset || "");
      } else {
        // legacy fallback
        setScheduleInterval(d.frequency || "");
      }

      setCampaigns(d.campaigns || []);
      const raw = Array.isArray(d.condition) ? d.condition : [];
      const rows =
          raw.length > 0
              ? raw.map((c, i) => ({
                ...parseIncomingCondition(c, i),
                id: i + 1,
                logic: i === 0 ? "If" : (String(c?.logic).toUpperCase() === "OR" ? "OR" : "AND"),
              }))
              : [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }];

      setConditions(rows);

      // === ADDED: restore lookback root if present
      if (d.lookback?.start) setStartDate(d.lookback.start);
      if (d.lookback?.end) setEndDate(d.lookback.end);
      if (d.lookback?.period) setLookBackPeriod(d.lookback.period);
      if (d.lookback?.display) setActiveLookBack(d.lookback.display);

      // === ADDED: restore schedule custom pieces if present
      if (d.schedule) {
        if (d.schedule.time) setCustomScheduleTime(d.schedule.time);
        if (d.schedule.timezone === "Asia/Kolkata") setScheduleTimezone("Local");
        else if (d.schedule.timezone === "UTC") setScheduleTimezone("UTC");
        if (d.schedule.frequency) setScheduleFrequency(d.schedule.frequency);
        if (Array.isArray(d.schedule.days)) setScheduleDays(d.schedule.days);
      }

      // Action fields (if present)
      setActionType(d.actionType || "");
      setActionValue(d.actionValue ?? "");
      setActionUnit(d.actionUnit || "%");
      setActionTarget(d.actionTarget || "of Current Budget");
      setMinBudget(d.minBudget ?? "");
      setMaxBudget(d.maxBudget ?? "");
    });
    return () => unsub();
  }, [ruleId, colName]);

  // close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) setIsSearchOpen(false);
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(e.target)) setShowCampaignDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ------ conditions handlers ------ */
  const addConditionRow = () => {
    setConditions((prev) => [
      ...prev,
      { id: prev.length + 1, logic: "And", metric: "", operator: "", value: "", unit: "none", target: "" },
    ]);
  };

  const removeCondition = (id) => {
    setConditions((prev) => {
      if (prev.length <= 1) {
        return [{ id: 1, logic: "If", metric: "", operator: "", value: "", unit: "none", target: "" }];
      }
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c, i) => ({
        ...c,
        id: i + 1,
        logic: i === 0 ? "If" : (String(c.logic).toUpperCase() === "OR" ? "OR" : "AND"),
      }));
    });
  };

  /* ------ campaigns ------ */
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
    setSelectedCampaignOptions((prev) => (checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)));
  };
  const clearCampaignSelection = () => setSelectedCampaignOptions([]);

  const removeCampaign = (index) => setCampaigns((prev) => prev.filter((_, i) => i !== index));

  /* ------ save -> Firestore via services/config.js ------ */
  const handleSave = async () => {
    // === CHANGED === map "Local" explicitly to Asia/Kolkata
    const tzResolved =
        scheduleTimezone === "Local" ? "Asia/Kolkata" : "UTC"; // IST region string

    // === ADDED === build schedule payload (cron + rrule + meta)
    function buildSchedulePayload() {
      const [hh = "12", mm = "00"] = (customScheduleTime || "12:00").split(":");

      if (scheduleInterval !== "Custom") {
        return {
          mode: "preset",
          preset: scheduleInterval,
          timezone: tzResolved,
          summary: scheduleInterval,
        };
      }

      let rrule = "";
      let summary = `Run ${scheduleFrequency} at ${customScheduleTime} ${tzResolved}`;
      let byDay = [];

      const dayMap = {
        Sunday: "SU", Monday: "MO", Tuesday: "TU", Wednesday: "WE",
        Thursday: "TH", Friday: "FR", Saturday: "SA",
      };

      if (scheduleFrequency === "daily") {
        rrule = `FREQ=DAILY;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else if (scheduleFrequency === "weekdays") {
        rrule = `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else if (scheduleFrequency === "weekends") {
        rrule = `FREQ=WEEKLY;BYDAY=SA,SU;BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
      } else {
        // custom days
        byDay = (scheduleDays || []).map(d => dayMap[d]).filter(Boolean);
        const by = byDay.length ? byDay.join(",") : "MO,TU,WE,TH,FR,SA,SU"; // fallback all days
        rrule = `FREQ=WEEKLY;BYDAY=${by};BYHOUR=${hh};BYMINUTE=${mm};BYSECOND=0`;
        summary = `Run on ${byDay.length ? scheduleDays.join(", ") : "all days"} at ${customScheduleTime} ${tzResolved}`;
      }

      const cron = `${mm} ${hh} * * *`; // daily cron (workers can further gate by RRULE)

      return {
        mode: "custom",
        timezone: tzResolved,
        time: customScheduleTime,
        frequency: scheduleFrequency,   // daily | weekdays | weekends | custom
        days: scheduleFrequency === "custom" ? scheduleDays : [],
        cron,
        rrule,
        summary,
      };
    }

    const schedulePayload = buildSchedulePayload(); // === ADDED ===

    // === ADDED === root-level lookback payload
    const lookbackPayload = {
      period: lookBackPeriod, // "7_days" | "custom" | ...
      start: startDate,       // "YYYY-MM-DD"
      end: endDate,           // "YYYY-MM-DD"
      display: activeLookBack // "Last 7 days", "Custom range", etc.
    };

    // existing campaigns normalization
    const campaignsToPersist = campaigns.map(toPlainCampaignName);

    // === CHANGED === conditions now carry per-condition lookback context
    const serializedConditions = conditions.map((c, i) => ({
      logic:
          i === 0
              ? "If"
              : (String(c.logic).toUpperCase() === "OR" ? "OR" : "AND"),
      metric: c.metric,
      operator: c.operator,
      value: c.value,
      unit: c.unit,
      type: "value",
      target: c.target || "",
    }));

    const uiPayload = {
      id: ruleId || crypto.randomUUID(),
      name: ruleName || "Unnamed Change Budget",
      status: "Running",
      type: "Change Campaign Budget",
      platform: selectedPlatform || "meta",
      frequency:
          schedulePayload.mode === "preset"
              ? scheduleInterval
              : schedulePayload.summary, // === CHANGED ===

      schedule: schedulePayload,     // === ADDED ===
      lookback: lookbackPayload,     // === ADDED ===

      campaigns: campaignsToPersist,
      conditions: conditions
          .filter((c) => c.metric && c.operator && c.value !== "")
          .map((c) => ({
            type: "value",
            metric: c.metric,
            operator: c.operator,
            value: c.value,
            unit: c.unit,
            target: c.target || "",
          })),
      actionType,
      actionValue: actionValue === "" ? "" : Number(actionValue),
      actionUnit,
      actionTarget,
      minBudget: minBudget === "" ? "" : Number(minBudget),
      maxBudget: maxBudget === "" ? "" : Number(maxBudget),
    };

    try {
      await addConfig(uiPayload); // service decides collection from type + platform
      navigate("/rules");
    } catch (e) {
      alert(`Error saving: ${e.message}`);
    }
  };

  return (
      <>
        <TopSearch/>
        <div className="bg-gray-50">
          <div className="max-w-6xl xl:mx-auto 2xl:mx-auto p-[20px] pt-[60px] bg-gray-50">
            {/* 1. Rule header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-blue-600 mb-4 pt-5">{ruleId ? "Edit Rule" : "Create New Rule"}</h1>
              <div className="flex items-center gap-3 mb-6">
                <div
                    className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">1
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-900">Rule: </span>
                  <span className="text-lg text-gray-600 font-medium">Change budget campaign</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 bg-white mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="rule-name" className="text-sm font-medium text-gray-700">Rule Name</Label>
                    <Input id="rule-name" value={ruleName} onChange={(e) => setRuleName(e.target.value)}
                           className="w-full"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-sm font-medium text-gray-700">Platform</Label>
                    <div className="flex gap-2">
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select Platform..."/>
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <div className="flex items-center gap-2">
                                  <img src={p.icon} alt="" className="w-4 h-4"/>
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

            {/* 2. Conditions */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-6">
                <div
                    className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">2
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rule Conditions</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                <div className="space-y-6">
                  {conditions.map((condition, index) => (
                      <div key={condition.id}
                           className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg">
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
                                <SelectValue placeholder="Select Option"/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Traffic Source Metrics</SelectLabel>
                                  <SelectItem value="days_since_creation">Days since creation</SelectItem>
                                  <SelectItem value="days_since_started">Days since started</SelectItem>
                                  <SelectItem value="days_until_end">Days until end</SelectItem>
                                  <SelectItem value="created_date">Created Date</SelectItem>
                                  <SelectItem value="start_date">Start Date</SelectItem>
                                  <SelectItem value="end_date">End Date</SelectItem>
                                  <SelectItem value="tags">Tags</SelectItem>
                                  <SelectItem value="campaign_status">Campaign Status</SelectItem>
                                  <SelectItem value="budget">Budget</SelectItem>
                                </SelectGroup>

                                <SelectSeparator/>

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

                                <SelectSeparator/>

                                <SelectGroup>
                                  <SelectLabel>Facebook Metrics</SelectLabel>
                                  <SelectItem value="fb_engagement">Engagement</SelectItem>
                                  <SelectItem value="fb_reach">Reach</SelectItem>
                                  <SelectItem value="fb_impressions">Impressions</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>

                            {/* is */}
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
                                <SelectValue placeholder="Operator"/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Greater">Greater</SelectItem>
                                <SelectItem value="Greater or Equal">Greater or Equal</SelectItem>
                                <SelectItem value="Less">Less</SelectItem>
                                <SelectItem value="Less or Equal">Less or Equal</SelectItem>
                                <SelectItem value="Equal to">Equal to</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* than */}
                            <div className="flex items-center justify-center">
                              <span className="text-sm text-gray-600">than</span>
                            </div>

                            {/* value + unit (+ optional target when %) */}
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Input
                                  value={condition.value}
                                  onChange={(e) => {
                                    const next = [...conditions];
                                    next[index].value = e.target.value;
                                    setConditions(next);
                                  }}
                                  className="w-full"
                              />
                              <Select
                                  value={condition.unit}
                                  onValueChange={(value) => {
                                    const next = [...conditions];
                                    next[index].unit = value;
                                    if (value !== "%") next[index].target = "";
                                    setConditions(next);
                                  }}
                              >
                                <SelectTrigger className="w-16">
                                  <SelectValue placeholder="%"/>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">—</SelectItem>
                                  <SelectItem value="%">%</SelectItem>
                                  <SelectItem value="$">$</SelectItem>
                                  <SelectItem value="days">days</SelectItem>
                                </SelectContent>
                              </Select>

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
                                        <SelectValue placeholder="Select Option"/>
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
                                className={`text-gray-400 p-1 hover:bg-gray-200 ${conditions.length <= 1 ? "opacity-50" : ""}`}
                                onClick={() => removeCondition(condition.id)}
                                disabled={conditions.length <= 1}
                            >
                              <X className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      </div>
                  ))}
                  <div className=" relative flex gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 bg-transparent border-gray-300 w-full sm:w-auto"
                        onClick={addConditionRow}
                    >
                      <Plus className="w-4 h-4 mr-2"/> Add
                    </Button>

                    <div>
                      <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 bg-transparent border-gray-300 w-full sm:w-auto flex items-center gap-2"
                          onClick={() => setShowLookBack(!showLookBack)}
                      >
                        <span>Look Back:</span>
                        <span className="font-medium whitespace-nowrap">{activeLookBack}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded px-1.5 py-0.5 ml-1">
                        {calculateDaysBetween(startDate, endDate)}d
                      </span>
                      </Button>

                      {showLookBack && (
                          <div className="absolute z-50 mt-2 w-96 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-3 px-4 flex justify-between items-center border-b border-gray-200">
                              <span className="text-base font-medium text-gray-800">Look Back Period</span>
                              <button
                                  className="p-1 h-8 w-8 hover:bg-gray-100 rounded-full flex items-center justify-center"
                                  onClick={() => setShowLookBack(false)}
                              >
                                <span className="text-gray-500 text-lg">×</span>
                              </button>
                            </div>

                            <div className="p-4">
                              <Select
                                  value={lookBackPeriod}
                                  onValueChange={(value) => {
                                    setLookBackPeriod(value);

                                    // Set default date ranges based on selection
                                    const today = new Date();
                                    let start = new Date();
                                    let displayText = "";

                                    if (value === "today") {
                                      start = today;
                                      displayText = "Today";
                                    } else if (value === "yesterday") {
                                      start = new Date(today);
                                      start.setDate(start.getDate() - 1);
                                      setEndDate(start.toISOString().split('T')[0]);
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
                                      setEndDate(end.toISOString().split('T')[0]);
                                      displayText = "Last month";
                                    } else if (value === "this_year") {
                                      start = new Date(today.getFullYear(), 0, 1);
                                      displayText = "This year";
                                    } else if (value === "last_year") {
                                      start = new Date(today.getFullYear() - 1, 0, 1);
                                      const end = new Date(today.getFullYear(), 0, 0);
                                      setEndDate(end.toISOString().split('T')[0]);
                                      displayText = "Last year";
                                    } else if (value === "custom") {
                                      displayText = "Custom range";
                                    }

                                    if (value !== "yesterday" && value !== "last_month" && value !== "last_year") {
                                      setEndDate(today.toISOString().split('T')[0]);
                                    }

                                    if (value !== "custom") {
                                      setStartDate(start.toISOString().split('T')[0]);
                                      setActiveLookBack(displayText);
                                    }

                                    // Apply the look back period to all conditions dynamically
                                    const updatedConditions = conditions.map(condition => ({
                                      ...condition,
                                      lookBackPeriod: value,
                                      lookBackStart: start.toISOString().split('T')[0],
                                      lookBackEnd: value !== "yesterday" && value !== "last_month" && value !== "last_year"
                                          ? today.toISOString().split('T')[0]
                                          : (value === "yesterday"
                                              ? start.toISOString().split('T')[0]
                                              : (value === "last_month"
                                                  ? new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
                                                  : new Date(today.getFullYear(), 0, 0).toISOString().split('T')[0]))
                                    }));
                                    setConditions(updatedConditions);
                                  }}
                              >
                                <SelectTrigger className="w-full mb-3">
                                  <SelectValue placeholder="Select period"/>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="today">Today</SelectItem>
                                  <SelectItem value="yesterday">Yesterday</SelectItem>
                                  <SelectItem value="1_days">Last 1 days</SelectItem>

                                  <SelectItem value="7_days">Last 7 days</SelectItem>
                                  <SelectItem value="14_days">Last 14 days</SelectItem>
                                  <SelectItem value="30_days">Last 30 days</SelectItem>
                                  <SelectItem value="90_days">Last 90 days</SelectItem>
                                  <SelectItem value="this_month">This month</SelectItem>
                                  <SelectItem value="last_month">Last month</SelectItem>
                                  <SelectItem value="this_year">This year</SelectItem>
                                  <SelectItem value="last_year">Last year</SelectItem>
                                  <SelectItem value="custom">Custom date range</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Display selected date range with day count */}
                              <div className="flex flex-col mb-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-blue-600 font-medium">From</span>
                                    <span
                                        className="text-sm text-blue-800 font-medium">{formatDateForDisplay(startDate)}</span>
                                  </div>

                                  <div className="h-8 flex items-center">
                                    <span className="px-2 text-gray-400">→</span>
                                  </div>

                                  <div className="flex flex-col text-right">
                                    <span className="text-xs text-blue-600 font-medium">To</span>
                                    <span
                                        className="text-sm text-blue-800 font-medium">{formatDateForDisplay(endDate)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end">
                                  <div
                                      className="text-xs px-2 py-0.5 bg-white rounded border border-blue-200 text-blue-700 font-medium">
                                    {calculateDaysBetween(startDate, endDate)} day{calculateDaysBetween(startDate, endDate) !== 1 ? 's' : ''}
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
                                        <span
                                            className="font-medium text-blue-700">{monthNames[currentMonth]} {currentYear}</span>
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
                                              <div key={index}
                                                   className="text-center text-xs font-medium text-gray-500 py-1">
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
                                          ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                                          ${isDateSelected(day.date) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                                          ${isDateInRange(day.date) ? 'bg-blue-100 hover:bg-blue-200' : ''}
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
                                      {selectionMode === 'start'
                                          ? 'Select start date'
                                          : (selectionMode === 'end'
                                              ? 'Now select end date'
                                              : 'Click dates to select a range')}
                                    </div>
                                  </div>
                              )}
                              <div></div>
                              <div className="mt-4">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => {
                                      // Apply the date range to all conditions
                                      const updatedConditions = conditions.map(condition => ({
                                        ...condition,
                                        lookBackPeriod: lookBackPeriod,
                                        lookBackStart: startDate,
                                        lookBackEnd: endDate
                                      }));
                                      setConditions(updatedConditions);

                                      // For custom range, update the display text
                                      if (lookBackPeriod === "custom") {
                                        const dayCount = calculateDaysBetween(startDate, endDate);
                                        setActiveLookBack(`Custom range`);
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

            {/* 3. Rule Action */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-6">
                <div
                    className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">3
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rule Action</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <Select value={actionType} onValueChange={setActionType}>
                      <SelectTrigger className="w-full sm:w-48 mb-2 sm:mb-0">
                        <SelectValue placeholder="Select action..."/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Increase Budget By">Increase Budget By</SelectItem>
                        <SelectItem value="Decrease Budget By">Decrease Budget By</SelectItem>
                        <SelectItem value="Set Budget To">Set Budget To</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input value={actionValue} onChange={(e) => setActionValue(e.target.value)}
                             className="w-full sm:w-20"/>
                      <Select value={actionUnit} onValueChange={setActionUnit}>
                        <SelectTrigger className="w-20 sm:w-16">
                          <SelectValue placeholder="%"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="%">%</SelectItem>
                          <SelectItem value="$">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select value={actionTarget} onValueChange={setActionTarget} className="w-full sm:w-48 mt-2 sm:mt-0">
                      <SelectTrigger>
                        <SelectValue placeholder="Select target..."/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="of Current Budget">of Current Budget</SelectItem>
                        <SelectItem value="of Original Budget">of Original Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Label className="text-sm text-gray-600 w-full sm:w-auto sm:whitespace-nowrap">
                        Do not allow the Budget to be lower than
                      </Label>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="w-24 sm:w-20"/>
                        <span className="text-gray-600">$</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Label className="text-sm text-gray-600 w-full sm:w-auto sm:whitespace-nowrap">Do not allow the Budget to be higher than
                      </Label>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="w-24 sm:w-20"/>
                        <span className="text-gray-600">$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Apply Rule */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Apply Rule</h2>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 block">Apply Rule to Campaigns</Label>

                  {/* Campaign Search Dropdown */}
                  <div ref={searchInputRef} className="relative">
                    <div
                        className="border border-gray-300 rounded-md flex items-center px-3 py-2 cursor-pointer"
                        onClick={() => selectedPlatform && setIsSearchOpen((s) => !s)}>
                      <SearchIcon className="h-4 w-4 text-gray-400 mr-2"/>
                      <span className="text-sm text-gray-500">
                                          {selectedPlatform ? "Search campaigns..." : "Select a platform to search"}
                                        </span>
                      <ChevronDown className="h-4 w-4 text-gray-400 ml-auto"/>
                    </div>
                    {isSearchOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
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
                                      <img src={c.icon || snapchatIcon} alt="" className="w-5 h-5 mr-2"/>
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
                                className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
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
                                  onClick={() => removeCampaign(index)}>
                                <X className="w-3 h-3"/>
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
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
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
                                    <img src={opt.icon} alt="" className="w-5 h-5"/>
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

                    {/* =================== Add Traffic =================== */}
                    <div className="relative">
                      <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto transition-colors ${
                              selectedPlatform
                                  ? showTrafficDropdown
                                      ? "text-blue-600 border-blue-400 bg-blue-50"
                                      : "text-gray-600 bg-transparent"
                                  : "text-gray-400 bg-gray-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (selectedPlatform) {
                              setShowTrafficDropdown((prev) => !prev);
                              setShowCampaignDropdown(false); // close the other dropdown
                            }
                          }}
                          disabled={!selectedPlatform}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                        Add Traffic
                      </Button>

                      {showTrafficDropdown && (
                          <div className="absolute z-50 mt-1 w-72 rounded-md shadow-md ring-1 ring-gray-200 bg-gray-50">
                            <div className="px-3 py-2 border-t border-gray-100 flex justify-between">
                              <span className="text-sm text-gray-600">Found:</span>
                              <button className="text-sm px-3 py-1 rounded-md text-blue-600 hover:bg-gray-100">
                                Add
                              </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {/* You can use a separate traffic options list here */}
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                Traffic options go here
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 5. Schedule */}
            <div className="mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="min-w-6 h-6 bg-cyan-500 rounded flex items-center justify-center text-white text-sm font-medium">5</div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Schedule Rule</h2>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 sm:p-6 bg-white">
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium text-gray-700">Run this rule every</Label>
                      <Select value={scheduleInterval} onValueChange={(value) => {
                        setScheduleInterval(value);
                        // Reset custom time if not custom
                        if (value !== "Custom") {
                          setCustomScheduleTime("12:00");
                        }
                      }}>
                        <SelectTrigger className="w-full sm:w-[33rem]">
                          <SelectValue placeholder="Select interval..."/>
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
                          <SelectItem value="Daily (At 12:00 PM UTC)">Daily (At 12:00 PM UTC)</SelectItem>
                          <SelectItem value="Daily (At 12:00 PM Local)">Daily (At 12:00 PM IST)</SelectItem>
                          <SelectItem value="Custom">Custom Schedule...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {scheduleInterval === "Custom" && (
                      <div className="space-y-4 border-t border-gray-200 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Run at specific time</Label>
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
                                <SelectValue placeholder="Select timezone"/>
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
                                <SelectValue placeholder="Select frequency"/>
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
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                                    <Button
                                        key={day}
                                        type="button"
                                        variant={scheduleDays.includes(day) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          if (scheduleDays.includes(day)) {
                                            setScheduleDays(scheduleDays.filter(d => d !== day));
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
              <Button variant="outline" className="text-gray-600 bg-transparent" onClick={() => navigate("/rules")}>
                Back
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </>
  );
}
