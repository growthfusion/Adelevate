import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as landerAPI from "./landerAPI";

// ==================== ASYNC THUNKS ====================
export const fetchLanders = createAsyncThunk(
  "lander/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await landerAPI.getAllLanders(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchLanderById = createAsyncThunk(
  "lander/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await landerAPI.getLanderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createLander = createAsyncThunk(
  "lander/create",
  async (landerData, { rejectWithValue }) => {
    try {
      const response = await landerAPI.createLander(landerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateLander = createAsyncThunk(
  "lander/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await landerAPI.updateLander(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteLander = createAsyncThunk("lander/delete", async (id, { rejectWithValue }) => {
  try {
    await landerAPI.deleteLander(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const toggleLanderStatus = createAsyncThunk(
  "lander/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await landerAPI.updateLanderStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  landers: [],
  currentLander: null,
  selectedLanders: [],
  stats: {
    total: 0,
    active: 0,
    paused: 0,
    testing: 0,
    needsAttention: 0
  },
  filters: {
    search: "",
    status: "all",
    audience: "all",
    performance: "all",
    dateRange: "last7days",
    sortBy: "performance",
    sortOrder: "desc"
  },
  viewMode: "list",
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  loading: false,
  actionLoading: false,
  error: null
};

// ==================== SLICE ====================
const landerSlice = createSlice({
  name: "lander",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    toggleLanderSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedLanders.indexOf(id);
      if (index > -1) {
        state.selectedLanders.splice(index, 1);
      } else {
        state.selectedLanders.push(id);
      }
    },
    selectAllAction: (state) => {
      // ✅ Renamed
      state.selectedLanders = state.landers.map((l) => l.id);
    },
    clearSelection: (state) => {
      state.selectedLanders = [];
    },
    clearCurrentLander: (state) => {
      state.currentLander = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanders.fulfilled, (state, action) => {
        state.loading = false;
        state.landers = action.payload.landers;
        state.stats = action.payload.stats;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchLanders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch landers";
      })
      .addCase(fetchLanderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLander = action.payload;
      })
      .addCase(fetchLanderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch lander";
      })
      .addCase(createLander.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createLander.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.landers.unshift(action.payload);
        state.stats.total += 1;
        state.stats.active += 1;
      })
      .addCase(createLander.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || "Failed to create lander";
      })
      .addCase(updateLander.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateLander.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.landers.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.landers[index] = action.payload;
        }
        if (state.currentLander?.id === action.payload.id) {
          state.currentLander = action.payload;
        }
      })
      .addCase(updateLander.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || "Failed to update lander";
      })
      .addCase(deleteLander.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteLander.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.landers = state.landers.filter((l) => l.id !== action.payload);
        state.stats.total -= 1;
      })
      .addCase(deleteLander.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || "Failed to delete lander";
      })
      .addCase(toggleLanderStatus.fulfilled, (state, action) => {
        const index = state.landers.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.landers[index].status = action.payload.status;
        }
      });
  }
});

// ==================== EXPORT ACTIONS ====================
export const {
  setFilters,
  resetFilters,
  setSearchTerm,
  setViewMode,
  toggleLanderSelection,
  selectAllAction, // ✅ This is an ACTION
  clearSelection,
  clearCurrentLander,
  setPage,
  clearError
} = landerSlice.actions;

export default landerSlice.reducer;

// ==================== SELECTORS ====================
export const selectAllLanders = (state) => state.lander.landers;
export const selectCurrentLander = (state) => state.lander.currentLander;
export const selectLanderStats = (state) => state.lander.stats;
export const selectFilters = (state) => state.lander.filters;
export const selectSelectedLanders = (state) => state.lander.selectedLanders;
export const selectLoading = (state) => state.lander.loading;
export const selectError = (state) => state.lander.error;
export const selectViewMode = (state) => state.lander.viewMode;
export const selectPagination = (state) => state.lander.pagination;
