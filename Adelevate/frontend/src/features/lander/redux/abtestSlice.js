import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as abtestAPI from "./abtestAPI";

// ==================== ASYNC THUNKS ====================
export const fetchTests = createAsyncThunk(
  "abtest/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await abtestAPI.getAllTests(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTestById = createAsyncThunk(
  "abtest/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await abtestAPI.getTestById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTest = createAsyncThunk(
  "abtest/create",
  async (testData, { rejectWithValue }) => {
    try {
      const response = await abtestAPI.createTest(testData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTest = createAsyncThunk(
  "abtest/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await abtestAPI.updateTest(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const endTest = createAsyncThunk(
  "abtest/end",
  async ({ id, winnerId }, { rejectWithValue }) => {
    try {
      const response = await abtestAPI.endTest(id, winnerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTest = createAsyncThunk("abtest/delete", async (id, { rejectWithValue }) => {
  try {
    await abtestAPI.deleteTest(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ==================== INITIAL STATE ====================
const initialState = {
  tests: [],
  currentTest: null,
  stats: {
    total: 0,
    active: 0,
    completed: 0,
    scheduled: 0
  },
  filters: {
    status: "all",
    landerId: null,
    dateRange: "all"
  },
  loading: false,
  actionLoading: false,
  error: null
};

// ==================== SLICE ====================
const abtestSlice = createSlice({
  name: "abtest",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentTest: (state) => {
      state.currentTest = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tests
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload.tests;
        state.stats = action.payload.stats;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchTestById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Test
      .addCase(createTest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.tests.unshift(action.payload);
        state.stats.total += 1;
        state.stats.active += 1;
      })
      .addCase(createTest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // End Test
      .addCase(endTest.fulfilled, (state, action) => {
        const index = state.tests.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.stats.active -= 1;
        state.stats.completed += 1;
      })

      // Delete Test
      .addCase(deleteTest.fulfilled, (state, action) => {
        const test = state.tests.find((t) => t.id === action.payload);
        state.tests = state.tests.filter((t) => t.id !== action.payload);
        state.stats.total -= 1;
        if (test?.status === "active") state.stats.active -= 1;
        if (test?.status === "completed") state.stats.completed -= 1;
      });
  }
});

// ==================== ACTIONS ====================
export const { setFilters, clearFilters, clearCurrentTest, clearError } = abtestSlice.actions;

export default abtestSlice.reducer;

// ==================== SELECTORS ====================
export const selectAllTests = (state) => state.abtest.tests;
export const selectCurrentTest = (state) => state.abtest.currentTest;
export const selectStats = (state) => state.abtest.stats;
export const selectFilters = (state) => state.abtest.filters;
export const selectLoading = (state) => state.abtest.loading;
export const selectError = (state) => state.abtest.error;

export const selectActiveTests = (state) => state.abtest.tests.filter((t) => t.status === "active");

export const selectCompletedTests = (state) =>
  state.abtest.tests.filter((t) => t.status === "completed");
