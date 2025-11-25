import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { startOfDay } from "date-fns";
import DatePickerToggle from "./datepicker.jsx";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import { supabase } from "@/supabaseClient";

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
    // /api/campaigns/* requests to http://65.109.65.93:8080/v1/campaigns/*
    // This avoids mixed content errors (HTTPS page calling HTTP API)
    return "/api/campaigns";
  }
  
  // In development, use the direct backend URL
  return "http://65.109.65.93:8080/v1/campaigns";
};

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

const PLATFORM_API_NAMES = {
  meta: ["meta", "facebook", "Meta", "Facebook"],
  snap: ["snap", "snapchat", "Snap", "Snapchat"],
  tiktok: ["tiktok", "TikTok"],
  google: ["google", "Google"],
  newsbreak: ["newsbreak", "NewsBreak"]
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
  return String(id);
};

// ✅ Helper to extract campaigns from various API response formats
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
    // Search all object keys for an array
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        campaigns = data[key];
        break;
      }
    }
  }

  return campaigns;
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
  const [campaignsWarning, setCampaignsWarning] = useState(null);

  // Title search autocomplete states
  const [title, setTitle] = useState(initialFilters.title || "");
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSearchLoading, setTitleSearchLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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

        console.log("📡 Fetching ad accounts from API...");

        const apiBase = getApiBaseUrl();
        const endpoint = `${apiBase}/all-with-status`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Ad accounts raw response:", data);

        const campaigns = extractCampaignsFromResponse(data);

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

        console.log("✅ Formatted ad accounts:", formattedAccounts);

        if (mounted) {
          setAdAccounts(formattedAccounts);
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

  const [tags, setTags] = useState(initialFilters.tags || "");
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  // Status filter - default to active
  const [status, setStatus] = useState(initialFilters.status || ["active"]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  // ====== TITLE SEARCH AUTOCOMPLETE ======
  const searchCampaignTitles = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
      return;
    }

    setTitleSearchLoading(true);

    try {
      console.log(`🔍 Searching campaigns with title: "${searchQuery}"`);

      const requestBody = {
        title: searchQuery.trim()
      };

      const apiBase = getApiBaseUrl();
      const endpoint = `${apiBase}/details`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      const campaigns = extractCampaignsFromResponse(data);

      console.log(`✅ Extracted ${campaigns.length} campaigns from response`);

      const suggestionMap = new Map();

      campaigns.forEach((campaign) => {
        const campaignTitle =
          campaign.name ||
          campaign.title ||
          campaign.campaignName ||
          campaign.campaign_name ||
          "Untitled Campaign";

        const campaignId = campaign.id || campaign.campaignId || campaign.campaign_id || "";
        const platform = normalizePlatformFromDB(campaign.platform || campaign.platformName || "");
        const status = campaign.status || campaign.campaignStatus || "unknown";
        const adAccountId =
          campaign.adAccountId || campaign.ad_account_id || campaign.accountId || "";
        const adAccountName =
          campaign.adAccountName || campaign.ad_account_name || campaign.accountName || "";

        const uniqueKey = `${campaignTitle.toLowerCase()}-${platform}`;

        if (!suggestionMap.has(uniqueKey)) {
          suggestionMap.set(uniqueKey, {
            title: campaignTitle,
            id: campaignId,
            platform: platform,
            status: status,
            adAccountId: adAccountId,
            adAccountName: adAccountName,
            count: 1,
            campaigns: [campaign]
          });
        } else {
          const existing = suggestionMap.get(uniqueKey);
          existing.count += 1;
          existing.campaigns.push(campaign);
        }
      });

      const suggestions = Array.from(suggestionMap.values())
        .sort((a, b) => {
          const aExact = a.title.toLowerCase() === searchQuery.toLowerCase();
          const bExact = b.title.toLowerCase() === searchQuery.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return b.count - a.count;
        })
        .slice(0, 15);

      setTitleSuggestions(suggestions);
      setShowTitleSuggestions(suggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("❌ Error searching campaigns:", error);
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
    } finally {
      setTitleSearchLoading(false);
    }
  }, []);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length === 0) {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
      setTitleSearchLoading(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCampaignTitles(value);
    }, 150);
  };

  const selectTitleSuggestion = (suggestion) => {
    setTitle(suggestion.title);
    setShowTitleSuggestions(false);
    setTitleSuggestions([]);
    setSelectedSuggestionIndex(-1);
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  };

  const handleTitleKeyDown = (e) => {
    if (!showTitleSuggestions || titleSuggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFilters();
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
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < titleSuggestions.length) {
          selectTitleSuggestion(titleSuggestions[selectedSuggestionIndex]);
        } else {
          setShowTitleSuggestions(false);
          applyFilters();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowTitleSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          return isMatch ? (
            <mark key={i} className="bg-yellow-300 font-bold text-gray-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </>
    );
  };

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

  const selectStatus = (statusValue) => {
    if (statusValue === "all") {
      setStatus([]); // Empty array means "all"
    } else {
      setStatus([statusValue]);
    }
    setShowStatusMenu(false);
  };

  // ✅ UPDATED: Fetch all campaigns using different endpoints based on status
  // - Active (default): /active endpoint (today's metrics)
  // - Paused or All: base /v1/campaigns endpoint (all campaigns with status)
  const fetchAllCampaigns = async () => {
    // Empty array or no status means "all"
    const currentStatus = status && status.length > 0 ? status[0] : "all";
    const useActiveEndpoint = currentStatus === "active";
    
    console.log(`\n🔄 Fetching ALL campaigns (no account filter)...`);
    console.log(`   Status: ${currentStatus}`);
    console.log(`   Using endpoint: ${useActiveEndpoint ? "/active (today's data)" : "base /v1/campaigns (all campaigns)"}`);

    try {
      const apiBase = getApiBaseUrl();
      // Use /active for Active status, base endpoint for Paused or All
      const endpoint = useActiveEndpoint 
        ? `${apiBase}/active` 
        : apiBase; // Base endpoint without /active
      
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const allCampaigns = extractCampaignsFromResponse(data);

      console.log(`✅ Fetched ${allCampaigns.length} total campaigns from ${useActiveEndpoint ? "/active" : "base"} endpoint`);

      // Filter by selected platforms if any
      let filtered = allCampaigns;
      if (selectedPlatforms.length > 0) {
        filtered = allCampaigns.filter((c) => {
          const campaignPlatform = normalizePlatformFromDB(c.platform);
          return selectedPlatforms.includes(campaignPlatform);
        });
        console.log(`   Filtered to ${filtered.length} campaigns for selected platforms`);
      }

      // Filter by status
      if (status && status.length > 0 && currentStatus !== "all") {
        const statusFiltered = filtered.filter((c) => {
          const campaignStatus = String(c.status || "").toLowerCase();
          const normalizedStatus = campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
          return status.includes(normalizedStatus);
        });
        console.log(`   Filtered to ${statusFiltered.length} campaigns for status: ${status.join(", ")}`);
        return statusFiltered;
      }

      // If "all" is selected, return all campaigns without status filtering
      if (currentStatus === "all") {
        console.log(`   Returning all ${filtered.length} campaigns (status: all)`);
      }

      return filtered;
    } catch (error) {
      console.error("❌ Error fetching all campaigns:", error);
      throw error;
    }
  };

  // ✅ IMPROVED: Try multiple strategies to fetch campaigns
  const fetchCampaignsByAccount = async (accountIds, platform) => {
    const platformVariations = PLATFORM_API_NAMES[platform] || [platform];

    console.log(`\n🔄 Fetching campaigns for platform: ${platform}`);
    console.log(`   Account IDs (${accountIds.length}):`, accountIds);

    // Strategy 1: Try /v1/campaigns/by-account with different platform names
    for (const platformName of platformVariations) {
      try {
        console.log(`   📤 Strategy 1: Trying /by-account with platform: "${platformName}"`);

        const requestBody = {
          ad_account_ids: accountIds,
          platform: platformName
        };

        const apiBase = getApiBaseUrl();
        const endpoint = `${apiBase}/by-account`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          const campaigns = extractCampaignsFromResponse(data);

          if (campaigns.length > 0) {
            console.log(`   ✅ SUCCESS: Found ${campaigns.length} campaigns via /by-account`);
            return campaigns;
          }
        }
      } catch (error) {
        console.error(`   ⚠️ /by-account failed for "${platformName}":`, error.message);
      }
    }

    // Strategy 2: Try /v1/campaigns/details with account filter
    try {
      console.log(`   📤 Strategy 2: Trying /details endpoint`);

      const requestBody = {
        ad_account_ids: accountIds,
        platform: platform
      };

      const apiBase = getApiBaseUrl();
      const endpoint = `${apiBase}/details`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const campaigns = extractCampaignsFromResponse(data);

        if (campaigns.length > 0) {
          // Filter campaigns by account IDs
          const filtered = campaigns.filter((c) =>
            accountIds.includes(c.adAccountId || c.ad_account_id || c.accountId)
          );

          if (filtered.length > 0) {
            console.log(`   ✅ SUCCESS: Found ${filtered.length} campaigns via /details`);
            return filtered;
          }
        }
      }
    } catch (error) {
      console.error(`   ⚠️ /details endpoint failed:`, error.message);
    }

    // Strategy 3: Fetch all campaigns and filter client-side (endpoint depends on status)
    try {
      // Empty array or no status means "all"
      const currentStatus = status && status.length > 0 ? status[0] : "all";
      const useActiveEndpoint = currentStatus === "active";
      
      console.log(`   📤 Strategy 3: Fetching all campaigns and filtering client-side`);
      console.log(`      Status: ${currentStatus}, Using: ${useActiveEndpoint ? "/active" : "base"} endpoint`);

      const apiBase = getApiBaseUrl();
      // Use /active for Active status, base endpoint for Paused or All
      const endpoint = useActiveEndpoint 
        ? `${apiBase}/active` 
        : apiBase; // Base endpoint without /active
      
      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        const allCampaigns = extractCampaignsFromResponse(data);

        // Filter by platform and account IDs
        let filtered = allCampaigns.filter((c) => {
          const campaignPlatform = normalizePlatformFromDB(c.platform);
          const campaignAccountId = c.adAccountId || c.ad_account_id || c.accountId;
          return campaignPlatform === platform && accountIds.includes(campaignAccountId);
        });

        // Apply status filter if not "all"
        if (currentStatus !== "all" && status && status.length > 0) {
          filtered = filtered.filter((c) => {
            const campaignStatus = String(c.status || "").toLowerCase();
            const normalizedStatus = campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
            return status.includes(normalizedStatus);
          });
        }

        if (filtered.length > 0) {
          console.log(
            `   ✅ SUCCESS: Found ${filtered.length} campaigns via client-side filtering`
          );
          return filtered;
        }
      }
    } catch (error) {
      console.error(`   ⚠️ Client-side filtering failed:`, error.message);
    }

    console.error(`   ❌ FAILED: No campaigns found after trying all strategies`);
    return [];
  };

  // ✅ IMPROVED: Show partial results and detailed warnings
  const applyFiltersWithAccounts = async (accountsToUse) => {
    console.log("\n🚀 ========== APPLY FILTERS ==========");
    console.log("Selected accounts:", accountsToUse);
    console.log("Selected platforms:", selectedPlatforms);
    console.log("Title filter:", title);
    console.log("Tags filter:", tags);
    console.log("Status filter:", status);

    setCampaignsLoading(true);
    setCampaignsError(null);
    setCampaignsWarning(null);

    const filterData = {
      platforms: selectedPlatforms,
      accounts: accountsToUse,
      title,
      tags,
      status,
      dateRange,
      timeZone
    };

    // ✅ NEW: If no accounts selected, fetch all campaigns
    if (accountsToUse.length === 0) {
      console.log("\n📢 No accounts selected - fetching ALL campaigns");

      try {
        const allCampaigns = await fetchAllCampaigns();

        if (allCampaigns.length === 0) {
          setCampaignsWarning(
            "⚠️ No campaigns found. The API returned an empty dataset. This could mean:\n• No campaigns exist in the system\n• All campaigns are filtered out by platform selection\n• The API service may be experiencing issues"
          );
        } else {
          console.log(`✅ Successfully loaded ${allCampaigns.length} campaigns (unfiltered)`);
        }

        filterData.campaignsData = allCampaigns;
        filterData.isUnfiltered = true; // Flag to indicate this is unfiltered data
      } catch (error) {
        console.error("\n❌ ERROR fetching all campaigns:", error);
        setCampaignsError(
          `Failed to fetch campaigns: ${error.message}\n\nPlease try again or contact support if the issue persists.`
        );
        filterData.campaignsData = [];
      }

      setCampaignsLoading(false);

      console.log("\n📤 Calling onApplyFilters with:", filterData);
      console.log("========================================\n");

      if (onApplyFilters) {
        onApplyFilters(filterData);
      }

      return;
    }

    // ✅ EXISTING LOGIC: Fetch campaigns by account
    try {
      const accountsByPlatform = {};

      // Map each account to its platform
      accountsToUse.forEach((accountId) => {
        let foundPlatform = null;

        for (const [platform, accounts] of Object.entries(adAccounts)) {
          const found = accounts.find((acc) => acc.id === accountId);
          if (found) {
            foundPlatform = platform;
            if (!accountsByPlatform[platform]) {
              accountsByPlatform[platform] = [];
            }
            accountsByPlatform[platform].push(accountId);
            break;
          }
        }

        if (!foundPlatform) {
          console.warn(`   ⚠️ Could not find platform for account: ${accountId}`);
        }
      });

      console.log("\n📊 Accounts grouped by platform:", accountsByPlatform);

      if (Object.keys(accountsByPlatform).length === 0) {
        throw new Error(
          "Could not match selected accounts to platforms. Please refresh and try again."
        );
      }

      const allCampaigns = [];
      const platformResults = {};
      const failedPlatforms = [];

      // Fetch campaigns for each platform
      for (const [platform, accountIds] of Object.entries(accountsByPlatform)) {
        console.log(`\n🔄 Processing ${platform} with ${accountIds.length} account(s)...`);

        let campaigns = await fetchCampaignsByAccount(accountIds, platform);

         // Filter by status if status filter is set (skip if "all" is selected)
         const currentStatus = status && status.length > 0 ? status[0] : "active";
         if (currentStatus !== "all" && status && status.length > 0) {
           campaigns = campaigns.filter((c) => {
             const campaignStatus = String(c.status || "").toLowerCase();
             const normalizedStatus = campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
             return status.includes(normalizedStatus);
           });
           console.log(`   Filtered to ${campaigns.length} campaigns for status: ${status.join(", ")}`);
         }

        platformResults[platform] = {
          accountCount: accountIds.length,
          campaignCount: campaigns.length,
          accountIds: accountIds
        };

        if (campaigns.length > 0) {
          allCampaigns.push(...campaigns);
          console.log(`   ✅ Added ${campaigns.length} campaigns from ${platform}`);
        } else {
          failedPlatforms.push({
            platform,
            accountCount: accountIds.length,
            accounts: accountIds
          });
          console.log(`   ⚠️ No campaigns found for ${platform}`);
        }
      }

      console.log("\n📈 RESULTS SUMMARY:");
      console.log(`   Total campaigns fetched: ${allCampaigns.length}`);
      console.log(`   Platform breakdown:`, platformResults);

      // ✅ Show partial results with warning instead of error
      if (allCampaigns.length === 0) {
        const platformSummary = Object.entries(platformResults)
          .map(
            ([plat, info]) =>
              `${platformDisplayNames[plat]}: ${info.accountCount} account(s), 0 campaigns`
          )
          .join("; ");

        const errorMessage = `No campaigns found for any selected accounts.\n\n📊 Checked: ${platformSummary}\n\n💡 Possible reasons:\n• The accounts have no active campaigns\n• Campaigns exist but API returned empty data\n• Date range filters might be too restrictive\n• API endpoint may not support this platform yet`;

        setCampaignsError(errorMessage);
      } else if (failedPlatforms.length > 0) {
        // Some platforms succeeded, show warning for failed ones
        const warningMessage =
          `⚠️ Partial results: Found ${allCampaigns.length} campaigns, but ${failedPlatforms.length} platform(s) returned no data:\n\n` +
          failedPlatforms
            .map(
              (fp) =>
                `• ${platformDisplayNames[fp.platform]}: ${fp.accountCount} account(s) checked, 0 campaigns found`
            )
            .join("\n");

        setCampaignsWarning(warningMessage);
        console.log(`   ✅ Showing partial results: ${allCampaigns.length} campaigns`);
      } else {
        console.log(
          `   ✅ Successfully loaded ${allCampaigns.length} campaigns from all platforms`
        );
      }

      filterData.campaignsData = allCampaigns;
      filterData.platformResults = platformResults;
    } catch (error) {
      console.error("\n❌ ERROR in applyFiltersWithAccounts:", error);
      setCampaignsError(error.message);
      filterData.campaignsData = [];
    }

    setCampaignsLoading(false);

    console.log("\n📤 Calling onApplyFilters with:", filterData);
    console.log("========================================\n");

    if (onApplyFilters) {
      onApplyFilters(filterData);
    }
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
    setStatus(["active"]); // Reset to active by default
    setDateRange({ startDate: today, endDate: today, key: "today" });
    setTimeZone("America/Los_Angeles");
    setCampaignsError(null);
    setCampaignsWarning(null);
    setTitleSuggestions([]);
    setShowTitleSuggestions(false);

    if (onApplyFilters) {
      onApplyFilters({
        platforms: resetPlatforms,
        accounts: [],
        title: "",
        tags: "",
        status: ["active"],
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
    <section aria-label="Filters" className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-6 2xl:gap-4">
          {/* Date Picker */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
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
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all ${
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
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              disabled={accountsLoading}
              className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all ${
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
                <span className="text-xs text-gray-400 italic">All</span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
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

            {showAccountMenu && !accountsLoading && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAccountMenu(false)} />
                <div className="fixed inset-x-4 top-1/2 z-40 -translate-y-1/2 sm:absolute sm:inset-x-auto sm:top-auto sm:left-0 sm:translate-y-0 sm:mt-2 w-auto sm:w-96 lg:w-[32rem] xl:w-[40rem] 2xl:w-[48rem] max-h-[80vh] sm:max-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-10">
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

                  <div className="max-h-[calc(80vh-140px)] overflow-y-auto sm:max-h-[calc(70vh-140px)]">
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
                                      checked={selectedAccounts.includes(account.id)}
                                      onChange={() => toggleAccount(account.id)}
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

          {/* Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <span className="text-gray-600 font-medium">Status</span>
              {status && status.length > 0 ? (
                <span
                  className={`truncate rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    status[0] === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : status[0] === "paused"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {status[0] === "active" ? "Active" : status[0] === "paused" ? "Paused" : "All"}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">All</span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showStatusMenu ? "rotate-180" : ""}`}
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
                <div className="absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-auto rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5 sm:right-auto sm:w-56">
                  <div className="p-2">
                    <div className="mb-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Select Status
                    </div>
                    <button
                      type="button"
                      onClick={() => selectStatus("active")}
                      className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                        status.includes("active")
                          ? "bg-emerald-500 font-semibold text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
                        Active
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectStatus("paused")}
                      className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                        status.includes("paused")
                          ? "bg-amber-500 font-semibold text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-600"></span>
                        Paused
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectStatus("all")}
                      className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                        !status || status.length === 0
                          ? "bg-blue-500 font-semibold text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                        All
                      </div>
                    </button>
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
              className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {/* Title Input with Autocomplete */}
        <div className="relative mt-3">
          <label className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <svg
              className="h-5 w-5 text-gray-400 flex-shrink-0"
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
            <span className="text-sm font-medium text-gray-600 flex-shrink-0">Title:</span>
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
              className="w-full flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Type to search campaigns..."
              autoComplete="off"
            />
            {titleSearchLoading && (
              <svg className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0" viewBox="0 0 24 24">
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
            )}
            {title && !titleSearchLoading && (
              <button
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  setTitle("");
                  setTitleSuggestions([]);
                  setShowTitleSuggestions(false);
                }}
                title="Clear title"
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

          {/* Autocomplete suggestions dropdown */}
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <div
              ref={titleDropdownRef}
              className="absolute left-0 right-0 z-50 mt-2 max-h-[420px] overflow-hidden rounded-xl border-2 border-blue-300 bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    {titleSuggestions.length} Campaign{titleSuggestions.length !== 1 ? "s" : ""}{" "}
                    Found
                  </span>
                </div>
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100">
                {titleSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.id}-${index}`}
                    type="button"
                    onClick={() => selectTitleSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-all ${
                      index === selectedSuggestionIndex
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    {suggestion.platform && platformIconsMap[suggestion.platform] && (
                      <img
                        src={platformIconsMap[suggestion.platform]}
                        alt={suggestion.platform}
                        className="h-6 w-6 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {highlightMatch(suggestion.title, title)}
                      </div>
                      {suggestion.adAccountName && (
                        <div className="text-xs text-gray-600 mt-1">{suggestion.adAccountName}</div>
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
            onClick={resetForm}
            disabled={campaignsLoading}
            className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={applyFilters}
            disabled={campaignsLoading}
            className={`flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
              campaignsLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            }`}
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

        {/* ✅ INFO MESSAGE (No filters selected) */}
        {selectedAccounts.length === 0 && !campaignsLoading && !campaignsError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-3 shadow-sm">
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600"
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
              <div className="text-sm font-bold text-blue-900">ℹ️ No Account Filter</div>
              <div className="mt-1 text-sm text-blue-800">
                Clicking "Load All Campaigns" will fetch all campaigns from all platforms
                {selectedPlatforms.length > 0 &&
                  ` (filtered by: ${selectedPlatforms
                    .map((p) => platformDisplayNames[p])
                    .join(", ")})`}
                . This may take a moment.
              </div>
            </div>
          </div>
        )}

        {/* ✅ WARNING MESSAGE (Partial Results) */}
        {campaignsWarning && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 px-4 py-3 shadow-sm">
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600"
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
              <div className="text-sm font-bold text-yellow-900">⚠️ Partial Results</div>
              <div className="mt-1 text-sm text-yellow-800 whitespace-pre-line">
                {campaignsWarning}
              </div>
            </div>
          </div>
        )}

        {/* ✅ ERROR MESSAGE (No Results) */}
        {campaignsError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 shadow-sm">
            <svg
              className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600"
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
              <div className="text-sm font-bold text-red-900">❌ Error Loading Campaigns</div>
              <div className="mt-1 text-sm text-red-700 whitespace-pre-line">{campaignsError}</div>
              <div className="mt-3 text-xs text-red-600">
                <strong>Debug steps:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Open browser console (F12) and check the detailed logs</li>
                  <li>Look for "Strategy 1/2/3" messages showing which API calls were attempted</li>
                  <li>Verify accounts have campaigns in the selected date range</li>
                  <li>Try different accounts or platforms</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {campaignsLoading && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
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
            <span className="text-sm font-medium text-blue-900">
              {selectedAccounts.length === 0
                ? "Fetching all campaigns... (Check console for progress)"
                : "Fetching campaigns... (Check console for detailed progress)"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

export default CampaignsToolbar;
