import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  toggleTheme, 
  selectCurrentTheme, 
  selectThemeColors,
  selectIsDarkMode 
} from "@/features/theme/themeSlice";

const ThemeToggle = ({ className = "", showTooltip = true, size = "default" }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectCurrentTheme);
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  // Size configurations
  const sizes = {
    small: {
      button: "p-2",
      icon: "w-4 h-4"
    },
    default: {
      button: "p-3",
      icon: "w-5 h-5"
    },
    large: {
      button: "p-4",
      icon: "w-6 h-6"
    }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`relative ${currentSize.button} rounded-xl transition-all duration-300 ${className}`}
      style={{
        backgroundColor: isHovered ? theme.bgCardHover : theme.bgCard,
        border: `1px solid ${isHovered ? theme.borderHover : theme.borderSubtle}`,
        boxShadow: isPressed 
          ? theme.innerShadow 
          : `0 4px 12px ${theme.shadowSoft}`,
        transform: isPressed ? "scale(0.95)" : isHovered ? "scale(1.05)" : "scale(1)"
      }}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none"
        style={{
          background: isDark 
            ? `radial-gradient(circle at center, ${theme.blue}20 0%, transparent 70%)`
            : `radial-gradient(circle at center, ${theme.yellow}20 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0
        }}
      />

      <div className={`relative ${currentSize.icon}`}>
        {/* Sun Icon (Light Mode) */}
        <svg
          className={`absolute inset-0 transition-all duration-500 ${currentSize.icon}`}
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(180deg) scale(0)" : "rotate(0deg) scale(1)",
            color: theme.yellow
          }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon Icon (Dark Mode) */}
        <svg
          className={`absolute inset-0 transition-all duration-500 ${currentSize.icon}`}
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-180deg) scale(0)",
            color: theme.blue
          }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none transition-all duration-200 z-50"
          style={{
            backgroundColor: theme.bgTooltip,
            border: `1px solid ${theme.borderSubtle}`,
            color: isDark ? theme.textPrimary : "#FFFFFF",
            opacity: isHovered ? 1 : 0,
            transform: isHovered 
              ? "translate(-50%, 0)" 
              : "translate(-50%, -4px)",
            boxShadow: `0 4px 12px ${theme.shadowDeep}`
          }}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;