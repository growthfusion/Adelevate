// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import filtersReducer from "../features/filters/filtersSlice";
import metricsReducer from "../features/metrics/metricsSlice";
import themeReducer from "../features/theme/themeSlice";
import rulesReducer from "../features/automation/rules/rulesSlice";
import uiReducer from "../features/ui/uiSlice";
import accountsReducer from "../features/addAccount/accountsSlice";
import authorizationReducer from "../features/authorization/authorizationSlice";
import logsReducer from "../features/action_logs/logsSlice"; // NEW

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    metrics: metricsReducer,
    theme: themeReducer,
    rules: rulesReducer,
    ui: uiReducer,
    accounts: accountsReducer,
    authorization: authorizationReducer,
    logs: logsReducer // NEW
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "metrics/fetchMetrics/fulfilled",
          "logs/fetchLogs/fulfilled" // NEW
        ],
        ignoredActionPaths: ["payload.lastUpdated"],
        ignoredPaths: ["metrics.lastUpdated"]
      }
    }),
  devTools: process.env.NODE_ENV !== "production"
});

export default store;
