import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { startOfDay } from "date-fns";
import DatePickerToggle from "./datepicker";

import {
  setPlatforms,
  setAccounts,
  setStatus,
  setTitle,
  setTags,
  setDateRange,
  setTimeZone,
  resetFilters,
  fetchAllCampaigns,
  fetchCampaignsByAccount,
  fetchAdAccounts,
  searchCampaignsByTitle,
  clearTitleSuggestions,
  setCampaigns,
  setWarning,
  clearError,
  clearWarning
} from "@/features/campaigns/campaignsSlice";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";
import { supabase } from "@/supabaseClient";

// Platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Constants
const platformIconsMap = {
  meta: fb,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nb
};

const platformDisplayNames = {
  meta: "Meta",
  snap: "Snap",
  tiktok: "TikTok",
  google: "Google",
  newsbreak: "NewsBreak"
};

const ALL_PLATFORMS = [
  { id: "meta", name: "Meta" },
  { id: "snap", name: "Snapchat" },
  { id: "tiktok", name: "TikTok" },
  { id: "google", name: "Google" },
  { id: "newsbreak", name: "NewsBreak" }
];

const PREDEFINED_TAGS = [
  "Mythili",
  "Naga",
  "Shanker",
  "Ramanan",
  "Jai",
  "ArunS",
  "naveen",
  "Ashwin",
  "Raju",
  "Sudhanshu",
  "Hari",
  "Gokulraj"
];

const TIME_ZONE_OPTIONS = [
  { id: "America/Los_Angeles", name: "America/Los_Angeles" },
  { id: "America/New_York", name: "America/New_York" },
  { id: "Europe/London", name: "Europe/London" },
  { id: "Asia/Tokyo", name: "Asia/Tokyo" },
  { id: "Australia/Sydney", name: "Australia/Sydney" }
];

const normalizePlatformFromDB = (p) => {
  if (!p) return "";
  const v = String(p).toLowerCase();
  if (v === "facebook") return "meta";
  if (v === "snapchat") return "snap";
  return v;
};

function CampaignsToolbar() {
  const dispatch = useDispatch();

  // Theme selectors
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  // Campaign state selectors
  const {
    adAccounts,
    adAccountsLoading,
    adAccountsError,
    isLoading: campaignsLoading,
    error: campaignsError,
    warning: campaignsWarning,
    filters,
    titleSuggestions,
    titleSearchLoading
  } = useSelector((state) => state.campaigns);

  const {
    platforms: selectedPlatforms,
    accounts: selectedAccounts,
    status,
    title,
    tags,
    dateRange,
    timeZone
  } = filters;

  // Local UI state
  const [myRole, setMyRole] = React.useState("user");
  const [allowedPlatforms, setAllowedPlatforms] = React.useState([]);
  const [accessLoaded, setAccessLoaded] = React.useState(false);

  // Dropdown states
  const [showPlatformMenu, setShowPlatformMenu] = React.useState(false);
  const [showAccountMenu, setShowAccountMenu] = React.useState(false);
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const [showTagsMenu, setShowTagsMenu] = React.useState(false);
  const [showTimeZoneMenu, setShowTimeZoneMenu] = React.useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = React.useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);

  // Section expansion for accounts
  const [expandedSections, setExpandedSections] = React.useState({
    meta: true,
    snap: true,
    tiktok: true,
    google: true,
    newsbreak: true
  });

  // Refs
  const titleInputRef = useRef(null);
  const titleDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch user role and platform access
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
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
            platforms = Array.from(
              new Set((me.platforms || []).map((v) => normalizePlatformFromDB(v)))
            );
          }
        }

        if (role === "SuperAdmin") {
          platforms = ["meta", "snap", "tiktok", "google", "newsbreak"];
        }

        setMyRole(role);
        setAllowedPlatforms(platforms);
        setAccessLoaded(true);

        // Set initial platforms in Redux
        if (platforms.length > 0 && selectedPlatforms.length === 0) {
          dispatch(setPlatforms(platforms));
        }
      } catch (e) {
        console.error("Error loading user role/platforms", e);
        setAccessLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Fetch ad accounts on mount
  useEffect(() => {
    dispatch(fetchAdAccounts());
  }, [dispatch]);

  // Available platforms based on access
  const availablePlatforms = React.useMemo(() => {
    if (!accessLoaded) return [];
    const allowedSet = new Set(allowedPlatforms);

    if (allowedSet.size === 0 && myRole === "SuperAdmin") {
      return ALL_PLATFORMS;
    }
    if (allowedSet.size === 0) return [];
    return ALL_PLATFORMS.filter((p) => allowedSet.has(p.id));
  }, [accessLoaded, allowedPlatforms, myRole]);

  // Title search with debounce
  const handleTitleChange = useCallback(
    (e) => {
      const value = e.target.value;
      dispatch(setTitle(value));

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!value || value.trim().length === 0) {
        dispatch(clearTitleSuggestions());
        setShowTitleSuggestions(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(() => {
        dispatch(searchCampaignsByTitle(value));
        setShowTitleSuggestions(true);
      }, 150);
    },
    [dispatch]
  );

  const selectTitleSuggestion = (suggestion) => {
    dispatch(setTitle(suggestion.title));
    setShowTitleSuggestions(false);
    dispatch(clearTitleSuggestions());
    setSelectedSuggestionIndex(-1);
    titleInputRef.current?.focus();
  };

  const handleTitleKeyDown = (e) => {
    if (!showTitleSuggestions || titleSuggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApplyFilters();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < titleSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectTitleSuggestion(titleSuggestions[selectedSuggestionIndex]);
        } else {
          setShowTitleSuggestions(false);
          handleApplyFilters();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowTitleSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Click outside handler for title suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        titleDropdownRef.current &&
        !titleDropdownRef.current.contains(event.target) &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target)
      ) {
        setShowTitleSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const togglePlatform = (platformId) => {
    const newPlatforms = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter((p) => p !== platformId)
      : [...selectedPlatforms, platformId];
    dispatch(setPlatforms(newPlatforms));
  };

  const toggleAccount = (accountId) => {
    const newAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter((a) => a !== accountId)
      : [...selectedAccounts, accountId];
    dispatch(setAccounts(newAccounts));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const selectTag = (tag) => {
    dispatch(setTags(tag));
    setShowTagsMenu(false);
  };

  const selectTimeZone = (zone) => {
    dispatch(setTimeZone(zone));
    setShowTimeZoneMenu(false);
  };

  const handleStatusChange = (statusValue) => {
    if (statusValue === "all") {
      dispatch(setStatus([]));
    } else if (statusValue === "active" || statusValue === "paused") {
      const currentStatus = status || [];
      if (currentStatus.includes(statusValue)) {
        const newStatus = currentStatus.filter((s) => s !== statusValue);
        dispatch(setStatus(newStatus.length > 0 ? newStatus : []));
      } else {
        dispatch(setStatus([...currentStatus, statusValue]));
      }
    }
    setShowStatusMenu(false);
  };

  // Apply filters
  const handleApplyFilters = async () => {
    dispatch(clearError());
    dispatch(clearWarning());

    if (selectedAccounts.length === 0) {
      // Fetch all campaigns
      dispatch(
        fetchAllCampaigns({
          platforms: selectedPlatforms,
          status: status || []
        })
      );
    } else {
      // Clear existing campaigns first
      dispatch(setCampaigns([]));

      // Group accounts by platform
      const accountsByPlatform = {};
      selectedAccounts.forEach((accountId) => {
        for (const [platform, accounts] of Object.entries(adAccounts)) {
          const found = accounts.find((acc) => acc.id === accountId);
          if (found) {
            if (!accountsByPlatform[platform]) {
              accountsByPlatform[platform] = [];
            }
            accountsByPlatform[platform].push(accountId);
            break;
          }
        }
      });

      // Fetch for each platform
      const fetchPromises = Object.entries(accountsByPlatform).map(([platform, accountIds]) =>
        dispatch(
          fetchCampaignsByAccount({
            accountIds,
            platform,
            status: status || []
          })
        )
      );

      await Promise.all(fetchPromises);
    }
  };

  // Reset filters
  const handleReset = () => {
    const today = startOfDay(new Date());
    dispatch(resetFilters());
    dispatch(setPlatforms(allowedPlatforms.length > 0 ? [...allowedPlatforms] : []));
    dispatch(setDateRange({ startDate: today, endDate: today, key: "today" }));
    dispatch(setCampaigns([]));
    setShowTitleSuggestions(false);
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          return isMatch ? (
            <mark
              key={i}
              className="font-bold rounded px-0.5"
              style={{ backgroundColor: theme.warning, color: theme.textPrimary }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </>
    );
  };

  // Get status display text
  const getStatusDisplayText = () => {
    if (!status || status.length === 0) return "All";
    if (status.length === 2 && status.includes("active") && status.includes("paused")) {
      return "Active & Paused";
    }
    if (status.includes("active")) return "Active";
    if (status.includes("paused")) return "Paused";
    return "All";
  };

  // Button styles helper
  const getButtonStyle = (isActive = false) => ({
    backgroundColor: isActive ? theme.buttonPrimaryBg : theme.buttonSecondaryBg,
    color: isActive ? theme.buttonPrimaryText : theme.buttonSecondaryText,
    borderColor: theme.borderSubtle
  });

  const getDropdownStyle = () => ({
    backgroundColor: theme.bgDropdown,
    borderColor: theme.borderSubtle,
    boxShadow: theme.shadowDropdown
  });

  return (
    <section
      aria-label="Filters"
      className="rounded-lg border shadow-sm"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderSubtle
      }}
    >
      <div className="p-4 lg:p-6">
        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:gap-4">
          {/* Date Picker */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <DatePickerToggle
              initialSelection={dateRange}
              onChange={(newRange) => dispatch(setDateRange(newRange))}
              theme={theme}
            />
          </div>

          {/* Time Zone Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimeZoneMenu(!showTimeZoneMenu)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              <span style={{ color: theme.textSecondary }}>Timezone</span>
              <span
                className="truncate text-xs font-semibold max-w-[120px]"
                style={{ color: theme.blue }}
              >
                {timeZone.split("/")[1] || timeZone}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${showTimeZoneMenu ? "rotate-180" : ""}`}
                style={{ color: theme.textTertiary }}
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

            {showTimeZoneMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTimeZoneMenu(false)} />
                <div
                  className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-auto rounded-lg shadow-xl border sm:w-72"
                  style={getDropdownStyle()}
                >
                  <div className="p-2">
                    <div
                      className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide"
                      style={{ color: theme.textSecondary }}
                    >
                      Select Timezone
                    </div>
                    {TIME_ZONE_OPTIONS.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => selectTimeZone(zone.id)}
                        className="w-full truncate rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                        style={{
                          backgroundColor:
                            timeZone === zone.id ? theme.buttonPrimaryBg : "transparent",
                          color: timeZone === zone.id ? theme.buttonPrimaryText : theme.textPrimary
                        }}
                      >
                        {zone.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Platform Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                accessLoaded &&
                availablePlatforms.length > 0 &&
                setShowPlatformMenu(!showPlatformMenu)
              }
              disabled={!accessLoaded || availablePlatforms.length === 0}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              <span style={{ color: theme.textSecondary }}>Platforms</span>
              {selectedPlatforms.length > 0 ? (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${theme.blue}20`, color: theme.blue }}
                >
                  {selectedPlatforms.length}
                </span>
              ) : (
                <span className="text-xs italic" style={{ color: theme.textTertiary }}>
                  {availablePlatforms.length === 0 ? "No access" : "Select..."}
                </span>
              )}
              <svg
                className={`h-4 w-4 transition-transform ${showPlatformMenu ? "rotate-180" : ""}`}
                style={{ color: theme.textTertiary }}
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

            {showPlatformMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowPlatformMenu(false)} />
                <div
                  className="absolute left-0 right-0 z-40 mt-2 rounded-lg shadow-xl border sm:w-64"
                  style={getDropdownStyle()}
                >
                  <div className="p-2">
                    <div
                      className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide"
                      style={{ color: theme.textSecondary }}
                    >
                      Select Platforms
                    </div>
                    {availablePlatforms.map((platform) => (
                      <label
                        key={platform.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors"
                        style={{ color: theme.textPrimary }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={() => togglePlatform(platform.id)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600"
                        />
                        <img
                          src={platformIconsMap[platform.id]}
                          alt={platform.name}
                          className="h-5 w-5"
                        />
                        <span className="text-sm font-medium">{platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              disabled={adAccountsLoading}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all disabled:opacity-50"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              <span style={{ color: theme.textSecondary }}>Accounts</span>
              {adAccountsLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    style={{ color: theme.blue }}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-xs">Loading...</span>
                </div>
              ) : selectedAccounts.length > 0 ? (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${theme.green}20`, color: theme.green }}
                >
                  {selectedAccounts.length}
                </span>
              ) : (
                <span className="text-xs italic" style={{ color: theme.textTertiary }}>
                  All
                </span>
              )}
              <svg
                className={`h-4 w-4 transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
                style={{ color: theme.textTertiary }}
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

            {showAccountMenu && !adAccountsLoading && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAccountMenu(false)} />
                <div
                  className="fixed inset-x-4 top-1/2 z-40 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:top-auto sm:left-0 sm:translate-y-0 sm:mt-2 w-auto sm:w-96 lg:w-[32rem] max-h-[80vh] overflow-hidden rounded-xl shadow-xl border"
                  style={getDropdownStyle()}
                >
                  {/* Account dropdown header */}
                  <div
                    className="sticky top-0 z-10 border-b px-4 py-3 sm:px-6"
                    style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-lg p-2 shadow-sm"
                          style={{ backgroundColor: theme.blue }}
                        >
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
                          <h3
                            className="text-base font-bold sm:text-lg"
                            style={{ color: theme.textPrimary }}
                          >
                            Ad Accounts
                          </h3>
                          <p className="text-xs" style={{ color: theme.textSecondary }}>
                            {selectedAccounts.length === 0
                              ? "No selection = All campaigns"
                              : "Select accounts to filter"}
                          </p>
                        </div>
                      </div>
                      {selectedAccounts.length > 0 && (
                        <span
                          className="rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-sm"
                          style={{ backgroundColor: theme.green }}
                        >
                          {selectedAccounts.length} selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account list */}
                  <div className="max-h-[calc(80vh-140px)] overflow-y-auto">
                    <div className="space-y-3 p-4 sm:p-6">
                      {Object.entries(adAccounts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([platform, accounts]) => (
                          <div
                            key={platform}
                            className="overflow-hidden rounded-xl border"
                            style={{
                              borderColor: theme.borderSubtle,
                              backgroundColor: theme.bgCard
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSection(platform)}
                              className="flex w-full items-center justify-between px-4 py-3 transition-all"
                              style={{ backgroundColor: theme.bgSecondary }}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={platformIconsMap[platform]}
                                  alt={platform}
                                  className="h-6 w-6"
                                />
                                <span
                                  className="text-sm font-bold uppercase tracking-wide"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {platformDisplayNames[platform] || platform}
                                </span>
                                <span
                                  className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                                  style={{ backgroundColor: theme.blue }}
                                >
                                  {accounts.length}
                                </span>
                              </div>
                              <svg
                                className={`h-5 w-5 transition-transform ${expandedSections[platform] ? "rotate-180" : ""}`}
                                style={{ color: theme.textSecondary }}
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
                              <div className="divide-y" style={{ borderColor: theme.borderSubtle }}>
                                {accounts.map((account) => (
                                  <label
                                    key={account.id}
                                    className="group flex cursor-pointer items-start gap-3 px-4 py-3 transition-all sm:px-5"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedAccounts.includes(account.id)}
                                      onChange={() => toggleAccount(account.id)}
                                      className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-blue-600"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div
                                        className="break-words text-sm font-semibold"
                                        style={{ color: theme.textPrimary }}
                                      >
                                        {account.name}
                                      </div>
                                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <code
                                          className="break-all rounded-md px-2 py-1 text-xs font-mono"
                                          style={{
                                            backgroundColor: theme.bgSecondary,
                                            color: theme.textSecondary
                                          }}
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

                  {/* Clear selection button */}
                  {selectedAccounts.length > 0 && (
                    <div
                      className="sticky bottom-0 border-t px-4 py-3 sm:px-6"
                      style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
                    >
                      <button
                        type="button"
                        onClick={() => dispatch(setAccounts([]))}
                        className="w-full rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-all"
                        style={{
                          borderColor: `${theme.negative}50`,
                          backgroundColor: `${theme.negative}10`,
                          color: theme.negative
                        }}
                      >
                        Clear all ({selectedAccounts.length})
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              <span style={{ color: theme.textSecondary }}>Status</span>
              <span
                className="truncate rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor:
                    status?.includes("active") && !status?.includes("paused")
                      ? `${theme.positive}20`
                      : status?.includes("paused") && !status?.includes("active")
                        ? `${theme.warning}20`
                        : `${theme.blue}20`,
                  color:
                    status?.includes("active") && !status?.includes("paused")
                      ? theme.positive
                      : status?.includes("paused") && !status?.includes("active")
                        ? theme.warning
                        : theme.blue
                }}
              >
                {getStatusDisplayText()}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${showStatusMenu ? "rotate-180" : ""}`}
                style={{ color: theme.textTertiary }}
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

            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStatusMenu(false)} />
                <div
                  className="absolute left-0 right-0 z-40 mt-2 rounded-lg shadow-xl border sm:w-56"
                  style={getDropdownStyle()}
                >
                  <div className="p-2">
                    <div
                      className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide"
                      style={{ color: theme.textSecondary }}
                    >
                      Select Status
                    </div>
                    {["active", "paused", "all"].map((statusOption) => {
                      const isSelected =
                        statusOption === "all"
                          ? !status || status.length === 0
                          : status?.includes(statusOption);

                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => handleStatusChange(statusOption)}
                          className="w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                          style={{
                            backgroundColor: isSelected ? theme.buttonPrimaryBg : "transparent",
                            color: isSelected ? theme.buttonPrimaryText : theme.textPrimary
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  statusOption === "active"
                                    ? theme.positive
                                    : statusOption === "paused"
                                      ? theme.warning
                                      : theme.blue
                              }}
                            />
                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tags Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTagsMenu(!showTagsMenu)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }}
            >
              <span style={{ color: theme.textSecondary }}>Tags</span>
              {tags ? (
                <span
                  className="truncate rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${theme.purple}20`, color: theme.purple }}
                >
                  {tags}
                </span>
              ) : (
                <span className="text-xs italic" style={{ color: theme.textTertiary }}>
                  Select...
                </span>
              )}
              <svg
                className={`h-4 w-4 transition-transform ${showTagsMenu ? "rotate-180" : ""}`}
                style={{ color: theme.textTertiary }}
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

            {showTagsMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTagsMenu(false)} />
                <div
                  className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-auto rounded-lg shadow-xl border sm:w-56"
                  style={getDropdownStyle()}
                >
                  <div className="p-2">
                    <div
                      className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide"
                      style={{ color: theme.textSecondary }}
                    >
                      Select Tag
                    </div>
                    {PREDEFINED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => selectTag(tag)}
                        className="w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                        style={{
                          backgroundColor: tags === tag ? theme.purple : "transparent",
                          color: tags === tag ? "white" : theme.textPrimary
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                    {tags && (
                      <button
                        type="button"
                        onClick={() => selectTag("")}
                        className="mt-2 w-full rounded-md border-t px-3 py-2.5 text-left text-sm"
                        style={{ borderColor: theme.borderSubtle, color: theme.textSecondary }}
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title Search with Autocomplete */}
        <div className="relative mt-3">
          <label
            className="flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 shadow-sm transition-all"
            style={{
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder
            }}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              style={{ color: theme.textTertiary }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span
              className="text-sm font-medium flex-shrink-0"
              style={{ color: theme.textSecondary }}
            >
              Title:
            </span>
            <input
              ref={titleInputRef}
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onFocus={() => {
                if (title && titleSuggestions.length > 0) {
                  setShowTitleSuggestions(true);
                }
              }}
              className="w-full flex-1 bg-transparent text-sm outline-none"
              style={{ color: theme.inputText }}
              placeholder="Type to search campaigns..."
              autoComplete="off"
            />
            {titleSearchLoading && (
              <svg
                className="h-5 w-5 animate-spin flex-shrink-0"
                style={{ color: theme.blue }}
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {title && !titleSearchLoading && (
              <button
                className="rounded-full p-1 transition-colors flex-shrink-0"
                style={{ color: theme.textTertiary }}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setTitle(""));
                  dispatch(clearTitleSuggestions());
                  setShowTitleSuggestions(false);
                }}
                type="button"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </label>

          {/* Autocomplete suggestions */}
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <div
              ref={titleDropdownRef}
              className="absolute left-0 right-0 z-50 mt-2 max-h-[420px] overflow-hidden rounded-xl border-2 shadow-xl"
              style={{
                backgroundColor: theme.bgDropdown,
                borderColor: theme.blue
              }}
            >
              <div
                className="sticky top-0 z-10 border-b-2 px-4 py-3"
                style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle }}
              >
                <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                  {titleSuggestions.length} Campaign{titleSuggestions.length !== 1 ? "s" : ""} Found
                </span>
              </div>

              <div
                className="max-h-[340px] overflow-y-auto divide-y"
                style={{ borderColor: theme.borderSubtle }}
              >
                {titleSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.id}-${index}`}
                    type="button"
                    onClick={() => selectTitleSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-all"
                    style={{
                      backgroundColor:
                        index === selectedSuggestionIndex ? theme.bgSecondary : "transparent"
                    }}
                  >
                    {suggestion.platform && platformIconsMap[suggestion.platform] && (
                      <img
                        src={platformIconsMap[suggestion.platform]}
                        alt={suggestion.platform}
                        className="h-6 w-6 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                        {highlightMatch(suggestion.title, title)}
                      </div>
                      {suggestion.adAccountName && (
                        <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                          {suggestion.adAccountName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={campaignsLoading}
            className="rounded-lg border-2 px-6 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
            style={{
              borderColor: theme.borderSubtle,
              backgroundColor: theme.buttonSecondaryBg,
              color: theme.buttonSecondaryText
            }}
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={campaignsLoading}
            className="flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md transition-all disabled:opacity-50"
            style={{
              backgroundColor: campaignsLoading ? theme.buttonSecondaryBg : theme.buttonPrimaryBg,
              color: campaignsLoading ? theme.buttonSecondaryText : theme.buttonPrimaryText
            }}
          >
            {campaignsLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span>
                  {selectedAccounts.length === 0 ? "Load All Campaigns" : "Apply Filters"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Info/Warning/Error Messages */}
        {selectedAccounts.length === 0 && !campaignsLoading && !campaignsError && (
          <div
            className="mt-4 flex items-start gap-3 rounded-lg border-2 px-4 py-3 shadow-sm"
            style={{
              borderColor: `${theme.info}50`,
              backgroundColor: `${theme.info}10`
            }}
          >
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0"
              style={{ color: theme.info }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: theme.info }}>
                ℹ️ No Account Filter
              </div>
              <div className="mt-1 text-sm" style={{ color: theme.info }}>
                Clicking "Load All Campaigns" will fetch all campaigns
                {selectedPlatforms.length > 0 &&
                  ` (filtered by: ${selectedPlatforms.map((p) => platformDisplayNames[p]).join(", ")})`}
                .
              </div>
            </div>
          </div>
        )}

        {campaignsWarning && (
          <div
            className="mt-4 flex items-start gap-3 rounded-lg border-2 px-4 py-3 shadow-sm"
            style={{
              borderColor: `${theme.warning}50`,
              backgroundColor: `${theme.warning}10`
            }}
          >
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0"
              style={{ color: theme.warning }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: theme.warning }}>
                ⚠️ Partial Results
              </div>
              <div className="mt-1 text-sm whitespace-pre-line" style={{ color: theme.warning }}>
                {campaignsWarning}
              </div>
            </div>
          </div>
        )}

        {campaignsError && (
          <div
            className="mt-4 flex items-start gap-3 rounded-lg border-2 px-4 py-3 shadow-sm"
            style={{
              borderColor: `${theme.negative}50`,
              backgroundColor: `${theme.negative}10`
            }}
          >
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0"
              style={{ color: theme.negative }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: theme.negative }}>
                ❌ Error Loading Campaigns
              </div>
              <div className="mt-1 text-sm whitespace-pre-line" style={{ color: theme.negative }}>
                {campaignsError}
              </div>
            </div>
          </div>
        )}

        {campaignsLoading && (
          <div
            className="mt-4 flex items-center justify-center gap-3 rounded-lg border px-4 py-3"
            style={{
              borderColor: `${theme.blue}30`,
              backgroundColor: `${theme.blue}10`
            }}
          >
            <svg className="h-5 w-5 animate-spin" style={{ color: theme.blue }} viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: theme.blue }}>
              {selectedAccounts.length === 0
                ? "Fetching all campaigns..."
                : "Fetching campaigns..."}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default CampaignsToolbar;
