import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPlatform: "all",
  dateRange: "30d",
  customDateRange: { start: null, end: null },
  autoRefresh: "200"
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSelectedPlatform(state, action) {
      state.selectedPlatform = action.payload;
    },
    setDateRange(state, action) {
      state.dateRange = action.payload.range;
      state.customDateRange = action.payload.customRange || { start: null, end: null };
    },
    setAutoRefresh(state, action) {
      state.autoRefresh = action.payload;
    },
    resetFilters(state) {
      state.selectedPlatform = "all";
      state.dateRange = "30d";
      state.customDateRange = { start: null, end: null };
      state.autoRefresh = "200";
    }
  }
});

export const { setSelectedPlatform, setDateRange, setAutoRefresh, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;

// Selectors
export const selectFilters = (state) => state.filters;
export const selectSelectedPlatform = (state) => state.filters.selectedPlatform;
export const selectDateRange = (state) => state.filters.dateRange;
export const selectCustomDateRange = (state) => state.filters.customDateRange;
export const selectAutoRefresh = (state) => state.filters.autoRefresh;
