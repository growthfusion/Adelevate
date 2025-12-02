// src/features/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  theme: "dark",
  activeModal: null // "createRule" | "logDetails" | etc
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setActiveModal(state, action) {
      state.activeModal = action.payload; // or null
    }
  }
});

export const { toggleSidebar, setTheme, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
