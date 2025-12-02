// src/hooks/useTheme.js
import { useSelector } from "react-redux";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

export const useTheme = () => {
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);

  return { theme, isDarkMode };
};
