// src/hooks/useThemeSync.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode, selectThemeMode, selectThemeColors } from "@/features/theme/themeSlice";

/**
 * Hook to sync theme across browser tabs and apply to document
 * Use this in your App.jsx or root layout component
 */
const useThemeSync = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectThemeMode);
  const themeColors = useSelector(selectThemeColors);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "app-theme-mode" && event.newValue) {
        const newTheme = event.newValue;
        if (newTheme === "dark" || newTheme === "light") {
          dispatch(setThemeMode(newTheme));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  // Apply theme class to document whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(currentTheme);

    // Set data attribute
    root.setAttribute("data-theme", currentTheme);

    // Update background color for smooth transition
    document.body.style.backgroundColor = themeColors.bgMain;
    document.body.style.color = themeColors.textPrimary;

    // Transition for smooth theme change
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, [currentTheme, themeColors]);

  // Optional: Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem("app-theme-mode");
      if (!savedTheme) {
        dispatch(setThemeMode(e.matches ? "dark" : "light"));
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [dispatch]);

  return {
    theme: currentTheme,
    colors: themeColors,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light"
  };
};

export default useThemeSync;
