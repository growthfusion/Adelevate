// src/features/theme/themeSlice.js
import { createSlice, createSelector } from "@reduxjs/toolkit";

// Import theme configurations
import { darkTheme, lightTheme, defaultTheme } from "@/constants/themes";

// ============ STORAGE KEY ============
const THEME_STORAGE_KEY = "app-theme-mode";

// ============ HELPER FUNCTIONS ============

/**
 * Check if we're in browser environment
 * @returns {boolean}
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * Get initial theme from localStorage or system preference
 * @returns {string} - "dark" or "light"
 */
const getInitialTheme = () => {
  if (!isBrowser()) {
    return defaultTheme;
  }

  try {
    // 1. Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    // 2. Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme = prefersDark ? "dark" : "light";

    // Save system preference to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, systemTheme);

    return systemTheme;
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
  if (!isBrowser()) return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("[Theme] Could not save to localStorage:", error);
  }
};

/**
 * Apply theme to document root
 * @param {string} theme - "dark" or "light"
 */
const applyThemeToDocument = (theme) => {
  if (!isBrowser()) return;

  try {
    const root = document.documentElement;
    const body = document.body;

    // Remove old theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(theme);
    body.classList.add(theme);

    // Set data attribute for CSS selectors
    root.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = theme === "dark" ? darkTheme : lightTheme;
      metaThemeColor.setAttribute("content", themeColors.bgMain);
    }

    // Update color-scheme for native elements
    root.style.colorScheme = theme;
  } catch (error) {
    console.warn("[Theme] Could not apply to document:", error);
  }
};

/**
 * Apply CSS variables to document
 * @param {string} theme - "dark" or "light"
 */
const applyCSSVariables = (theme) => {
  if (!isBrowser()) return;

  try {
    const themeColors = theme === "dark" ? darkTheme : lightTheme;
    const root = document.documentElement;

    // Apply all theme colors as CSS variables
    Object.entries(themeColors).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--${key}`, value);
      } else if (typeof value === "object" && value !== null) {
        // Handle nested objects like platformBg
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          root.style.setProperty(`--${key}-${nestedKey}`, nestedValue);
        });
      }
    });
  } catch (error) {
    console.warn("[Theme] Could not apply CSS variables:", error);
  }
};

/**
 * Listen for system theme changes
 * @param {function} callback - Callback when system theme changes
 * @returns {function} - Cleanup function
 */
export const listenToSystemTheme = (callback) => {
  if (!isBrowser()) return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e) => {
    const newTheme = e.matches ? "dark" : "light";
    callback(newTheme);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }

  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
};

// ============ INITIAL STATE ============
const initialTheme = getInitialTheme();

// Apply initial theme to document immediately (before React renders)
if (isBrowser()) {
  applyThemeToDocument(initialTheme);
  applyCSSVariables(initialTheme);
}

const initialState = {
  mode: initialTheme, // "dark" | "light"
  systemPreference: isBrowser()
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : "dark",
  followSystem: false // Whether to automatically follow system preference
};

// ============ SLICE ============
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    /**
     * Toggle between dark and light theme
     */
    toggleTheme(state) {
      const newTheme = state.mode === "dark" ? "light" : "dark";
      state.mode = newTheme;
      state.followSystem = false; // Disable follow system when manually toggling

      saveThemeToStorage(newTheme);
      applyThemeToDocument(newTheme);
      applyCSSVariables(newTheme);
    },

    /**
     * Set specific theme mode
     * @param {string} action.payload - "dark" or "light"
     */
    setThemeMode(state, action) {
      const theme = action.payload;

      if (theme !== "dark" && theme !== "light") {
        console.warn(`[Theme] Invalid mode: ${theme}. Ignoring.`);
        return;
      }

      if (state.mode === theme) return; // No change needed

      state.mode = theme;
      state.followSystem = false;

      saveThemeToStorage(theme);
      applyThemeToDocument(theme);
      applyCSSVariables(theme);
    },

    /**
     * Set theme to dark
     */
    setDarkMode(state) {
      if (state.mode === "dark") return;

      state.mode = "dark";
      state.followSystem = false;

      saveThemeToStorage("dark");
      applyThemeToDocument("dark");
      applyCSSVariables("dark");
    },

    /**
     * Set theme to light
     */
    setLightMode(state) {
      if (state.mode === "light") return;

      state.mode = "light";
      state.followSystem = false;

      saveThemeToStorage("light");
      applyThemeToDocument("light");
      applyCSSVariables("light");
    },

    /**
     * Update system preference (called when system theme changes)
     * @param {string} action.payload - "dark" or "light"
     */
    setSystemPreference(state, action) {
      const preference = action.payload;

      if (preference !== "dark" && preference !== "light") return;

      state.systemPreference = preference;

      // If following system, update the theme
      if (state.followSystem) {
        state.mode = preference;
        saveThemeToStorage(preference);
        applyThemeToDocument(preference);
        applyCSSVariables(preference);
      }
    },

    /**
     * Toggle follow system preference
     */
    toggleFollowSystem(state) {
      state.followSystem = !state.followSystem;

      if (state.followSystem) {
        // Sync with system preference
        state.mode = state.systemPreference;
        saveThemeToStorage(state.systemPreference);
        applyThemeToDocument(state.systemPreference);
        applyCSSVariables(state.systemPreference);
      }
    },

    /**
     * Set follow system preference
     * @param {boolean} action.payload
     */
    setFollowSystem(state, action) {
      state.followSystem = Boolean(action.payload);

      if (state.followSystem) {
        state.mode = state.systemPreference;
        saveThemeToStorage(state.systemPreference);
        applyThemeToDocument(state.systemPreference);
        applyCSSVariables(state.systemPreference);
      }
    },

    /**
     * Initialize theme from storage (useful for SSR hydration)
     */
    initializeTheme(state) {
      const savedTheme = getInitialTheme();
      state.mode = savedTheme;

      if (isBrowser()) {
        state.systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      applyThemeToDocument(savedTheme);
      applyCSSVariables(savedTheme);
    },

    /**
     * Hydrate theme state (for SSR)
     * @param {object} action.payload - { mode, followSystem }
     */
    hydrateTheme(state, action) {
      const { mode, followSystem } = action.payload || {};

      if (mode === "dark" || mode === "light") {
        state.mode = mode;
      }

      if (typeof followSystem === "boolean") {
        state.followSystem = followSystem;
      }

      applyThemeToDocument(state.mode);
      applyCSSVariables(state.mode);
    }
  }
});

// ============ ACTIONS ============
export const {
  toggleTheme,
  setThemeMode,
  setDarkMode,
  setLightMode,
  setSystemPreference,
  toggleFollowSystem,
  setFollowSystem,
  initializeTheme,
  hydrateTheme
} = themeSlice.actions;

// ============ BASE SELECTORS ============
const selectThemeState = (state) => state.theme;

// ============ MEMOIZED SELECTORS ============

/**
 * Select current theme mode
 */
export const selectThemeMode = createSelector([selectThemeState], (theme) => theme.mode);

/**
 * Select if dark mode is active
 */
export const selectIsDarkMode = createSelector(
  [selectThemeState],
  (theme) => theme.mode === "dark"
);

/**
 * Select if light mode is active
 */
export const selectIsLightMode = createSelector(
  [selectThemeState],
  (theme) => theme.mode === "light"
);

/**
 * Select system preference
 */
export const selectSystemPreference = createSelector(
  [selectThemeState],
  (theme) => theme.systemPreference
);

/**
 * Select if following system preference
 */
export const selectFollowSystem = createSelector([selectThemeState], (theme) => theme.followSystem);

/**
 * Select complete theme colors object
 */
export const selectThemeColors = createSelector([selectThemeMode], (mode) =>
  mode === "dark" ? darkTheme : lightTheme
);

/**
 * Alias for backward compatibility
 */
export const selectCurrentTheme = selectThemeMode;

// ============ INDIVIDUAL COLOR SELECTORS ============
// These are memoized to prevent unnecessary re-renders

export const selectBgMain = createSelector([selectThemeColors], (colors) => colors.bgMain);

export const selectBgSecondary = createSelector(
  [selectThemeColors],
  (colors) => colors.bgSecondary
);

export const selectBgCard = createSelector([selectThemeColors], (colors) => colors.bgCard);

export const selectBgCardHover = createSelector(
  [selectThemeColors],
  (colors) => colors.bgCardHover
);

export const selectBgMuted = createSelector([selectThemeColors], (colors) => colors.bgMuted);

export const selectBgInput = createSelector([selectThemeColors], (colors) => colors.bgInput);

export const selectBgDropdown = createSelector([selectThemeColors], (colors) => colors.bgDropdown);

export const selectBgTooltip = createSelector([selectThemeColors], (colors) => colors.bgTooltip);

export const selectBgModal = createSelector([selectThemeColors], (colors) => colors.bgModal);

export const selectTextPrimary = createSelector(
  [selectThemeColors],
  (colors) => colors.textPrimary
);

export const selectTextSecondary = createSelector(
  [selectThemeColors],
  (colors) => colors.textSecondary
);

export const selectTextTertiary = createSelector(
  [selectThemeColors],
  (colors) => colors.textTertiary
);

export const selectTextMuted = createSelector([selectThemeColors], (colors) => colors.textMuted);

export const selectTextPlaceholder = createSelector(
  [selectThemeColors],
  (colors) => colors.textPlaceholder
);

export const selectBorderSubtle = createSelector(
  [selectThemeColors],
  (colors) => colors.borderSubtle
);

export const selectBorderHover = createSelector(
  [selectThemeColors],
  (colors) => colors.borderHover
);

export const selectBorderInput = createSelector(
  [selectThemeColors],
  (colors) => colors.inputBorder
);

export const selectBorderFocus = createSelector(
  [selectThemeColors],
  (colors) => colors.borderFocus
);

export const selectShadowSoft = createSelector([selectThemeColors], (colors) => colors.shadowSoft);

export const selectShadowDeep = createSelector([selectThemeColors], (colors) => colors.shadowDeep);

export const selectShadowCard = createSelector([selectThemeColors], (colors) => colors.shadowCard);

export const selectShadowDropdown = createSelector(
  [selectThemeColors],
  (colors) => colors.shadowDropdown
);

// ============ ACCENT COLOR SELECTORS ============

export const selectAccentBlue = createSelector([selectThemeColors], (colors) => colors.blue);

export const selectAccentGreen = createSelector([selectThemeColors], (colors) => colors.green);

export const selectAccentRed = createSelector([selectThemeColors], (colors) => colors.red);

export const selectAccentYellow = createSelector([selectThemeColors], (colors) => colors.yellow);

export const selectAccentPurple = createSelector([selectThemeColors], (colors) => colors.purple);

export const selectAccentOrange = createSelector([selectThemeColors], (colors) => colors.orange);

// ============ STATUS COLOR SELECTORS ============

export const selectPositiveColor = createSelector([selectThemeColors], (colors) => colors.positive);

export const selectNegativeColor = createSelector([selectThemeColors], (colors) => colors.negative);

export const selectWarningColor = createSelector([selectThemeColors], (colors) => colors.warning);

export const selectInfoColor = createSelector([selectThemeColors], (colors) => colors.info);

export const selectSuccessColor = createSelector([selectThemeColors], (colors) => colors.success);

export const selectErrorColor = createSelector([selectThemeColors], (colors) => colors.error);

// ============ BUTTON COLOR SELECTORS ============

export const selectButtonPrimaryBg = createSelector(
  [selectThemeColors],
  (colors) => colors.buttonPrimaryBg
);

export const selectButtonPrimaryText = createSelector(
  [selectThemeColors],
  (colors) => colors.buttonPrimaryText
);

export const selectButtonSecondaryBg = createSelector(
  [selectThemeColors],
  (colors) => colors.buttonSecondaryBg
);

export const selectButtonSecondaryText = createSelector(
  [selectThemeColors],
  (colors) => colors.buttonSecondaryText
);

// ============ TABLE COLOR SELECTORS ============

export const selectTableHeaderBg = createSelector(
  [selectThemeColors],
  (colors) => colors.tableHeaderBg
);

export const selectTableRowBg = createSelector([selectThemeColors], (colors) => colors.tableRowBg);

export const selectTableRowHover = createSelector(
  [selectThemeColors],
  (colors) => colors.tableRowHover
);

export const selectTableBorder = createSelector(
  [selectThemeColors],
  (colors) => colors.tableBorder
);

// ============ PLATFORM COLORS SELECTOR ============

export const selectPlatformBg = createSelector([selectThemeColors], (colors) => colors.platformBg);

// ============ SKELETON SELECTORS ============

export const selectSkeletonBase = createSelector(
  [selectThemeColors],
  (colors) => colors.skeletonBase
);

export const selectSkeletonHighlight = createSelector(
  [selectThemeColors],
  (colors) => colors.skeletonHighlight
);

export const selectSkeletonShimmer = createSelector(
  [selectThemeColors],
  (colors) => colors.skeletonShimmer
);

// ============ COMPOSITE SELECTORS ============

/**
 * Select button styles object
 */
export const selectButtonStyles = createSelector([selectThemeColors], (colors) => ({
  primary: {
    bg: colors.buttonPrimaryBg,
    hoverBg: colors.buttonPrimaryHover,
    text: colors.buttonPrimaryText
  },
  secondary: {
    bg: colors.buttonSecondaryBg,
    hoverBg: colors.buttonSecondaryHover,
    text: colors.buttonSecondaryText
  },
  ghost: {
    hoverBg: colors.buttonGhostHover
  }
}));

/**
 * Select input styles object
 */
export const selectInputStyles = createSelector([selectThemeColors], (colors) => ({
  bg: colors.inputBg,
  border: colors.inputBorder,
  focusBorder: colors.inputBorderFocus,
  text: colors.inputText,
  placeholder: colors.inputPlaceholder
}));

/**
 * Select table styles object
 */
export const selectTableStyles = createSelector([selectThemeColors], (colors) => ({
  headerBg: colors.tableHeaderBg,
  rowBg: colors.tableRowBg,
  rowHover: colors.tableRowHover,
  border: colors.tableBorder
}));

/**
 * Select status colors object
 */
export const selectStatusColors = createSelector([selectThemeColors], (colors) => ({
  positive: colors.positive,
  negative: colors.negative,
  warning: colors.warning,
  info: colors.info,
  success: colors.success,
  error: colors.error,
  online: colors.online
}));

/**
 * Select gradient colors
 */
export const selectGradientColors = createSelector([selectThemeColors], (colors) => ({
  start: colors.accentGradientStart,
  end: colors.accentGradientEnd,
  glow: colors.accentGlow,
  light: colors.accentLight
}));

/**
 * Select scrollbar colors
 */
export const selectScrollbarColors = createSelector([selectThemeColors], (colors) => ({
  track: colors.scrollbarTrack,
  thumb: colors.scrollbarThumb,
  thumbHover: colors.scrollbarThumbHover
}));

// ============ UTILITY SELECTORS ============

/**
 * Get theme color by key
 * Usage: const color = useSelector(state => selectThemeColorByKey(state, 'blue'))
 */
export const selectThemeColorByKey = (state, key) => {
  const colors = selectThemeColors(state);
  return colors[key] || null;
};

/**
 * Create a selector for a specific color key
 * Usage: const selectMyColor = makeSelectThemeColor('blue')
 */
export const makeSelectThemeColor = (key) =>
  createSelector([selectThemeColors], (colors) => colors[key]);

// ============ EXPORT REDUCER ============
export default themeSlice.reducer;
