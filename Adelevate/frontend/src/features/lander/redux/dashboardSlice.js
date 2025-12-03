import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as dashboardAPI from "./dashboardAPI";

// ==================== ASYNC THUNKS ====================
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (dateRange = "last7days", { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getDashboardData(dateRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopPerformers = createAsyncThunk(
  "dashboard/fetchTopPerformers",
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTopPerformers(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  "dashboard/fetchRecentActivity",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentActivity(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAIInsights = createAsyncThunk(
  "dashboard/fetchAIInsights",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getAIInsights();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  // Key Metrics
  metrics: {
    views: { value: 0, change: 0, trend: "up" },
    clicks: { value: 0, change: 0, trend: "up" },
    revenue: { value: 0, change: 0, trend: "up" },
    roi: { value: 0, change: 0, trend: "up" },
    conversions: { value: 0, change: 0, trend: "up" },
    ctr: { value: 0, change: 0, trend: "up" }
  },

  // Chart Data
  performanceChart: [],

  // Lists
  topPerformers: [],
  needsAttention: [],
  aiInsights: [],
  recentActivity: [],

  // System Status
  systemStatus: {
    allOperational: true,
    activeLanders: 0,
    needsAttentionCount: 0,
    criticalIssues: 0
  },

  // UI State
  dateRange: "last7days",
  sidebarOpen: true,
  autoRefresh: true,
  lastUpdated: null,

  // Loading States
  loading: false,
  metricsLoading: false,
  topPerformersLoading: false,
  activityLoading: false,
  insightsLoading: false,

  error: null
};

// ==================== SLICE ====================
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleAutoRefresh: (state) => {
      state.autoRefresh = !state.autoRefresh;
    },
    updateLastRefresh: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
        state.performanceChart = action.payload.performanceChart;
        state.systemStatus = action.payload.systemStatus;
        state.needsAttention = action.payload.needsAttention;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Top Performers
      .addCase(fetchTopPerformers.pending, (state) => {
        state.topPerformersLoading = true;
      })
      .addCase(fetchTopPerformers.fulfilled, (state, action) => {
        state.topPerformersLoading = false;
        state.topPerformers = action.payload;
      })
      .addCase(fetchTopPerformers.rejected, (state, action) => {
        state.topPerformersLoading = false;
        state.error = action.payload;
      })

      // Fetch Recent Activity
      .addCase(fetchRecentActivity.pending, (state) => {
        state.activityLoading = true;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.activityLoading = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.activityLoading = false;
        state.error = action.payload;
      })

      // Fetch AI Insights
      .addCase(fetchAIInsights.pending, (state) => {
        state.insightsLoading = true;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.aiInsights = action.payload;
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.insightsLoading = false;
        state.error = action.payload;
      });
  }
});

// ==================== ACTIONS ====================
export const {
  setDateRange,
  toggleSidebar,
  setSidebarOpen,
  toggleAutoRefresh,
  updateLastRefresh,
  clearError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// ==================== SELECTORS ====================
export const selectMetrics = (state) => state.landerDashboard.metrics;
export const selectPerformanceChart = (state) => state.landerDashboard.performanceChart;
export const selectTopPerformers = (state) => state.landerDashboard.topPerformers;
export const selectNeedsAttention = (state) => state.landerDashboard.needsAttention;
export const selectAIInsights = (state) => state.landerDashboard.aiInsights;
export const selectRecentActivity = (state) => state.landerDashboard.recentActivity;
export const selectSystemStatus = (state) => state.landerDashboard.systemStatus;
export const selectDateRange = (state) => state.landerDashboard.dateRange;
export const selectSidebarOpen = (state) => state.landerDashboard.sidebarOpen;
export const selectLoading = (state) => state.landerDashboard.loading;
export const selectLastUpdated = (state) => state.landerDashboard.lastUpdated;
