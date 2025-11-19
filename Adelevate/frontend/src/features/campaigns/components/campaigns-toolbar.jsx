import React, { useState, useMemo, useEffect } from "react";
import { startOfDay } from "date-fns";
import DatePickerToggle from "./datepicker.jsx";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import { supabase } from "@/supabaseClient";

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta", icon: fb },
  { value: "snap", label: "Snap", icon: snapchatIcon },
  { value: "tiktok", label: "TikTok", icon: tiktokIcon },
  { value: "google", label: "Google", icon: googleIcon },
  { value: "newsbreak", label: "NewsBreak", icon: nb }
];

const platformIconsMap = {
  meta: fb,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nb
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

// Platform name mapping for API
const PLATFORM_API_NAMES = {
  meta: ["meta", "facebook"],
  snap: ["snap", "snapchat"],
  tiktok: ["tiktok"],
  google: ["google"],
  newsbreak: ["newsbreak"]
};

const normalizePlatformFromDB = (p) => {
  if (!p) return "";
  const v = String(p).toLowerCase();
  if (v === "facebook") return "meta";
  if (v === "snapchat") return "snap";
  return v;
};

const platformDisplayNames = {
  meta: "Meta",
  snap: "Snap",
  tiktok: "TikTok",
  google: "Google",
  newsbreak: "NewsBreak"
};

const formatAccountId = (id) => {
  if (!id) return "";
  const str = String(id);
  if (str.startsWith("act_")) return str;
  if (str.length > 20 && str.includes("-")) {
    return str.substring(0, 8) + "...";
  }
  return str;
};

export function CampaignsToolbar({ onApplyFilters, onApplyGrouping, initialFilters = {} }) {
  const [myRole, setMyRole] = useState("user");
  const [allowedPlatforms, setAllowedPlatforms] = useState([]);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [adAccounts, setAdAccounts] = useState({});
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState(null);

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
      } catch (e) {
        console.error("Error loading user role/platforms", e);
        setAccessLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch ad accounts from API
  useEffect(() => {
    let mounted = true;

    const fetchAdAccounts = async () => {
      try {
        setAccountsLoading(true);
        setAccountsError(null);

        const response = await fetch("http://5.78.123.130:8080/v1/campaigns/all-with-status");

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        let campaigns = data;

        if (data.data && Array.isArray(data.data)) {
          campaigns = data.data;
        } else if (data.campaigns && Array.isArray(data.campaigns)) {
          campaigns = data.campaigns;
        } else if (!Array.isArray(data)) {
          throw new Error("Invalid API response format - expected an array");
        }

        const accountsByPlatform = {};

        campaigns.forEach((campaign) => {
          const platform = normalizePlatformFromDB(campaign.platform);
          const accountId = campaign.adAccountId;
          const accountName = campaign.adAccountName;

          if (!platform || !accountId || !accountName) return;

          if (!accountsByPlatform[platform]) {
            accountsByPlatform[platform] = {};
          }

          if (!accountsByPlatform[platform][accountId]) {
            accountsByPlatform[platform][accountId] = {
              id: accountId,
              name: accountName,
              platform: platform
            };
          }
        });

        const formattedAccounts = {};
        Object.keys(accountsByPlatform).forEach((platform) => {
          formattedAccounts[platform] = Object.values(accountsByPlatform[platform]).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });

        if (mounted) {
          setAdAccounts(formattedAccounts);
          setAccountsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching ad accounts:", error);
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

  const platforms = useMemo(() => {
    if (!accessLoaded) return [];
    const allowedSet = new Set(allowedPlatforms);

    if (allowedSet.size === 0 && myRole === "SuperAdmin") {
      return ALL_PLATFORMS;
    }
    if (allowedSet.size === 0) return [];
    return ALL_PLATFORMS.filter((p) => allowedSet.has(p.id));
  }, [accessLoaded, allowedPlatforms, myRole]);

  const [selectedPlatforms, setSelectedPlatforms] = useState(initialFilters.platforms || []);

  useEffect(() => {
    if (!accessLoaded) return;
    const allowedSet = new Set(allowedPlatforms);
    setSelectedPlatforms((prev) => {
      const filtered = prev.filter((p) => allowedSet.has(p));
      if (filtered.length === 0 && allowedPlatforms.length > 0) {
        return [...allowedPlatforms];
      }
      return filtered;
    });
  }, [accessLoaded, allowedPlatforms]);

  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState(initialFilters.accounts || []);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    meta: true,
    snap: true,
    tiktok: true,
    google: true,
    newsbreak: true
  });

  const [title, setTitle] = useState(initialFilters.title || "");
  const [tags, setTags] = useState(initialFilters.tags || "");
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const [dateRange, setDateRange] = useState(() => {
    if (initialFilters.dateRange) return initialFilters.dateRange;
    const today = startOfDay(new Date());
    return { startDate: today, endDate: today, key: "today" };
  });

  const [timeZone, setTimeZone] = useState(initialFilters.timeZone || "America/Los_Angeles");
  const [showTimeZoneMenu, setShowTimeZoneMenu] = useState(false);

  const timeZoneOptions = [
    { id: "America/Los_Angeles", name: "America/Los_Angeles" },
    { id: "America/New_York", name: "America/New_York" },
    { id: "Europe/London", name: "Europe/London" },
    { id: "Asia/Tokyo", name: "Asia/Tokyo" },
    { id: "Australia/Sydney", name: "Australia/Sydney" }
  ];

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((p) => p !== platformId);
      }
      return [...prev, platformId];
    });
  };

  const toggleAccount = (accountId) => {
    setSelectedAccounts((prev) => {
      const newSelection = prev.includes(accountId)
        ? prev.filter((a) => a !== accountId)
        : [...prev, accountId];
      
      // Auto-apply when account is toggled
      setTimeout(() => {
        applyFiltersWithAccounts(newSelection);
      }, 100);
      
      return newSelection;
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const selectTag = (tag) => {
    setTags(tag);
    setShowTagsMenu(false);
  };

  const selectTimeZone = (zone) => {
    setTimeZone(zone);
    setShowTimeZoneMenu(false);
  };

  // Smart fetch with platform name variations
  const fetchCampaignsByAccount = async (accountIds, platform) => {
    const platformVariations = PLATFORM_API_NAMES[platform] || [platform];

    console.log(`🔄 Fetching campaigns for platform: ${platform}`);
    console.log(`   Account IDs: ${accountIds.join(", ")}`);
    console.log(`   Trying variations: ${platformVariations.join(", ")}`);

    for (const platformName of platformVariations) {
      try {
        const requestBody = {
          ad_account_ids: accountIds,
          platform: platformName
        };

        console.log(`   📤 Trying "${platformName}":`, requestBody);

        const response = await fetch("http://5.78.123.130:8080/v1/campaigns/by-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          console.log(`   ❌ Failed with "${platformName}": ${response.status}`);
          continue;
        }

        const data = await response.json();

        // Extract campaigns from various response formats
        let campaigns = [];
        if (Array.isArray(data)) {
          campaigns = data;
        } else if (data?.data && Array.isArray(data.data)) {
          campaigns = data.data;
        } else if (data?.campaigns && Array.isArray(data.campaigns)) {
          campaigns = data.campaigns;
        } else if (typeof data === "object") {
          // Try to find any array field
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              campaigns = data[key];
              break;
            }
          }
        }

        if (campaigns.length > 0) {
          console.log(`   ✅ SUCCESS with "${platformName}"! Found ${campaigns.length} campaigns`);
          return campaigns;
        } else {
          console.log(`   ⚠️ Empty response with "${platformName}"`);
        }
      } catch (error) {
        console.error(`   ❌ Error with "${platformName}":`, error.message);
      }
    }

    console.log(`   ❌ No campaigns found for any variation of ${platform}`);
    return [];
  };

  const applyFiltersWithAccounts = async (accountsToUse) => {
    console.log("\n🚀 ========== AUTO APPLY FILTERS ==========");

    setCampaignsLoading(true);
    setCampaignsError(null);

    const filterData = {
      platforms: selectedPlatforms,
      accounts: accountsToUse,
      title,
      tags,
      dateRange,
      timeZone
    };

    if (accountsToUse.length > 0) {
      try {
        // Group accounts by platform
        const accountsByPlatform = {};

        accountsToUse.forEach((accountId) => {
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

        console.log("📊 Grouped accounts:", accountsByPlatform);

        if (Object.keys(accountsByPlatform).length === 0) {
          throw new Error("Could not match selected accounts to platforms");
        }

        // Fetch campaigns for each platform
        const allCampaigns = [];

        for (const [platform, accountIds] of Object.entries(accountsByPlatform)) {
          console.log(`\n📞 Fetching ${platform} campaigns...`);
          const campaigns = await fetchCampaignsByAccount(accountIds, platform);
          allCampaigns.push(...campaigns);
        }

        console.log(`\n✅ Total campaigns fetched: ${allCampaigns.length}`);

        if (allCampaigns.length === 0) {
          setCampaignsError(
            "No campaigns found for selected accounts. The accounts might not have any active campaigns."
          );
        }

        filterData.campaignsData = allCampaigns;
      } catch (error) {
        console.error("❌ Error:", error);
        setCampaignsError(error.message);
      }
    }

    setCampaignsLoading(false);

    if (onApplyFilters) {
      onApplyFilters(filterData);
    }

    console.log("========== AUTO APPLY COMPLETE ==========\n");
  };

  const applyFilters = async () => {
    await applyFiltersWithAccounts(selectedAccounts);
  };

  const resetForm = () => {
    const today = startOfDay(new Date());
    const resetPlatforms = allowedPlatforms?.length > 0 ? [...allowedPlatforms] : [];

    setSelectedPlatforms(resetPlatforms);
    setSelectedAccounts([]);
    setTitle("");
    setTags("");
    setDateRange({ startDate: today, endDate: today, key: "today" });
    setTimeZone("America/Los_Angeles");
    setCampaignsError(null);

    if (onApplyFilters) {
      onApplyFilters({
        platforms: resetPlatforms,
        accounts: [],
        title: "",
        tags: "",
        dateRange: { startDate: today, endDate: today, key: "today" },
        timeZone: "America/Los_Angeles",
        campaignsData: []
      });
    }

    if (onApplyGrouping) {
      onApplyGrouping([]);
    }
  };

  return (
    <section
      aria-label="Filters"
      className="rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      {/* Main Filter Container */}
      <div className="p-4 lg:p-6">
        {/* Filter Grid - Responsive Layout */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:gap-4">
          {/* Date Picker - Full width on mobile, spans 2 cols on xl */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <DatePickerToggle
              initialSelection={dateRange}
              onChange={(newRange) => setDateRange(newRange)}
            />
          </div>

          {/* Time Zone Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTimeZoneMenu(!showTimeZoneMenu)}
              className="flex h-full w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <span className="text-gray-600 font-medium">Timezone</span>
              <span className="truncate text-xs font-semibold text-blue-600 max-w-[120px]">
                {timeZone.split("/")[1] || timeZone}
              </span>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showTimeZoneMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTimeZoneMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTimeZoneMenu(false)} />
                <div className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-auto rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 sm:right-auto sm:w-72">
                  <div className="p-2">
                    <div className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Select Timezone
                    </div>
                    {timeZoneOptions.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => selectTimeZone(zone.id)}
                        className={`w-full truncate rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                          timeZone === zone.id
                            ? "bg-blue-500 text-white font-semibold shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {zone.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Platform selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (accessLoaded && platforms.length > 0) {
                  setShowPlatformMenu(!showPlatformMenu);
                }
              }}
              disabled={!accessLoaded || platforms.length === 0}
              className={`flex h-full w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all ${
                !accessLoaded || platforms.length === 0
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              }`}
            >
              <span className="text-gray-600 font-medium">Platforms</span>
              {selectedPlatforms.length > 0 ? (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {selectedPlatforms.length}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  {platforms.length === 0 ? "No access" : "Select..."}
                </span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showPlatformMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showPlatformMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowPlatformMenu(false)} />
                <div className="absolute left-0 right-0 z-40 mt-2 rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 sm:right-auto sm:w-64">
                  <div className="p-2">
                    <div className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Select Platforms
                    </div>
                    {platforms.map((platform) => (
                      <label
                        key={platform.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={() => togglePlatform(platform.id)}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <img
                          src={platformIconsMap[platform.id]}
                          alt={`${platform.name} icon`}
                          className="h-5 w-5"
                        />
                        <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                      </label>
                    ))}
                    {platforms.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-gray-500">
                        No platform access configured.
                        <br />
                        Contact your administrator.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account selector - IMPROVED RESPONSIVE */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              disabled={accountsLoading}
              className={`flex h-full w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all ${
                accountsLoading
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              }`}
            >
              <span className="text-gray-600 font-medium">Accounts</span>
              {accountsLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-xs">Loading...</span>
                </div>
              ) : selectedAccounts.length > 0 ? (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                  {selectedAccounts.length}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">Select...</span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* IMPROVED ACCOUNT DROPDOWN - RESPONSIVE FOR ALL DEVICES */}
            {showAccountMenu && !accountsLoading && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAccountMenu(false)} />
                <div className="fixed inset-x-4 top-1/2 z-40 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:top-auto sm:left-0 sm:translate-y-0 sm:mt-2 w-auto sm:w-96 lg:w-[32rem] xl:w-[36rem] 2xl:w-[40rem] max-h-[80vh] sm:max-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-10">
                  {/* Header - Sticky */}
                  <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500 p-2 shadow-sm">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 sm:text-lg">Ad Accounts</h3>
                          <p className="text-xs text-gray-600">Click to select accounts</p>
                        </div>
                      </div>
                      {selectedAccounts.length > 0 && (
                        <span className="rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                          {selectedAccounts.length} selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {accountsError && (
                    <div className="mx-4 mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 sm:mx-6">
                      <div className="flex items-start gap-2">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
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

                  {/* No Accounts Message */}
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
                      <p className="mt-4 text-base font-medium text-gray-900">No ad accounts available</p>
                      <p className="mt-1 text-sm text-gray-500">Check your platform access permissions</p>
                    </div>
                  )}

                  {/* Scrollable Content */}
                  <div className="max-h-[calc(80vh-140px)] overflow-y-auto sm:max-h-[calc(70vh-140px)]">
                    <div className="space-y-3 p-4 sm:p-6">
                      {Object.entries(adAccounts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([platform, accounts]) => (
                          <div key={platform} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            {/* Platform Header */}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Account List */}
                            {expandedSections[platform] && (
                              <div className="divide-y divide-gray-100 bg-white">
                                {accounts.map((account) => (
                                  <label
                                    key={account.id}
                                    className="group flex cursor-pointer items-start gap-3 px-4 py-3 transition-all hover:bg-blue-50 sm:px-5"
                                    title={`Full ID: ${account.id}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedAccounts.includes(account.id)}
                                      onChange={() => toggleAccount(account.id)}
                                      className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-blue-600 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="break-words text-sm font-semibold text-gray-900 group-hover:text-blue-700 sm:text-base">
                                        {account.name}
                                      </div>
                                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <code className="break-all rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-800 sm:text-sm">
                                          {formatAccountId(account.id)}
                                        </code>
                                        {account.id !== formatAccountId(account.id) && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              navigator.clipboard.writeText(account.id);
                                            }}
                                            className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
                                            title="Copy full ID"
                                          >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                              />
                                            </svg>
                                          </button>
                                        )}
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

                  {/* Footer - Sticky */}
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

          {/* Tags Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTagsMenu(!showTagsMenu)}
              className="flex h-full w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <span className="text-gray-600 font-medium">Tags</span>
              {tags ? (
                <span className="truncate rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                  {tags}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">Select...</span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showTagsMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTagsMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTagsMenu(false)} />
                <div className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-auto rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 sm:right-auto sm:w-56">
                  <div className="p-2">
                    <div className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Select Tag
                    </div>
                    {PREDEFINED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => selectTag(tag)}
                        className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                          tags === tag
                            ? "bg-purple-500 font-semibold text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {tags && (
                      <button
                        type="button"
                        onClick={() => selectTag("")}
                        className="mt-2 w-full rounded-md border-t px-3 py-2.5 pt-3 text-left text-sm text-gray-500 hover:bg-gray-100"
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

        {/* Title Input - Full Width Below */}
        <div className="mt-3">
          <label className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600">Title:</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              aria-label="Title filter"
              placeholder="Search campaigns by title..."
            />
            {title && (
              <button
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setTitle("")}
                title="Clear title"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={campaignsLoading}
            className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:order-1"
          >
            Reset Filters
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all sm:order-2 ${
              campaignsLoading
                ? "cursor-not-allowed bg-blue-400"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            }`}
            onClick={applyFilters}
            disabled={campaignsLoading}
          >
            {campaignsLoading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >















                  
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Apply Filters</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {campaignsError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 shadow-sm">
            <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900">Error Loading Campaigns</div>
              <div className="mt-1 text-sm text-red-700">{campaignsError}</div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {campaignsLoading && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-900">Fetching campaigns...</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default CampaignsToolbar;