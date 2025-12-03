import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as analyticsAPI from "./analyticsAPI";

// ==================== ASYNC THUNKS ====================
export const fetchAnalytics = createAsyncThunk(
  "analytics/fetch",
  async ({ landerId, dateRange } = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getAnalytics(landerId, dateRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRealtimeData = createAsyncThunk(
  "analytics/fetchRealtime",
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getRealtimeData();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  // Aggregate Metrics
  metrics: {
    views: { value: 0, change: 0 },
    uniqueVisitors: { value: 0, change: 0 },
    clicks: { value: 0, change: 0 },
    ctr: { value: 0, change: 0 },
    conversions: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    revenue: { value: 0, change: 0 },
    roi: { value: 0, change: 0 }
  },

  // Charts
  trendsChart: [],
  trafficSources: [],
  deviceBreakdown: [],
  countryBreakdown: [],
  funnel: [],

  // Realtime
  realtime: {
    activeUsers: 0,
    clicksLast30Min: 0,
    conversionsLast30Min: 0,
    topActiveLanders: []
  },

  // Filters
  filters: {
    landerId: null,
    dateRange: "last30days",
    compareMode: false,
    comparePeriod: null
  },

  // UI State
  selectedTab: "overview",
  autoRefresh: true,
  loading: false,
  error: null,
  lastUpdated: null
};

// ==================== SLICE ====================
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setLanderId: (state, action) => {
      state.filters.landerId = action.payload;
    },
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    toggleCompareMode: (state) => {
      state.filters.compareMode = !state.filters.compareMode;
    },
    updateRealtimeData: (state, action) => {
      state.realtime = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.trendsChart = action.payload.trendsChart;
        state.trafficSources = action.payload.trafficSources;
        state.deviceBreakdown = action.payload.deviceBreakdown;
        state.countryBreakdown = action.payload.countryBreakdown;
        state.funnel = action.payload.funnel;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Realtime
      .addCase(fetchRealtimeData.fulfilled, (state, action) => {
        state.realtime = action.payload;
      });
  }
});

// ==================== ACTIONS ====================
export const {
  setDateRange,
  setLanderId,
  setSelectedTab,
  toggleCompareMode,
  updateRealtimeData,
  clearFilters
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

// ==================== SELECTORS ====================
export const selectMetrics = (state) => state.analytics.metrics;
export const selectTrendsChart = (state) => state.analytics.trendsChart;
export const selectTrafficSources = (state) => state.analytics.trafficSources;
export const selectDeviceBreakdown = (state) => state.analytics.deviceBreakdown;
export const selectCountryBreakdown = (state) => state.analytics.countryBreakdown;
export const selectFunnel = (state) => state.analytics.funnel;
export const selectRealtime = (state) => state.analytics.realtime;
export const selectFilters = (state) => state.analytics.filters;
export const selectLoading = (state) => state.analytics.loading;
