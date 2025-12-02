import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Redux imports
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";
import {
  setSelectedPlatform,
  setDateRange,
  selectSelectedPlatform,
  selectDateRange,
  selectCustomDateRange
} from "@/features/filters/filtersSlice";
import {
  fetchMetrics,
  clearError,
  selectPlatformData,
  selectTotals,
  selectIsLoading,
  selectMetricsError,
  selectLastUpdated
} from "@/features/metrics/metricsSlice";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import DatePickerToggle from "./DatePicker";

// Platform icons mapping
const platformIcons = {
  facebook: fb,
  snapchat: snapchatIcon,
  "google-ads": googleIcon,
  tiktok: tiktokIcon,
  newsbreak: nb
};

// Platform display names
const platformNames = {
  facebook: "Facebook",
  snapchat: "Snapchat",
  "google-ads": "Google",
  tiktok: "TikTok",
  newsbreak: "NewsBreak"
};

// Platform options
const platformOptions = [
  { id: "all", name: "All Platforms", icon: null },
  { id: "facebook", name: "Facebook", icon: fb },
  { id: "snapchat", name: "Snapchat", icon: snapchatIcon },
  { id: "google-ads", name: "Google", icon: googleIcon },
  { id: "tiktok", name: "TikTok", icon: tiktokIcon },
  { id: "newsbreak", name: "NewsBreak", icon: nb }
];

// CSS for animations - Dynamic based on theme
const createGlobalStyles = (theme, isDarkMode) => `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes skeleton-wave {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background: ${
      isDarkMode
        ? `linear-gradient(90deg, ${theme.bgCard} 0%, #151515 20%, #1a1a1a 40%, #151515 60%, ${theme.bgCard} 80%, ${theme.bgCard} 100%)`
        : `linear-gradient(90deg, ${theme.bgSecondary} 0%, #e8e8e8 20%, #f0f0f0 40%, #e8e8e8 60%, ${theme.bgSecondary} 80%, ${theme.bgSecondary} 100%)`
    };
    background-size: 200% 100%;
    animation: skeleton-wave 1.8s ease-in-out infinite;
  }
  
  .skeleton-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// Generate sparkline data
const generateSparklineData = (days, currentValue, metricType = "positive") => {
  if (!currentValue || currentValue === 0) {
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      value: 0
    }));
  }

  const data = [];
  const variance = 0.15;
  const trendStrength = 0.3;

  const seed = metricType.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < days; i++) {
    const progress = i / (days - 1);
    const randomFactor = (pseudoRandom(i) - 0.5) * variance * 2;
    const trendValue = currentValue * (0.7 + progress * trendStrength);
    const value = Math.max(0, trendValue * (1 + randomFactor));

    data.push({
      day: i + 1,
      value: parseFloat(value.toFixed(2))
    });
  }

  data[data.length - 1].value = currentValue;
  return data;
};

// Format value based on format type
const formatValue = (val, format = "number") => {
  if (val === null || val === undefined || isNaN(val)) {
    return format === "currency" ? "$0.00" : "0";
  }

  if (format === "currency") {
    if (Math.abs(val) >= 1000) {
      return `${val < 0 ? "-" : ""}$${Math.abs(val).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    }
    return `${val < 0 ? "-" : ""}$${Math.abs(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else if (format === "percentage") {
    return `${parseFloat(val).toFixed(2)}%`;
  } else if (format === "decimal") {
    return parseFloat(val).toFixed(2);
  }
  return Math.round(val).toLocaleString();
};

// ============ COMPONENTS ============

// Premium Button Component
const PremiumButton = ({ onClick, disabled, children, isActive, className = "", theme }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden transition-all duration-300 ease-out ${className}`}
    style={{
      backgroundColor: isActive ? `${theme.blue}15` : theme.bgCard,
      border: `1px solid ${isActive ? theme.blue : theme.borderSubtle}`,
      borderRadius: "14px",
      boxShadow: isActive
        ? `0 0 40px ${theme.blue}15, ${theme.innerShadow}`
        : `0 4px 20px ${theme.shadowSoft}, ${theme.innerShadow}`
    }}
    onMouseEnter={(e) => {
      if (!isActive && !disabled) {
        e.currentTarget.style.backgroundColor = theme.bgCardHover;
        e.currentTarget.style.borderColor = theme.borderHover;
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive && !disabled) {
        e.currentTarget.style.backgroundColor = theme.bgCard;
        e.currentTarget.style.borderColor = theme.borderSubtle;
      }
    }}
  >
    {children}
  </button>
);

// Dropdown Menu Component - FIXED for mobile
const DropdownMenu = ({ isOpen, options, onSelect, selectedId, theme }) => {
  if (!isOpen) return null;

  const handleSelect = (e, optionId) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(optionId);
  };

  return (
    <div
      className="absolute z-[100] mt-2 w-full rounded-[16px] overflow-hidden backdrop-blur-xl"
      style={{
        backgroundColor: `${theme.bgCard}F5`,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${theme.blue}08`
      }}
    >
      <ul className="py-2">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={(e) => handleSelect(e, option.id)}
              className="flex items-center w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none touch-manipulation"
              style={{
                backgroundColor: selectedId === option.id ? `${theme.blue}12` : "transparent",
                color: selectedId === option.id ? theme.blue : theme.textSecondary
              }}
              onMouseEnter={(e) => {
                if (selectedId !== option.id) {
                  e.currentTarget.style.backgroundColor = theme.bgCardHover;
                  e.currentTarget.style.color = theme.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== option.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = theme.textSecondary;
                }
              }}
            >
              {option.icon ? (
                <img src={option.icon} alt={option.name} className="w-5 h-5 mr-3 opacity-90" />
              ) : (
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.textTertiary }}
                  />
                </div>
              )}
              <span className="font-medium">{option.name}</span>
              {selectedId === option.id && (
                <svg
                  className="w-4 h-4 ml-auto"
                  style={{ color: theme.blue }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ theme }) => (
  <svg
    className="animate-spin h-5 w-5"
    style={{ color: theme.blue }}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Refresh Icon Component
const RefreshIcon = ({ theme }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    style={{ color: theme.textSecondary }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

// Premium Skeleton Loading Card Component
const PremiumSkeletonCard = ({ theme, isDarkMode }) => {
  return (
    <div
      className="rounded-[18px] p-5 xs:p-6 md:p-7 min-h-[200px] xs:min-h-[220px] md:min-h-[240px] relative overflow-hidden"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: `0 8px 32px ${theme.shadowSoft}`
      }}
    >
      {/* Ambient glow for skeleton */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full skeleton-pulse"
        style={{
          background: isDarkMode
            ? `radial-gradient(circle, ${theme.blue}08 0%, transparent 70%)`
            : `radial-gradient(circle, ${theme.blue}05 0%, transparent 70%)`,
          filter: "blur(40px)"
        }}
      />

      {/* Title skeleton */}
      <div className="mb-4">
        <div
          className="h-4 rounded-lg w-24 skeleton-shimmer"
          style={{
            backgroundColor: isDarkMode ? "#151515" : "#e8e8e8"
          }}
        />
      </div>

      {/* Value skeleton */}
      <div className="mb-3">
        <div
          className="h-10 md:h-12 rounded-xl w-32 md:w-40 skeleton-shimmer"
          style={{
            backgroundColor: isDarkMode ? "#151515" : "#e8e8e8"
          }}
        />
      </div>

      {/* Change indicator skeleton */}
      <div className="mb-6">
        <div
          className="h-6 rounded-full w-16 skeleton-shimmer"
          style={{
            backgroundColor: isDarkMode ? "#151515" : "#e8e8e8"
          }}
        />
      </div>

      {/* Chart skeleton */}
      <div
        className="h-20 md:h-24 rounded-xl overflow-hidden relative"
        style={{
          backgroundColor: isDarkMode ? "#0a0a0a" : "#f5f5f5"
        }}
      >
        {/* Animated chart bars */}
        <div className="h-full flex items-end justify-between px-3 pb-2 gap-1">
          {[35, 55, 40, 65, 50, 75, 45, 60, 55, 70, 48, 62].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm skeleton-shimmer"
              style={{
                height: `${height}%`,
                backgroundColor: isDarkMode ? "#151515" : "#e0e0e0",
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 skeleton-shimmer"
          style={{
            background: isDarkMode
              ? "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)",
            backgroundSize: "200% 100%"
          }}
        />
      </div>

      {/* Bottom accent line skeleton */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px skeleton-shimmer"
        style={{
          background: isDarkMode
            ? `linear-gradient(90deg, transparent, ${theme.borderSubtle}, transparent)`
            : `linear-gradient(90deg, transparent, ${theme.borderHover}, transparent)`
        }}
      />
    </div>
  );
};

// Metric Card Component - FIXED hover (color only, no movement)
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  sparklineData,
  format = "number",
  platformBreakdown = {},
  selectedPlatform = "all",
  metricKey,
  isLoading,
  isExpanded,
  onToggleExpand,
  accentColor,
  theme,
  isDarkMode
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getChangeColor = () => {
    if (changeType === "positive") return theme.positive;
    if (changeType === "negative") return theme.negative;
    return theme.textSecondary;
  };

  const getChangeIcon = () => {
    if (changeType === "positive") {
      return (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (changeType === "negative") {
      return (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return <span className="mr-1">−</span>;
  };

  const displayValue =
    selectedPlatform !== "all" && platformBreakdown[selectedPlatform] !== undefined
      ? platformBreakdown[selectedPlatform]
      : value;

  const hasPlatformData = Object.keys(platformBreakdown).length > 0;

  // Loading state - Premium skeleton
  if (isLoading) {
    return <PremiumSkeletonCard theme={theme} isDarkMode={isDarkMode} />;
  }

  return (
    <div
      className="relative rounded-[18px] p-5 xs:p-6 md:p-7 transition-colors duration-300 ease-out cursor-pointer min-h-[200px] xs:min-h-[220px] md:min-h-[240px] flex flex-col overflow-hidden"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${isHovered ? `${accentColor}40` : theme.borderSubtle}`,
        boxShadow: `0 8px 32px ${theme.shadowSoft}`
      }}
      onClick={onToggleExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow effect - only opacity changes on hover */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          opacity: isHovered ? 0.8 : 0.3,
          filter: "blur(40px)"
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-2 md:mb-3 relative z-10">
        <div className="flex items-center">
          <h3
            className="text-sm xs:text-base font-medium tracking-wide transition-colors duration-300"
            style={{ color: isHovered ? theme.textPrimary : theme.textSecondary }}
          >
            {title}
          </h3>
        </div>
        {selectedPlatform !== "all" && (
          <div className="flex items-center">
            <img
              src={platformIcons[selectedPlatform]}
              alt={platformNames[selectedPlatform]}
              className="w-4 h-4 md:w-5 md:h-5 mr-1.5 opacity-80"
            />
            <span className="text-xs md:text-sm" style={{ color: theme.textTertiary }}>
              {platformNames[selectedPlatform]}
            </span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div
        className="text-2xl xs:text-3xl md:text-4xl font-bold mb-2 md:mb-3 relative z-10 tracking-tight transition-all duration-300"
        style={{
          color: accentColor,
          textShadow: isDarkMode
            ? `0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`
            : `0 0 20px ${accentColor}20`
        }}
      >
        {formatValue(displayValue, format)}
      </div>

      {/* Change Indicator */}
      <div className="flex items-center text-xs xs:text-sm mb-4 md:mb-5 relative z-10">
        <span
          className="font-semibold flex items-center px-2 py-0.5 rounded-full"
          style={{
            color: getChangeColor(),
            backgroundColor: `${getChangeColor()}12`
          }}
        >
          {getChangeIcon()}
          {Math.abs(change)}%
        </span>
      </div>

      {/* Chart */}
      <div
        className="h-20 ss:h-24 md:h-28 mt-auto rounded-xl overflow-hidden relative z-10"
        style={{
          background: isDarkMode
            ? `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`
            : `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgCard} 100%)`
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`gradient-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={isDarkMode ? 0.25 : 0.3} />
                <stop offset="40%" stopColor={accentColor} stopOpacity={isDarkMode ? 0.1 : 0.15} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
              <filter id={`glow-${metricKey}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={isDarkMode ? "3" : "2"} result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={2.2}
              fillOpacity={1}
              fill={`url(#gradient-${metricKey})`}
              filter={isDarkMode ? `url(#glow-${metricKey})` : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Breakdown (Expanded) */}
      {isExpanded && selectedPlatform === "all" && hasPlatformData && (
        <div
          className="mt-5 md:mt-6 pt-4 md:pt-5 relative z-10"
          style={{ borderTop: `1px solid ${theme.dividerSubtle}` }}
        >
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h4
              className="text-xs md:text-sm font-semibold tracking-wide"
              style={{ color: theme.textSecondary }}
            >
              Platform Breakdown
            </h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-300"
              style={{
                color: theme.textTertiary,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0)"
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="space-y-2.5 md:space-y-3">
            {Object.entries(platformBreakdown)
              .filter(([, platformValue]) => platformValue > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, platformValue]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors duration-200"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.borderSubtle}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    e.currentTarget.style.borderColor = theme.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bgSecondary;
                    e.currentTarget.style.borderColor = theme.borderSubtle;
                  }}
                >
                  <div className="flex items-center">
                    {platformIcons[platform] && (
                      <img
                        src={platformIcons[platform]}
                        alt={platformNames[platform]}
                        className="w-5 h-5 md:w-6 md:h-6 mr-2.5 opacity-90"
                      />
                    )}
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {platformNames[platform]}
                    </span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                    {formatValue(platformValue, format)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Bottom accent line - only opacity changes on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
          opacity: isHovered ? 1 : 0
        }}
      />
    </div>
  );
};

// ============ MAIN COMPONENT ============

const MediaBuyerDashboard = () => {
  const dispatch = useDispatch();

  // ========== REDUX STATE ==========
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);
  const selectedPlatform = useSelector(selectSelectedPlatform);
  const dateRange = useSelector(selectDateRange);
  const customDateRange = useSelector(selectCustomDateRange);
  const platformData = useSelector(selectPlatformData);
  const totals = useSelector(selectTotals);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectMetricsError);
  const lastUpdated = useSelector(selectLastUpdated);

  // ========== LOCAL UI STATE ==========
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabletMenuOpen, setTabletMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // ========== MEMOIZED VALUES ==========

  // Metric accent colors mapping - uses theme colors
  const metricAccentColors = useMemo(
    () => ({
      amount_spent: theme.blue,
      revenue: theme.green,
      net: theme.teal,
      roi: theme.yellow,
      clicks: theme.purple,
      conversions: theme.pink,
      cpa: theme.red,
      epc: theme.orange
    }),
    [theme]
  );

  const selectedPlatformObj = useMemo(
    () => platformOptions.find((p) => p.id === selectedPlatform) || platformOptions[0],
    [selectedPlatform]
  );

  // Calculate display data based on selected platform
  const displayData = useMemo(() => {
    if (selectedPlatform === "all") {
      return totals;
    }
    return (
      platformData[selectedPlatform] || {
        spend: 0,
        revenue: 0,
        profit: 0,
        roi: 0,
        clicks: 0,
        conversions: 0,
        cpa: 0,
        epc: 0
      }
    );
  }, [selectedPlatform, platformData, totals]);

  // Build platform breakdowns for "all" view
  const platformBreakdowns = useMemo(() => {
    const breakdowns = {
      amount_spent: {},
      revenue: {},
      net: {},
      roi: {},
      clicks: {},
      conversions: {},
      cpa: {},
      epc: {}
    };

    Object.entries(platformData).forEach(([platform, metrics]) => {
      if (metrics.spend > 0 || metrics.revenue > 0 || metrics.clicks > 0) {
        breakdowns.amount_spent[platform] = metrics.spend;
        breakdowns.revenue[platform] = metrics.revenue;
        breakdowns.net[platform] = metrics.profit;
        breakdowns.roi[platform] = metrics.roi;
        breakdowns.clicks[platform] = metrics.clicks;
        breakdowns.conversions[platform] = metrics.conversions;
        breakdowns.cpa[platform] = metrics.cpa;
        breakdowns.epc[platform] = metrics.epc;
      }
    });

    return breakdowns;
  }, [platformData]);

  // Generate metrics data for cards
  const metricsData = useMemo(() => {
    const mockChange = (value) => {
      return value > 0 ? parseFloat((Math.random() * 15).toFixed(1)) : 0;
    };

    return {
      amount_spent: {
        title: "Amount Spent",
        value: displayData.spend,
        change: mockChange(displayData.spend),
        changeType: displayData.spend > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, displayData.spend, "spend"),
        platformBreakdown: platformBreakdowns.amount_spent
      },
      revenue: {
        title: "Revenue",
        value: displayData.revenue,
        change: mockChange(displayData.revenue),
        changeType: displayData.revenue > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, displayData.revenue, "revenue"),
        platformBreakdown: platformBreakdowns.revenue
      },
      net: {
        title: "Net",
        value: displayData.profit,
        change: mockChange(Math.abs(displayData.profit)),
        changeType: displayData.profit > 0 ? "positive" : "negative",
        format: "currency",
        sparklineData: generateSparklineData(30, displayData.profit, "profit"),
        platformBreakdown: platformBreakdowns.net
      },
      roi: {
        title: "ROI",
        value: displayData.roi,
        change: mockChange(displayData.roi),
        changeType: displayData.roi > 0 ? "positive" : "negative",
        format: "percentage",
        sparklineData: generateSparklineData(30, displayData.roi, "roi"),
        platformBreakdown: platformBreakdowns.roi
      },
      clicks: {
        title: "Clicks",
        value: displayData.clicks,
        change: mockChange(displayData.clicks),
        changeType: displayData.clicks > 0 ? "positive" : "neutral",
        format: "number",
        sparklineData: generateSparklineData(30, displayData.clicks, "clicks"),
        platformBreakdown: platformBreakdowns.clicks
      },
      conversions: {
        title: "Conversions",
        value: displayData.conversions,
        change: mockChange(displayData.conversions),
        changeType: displayData.conversions > 0 ? "positive" : "neutral",
        format: "number",
        sparklineData: generateSparklineData(30, displayData.conversions, "conversions"),
        platformBreakdown: platformBreakdowns.conversions
      },
      cpa: {
        title: "CPA",
        value: displayData.cpa,
        change: mockChange(displayData.cpa),
        changeType: displayData.cpa > 0 ? "negative" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, displayData.cpa, "cpa"),
        platformBreakdown: platformBreakdowns.cpa
      },
      epc: {
        title: "EPC",
        value: displayData.epc,
        change: mockChange(displayData.epc),
        changeType: displayData.epc > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, displayData.epc, "epc"),
        platformBreakdown: platformBreakdowns.epc
      }
    };
  }, [displayData, platformBreakdowns]);

  // ========== EFFECTS ==========

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "media-buyer-styles";
    styleElement.textContent = createGlobalStyles(theme, isDarkMode);

    const oldStyles = document.getElementById("media-buyer-styles");
    if (oldStyles) oldStyles.remove();

    document.head.appendChild(styleElement);
    return () => {
      const el = document.getElementById("media-buyer-styles");
      if (el) el.remove();
    };
  }, [theme, isDarkMode]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    dispatch(fetchMetrics({ dateRange, customDateRange }));
  }, [dispatch, dateRange, customDateRange]);

  // Close dropdown when clicking outside - FIXED
  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileDropdown = document.querySelector(".mobile-dropdown");
      const tabletDropdown = document.querySelector(".tablet-dropdown");
      const desktopDropdown = document.querySelector(".desktop-dropdown");

      if (mobileMenuOpen && mobileDropdown && !mobileDropdown.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (tabletMenuOpen && tabletDropdown && !tabletDropdown.contains(event.target)) {
        setTabletMenuOpen(false);
      }
      if (mobileMenuOpen && desktopDropdown && !desktopDropdown.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenuOpen, tabletMenuOpen]);

  // ========== HANDLERS ==========

  const handlePlatformChange = useCallback(
    (platformId) => {
      dispatch(setSelectedPlatform(platformId));
      setMobileMenuOpen(false);
      setTabletMenuOpen(false);
      setExpandedCard(null);
    },
    [dispatch]
  );

  const handleDateRangeChange = useCallback(
    (range, customRange = null) => {
      dispatch(setDateRange({ range, customRange }));
    },
    [dispatch]
  );

  const handleRefresh = useCallback(() => {
    dispatch(fetchMetrics({ dateRange, customDateRange }));
  }, [dispatch, dateRange, customDateRange]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const toggleCardExpansion = useCallback((cardKey) => {
    setExpandedCard((prev) => (prev === cardKey ? null : cardKey));
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen((prev) => !prev);
  }, []);

  // Toggle tablet menu
  const toggleTabletMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setTabletMenuOpen((prev) => !prev);
  }, []);

  // ========== RENDER ==========

  return (
    <div
      className="p-4 xs:p-5 md:p-8 w-full xs:pt-[25%] ss:pt-[15%] md:pt-[5%] lg:pt-[3%] transition-colors duration-300"
      style={{
        backgroundColor: theme.bgMain,
        backgroundImage: isDarkMode
          ? `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.blue}08, transparent)`
          : `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.blue}05, transparent)`
      }}
    >
      {/* Error message */}
      {error && (
        <div
          className="mb-6 p-5 rounded-[16px] backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.red}08`,
            border: `1px solid ${theme.red}25`,
            boxShadow: `0 0 40px ${theme.red}10`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: `${theme.red}15` }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: theme.red }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p style={{ color: theme.red }} className="text-sm font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={handleClearError}
              className="p-2 rounded-full transition-colors duration-200"
              style={{ color: theme.red }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.red}15`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="mb-4 text-xs" style={{ color: theme.textTertiary }}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}

      {/* Main header with filters */}
      <div className="mb-6 md:mb-8">
        {/* Mobile Layout (up to 640px) */}
        <div className="sm:hidden">
          <div className="space-y-4">
            {/* Platform Dropdown for Mobile - FIXED */}
            <div className="mobile-dropdown relative w-full">
              <PremiumButton
                onClick={toggleMobileMenu}
                className="flex items-center justify-between w-full px-4 py-3"
                theme={theme}
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-3"
                    />
                  )}
                  <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-300 ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: theme.textSecondary }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </PremiumButton>

              <DropdownMenu
                isOpen={mobileMenuOpen}
                options={platformOptions}
                onSelect={handlePlatformChange}
                selectedId={selectedPlatform}
                theme={theme}
              />
            </div>

            {/* Date and Refresh Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-grow">
                <DatePickerToggle
                  selectedRange={dateRange}
                  onRangeChange={handleDateRangeChange}
                  customRange={customDateRange}
                />
              </div>
              <PremiumButton
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-3"
                theme={theme}
              >
                {isLoading ? <LoadingSpinner theme={theme} /> : <RefreshIcon theme={theme} />}
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Tablet Layout (640px to 1023px) */}
        <div className="hidden sm:flex lg:hidden flex-col space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0 w-auto">
              <DatePickerToggle
                selectedRange={dateRange}
                onRangeChange={handleDateRangeChange}
                customRange={customDateRange}
              />
            </div>

            {/* Platform Dropdown for Tablet */}
            <div className="tablet-dropdown relative w-64">
              <PremiumButton
                onClick={toggleTabletMenu}
                className="flex items-center justify-between w-full px-4 py-2.5"
                theme={theme}
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-300 ${
                    tabletMenuOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: theme.textSecondary }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </PremiumButton>

              <DropdownMenu
                isOpen={tabletMenuOpen}
                options={platformOptions}
                onSelect={handlePlatformChange}
                selectedId={selectedPlatform}
                theme={theme}
              />
            </div>

            {/* Refresh Button */}
            <PremiumButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2.5"
              theme={theme}
            >
              {isLoading ? (
                <LoadingSpinner theme={theme} />
              ) : (
                <>
                  <RefreshIcon theme={theme} />
                  <span className="text-sm font-medium ml-2" style={{ color: theme.textSecondary }}>
                    Refresh
                  </span>
                </>
              )}
            </PremiumButton>
          </div>
        </div>

        {/* Desktop Layout (1024px to 1535px) */}
        <div className="hidden lg:flex xl:hidden items-center justify-between gap-4">
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Dropdown for Desktop */}
          <div className="desktop-dropdown relative w-64">
            <PremiumButton
              onClick={toggleMobileMenu}
              className="flex items-center justify-between w-full px-4 py-2.5"
              theme={theme}
            >
              <div className="flex items-center">
                {selectedPlatformObj.icon && (
                  <img
                    src={selectedPlatformObj.icon}
                    alt={selectedPlatformObj.name}
                    className="w-5 h-5 mr-2"
                  />
                )}
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {selectedPlatformObj.name}
                </span>
              </div>
              <svg
                className={`h-5 w-5 transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
                style={{ color: theme.textSecondary }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </PremiumButton>

            <DropdownMenu
              isOpen={mobileMenuOpen}
              options={platformOptions}
              onSelect={handlePlatformChange}
              selectedId={selectedPlatform}
              theme={theme}
            />
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <PremiumButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-5 py-2.5"
              theme={theme}
            >
              {isLoading ? (
                <LoadingSpinner theme={theme} />
              ) : (
                <>
                  <RefreshIcon theme={theme} />
                  <span className="text-sm font-medium ml-2" style={{ color: theme.textSecondary }}>
                    Refresh
                  </span>
                </>
              )}
            </PremiumButton>
          </div>
        </div>

        {/* Large Screen Layout (1536px and above) */}
        <div className="hidden xl:flex items-center justify-between">
          {/* Date Picker */}
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Buttons */}
          <div className="flex items-center justify-center flex-grow px-8 gap-2">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformChange(platform.id)}
                className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 whitespace-nowrap focus:outline-none overflow-hidden"
                style={{
                  backgroundColor:
                    selectedPlatform === platform.id ? `${theme.blue}12` : theme.bgCard,
                  border: `1px solid ${selectedPlatform === platform.id ? `${theme.blue}50` : theme.borderSubtle}`,
                  color: selectedPlatform === platform.id ? theme.blue : theme.textSecondary,
                  boxShadow:
                    selectedPlatform === platform.id
                      ? `0 0 40px ${theme.blue}18`
                      : `0 2px 8px ${theme.shadowSoft}`
                }}
                onMouseEnter={(e) => {
                  if (selectedPlatform !== platform.id) {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    e.currentTarget.style.borderColor = theme.borderHover;
                    e.currentTarget.style.color = theme.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPlatform !== platform.id) {
                    e.currentTarget.style.backgroundColor = theme.bgCard;
                    e.currentTarget.style.borderColor = theme.borderSubtle;
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                <span className="flex items-center relative z-10">
                  {platform.id !== "all" && platform.icon && (
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-4 h-4 mr-2 opacity-90"
                    />
                  )}
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <PremiumButton
              onClick={handleRefresh}
              className="flex items-center px-5 py-2.5"
              disabled={isLoading}
              theme={theme}
            >
              {isLoading ? (
                <LoadingSpinner theme={theme} />
              ) : (
                <>
                  <RefreshIcon theme={theme} />
                  <span className="text-sm font-medium ml-2" style={{ color: theme.textSecondary }}>
                    Refresh
                  </span>
                </>
              )}
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 xs:gap-5 md:gap-6 w-full">
        {Object.entries(metricsData).map(([key, metric]) => (
          <MetricCard
            key={key}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            sparklineData={metric.sparklineData}
            format={metric.format}
            platformBreakdown={metric.platformBreakdown}
            selectedPlatform={selectedPlatform}
            metricKey={key}
            isLoading={isLoading}
            isExpanded={expandedCard === key}
            onToggleExpand={() => toggleCardExpansion(key)}
            accentColor={metricAccentColors[key]}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaBuyerDashboard;
