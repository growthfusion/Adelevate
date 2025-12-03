import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleTheme,
  selectCurrentTheme,
  selectThemeColors,
  selectIsDarkMode
} from "@/features/theme/themeSlice";

/**
 * ThemeToggle Component
 * A beautiful, animated toggle button for switching between dark and light themes
 */
const ThemeToggle = ({
  className = "",
  showTooltip = true,
  size = "default",
  variant = "default"
}) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectCurrentTheme);
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    dispatch(toggleTheme());

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [dispatch, isAnimating]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  // Size configurations
  const sizeConfig = {
    small: {
      button: "p-2",
      icon: "w-4 h-4",
      tooltip: "text-xs px-2 py-1",
      tooltipOffset: "-bottom-8"
    },
    default: {
      button: "p-2.5",
      icon: "w-5 h-5",
      tooltip: "text-xs px-3 py-1.5",
      tooltipOffset: "-bottom-10"
    },
    large: {
      button: "p-3",
      icon: "w-6 h-6",
      tooltip: "text-sm px-3 py-1.5",
      tooltipOffset: "-bottom-12"
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      borderRadius: "rounded-xl",
      border: true,
      shadow: true,
      glow: true
    },
    minimal: {
      borderRadius: "rounded-lg",
      border: false,
      shadow: false,
      glow: false
    },
    pill: {
      borderRadius: "rounded-full",
      border: true,
      shadow: true,
      glow: true
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.default;
  const currentVariant = variantConfig[variant] || variantConfig.default;

  // Dynamic styles
  const getButtonStyles = () => {
    const baseStyles = {
      backgroundColor: isHovered ? theme.bgCardHover : theme.bgCard,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    };

    if (currentVariant.border) {
      baseStyles.border = `1px solid ${isHovered ? theme.borderHover : theme.borderSubtle}`;
    }

    if (currentVariant.shadow) {
      baseStyles.boxShadow = isPressed
        ? theme.innerShadow
        : isHovered
          ? `0 8px 24px ${theme.shadowSoft}`
          : `0 4px 12px ${theme.shadowSoft}`;
    }

    if (isPressed) {
      baseStyles.transform = "scale(0.95)";
    } else if (isHovered) {
      baseStyles.transform = "scale(1.05)";
    } else {
      baseStyles.transform = "scale(1)";
    }

    return baseStyles;
  };

  const getGlowStyles = () => {
    if (!currentVariant.glow) return {};

    return {
      background: isDark
        ? `radial-gradient(circle at center, ${theme.blue}25 0%, transparent 70%)`
        : `radial-gradient(circle at center, ${theme.yellow}30 0%, transparent 70%)`,
      opacity: isHovered ? 1 : 0,
      transition: "opacity 0.3s ease"
    };
  };

  const sunIconStyle = {
    opacity: isDark ? 0 : 1,
    transform: isDark ? "rotate(180deg) scale(0.5)" : "rotate(0deg) scale(1)",
    color: theme.yellow,
    filter: !isDark && isHovered ? `drop-shadow(0 0 8px ${theme.yellow})` : "none",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  const moonIconStyle = {
    opacity: isDark ? 1 : 0,
    transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-180deg) scale(0.5)",
    color: theme.blue,
    filter: isDark && isHovered ? `drop-shadow(0 0 8px ${theme.blue})` : "none",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  const tooltipStyle = {
    backgroundColor: theme.bgTooltip,
    border: `1px solid ${theme.borderSubtle}`,
    color: isDark ? theme.textPrimary : "#FFFFFF",
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? "translate(-50%, 0)" : "translate(-50%, -4px)",
    boxShadow: `0 4px 12px ${theme.shadowDeep}`,
    transition: "all 0.2s ease",
    pointerEvents: "none"
  };

  const ariaLabel = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <button
      type="button"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      disabled={isAnimating}
      className={`
        relative 
        ${currentSize.button} 
        ${currentVariant.borderRadius} 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2
        disabled:cursor-wait
        ${className}
      `}
      style={getButtonStyles()}
      aria-label={ariaLabel}
      aria-pressed={isDark}
      role="switch"
    >
      {/* Background glow effect */}
      {currentVariant.glow && (
        <div
          className={`absolute inset-0 ${currentVariant.borderRadius} pointer-events-none`}
          style={getGlowStyles()}
        />
      )}

      {/* Icon container */}
      <div className={`relative ${currentSize.icon}`}>
        {/* Sun Icon (Light Mode) */}
        <svg
          className={`absolute inset-0 ${currentSize.icon}`}
          style={sunIconStyle}
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
          className={`absolute inset-0 ${currentSize.icon}`}
          style={moonIconStyle}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>

        {/* Stars animation for dark mode */}
        {isDark && isHovered && (
          <React.Fragment>
            <span
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: theme.yellow,
                top: "-2px",
                right: "-2px"
              }}
            />
            <span
              className="absolute w-0.5 h-0.5 rounded-full animate-pulse"
              style={{
                backgroundColor: theme.yellow,
                top: "2px",
                right: "-4px",
                animationDelay: "150ms"
              }}
            />
            <span
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: theme.yellow,
                bottom: "0px",
                left: "-3px",
                animationDelay: "300ms"
              }}
            />
          </React.Fragment>
        )}

        {/* Sun rays animation for light mode */}
        {!isDark && isHovered && (
          <div
            className="absolute inset-0"
            style={{
              animation: "spin 8s linear infinite"
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={`ray-${i}`}
                className="absolute w-0.5 h-1 rounded-full"
                style={{
                  backgroundColor: theme.yellow,
                  opacity: 0.6,
                  top: "50%",
                  left: "50%",
                  transformOrigin: "center",
                  transform: `rotate(${i * 45}deg) translateY(-12px)`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`
            absolute 
            ${currentSize.tooltipOffset} 
            left-1/2 
            ${currentSize.tooltip}
            ${currentVariant.borderRadius}
            font-medium 
            whitespace-nowrap 
            z-50
          `}
          style={tooltipStyle}
          role="tooltip"
        >
          {isDark ? "Light Mode" : "Dark Mode"}

          {/* Tooltip arrow */}
          <span
            className="absolute -top-1 left-1/2 w-2 h-2 rotate-45"
            style={{
              transform: "translateX(-50%)",
              backgroundColor: theme.bgTooltip,
              borderLeft: `1px solid ${theme.borderSubtle}`,
              borderTop: `1px solid ${theme.borderSubtle}`
            }}
          />
        </div>
      )}

      {/* Ripple effect on click */}
      {isPressed && (
        <span
          className={`absolute inset-0 ${currentVariant.borderRadius}`}
          style={{
            backgroundColor: isDark ? theme.blue : theme.yellow,
            opacity: 0.2,
            animation: "ping 0.4s cubic-bezier(0, 0, 0.2, 1)"
          }}
        />
      )}
    </button>
  );
};

/**
 * ThemeToggleSwitch - Alternative switch-style toggle
 */
export const ThemeToggleSwitch = ({ className = "" }) => {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const trackStyle = {
    backgroundColor: isDark ? theme.bgSecondary : theme.bgMuted,
    border: `1px solid ${theme.borderSubtle}`,
    boxShadow: isHovered ? `0 4px 12px ${theme.shadowSoft}` : "none"
  };

  const trackGradientStyle = {
    background: isDark
      ? `linear-gradient(to right, ${theme.bgSecondary}, ${theme.blue}30)`
      : `linear-gradient(to right, ${theme.yellow}30, ${theme.bgMuted})`,
    opacity: isHovered ? 1 : 0.5
  };

  const knobStyle = {
    left: isDark ? "4px" : "calc(100% - 28px)",
    backgroundColor: theme.bgCard,
    boxShadow: `0 2px 8px ${theme.shadowSoft}`
  };

  const sunStyle = {
    opacity: isDark ? 0 : 1,
    transform: isDark ? "scale(0) rotate(-180deg)" : "scale(1) rotate(0deg)",
    color: theme.yellow,
    position: "absolute",
    transition: "all 0.3s ease"
  };

  const moonStyle = {
    opacity: isDark ? 1 : 0,
    transform: isDark ? "scale(1) rotate(0deg)" : "scale(0) rotate(180deg)",
    color: theme.blue,
    position: "absolute",
    transition: "all 0.3s ease"
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative 
        w-16 
        h-8 
        rounded-full 
        transition-all 
        duration-300 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2
        ${className}
      `}
      style={trackStyle}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-pressed={isDark}
      role="switch"
    >
      {/* Track background gradient */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={trackGradientStyle}
      />

      {/* Sliding knob */}
      <span
        className="absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        style={knobStyle}
      >
        {/* Sun icon */}
        <svg className="w-4 h-4" style={sunStyle} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon icon */}
        <svg className="w-4 h-4" style={moonStyle} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Label indicators */}
      <span
        className="absolute left-2 top-1/2 text-xs font-medium transition-opacity duration-300"
        style={{
          transform: "translateY(-50%)",
          opacity: isDark ? 0.5 : 0,
          color: theme.textSecondary
        }}
      >
        🌙
      </span>
      <span
        className="absolute right-2 top-1/2 text-xs font-medium transition-opacity duration-300"
        style={{
          transform: "translateY(-50%)",
          opacity: isDark ? 0 : 0.5,
          color: theme.textSecondary
        }}
      >
        ☀️
      </span>
    </button>
  );
};

/**
 * ThemeToggleMinimal - Compact minimal toggle
 */
export const ThemeToggleMinimal = ({ className = "" }) => {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  const buttonStyle = {
    backgroundColor: "transparent",
    color: theme.textSecondary
  };

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className={`
        p-2 
        rounded-lg 
        transition-all 
        duration-200 
        hover:opacity-80
        focus:outline-none 
        focus:ring-2
        ${className}
      `}
      style={buttonStyle}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

/**
 * ThemeToggleWithLabel - Toggle with text label
 */
export const ThemeToggleWithLabel = ({ className = "", showIcon = true }) => {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    backgroundColor: isHovered ? theme.bgCardHover : theme.bgCard,
    border: `1px solid ${theme.borderSubtle}`,
    color: theme.textPrimary
  };

  const iconContainerStyle = {
    transform: isHovered ? "rotate(15deg)" : "rotate(0deg)",
    transition: "transform 0.3s ease"
  };

  const arrowStyle = {
    color: theme.textTertiary,
    transform: isHovered ? "translateX(2px)" : "translateX(0)",
    transition: "transform 0.2s ease"
  };

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex 
        items-center 
        gap-2 
        px-4 
        py-2 
        rounded-lg 
        transition-all 
        duration-200
        focus:outline-none 
        focus:ring-2
        ${className}
      `}
      style={buttonStyle}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {showIcon && (
        <span style={iconContainerStyle}>
          {isDark ? (
            <svg
              className="w-5 h-5"
              style={{ color: theme.blue }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              style={{ color: theme.yellow }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      )}
      <span className="text-sm font-medium">{isDark ? "Dark" : "Light"}</span>
      <svg
        className="w-4 h-4"
        style={arrowStyle}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// Add CSS keyframes for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes ping {
    0% { transform: scale(1); opacity: 0.2; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("theme-toggle-styles")) {
  styleSheet.id = "theme-toggle-styles";
  document.head.appendChild(styleSheet);
}

export default ThemeToggle;
