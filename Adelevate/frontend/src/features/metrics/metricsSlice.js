import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ============ HELPER FUNCTIONS ============

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

// Helper to normalize platform names from API response
const normalizePlatformFromDB = (platformRaw) => {
  if (!platformRaw) return "";
  const platform = String(platformRaw).toLowerCase().trim();

  if (platform === "meta" || platform === "fb" || platform === "facebook") {
    return "facebook";
  } else if (platform === "snapchat" || platform === "snap") {
    return "snapchat";
  } else if (platform === "tiktok") {
    return "tiktok";
  } else if (platform === "google" || platform === "google-ads" || platform === "googleads") {
    return "google-ads";
  } else if (platform === "newsbreak") {
    return "newsbreak";
  }

  return platform;
};

// Helper to extract campaigns from various API response formats
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
  } else if (data?.items && Array.isArray(data.items)) {
    campaigns = data.items;
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

// All supported platforms
const ALL_PLATFORMS = ["facebook", "snapchat", "tiktok", "google-ads", "newsbreak"];

// Create empty platform metrics object
const createEmptyPlatformMetrics = () => ({
  spend: 0,
  revenue: 0,
  profit: 0,
  roi: 0,
  clicks: 0,
  conversions: 0,
  cpa: 0,
  epc: 0,
  impressions: 0
});

// Create empty totals object
const createEmptyTotals = () => ({
  spend: 0,
  revenue: 0,
  profit: 0,
  roi: 0,
  clicks: 0,
  conversions: 0,
  cpa: 0,
  epc: 0
});

// ============ ASYNC THUNK ============

export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async ({ dateRange, customDateRange }, thunkAPI) => {
    try {
      const apiBase = getApiBaseUrl();

      // Build endpoint with date parameters if needed
      let endpoint = `${apiBase}/active`;

      // Add date range parameters if custom dates are provided
      if (dateRange === "custom" && customDateRange?.start && customDateRange?.end) {
        const params = new URLSearchParams({
          startDate: customDateRange.start,
          endDate: customDateRange.end
        });
        endpoint = `${endpoint}?${params.toString()}`;
      }

      console.log(`📊 Metrics: Fetching from ${endpoint}`);

      const response = await fetch(endpoint, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const allCampaigns = extractCampaignsFromResponse(data);

      console.log(`✅ Metrics: Fetched ${allCampaigns.length} campaigns`);

      // Initialize aggregated data for all platforms
      const aggregatedData = {};
      ALL_PLATFORMS.forEach((platform) => {
        aggregatedData[platform] = createEmptyPlatformMetrics();
      });

      // Process campaigns and group by platform
      allCampaigns.forEach((campaign) => {
        const platform = normalizePlatformFromDB(campaign.platform);

        if (!ALL_PLATFORMS.includes(platform)) {
          return;
        }

        // Extract metrics from campaign (handle different field names)
        const spend = parseFloat(campaign.spend || campaign.cost || 0);
        const revenue = parseFloat(campaign.revenue || 0);
        const profit =
          campaign.profit !== undefined && campaign.profit !== null
            ? parseFloat(campaign.profit)
            : revenue - spend;
        const clicks = parseInt(campaign.clicks || 0, 10);
        const conversions = parseInt(campaign.conversions || campaign.purchases || 0, 10);
        const impressions = parseInt(campaign.impressions || 0, 10);

        // Accumulate metrics by platform
        const m = aggregatedData[platform];
        m.spend += spend;
        m.revenue += revenue;
        m.profit += profit;
        m.clicks += clicks;
        m.conversions += conversions;
        m.impressions += impressions;
      });

      // Calculate derived metrics for each platform and totals
      const totals = createEmptyTotals();

      Object.values(aggregatedData).forEach((m) => {
        // Calculate ROI: (Profit / Spend) * 100
        m.roi = m.spend > 0 ? parseFloat(((m.profit / m.spend) * 100).toFixed(2)) : 0;

        // Calculate CPA: Spend / Conversions
        m.cpa = m.conversions > 0 ? parseFloat((m.spend / m.conversions).toFixed(2)) : 0;

        // Calculate EPC: Revenue / Clicks
        m.epc = m.clicks > 0 ? parseFloat((m.revenue / m.clicks).toFixed(2)) : 0;

        // Accumulate totals
        totals.spend += m.spend;
        totals.revenue += m.revenue;
        totals.profit += m.profit;
        totals.clicks += m.clicks;
        totals.conversions += m.conversions;
      });

      // Calculate derived metrics for totals
      totals.roi =
        totals.spend > 0 ? parseFloat(((totals.profit / totals.spend) * 100).toFixed(2)) : 0;
      totals.cpa =
        totals.conversions > 0 ? parseFloat((totals.spend / totals.conversions).toFixed(2)) : 0;
      totals.epc = totals.clicks > 0 ? parseFloat((totals.revenue / totals.clicks).toFixed(2)) : 0;

      console.log("📈 Metrics: Aggregated data:", aggregatedData);
      console.log("📊 Metrics: Totals:", totals);

      return {
        platformData: aggregatedData,
        totals,
        lastUpdated: new Date().toISOString()
      };
    } catch (err) {
      console.error("❌ Metrics fetch error:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to load data");
    }
  }
);

// ============ SLICE ============

const initialState = {
  platformData: {},
  totals: createEmptyTotals(),
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  lastUpdated: null
};

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    clearMetrics(state) {
      state.platformData = {};
      state.totals = createEmptyTotals();
      state.status = "idle";
      state.error = null;
      state.lastUpdated = null;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.platformData = action.payload.platformData;
        state.totals = action.payload.totals;
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load data";
      });
  }
});

export const { clearMetrics, clearError } = metricsSlice.actions;

export default metricsSlice.reducer;

// Selectors
export const selectMetrics = (state) => state.metrics;
export const selectPlatformData = (state) => state.metrics.platformData;
export const selectTotals = (state) => state.metrics.totals;
export const selectMetricsStatus = (state) => state.metrics.status;
export const selectMetricsError = (state) => state.metrics.error;
export const selectLastUpdated = (state) => state.metrics.lastUpdated;
export const selectIsLoading = (state) => state.metrics.status === "loading";

// Select metrics for a specific platform
export const selectPlatformMetrics = (platform) => (state) => {
  if (platform === "all") {
    return state.metrics.totals;
  }
  return state.metrics.platformData[platform] || createEmptyPlatformMetrics();
};
