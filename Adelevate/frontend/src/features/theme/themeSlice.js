// src/features/theme/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Import theme configurations
import { darkTheme, lightTheme, defaultTheme } from "@/constants/themes";

// ============ STORAGE KEY ============
const THEME_STORAGE_KEY = "app-theme-mode";

// ============ HELPER FUNCTIONS ============

/**
 * Get initial theme from localStorage or default
 * @returns {string} - "dark" or "light"
 */
const getInitialTheme = () => {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  try {
    // Try to get from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      console.log("[Theme] Loaded from localStorage:", savedTheme);
      return savedTheme;
    }

    // Optional: Check system preference if no saved theme
    // const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // return prefersDark ? "dark" : "light";

    // Return default theme if nothing is saved
    console.log("[Theme] Using default:", defaultTheme);
    return defaultTheme;
  } catch (error) {
    console.warn("[Theme] Could not access localStorage:", error);
    return defaultTheme;
  }
};

/**
 * Save theme to localStorage
 * @param {string} theme - "dark" or "light"
 */
const saveThemeToStorage = (theme) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    console.log("[Theme] Saved to localStorage:", theme);
  } catch (error) {
    console.warn("[Theme] Could not save to localStorage:", error);
  }
};

/**
 * Apply theme to document
 * @param {string} theme - "dark" or "light"
 */
const applyThemeToDocument = (theme) => {
  if (typeof window === "undefined") return;

  try {
    const root = document.documentElement;

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(theme);

    // Set data attribute for CSS selectors
    root.setAttribute("data-theme", theme);

    console.log("[Theme] Applied to document:", theme);
  } catch (error) {
    console.warn("[Theme] Could not apply to document:", error);
  }
};

// ============ INITIAL STATE ============
const initialTheme = getInitialTheme();

// Apply initial theme to document immediately
if (typeof window !== "undefined") {
  applyThemeToDocument(initialTheme);
}

const initialState = {
  mode: initialTheme // "dark" | "light"
};

// ============ SLICE ============
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      const newTheme = state.mode === "dark" ? "light" : "dark";
      state.mode = newTheme;

      // Persist to localStorage
      saveThemeToStorage(newTheme);

      // Apply to document
      applyThemeToDocument(newTheme);
    },

    setThemeMode(state, action) {
      const theme = action.payload;

      // Validate theme value
      if (theme !== "dark" && theme !== "light") {
        console.warn(`[Theme] Invalid mode: ${theme}. Using current.`);
        return;
      }

      state.mode = theme;

      // Persist to localStorage
      saveThemeToStorage(theme);

      // Apply to document
      applyThemeToDocument(theme);
    },

    // Initialize theme from storage (useful for SSR hydration)
    initializeTheme(state) {
      const savedTheme = getInitialTheme();
      state.mode = savedTheme;
      applyThemeToDocument(savedTheme);
    }
  }
});

// ============ ACTIONS ============
export const { toggleTheme, setThemeMode, initializeTheme } = themeSlice.actions;

// ============ SELECTORS ============

// Basic selectors
export const selectThemeMode = (state) => state.theme.mode;
export const selectIsDarkMode = (state) => state.theme.mode === "dark";
export const selectIsLightMode = (state) => state.theme.mode === "light";

// Alias for backward compatibility
export const selectCurrentTheme = selectThemeMode;

// Theme colors selector - returns the complete theme object
export const selectThemeColors = (state) => {
  return state.theme.mode === "dark" ? darkTheme : lightTheme;
};

// Individual theme property selectors (optimized)
export const selectBgMain = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.bgMain;
};

export const selectBgSecondary = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.bgSecondary;
};

export const selectBgCard = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.bgCard;
};

export const selectTextPrimary = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.textPrimary;
};

export const selectTextSecondary = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.textSecondary;
};

export const selectAccentColor = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.blue;
};

export const selectBorderSubtle = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.borderSubtle;
};

export const selectBorderPrimary = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.borderSubtle;
};

export const selectShadowSoft = (state) => {
  const theme = state.theme.mode === "dark" ? darkTheme : lightTheme;
  return theme.shadowSoft;
};

// ============ EXPORT REDUCER ============
export default themeSlice.reducer;
