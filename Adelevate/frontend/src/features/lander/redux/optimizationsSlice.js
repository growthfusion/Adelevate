import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as optimizationsAPI from "./optimizationsAPI";

// ==================== ASYNC THUNKS ====================
export const fetchSuggestions = createAsyncThunk(
  "optimizations/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await optimizationsAPI.getSuggestions(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const implementSuggestion = createAsyncThunk(
  "optimizations/implement",
  async (id, { rejectWithValue }) => {
    try {
      const response = await optimizationsAPI.implementSuggestion(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const dismissSuggestion = createAsyncThunk(
  "optimizations/dismiss",
  async (id, { rejectWithValue }) => {
    try {
      await optimizationsAPI.dismissSuggestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const scheduleSuggestion = createAsyncThunk(
  "optimizations/schedule",
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const response = await optimizationsAPI.scheduleSuggestion(id, date);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  suggestions: [],
  stats: {
    total: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    implemented: 0,
    dismissed: 0
  },
  filters: {
    priority: "all",
    landerId: null,
    status: "pending"
  },
  nextAnalysis: null,
  loading: false,
  actionLoading: false,
  error: null
};

// ==================== SLICE ====================
const optimizationsSlice = createSlice({
  name: "optimizations",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload.suggestions;
        state.stats = action.payload.stats;
        state.nextAnalysis = action.payload.nextAnalysis;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Implement
      .addCase(implementSuggestion.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(implementSuggestion.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.suggestions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.suggestions[index].status = "implemented";
        }
        state.stats.implemented += 1;
      })
      .addCase(implementSuggestion.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Dismiss
      .addCase(dismissSuggestion.fulfilled, (state, action) => {
        state.suggestions = state.suggestions.filter((s) => s.id !== action.payload);
        state.stats.dismissed += 1;
        state.stats.total -= 1;
      })

      // Schedule
      .addCase(scheduleSuggestion.fulfilled, (state, action) => {
        const index = state.suggestions.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.suggestions[index].status = "scheduled";
          state.suggestions[index].scheduledDate = action.payload.scheduledDate;
        }
      });
  }
});

// ==================== ACTIONS ====================
export const { setFilters, clearFilters } = optimizationsSlice.actions;

export default optimizationsSlice.reducer;

// ==================== SELECTORS ====================
export const selectAllSuggestions = (state) => state.optimizations.suggestions;
export const selectStats = (state) => state.optimizations.stats;
export const selectFilters = (state) => state.optimizations.filters;
export const selectLoading = (state) => state.optimizations.loading;
export const selectNextAnalysis = (state) => state.optimizations.nextAnalysis;

export const selectHighPrioritySuggestions = (state) =>
  state.optimizations.suggestions.filter((s) => s.priority === "high");

export const selectSuggestionsByLander = (landerId) => (state) =>
  state.optimizations.suggestions.filter((s) => s.landerId === landerId);
