// src/features/rules/rulesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedRules: [],
  searchQuery: "",
  currentPage: 1,
  rowsPerPage: 10,
  sortBy: "name",
  sortOrder: "asc"
};

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    setSelectedRules(state, action) {
      state.selectedRules = action.payload;
    },
    toggleRuleSelection(state, action) {
      const ruleKey = action.payload;
      const index = state.selectedRules.indexOf(ruleKey);
      if (index > -1) {
        state.selectedRules.splice(index, 1);
      } else {
        state.selectedRules.push(ruleKey);
      }
    },
    clearSelectedRules(state) {
      state.selectedRules = [];
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page on search
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setRowsPerPage(state, action) {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action) {
      state.sortOrder = action.payload;
    },
    resetRulesState(state) {
      return initialState;
    }
  }
});

export const {
  setSelectedRules,
  toggleRuleSelection,
  clearSelectedRules,
  setSearchQuery,
  setCurrentPage,
  setRowsPerPage,
  setSortBy,
  setSortOrder,
  resetRulesState
} = rulesSlice.actions;

export default rulesSlice.reducer;

// Selectors
export const selectSelectedRules = (state) => state.rules.selectedRules;
export const selectSearchQuery = (state) => state.rules.searchQuery;
export const selectCurrentPage = (state) => state.rules.currentPage;
export const selectRowsPerPage = (state) => state.rules.rowsPerPage;
export const selectSortBy = (state) => state.rules.sortBy;
export const selectSortOrder = (state) => state.rules.sortOrder;
