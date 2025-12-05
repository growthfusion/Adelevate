import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to get API base URL
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CAMPAIGNS_API_URL;

  if (apiUrl) {
    const base = apiUrl.replace(/\/$/, "");
    return base.endsWith("/v1/campaigns") ? base : `${base}/v1/campaigns`;
  }

  if (import.meta.env.PROD) {
    return "/api/campaigns";
  }

  return "http://65.109.65.93:8080/v1/campaigns";
};

const API_BASE = getApiBaseUrl();

// Platform API name mappings
const PLATFORM_API_NAMES = {
  meta: ["meta", "facebook", "Meta", "Facebook"],
  snap: ["snap", "snapchat", "Snap", "Snapchat"],
  tiktok: ["tiktok", "TikTok"],
  google: ["google", "Google"],
  newsbreak: ["newsbreak", "NewsBreak"]
};

// Normalize platform name
export const normalizePlatform = (platform, campaignName = "") => {
  if (!platform) {
    const name = String(campaignName).toLowerCase();
    if (name.includes("snap")) return "snap";
    if (name.includes("newsbreak")) return "newsbreak";
    if (name.includes("tiktok")) return "tiktok";
    if (name.includes("google")) return "google";
    if (name.includes("meta") || name.includes("facebook") || name.includes("fb")) return "meta";
    return "meta";
  }

  const v = String(platform).toLowerCase().trim();
  if (v === "facebook" || v === "fb") return "meta";
  if (v === "snapchat") return "snap";
  return v;
};

// Extract campaigns from various API response formats
const extractCampaigns = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.campaigns && Array.isArray(data.campaigns)) return data.campaigns;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.items && Array.isArray(data.items)) return data.items;

  if (typeof data === "object") {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        return data[key];
      }
    }
  }
  return [];
};

// Map campaign data to table format
const mapCampaignData = (rows, startIdx = 0) => {
  return rows.map((r, idx) => {
    const statusRaw = String(r.status || "")
      .toUpperCase()
      .trim();
    const cost = Number(r.spend ?? r.cost ?? 0);
    const revenue = Number(r.revenue ?? 0);
    const profit = Number(r.profit !== undefined ? r.profit : revenue - cost);
    const clicks = Number(r.clicks ?? 0);
    const lpViews = Number(r.lp_views ?? r.lpViews ?? 0);
    const lpClicks = Number(r.lp_clicks ?? r.lpClicks ?? 0);
    const conversions = Number(r.conversions ?? r.purchases ?? 0);

    const lpCtr = lpViews > 0 ? (lpClicks / lpViews) * 100 : 0;
    const roi = typeof r.roi === "number" ? r.roi * 100 : cost > 0 ? (profit / cost) * 100 : 0;
    const cpa = conversions > 0 ? cost / conversions : 0;
    const aov = conversions > 0 ? revenue / conversions : 0;
    const cr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const lpcpc = lpClicks > 0 ? cost / lpClicks : 0;
    const lpepc = lpClicks > 0 ? revenue / lpClicks : 0;

    const campaignName = r.campaign_name || r.campaignName || r.name || "";
    const tag = (() => {
      const parts = String(campaignName).split("|");
      return (parts[parts.length - 1] || "").trim() || "—";
    })();

    const platform = normalizePlatform(r.platform, campaignName);
    let status = "paused";
    if (statusRaw === "ACTIVE" || statusRaw === "ENABLED") {
      status = "active";
    }

    return {
      id: startIdx + idx + 1,
      campaignId: r.id || r.campaignId || r.campaign_id || "",
      title: String(campaignName || `Campaign ${startIdx + idx + 1}`),
      platform,
      status,
      tag,
      cost,
      revenue,
      profit,
      lpCtr,
      roi,
      purchases: conversions,
      cpa,
      aov,
      cr,
      lpcpc,
      lpepc,
      clicks,
      lpViews,
      lpClicks,
      adAccountId: r.adAccountId || r.ad_account_id || "",
      adAccountName: r.adAccountName || r.ad_account_name || ""
    };
  });
};

// ========================================
// ASYNC THUNK: FETCH ALL CAMPAIGNS (WITH TIMEZONE)
// ========================================
export const fetchAllCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async (
    { platforms = [], status = [], timezone = "UTC", dateRange = null },
    { rejectWithValue }
  ) => {
    try {
      const hasStatusFilter = status && status.length > 0;
      const useActiveEndpoint = hasStatusFilter;
      const endpoint = useActiveEndpoint ? `${API_BASE}/active` : API_BASE;

      // Build query params with timezone
      const params = new URLSearchParams();
      params.append("timezone", timezone);

      if (dateRange?.startDate) {
        params.append("start_date", new Date(dateRange.startDate).toISOString());
      }
      if (dateRange?.endDate) {
        params.append("end_date", new Date(dateRange.endDate).toISOString());
      }

      const url = `${endpoint}?${params.toString()}`;
      console.log("Fetching campaigns with timezone:", timezone, "URL:", url);

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      let campaigns = extractCampaigns(data);

      // Filter by platforms
      if (platforms.length > 0) {
        campaigns = campaigns.filter((c) => {
          const campaignPlatform = normalizePlatform(c.platform);
          return platforms.includes(campaignPlatform);
        });
      }

      // Filter by status
      if (hasStatusFilter) {
        campaigns = campaigns.filter((c) => {
          const campaignStatus = String(c.status || "").toLowerCase();
          const normalizedStatus =
            campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
          return status.includes(normalizedStatus);
        });
      }

      return {
        campaigns: mapCampaignData(campaigns),
        timezone
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================================
// ASYNC THUNK: FETCH CAMPAIGNS BY ACCOUNT (WITH TIMEZONE)
// ========================================
export const fetchCampaignsByAccount = createAsyncThunk(
  "campaigns/fetchByAccount",
  async (
    { accountIds, platform, status = [], timezone = "UTC", dateRange = null },
    { rejectWithValue }
  ) => {
    try {
      const platformVariations = PLATFORM_API_NAMES[platform] || [platform];

      // Build request body with timezone
      const requestBody = {
        ad_account_ids: accountIds,
        timezone: timezone
      };

      if (dateRange?.startDate) {
        requestBody.start_date = new Date(dateRange.startDate).toISOString();
      }
      if (dateRange?.endDate) {
        requestBody.end_date = new Date(dateRange.endDate).toISOString();
      }

      // Strategy 1: Try /by-account endpoint
      for (const platformName of platformVariations) {
        try {
          const response = await fetch(`${API_BASE}/by-account`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...requestBody, platform: platformName })
          });

          if (response.ok) {
            const data = await response.json();
            let campaigns = extractCampaigns(data);

            if (campaigns.length > 0) {
              // Apply status filter
              if (status.length > 0) {
                campaigns = campaigns.filter((c) => {
                  const campaignStatus = String(c.status || "").toLowerCase();
                  const normalizedStatus =
                    campaignStatus === "active" || campaignStatus === "enabled"
                      ? "active"
                      : "paused";
                  return status.includes(normalizedStatus);
                });
              }
              return {
                campaigns: mapCampaignData(campaigns),
                timezone
              };
            }
          }
        } catch (e) {
          console.warn(`/by-account failed for ${platformName}:`, e.message);
        }
      }

      // Strategy 2: Try /details endpoint
      try {
        const response = await fetch(`${API_BASE}/details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...requestBody, platform })
        });

        if (response.ok) {
          const data = await response.json();
          let campaigns = extractCampaigns(data);
          campaigns = campaigns.filter((c) =>
            accountIds.includes(c.adAccountId || c.ad_account_id || c.accountId)
          );

          if (campaigns.length > 0) {
            if (status.length > 0) {
              campaigns = campaigns.filter((c) => {
                const campaignStatus = String(c.status || "").toLowerCase();
                const normalizedStatus =
                  campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
                return status.includes(normalizedStatus);
              });
            }
            return {
              campaigns: mapCampaignData(campaigns),
              timezone
            };
          }
        }
      } catch (e) {
        console.warn("/details endpoint failed:", e.message);
      }

      // Strategy 3: Fallback to /active and filter client-side
      const hasStatusFilter = status.length > 0;
      const endpoint = hasStatusFilter ? `${API_BASE}/active` : API_BASE;

      const params = new URLSearchParams();
      params.append("timezone", timezone);

      const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
        let campaigns = extractCampaigns(data);

        campaigns = campaigns.filter((c) => {
          const campaignPlatform = normalizePlatform(c.platform);
          const campaignAccountId = c.adAccountId || c.ad_account_id || c.accountId;
          return campaignPlatform === platform && accountIds.includes(campaignAccountId);
        });

        if (hasStatusFilter) {
          campaigns = campaigns.filter((c) => {
            const campaignStatus = String(c.status || "").toLowerCase();
            const normalizedStatus =
              campaignStatus === "active" || campaignStatus === "enabled" ? "active" : "paused";
            return status.includes(normalizedStatus);
          });
        }

        return {
          campaigns: mapCampaignData(campaigns),
          timezone
        };
      }

      return { campaigns: [], timezone };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk: Fetch ad accounts
export const fetchAdAccounts = createAsyncThunk(
  "campaigns/fetchAdAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/all-with-status`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const campaigns = extractCampaigns(data);

      const accountsByPlatform = {};

      campaigns.forEach((campaign) => {
        const platform = normalizePlatform(campaign.platform);
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
            platform
          };
        }
      });

      const formattedAccounts = {};
      Object.keys(accountsByPlatform).forEach((platform) => {
        formattedAccounts[platform] = Object.values(accountsByPlatform[platform]).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });

      return formattedAccounts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk: Search campaigns by title
export const searchCampaignsByTitle = createAsyncThunk(
  "campaigns/searchByTitle",
  async (searchQuery, { rejectWithValue }) => {
    try {
      if (!searchQuery || searchQuery.trim().length < 1) {
        return [];
      }

      const response = await fetch(`${API_BASE}/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: searchQuery.trim() })
      });

      if (!response.ok) throw new Error(`Search API error: ${response.status}`);

      const data = await response.json();
      const campaigns = extractCampaigns(data);

      const suggestionMap = new Map();

      campaigns.forEach((campaign) => {
        const title =
          campaign.name ||
          campaign.title ||
          campaign.campaignName ||
          campaign.campaign_name ||
          "Untitled";
        const platform = normalizePlatform(campaign.platform || "");
        const uniqueKey = `${title.toLowerCase()}-${platform}`;

        if (!suggestionMap.has(uniqueKey)) {
          suggestionMap.set(uniqueKey, {
            title,
            id: campaign.id || campaign.campaignId || "",
            platform,
            status: campaign.status || "unknown",
            adAccountId: campaign.adAccountId || "",
            adAccountName: campaign.adAccountName || "",
            count: 1
          });
        } else {
          suggestionMap.get(uniqueKey).count += 1;
        }
      });

      return Array.from(suggestionMap.values())
        .sort((a, b) => {
          const aExact = a.title.toLowerCase() === searchQuery.toLowerCase();
          const bExact = b.title.toLowerCase() === searchQuery.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return b.count - a.count;
        })
        .slice(0, 15);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Campaign data
  campaigns: [],
  isLoading: false,
  error: null,
  warning: null,
  lastUpdated: null,

  // Ad accounts
  adAccounts: {},
  adAccountsLoading: false,
  adAccountsError: null,

  // Filters
  filters: {
    platforms: [],
    accounts: [],
    status: ["active", "paused"],
    title: "",
    tags: "",
    dateRange: null,
    timeZone: "America/Los_Angeles" // Default timezone
  },

  // Title search
  titleSuggestions: [],
  titleSearchLoading: false,

  // Table settings
  tableSettings: {
    rowsPerPage: 100,
    page: 1,
    density: "comfortable",
    hiddenColumns: [],
    sortConfig: { key: null, direction: null }
  },

  // Drill-down state
  drillDown: {
    expandedCampaigns: [],
    expandedDates: {},
    expandedHours: {},
    expandedOffers: {}
  }
};

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPlatforms: (state, action) => {
      state.filters.platforms = action.payload;
    },
    setAccounts: (state, action) => {
      state.filters.accounts = action.payload;
    },
    setStatus: (state, action) => {
      state.filters.status = action.payload;
    },
    setTitle: (state, action) => {
      state.filters.title = action.payload;
    },
    setTags: (state, action) => {
      state.filters.tags = action.payload;
    },
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setTimeZone: (state, action) => {
      state.filters.timeZone = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.warning = null;
      state.error = null;
    },

    // Table settings actions
    setRowsPerPage: (state, action) => {
      state.tableSettings.rowsPerPage = action.payload;
      state.tableSettings.page = 1;
    },
    setPage: (state, action) => {
      state.tableSettings.page = action.payload;
    },
    setDensity: (state, action) => {
      state.tableSettings.density = action.payload;
    },
    toggleColumn: (state, action) => {
      const columnId = action.payload;
      const idx = state.tableSettings.hiddenColumns.indexOf(columnId);
      if (idx === -1) {
        state.tableSettings.hiddenColumns.push(columnId);
      } else {
        state.tableSettings.hiddenColumns.splice(idx, 1);
      }
    },
    showAllColumns: (state) => {
      state.tableSettings.hiddenColumns = [];
    },
    hideAllColumns: (state, action) => {
      state.tableSettings.hiddenColumns = action.payload;
    },
    setSortConfig: (state, action) => {
      state.tableSettings.sortConfig = action.payload;
    },
    resetTableSettings: (state) => {
      state.tableSettings = initialState.tableSettings;
      state.drillDown = initialState.drillDown;
    },

    // Drill-down actions
    toggleCampaignExpansion: (state, action) => {
      const campaignId = action.payload;
      const idx = state.drillDown.expandedCampaigns.indexOf(campaignId);
      if (idx === -1) {
        state.drillDown.expandedCampaigns.push(campaignId);
      } else {
        state.drillDown.expandedCampaigns.splice(idx, 1);
        Object.keys(state.drillDown.expandedDates).forEach((key) => {
          if (key.startsWith(`${campaignId}-`)) {
            delete state.drillDown.expandedDates[key];
          }
        });
        Object.keys(state.drillDown.expandedHours).forEach((key) => {
          if (key.startsWith(`${campaignId}-`)) {
            delete state.drillDown.expandedHours[key];
          }
        });
        Object.keys(state.drillDown.expandedOffers).forEach((key) => {
          if (key.startsWith(`${campaignId}-`)) {
            delete state.drillDown.expandedOffers[key];
          }
        });
      }
    },
    toggleDateExpansion: (state, action) => {
      const { campaignId, dateId } = action.payload;
      const mapKey = `${campaignId}-${dateId}`;
      if (state.drillDown.expandedDates[mapKey]) {
        delete state.drillDown.expandedDates[mapKey];
      } else {
        state.drillDown.expandedDates[mapKey] = true;
      }
    },
    toggleHourExpansion: (state, action) => {
      const { campaignId, dateId, hourId } = action.payload;
      const mapKey = `${campaignId}-${dateId}-${hourId}`;
      if (state.drillDown.expandedHours[mapKey]) {
        delete state.drillDown.expandedHours[mapKey];
      } else {
        state.drillDown.expandedHours[mapKey] = true;
      }
    },
    toggleOfferExpansion: (state, action) => {
      const { campaignId, dateId, hourId, offerId } = action.payload;
      const mapKey = `${campaignId}-${dateId}-${hourId}-${offerId}`;
      if (state.drillDown.expandedOffers[mapKey]) {
        delete state.drillDown.expandedOffers[mapKey];
      } else {
        state.drillDown.expandedOffers[mapKey] = true;
      }
    },
    resetDrillDown: (state) => {
      state.drillDown = initialState.drillDown;
    },

    // Data actions
    setCampaigns: (state, action) => {
      state.campaigns = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
    clearWarning: (state) => {
      state.warning = null;
    },
    setWarning: (state, action) => {
      state.warning = action.payload;
    },
    clearTitleSuggestions: (state) => {
      state.titleSuggestions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campaigns
      .addCase(fetchAllCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.warning = null;
      })
      .addCase(fetchAllCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload.campaigns;
        state.lastUpdated = new Date().toISOString();
        state.drillDown = initialState.drillDown;
        state.tableSettings.page = 1;
      })
      .addCase(fetchAllCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.campaigns = [];
      })

      // Fetch campaigns by account
      .addCase(fetchCampaignsByAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        const newCampaigns = action.payload.campaigns;
        const existingIds = new Set(state.campaigns.map((c) => c.campaignId));
        const uniqueNew = newCampaigns.filter((c) => !existingIds.has(c.campaignId));
        state.campaigns = [...state.campaigns, ...uniqueNew];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCampaignsByAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.warning = action.payload;
      })

      // Fetch ad accounts
      .addCase(fetchAdAccounts.pending, (state) => {
        state.adAccountsLoading = true;
        state.adAccountsError = null;
      })
      .addCase(fetchAdAccounts.fulfilled, (state, action) => {
        state.adAccountsLoading = false;
        state.adAccounts = action.payload;
      })
      .addCase(fetchAdAccounts.rejected, (state, action) => {
        state.adAccountsLoading = false;
        state.adAccountsError = action.payload;
      })

      // Search campaigns by title
      .addCase(searchCampaignsByTitle.pending, (state) => {
        state.titleSearchLoading = true;
      })
      .addCase(searchCampaignsByTitle.fulfilled, (state, action) => {
        state.titleSearchLoading = false;
        state.titleSuggestions = action.payload;
      })
      .addCase(searchCampaignsByTitle.rejected, (state) => {
        state.titleSearchLoading = false;
        state.titleSuggestions = [];
      });
  }
});

export const {
  setFilters,
  setPlatforms,
  setAccounts,
  setStatus,
  setTitle,
  setTags,
  setDateRange,
  setTimeZone,
  resetFilters,
  setRowsPerPage,
  setPage,
  setDensity,
  toggleColumn,
  showAllColumns,
  hideAllColumns,
  setSortConfig,
  resetTableSettings,
  toggleCampaignExpansion,
  toggleDateExpansion,
  toggleHourExpansion,
  toggleOfferExpansion,
  resetDrillDown,
  setCampaigns,
  clearError,
  clearWarning,
  setWarning,
  clearTitleSuggestions
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
