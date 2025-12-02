// src/features/logs/logsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";

// ============ ASYNC THUNKS ============

// Fetch logs from Supabase
export const fetchLogs = createAsyncThunk("logs/fetchLogs", async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from("Adelevate_Action_Log")
      .select(
        "id, email, action, details, created_at, platform, rule_name, rule_conditions, platform_icon"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return rejectWithValue(error.message);
    }

    return data || [];
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Delete a log
export const deleteLog = createAsyncThunk("logs/deleteLog", async (logId, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from("Adelevate_Action_Log").delete().eq("id", logId);

    if (error) {
      return rejectWithValue(error.message);
    }

    return logId;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Bulk delete logs
export const bulkDeleteLogs = createAsyncThunk(
  "logs/bulkDeleteLogs",
  async (logIds, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("Adelevate_Action_Log").delete().in("id", logIds);

      if (error) {
        return rejectWithValue(error.message);
      }

      return logIds;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ============ INITIAL STATE ============

const initialState = {
  logs: [],
  loading: false,
  error: null,

  // Filters & Search
  query: "",
  actionFilter: "all",
  platformFilter: "all",
  dateRange: "all", // 'today', 'week', 'month', 'all'

  // Sorting
  sortBy: { key: "created_at", dir: "desc" },

  // Pagination
  page: 1,
  pageSize: 10,

  // UI State
  viewMode: "table", // 'table' | 'card'
  selectedLogs: [],
  selectedLog: null,

  // Toast
  toastMessage: "",
  showToast: false,
  toastType: "success", // 'success' | 'error' | 'info' | 'warning'

  // Stats
  stats: {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byAction: {},
    byPlatform: {}
  }
};

// ============ SLICE ============

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    // Search & Filters
    setQuery: (state, action) => {
      state.query = action.payload;
      state.page = 1;
    },
    setActionFilter: (state, action) => {
      state.actionFilter = action.payload;
      state.page = 1;
    },
    setPlatformFilter: (state, action) => {
      state.platformFilter = action.payload;
      state.page = 1;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
      state.page = 1;
    },

    // Sorting
    setSortBy: (state, action) => {
      const { key } = action.payload;
      if (state.sortBy.key === key) {
        state.sortBy.dir = state.sortBy.dir === "asc" ? "desc" : "asc";
      } else {
        state.sortBy = { key, dir: "asc" };
      }
    },

    // Pagination
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    nextPage: (state) => {
      state.page += 1;
    },
    prevPage: (state) => {
      if (state.page > 1) state.page -= 1;
    },

    // View Mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Selection
    setSelectedLog: (state, action) => {
      state.selectedLog = action.payload;
    },
    toggleLogSelection: (state, action) => {
      const logId = action.payload;
      const index = state.selectedLogs.indexOf(logId);
      if (index > -1) {
        state.selectedLogs.splice(index, 1);
      } else {
        state.selectedLogs.push(logId);
      }
    },
    selectAllLogs: (state, action) => {
      state.selectedLogs = action.payload;
    },
    clearSelection: (state) => {
      state.selectedLogs = [];
    },

    // Add new log (realtime)
    addLog: (state, action) => {
      state.logs.unshift(action.payload);
      state.stats.total += 1;

      // Update action stats
      const action_type = action.payload.action?.toLowerCase();
      if (action_type) {
        state.stats.byAction[action_type] = (state.stats.byAction[action_type] || 0) + 1;
      }

      // Update platform stats
      const platform = action.payload.platform?.toLowerCase();
      if (platform) {
        state.stats.byPlatform[platform] = (state.stats.byPlatform[platform] || 0) + 1;
      }
    },

    // Toast
    showToastMessage: (state, action) => {
      state.toastMessage = action.payload.message || action.payload;
      state.toastType = action.payload.type || "success";
      state.showToast = true;
    },
    hideToast: (state) => {
      state.showToast = false;
    },

    // Error
    clearError: (state) => {
      state.error = null;
    },

    // Reset filters
    resetFilters: (state) => {
      state.query = "";
      state.actionFilter = "all";
      state.platformFilter = "all";
      state.dateRange = "all";
      state.page = 1;
    },

    // Calculate stats
    calculateStats: (state) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      state.stats = {
        total: state.logs.length,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byAction: {},
        byPlatform: {}
      };

      state.logs.forEach((log) => {
        const logDate = new Date(log.created_at);

        if (logDate >= today) state.stats.today += 1;
        if (logDate >= weekAgo) state.stats.thisWeek += 1;
        if (logDate >= monthAgo) state.stats.thisMonth += 1;

        // Count by action
        const action = log.action?.toLowerCase();
        if (action) {
          state.stats.byAction[action] = (state.stats.byAction[action] || 0) + 1;
        }

        // Count by platform
        const platform = log.platform?.toLowerCase();
        if (platform) {
          state.stats.byPlatform[platform] = (state.stats.byPlatform[platform] || 0) + 1;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        // Calculate stats after fetching
        logsSlice.caseReducers.calculateStats(state);
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete log
      .addCase(deleteLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = state.logs.filter((log) => log.id !== action.payload);
        state.toastMessage = "Log deleted successfully";
        state.toastType = "success";
        state.showToast = true;
        logsSlice.caseReducers.calculateStats(state);
      })
      .addCase(deleteLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toastMessage = "Failed to delete log";
        state.toastType = "error";
        state.showToast = true;
      })

      // Bulk delete logs
      .addCase(bulkDeleteLogs.fulfilled, (state, action) => {
        state.logs = state.logs.filter((log) => !action.payload.includes(log.id));
        state.selectedLogs = [];
        state.toastMessage = `${action.payload.length} logs deleted successfully`;
        state.toastType = "success";
        state.showToast = true;
        logsSlice.caseReducers.calculateStats(state);
      })
      .addCase(bulkDeleteLogs.rejected, (state, action) => {
        state.error = action.payload;
        state.toastMessage = "Failed to delete logs";
        state.toastType = "error";
        state.showToast = true;
      });
  }
});

// ============ ACTIONS ============

export const {
  setQuery,
  setActionFilter,
  setPlatformFilter,
  setDateRange,
  setSortBy,
  setPage,
  setPageSize,
  nextPage,
  prevPage,
  setViewMode,
  setSelectedLog,
  toggleLogSelection,
  selectAllLogs,
  clearSelection,
  addLog,
  showToastMessage,
  hideToast,
  clearError,
  resetFilters,
  calculateStats
} = logsSlice.actions;

// ============ SELECTORS ============

// Basic selectors
export const selectLogs = (state) => state.logs.logs;
export const selectLoading = (state) => state.logs.loading;
export const selectError = (state) => state.logs.error;

// Filter selectors
export const selectQuery = (state) => state.logs.query;
export const selectActionFilter = (state) => state.logs.actionFilter;
export const selectPlatformFilter = (state) => state.logs.platformFilter;
export const selectDateRange = (state) => state.logs.dateRange;

// Sort & Pagination
export const selectSortBy = (state) => state.logs.sortBy;
export const selectPage = (state) => state.logs.page;
export const selectPageSize = (state) => state.logs.pageSize;

// UI State
export const selectViewMode = (state) => state.logs.viewMode;
export const selectSelectedLogs = (state) => state.logs.selectedLogs;
export const selectSelectedLog = (state) => state.logs.selectedLog;

// Toast
export const selectToast = (state) => ({
  show: state.logs.showToast,
  message: state.logs.toastMessage,
  type: state.logs.toastType
});

// Stats
export const selectStats = (state) => state.logs.stats;

// Memoized selectors (for computed data)
export const selectFilteredLogs = (state) => {
  const logs = state.logs.logs;
  const query = state.logs.query.trim().toLowerCase();
  const actionFilter = state.logs.actionFilter;
  const platformFilter = state.logs.platformFilter;
  const dateRange = state.logs.dateRange;

  let filtered = logs;

  // Text search
  if (query) {
    filtered = filtered.filter((log) => {
      return (
        (log.email || "").toLowerCase().includes(query) ||
        (log.action || "").toLowerCase().includes(query) ||
        (log.details || "").toLowerCase().includes(query) ||
        (log.rule_name || "").toLowerCase().includes(query) ||
        (log.platform || "").toLowerCase().includes(query)
      );
    });
  }

  // Action filter
  if (actionFilter !== "all") {
    filtered = filtered.filter((log) => {
      return (log.action || "").toLowerCase() === actionFilter.toLowerCase();
    });
  }

  // Platform filter
  if (platformFilter !== "all") {
    filtered = filtered.filter((log) => {
      return (log.platform || "").toLowerCase() === platformFilter.toLowerCase();
    });
  }

  // Date range filter
  if (dateRange !== "all") {
    const now = new Date();
    let cutoffDate;

    switch (dateRange) {
      case "today":
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = null;
    }

    if (cutoffDate) {
      filtered = filtered.filter((log) => {
        return new Date(log.created_at) >= cutoffDate;
      });
    }
  }

  return filtered;
};

export const selectSortedLogs = (state) => {
  const filtered = selectFilteredLogs(state);
  const { key, dir } = state.logs.sortBy;

  const sorted = [...filtered].sort((a, b) => {
    const va = a?.[key];
    const vb = b?.[key];

    if (key === "created_at") {
      const da = va ? new Date(va).getTime() : 0;
      const db = vb ? new Date(vb).getTime() : 0;
      return dir === "asc" ? da - db : db - da;
    }

    const sa = (va ?? "").toString().toLowerCase();
    const sb = (vb ?? "").toString().toLowerCase();
    if (sa < sb) return dir === "asc" ? -1 : 1;
    if (sa > sb) return dir === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const selectPaginatedLogs = (state) => {
  const sorted = selectSortedLogs(state);
  const page = state.logs.page;
  const pageSize = state.logs.pageSize;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return sorted.slice(startIndex, endIndex);
};

export const selectTotalPages = (state) => {
  const filtered = selectFilteredLogs(state);
  const pageSize = state.logs.pageSize;
  return Math.max(1, Math.ceil(filtered.length / pageSize));
};

export const selectUniqueActions = (state) => {
  const actions = new Set(["add", "edit", "delete", "update", "view", "draft"]);
  state.logs.logs.forEach((log) => {
    if (log.action) actions.add(log.action.toLowerCase());
  });
  return ["all", ...Array.from(actions)].sort();
};

export const selectUniquePlatforms = (state) => {
  const platforms = new Set();
  state.logs.logs.forEach((log) => {
    if (log.platform) platforms.add(log.platform.toLowerCase());
  });
  return ["all", ...Array.from(platforms)].sort();
};

export default logsSlice.reducer;
