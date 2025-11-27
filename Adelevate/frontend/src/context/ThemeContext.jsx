import { createContext, useContext, useState, useEffect, useMemo } from "react";

// Dark Theme - from your sidebar
const darkTheme = {
  name: "dark",

  // Deep matte backgrounds
  bgMain: "#0B0B0C",
  bgSecondary: "#060606",
  bgCard: "#0B0B0C",
  bgCardHover: "#101011",
  bgActiveMenu: "#141414",
  bgMuted: "#0F0F0F",
  bgUserCard: "#121212",
  bgInput: "#0F0F0F",
  bgTable: "#0A0A0B",
  bgTableRow: "#0E0E0F",
  bgTableRowHover: "#141415",
  bgModal: "#0D0D0E",
  bgDropdown: "#101011",
  bgButton: "#1A1A1B",
  bgButtonHover: "#252526",

  // Subtle borders
  borderSubtle: "#1A1A1B",
  borderHover: "#232324",
  borderMuted: "#1F1F1F",
  dividerSubtle: "#181819",
  borderUserCard: "#1F1F1F",
  borderInput: "#2A2A2B",
  borderInputFocus: "#00D1B2",

  // Premium shadows
  shadowSoft: "rgba(0, 0, 0, 0.4)",
  shadowDeep: "rgba(0, 0, 0, 0.6)",
  shadowMd: "0 4px 6px rgba(0, 0, 0, 0.4)",
  shadowLg: "0 10px 15px rgba(0, 0, 0, 0.5)",
  shadowXl: "0 20px 25px rgba(0, 0, 0, 0.6)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",

  // Text hierarchy
  textPrimary: "#FFFFFF",
  textSecondary: "#E8E8E8",
  textTertiary: "#909090",
  textMuted: "#6A6A6A",
  textIcon: "#D4D4D4",
  textEmail: "#A6A6A6",
  textPlaceholder: "#505050",
  textLink: "#00D1B2",

  // Premium Teal/Cyan accent
  accent: "#00D1B2",
  accentHover: "#00E0FF",
  accentGradientStart: "#00D1B2",
  accentGradientEnd: "#00E0FF",
  accentLight: "#00D1B220",
  accentGlow: "#00D1B210",
  accentDark: "#00A896",

  // Status colors
  online: "#3CF276",
  success: "#3CF276",
  successLight: "#3CF27620",
  successDark: "#2DB85E",
  warning: "#FFB800",
  warningLight: "#FFB80020",
  warningDark: "#E6A600",
  error: "#FF4B4B",
  errorLight: "#FF4B4B20",
  errorDark: "#E63E3E",
  info: "#3B82F6",
  infoLight: "#3B82F620",
  infoDark: "#2563EB",

  logout: "#FF4B4B",
  logoutBg: "#110000",
  logoutBorder: "#2A0000",
  logoutBgHover: "#1A0000",

  // Theme toggle
  themeToggleBg: "#1A1A1B",
  themeToggleBgHover: "#252526",
  themeToggleIcon: "#FFD93D",

  // Scrollbar
  scrollbarTrack: "#060606",
  scrollbarThumb: "#1A1A1B",
  scrollbarThumbHover: "#2A2A2B",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.5)",

  // Charts
  chartColors: ["#00D1B2", "#00E0FF", "#3CF276", "#FFB800", "#FF4B4B", "#3B82F6"]
};

// Light Theme - from your sidebar
const lightTheme = {
  name: "light",

  // Light backgrounds
  bgMain: "#FFFFFF",
  bgSecondary: "#F8F9FA",
  bgCard: "#FFFFFF",
  bgCardHover: "#F3F4F6",
  bgActiveMenu: "#EEF2FF",
  bgMuted: "#F1F5F9",
  bgUserCard: "#F8FAFC",
  bgInput: "#FFFFFF",
  bgTable: "#FFFFFF",
  bgTableRow: "#FFFFFF",
  bgTableRowHover: "#F9FAFB",
  bgModal: "#FFFFFF",
  bgDropdown: "#FFFFFF",
  bgButton: "#F3F4F6",
  bgButtonHover: "#E5E7EB",

  // Subtle borders
  borderSubtle: "#E5E7EB",
  borderHover: "#D1D5DB",
  borderMuted: "#E2E8F0",
  dividerSubtle: "#E5E7EB",
  borderUserCard: "#E2E8F0",
  borderInput: "#D1D5DB",
  borderInputFocus: "#0891B2",

  // Light shadows
  shadowSoft: "rgba(0, 0, 0, 0.05)",
  shadowDeep: "rgba(0, 0, 0, 0.1)",
  shadowMd: "0 4px 6px rgba(0, 0, 0, 0.07)",
  shadowLg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  shadowXl: "0 20px 25px rgba(0, 0, 0, 0.12)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",

  // Text hierarchy
  textPrimary: "#111827",
  textSecondary: "#374151",
  textTertiary: "#6B7280",
  textMuted: "#9CA3AF",
  textIcon: "#6B7280",
  textEmail: "#6B7280",
  textPlaceholder: "#9CA3AF",
  textLink: "#0891B2",

  // Premium Teal/Cyan accent
  accent: "#0891B2",
  accentHover: "#0E7490",
  accentGradientStart: "#0891B2",
  accentGradientEnd: "#06B6D4",
  accentLight: "#0891B215",
  accentGlow: "#0891B210",
  accentDark: "#0E7490",

  // Status colors
  online: "#22C55E",
  success: "#22C55E",
  successLight: "#22C55E15",
  successDark: "#16A34A",
  warning: "#F59E0B",
  warningLight: "#F59E0B15",
  warningDark: "#D97706",
  error: "#EF4444",
  errorLight: "#EF444415",
  errorDark: "#DC2626",
  info: "#3B82F6",
  infoLight: "#3B82F615",
  infoDark: "#2563EB",

  logout: "#EF4444",
  logoutBg: "#FEF2F2",
  logoutBorder: "#FECACA",
  logoutBgHover: "#FEE2E2",

  // Theme toggle
  themeToggleBg: "#F3F4F6",
  themeToggleBgHover: "#E5E7EB",
  themeToggleIcon: "#6366F1",

  // Scrollbar
  scrollbarTrack: "#F3F4F6",
  scrollbarThumb: "#D1D5DB",
  scrollbarThumbHover: "#9CA3AF",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Charts
  chartColors: ["#0891B2", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"]
};

// Create Context
const ThemeContext = createContext(undefined);

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-theme");
      if (saved) {
        return saved === "dark";
      }
      // Check system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // Default to dark mode
  });

  // Get current theme object
  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("app-theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  // Set specific theme
  const setTheme = (mode) => {
    const isDark = mode === "dark";
    setIsDarkMode(isDark);
    localStorage.setItem("app-theme", mode);
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Toggle dark class for Tailwind
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set data attribute
    root.setAttribute("data-theme", isDarkMode ? "dark" : "light");

    // Apply CSS variables for global access
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--theme-${key}`, value);
      }
    });

    // Set body styles
    document.body.style.backgroundColor = theme.bgMain;
    document.body.style.color = theme.textPrimary;
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, [theme, isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const saved = localStorage.getItem("app-theme");
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    darkTheme,
    lightTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { darkTheme, lightTheme };
export default ThemeContext;
