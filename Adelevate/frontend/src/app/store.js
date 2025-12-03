import { configureStore } from "@reduxjs/toolkit";

// Existing reducers
import filtersReducer from "../features/filters/filtersSlice";
import metricsReducer from "../features/metrics/metricsSlice";
import themeReducer from "../features/theme/themeSlice";
import rulesReducer from "../features/automation/rules/rulesSlice";
import uiReducer from "../features/ui/uiSlice";
import accountsReducer from "../features/addAccount/accountsSlice";
import authorizationReducer from "../features/authorization/authorizationSlice";
import logsReducer from "../features/action_logs/logsSlice";
import campaignsReducer from "../features/campaigns/campaignsSlice";

// New Lander System reducers
import landerReducer from "../features/lander/redux/landerSlice";
import dashboardReducer from "../features/lander/redux/dashboardSlice";
import abtestReducer from "../features/lander/redux/abtestSlice";
import optimizationsReducer from "../features/lander/redux/optimizationsSlice";
import analyticsReducer from "../features/lander/redux/analyticsSlice";

export const store = configureStore({
  reducer: {
    // Existing features
    filters: filtersReducer,
    metrics: metricsReducer,
    theme: themeReducer,
    rules: rulesReducer,
    ui: uiReducer,
    accounts: accountsReducer,
    authorization: authorizationReducer,
    logs: logsReducer,
    campaigns: campaignsReducer,

    // New Lander Management features
    lander: landerReducer,
    landerDashboard: dashboardReducer,
    abtest: abtestReducer,
    optimizations: optimizationsReducer,
    analytics: analyticsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignored actions
        ignoredActions: [
          // Existing ignored actions
          "metrics/fetchMetrics/fulfilled",
          "logs/fetchLogs/fulfilled",
          "campaigns/fetchAll/fulfilled",
          "campaigns/fetchAll/pending",
          "campaigns/fetchByAccount/fulfilled",
          "campaigns/fetchAdAccounts/fulfilled",
          "campaigns/searchByTitle/fulfilled",
          "campaigns/setDateRange",

          // New Lander system ignored actions
          "lander/fetchLanders/fulfilled",
          "lander/fetchLanders/pending",
          "lander/fetchLanderById/fulfilled",
          "lander/createLander/fulfilled",
          "lander/updateLander/fulfilled",
          "dashboard/fetchDashboardData/fulfilled",
          "analytics/fetchAnalytics/fulfilled",
          "analytics/fetchAnalytics/pending",
          "analytics/updateRealtimeData",
          "abtest/fetchTests/fulfilled",
          "abtest/createTest/fulfilled",
          "abtest/updateTest/fulfilled",
          "optimizations/fetchSuggestions/fulfilled"
        ],

        // Ignored action paths
        ignoredActionPaths: [
          // Existing paths
          "payload.lastUpdated",
          "payload.startDate",
          "payload.endDate",
          "meta.arg.startDate",
          "meta.arg.endDate",

          // New Lander system paths
          "payload.createdAt",
          "payload.updatedAt",
          "payload.analytics.lastUpdated",
          "payload.landers.createdAt",
          "payload.landers.updatedAt",
          "meta.arg.dateRange",
          "meta.arg.filters.dateRange"
        ],

        // Ignored state paths
        ignoredPaths: [
          // Existing paths
          "metrics.lastUpdated",
          "campaigns.lastUpdated",
          "campaigns.filters.dateRange",

          // New Lander system paths
          "lander.landers",
          "lander.currentLander.createdAt",
          "lander.currentLander.updatedAt",
          "dashboard.lastUpdated",
          "analytics.lastUpdated",
          "analytics.metrics.lastUpdated",
          "abtest.tests",
          "optimizations.suggestions"
        ]
      }
    }),

  devTools: process.env.NODE_ENV !== "production"
});

export default store;
