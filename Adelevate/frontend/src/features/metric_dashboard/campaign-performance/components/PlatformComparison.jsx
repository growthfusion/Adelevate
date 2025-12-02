import React, { useState, useEffect, useContext, createContext } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart
} from "recharts";

// Redux selectors
import {
  selectPlatformData,
  selectIsLoading,
  selectMetricsError
} from "@/features/metrics/metricsSlice";

// Theme imports
import { darkTheme, lightTheme } from "@/constants/themes";

// Platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// ============ THEME CONTEXT ============
// If you already have a ThemeContext, import it instead
const ThemeContext = createContext({
  isDarkMode: true,
  theme: darkTheme,
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

// ============ PLATFORM CONFIG ============
const getPlatformConfig = (isDarkMode) => ({
  "google-ads": {
    name: "Google Ads",
    icon: googleIcon,
    color: "#34A853",
    bgColor: isDarkMode ? "rgba(52, 168, 83, 0.12)" : "rgba(52, 168, 83, 0.08)",
    glowColor: isDarkMode ? "rgba(52, 168, 83, 0.25)" : "rgba(52, 168, 83, 0.15)"
  },
  facebook: {
    name: "Facebook",
    icon: fb,
    color: "#1877F2",
    bgColor: isDarkMode ? "rgba(24, 119, 242, 0.12)" : "rgba(24, 119, 242, 0.08)",
    glowColor: isDarkMode ? "rgba(24, 119, 242, 0.25)" : "rgba(24, 119, 242, 0.15)"
  },
  tiktok: {
    name: "TikTok",
    icon: tiktokIcon,
    color: isDarkMode ? "#8B5CF6" : "#7C3AED",
    bgColor: isDarkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(124, 58, 237, 0.08)",
    glowColor: isDarkMode ? "rgba(139, 92, 246, 0.25)" : "rgba(124, 58, 237, 0.15)"
  },
  snapchat: {
    name: "Snapchat",
    icon: snapchatIcon,
    color: isDarkMode ? "#FFFC00" : "#EAB308",
    bgColor: isDarkMode ? "rgba(255, 252, 0, 0.12)" : "rgba(234, 179, 8, 0.08)",
    glowColor: isDarkMode ? "rgba(255, 252, 0, 0.25)" : "rgba(234, 179, 8, 0.15)"
  },
  newsbreak: {
    name: "NewsBreak",
    icon: nb,
    color: isDarkMode ? "#EF4444" : "#DC2626",
    bgColor: isDarkMode ? "rgba(239, 68, 68, 0.12)" : "rgba(220, 38, 38, 0.08)",
    glowColor: isDarkMode ? "rgba(239, 68, 68, 0.25)" : "rgba(220, 38, 38, 0.15)"
  }
});

// ============ DYNAMIC STYLES ============
const getGlobalStyles = (theme, isDarkMode) => `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .shimmer-loading {
    background: ${theme.skeletonShimmer};
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .platform-comparison-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .platform-comparison-scrollbar::-webkit-scrollbar-track {
    background: ${theme.scrollbarTrack};
    border-radius: 4px;
  }

  .platform-comparison-scrollbar::-webkit-scrollbar-thumb {
    background: ${theme.scrollbarThumb};
    border-radius: 4px;
  }

  .platform-comparison-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${theme.scrollbarThumbHover};
  }
`;

// ============ MAIN COMPONENT ============
const PlatformComparison = ({ className = "" }) => {
  // ========== THEME ==========
  const { isDarkMode = true, theme: contextTheme } = useTheme();
  const theme = contextTheme || (isDarkMode ? darkTheme : lightTheme);
  const PLATFORM_CONFIG = getPlatformConfig(isDarkMode);

  // ========== GET DATA FROM REDUX ==========
  const platformData = useSelector(selectPlatformData);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectMetricsError);

  // ========== LOCAL STATE ==========
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [viewMode, setViewMode] = useState("overview");
  const [isHovered, setIsHovered] = useState(false);

  // Inject global styles
  useEffect(() => {
    const styleId = "platform-comparison-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = getGlobalStyles(theme, isDarkMode);

    return () => {
      const el = document.getElementById(styleId);
      if (el) document.head.removeChild(el);
    };
  }, [theme, isDarkMode]);

  // Process platform data when Redux data changes
  useEffect(() => {
    if (Object.keys(platformData).length > 0) {
      generateComparisonData();
    }
  }, [platformData, isDarkMode]);

  const generateComparisonData = () => {
    const platforms = ["google-ads", "facebook", "tiktok", "snapchat", "newsbreak"];

    const processedData = platforms.map((platform) => {
      const config = PLATFORM_CONFIG[platform];
      const data = platformData[platform] || {};

      const spend = data.spend || 0;
      const revenue = data.revenue || 0;
      const conversions = data.conversions || 0;
      const clicks = data.clicks || 0;
      const profit = data.profit || 0;
      const roi = data.roi || 0;
      const cpa = data.cpa || 0;
      const epc = data.epc || 0;
      const ctr = clicks > 0 ? (conversions / clicks) * 100 : 0;

      return {
        platform,
        ...config,
        spend,
        revenue,
        roi,
        conversions,
        clicks,
        cpa,
        ctr,
        profit,
        epc
      };
    });

    setComparisonData(processedData);
  };

  const metricOptions = [
    { value: "revenue", label: "Revenue", format: "currency" },
    { value: "spend", label: "Ad Spend", format: "currency" },
    { value: "profit", label: "Profit", format: "currency" },
    { value: "conversions", label: "Conversions", format: "number" },
    { value: "roi", label: "ROI %", format: "percentage" },
    { value: "clicks", label: "Clicks", format: "number" }
  ];

  const formatValue = (value, format) => {
    if (!value && value !== 0) return "0";

    switch (format) {
      case "currency":
        return `$${Math.round(value).toLocaleString()}`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return Math.round(value).toLocaleString();
    }
  };

  const currentMetric = metricOptions.find((m) => m.value === selectedMetric);

  // ========== CUSTOM TOOLTIP ==========
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: isDarkMode ? `${theme.bgCard}F8` : theme.bgCard,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: "16px",
            padding: "16px",
            boxShadow: isDarkMode
              ? `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${data.color}15`
              : `0 10px 40px ${theme.shadowDeep}`
          }}
        >
          <div
            className="flex items-center gap-3 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: data.bgColor,
                border: `1px solid ${data.color}30`
              }}
            >
              <img src={data.icon} alt={data.name} className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm" style={{ color: theme.textPrimary }}>
              {data.name}
            </p>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-sm" style={{ color: theme.textSecondary }}>
              {currentMetric.label}
            </span>
            <span
              className="text-sm font-bold"
              style={{
                color: data.color,
                textShadow: isDarkMode ? `0 0 20px ${data.color}40` : "none"
              }}
            >
              {formatValue(payload[0].value, currentMetric.format)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div
        className={`overflow-hidden ${className}`}
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          borderRadius: "24px",
          boxShadow: theme.shadowCard
        }}
      >
        <div
          className="p-6"
          style={{
            borderBottom: `1px solid ${theme.dividerSubtle}`,
            background: `linear-gradient(135deg, ${theme.blue}08 0%, transparent 100%)`
          }}
        >
          <div className="shimmer-loading h-6 rounded-lg w-1/3 mb-2"></div>
          <div className="shimmer-loading h-4 rounded-lg w-1/2"></div>
        </div>
        <div className="p-6">
          <div className="shimmer-loading h-64 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const hasData = comparisonData.some((p) => p.revenue > 0 || p.spend > 0 || p.clicks > 0);

  // ========== EMPTY STATE ==========
  if (!hasData) {
    return (
      <div
        className={`overflow-hidden ${className}`}
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          borderRadius: "24px",
          boxShadow: theme.shadowCard
        }}
      >
        <div
          className="p-6"
          style={{
            borderBottom: `1px solid ${theme.dividerSubtle}`,
            background: `linear-gradient(135deg, ${theme.blue}08 0%, transparent 100%)`
          }}
        >
          <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
            Platform Comparison
          </h3>
          <p className="text-sm mt-1" style={{ color: theme.textTertiary }}>
            Analytics across all platforms
          </p>
        </div>
        <div className="p-12 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              style={{ color: theme.textMuted }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p style={{ color: theme.textSecondary }}>No platform data available yet</p>
        </div>
      </div>
    );
  }

  const activePlatforms = comparisonData.filter(
    (p) => p.revenue > 0 || p.spend > 0 || p.clicks > 0
  );

  // ========== VIEW MODE BUTTON ==========
  const ViewModeButton = ({ mode, label }) => {
    const [buttonHovered, setButtonHovered] = useState(false);
    const isActive = viewMode === mode;

    return (
      <button
        onClick={() => setViewMode(mode)}
        onMouseEnter={() => setButtonHovered(true)}
        onMouseLeave={() => setButtonHovered(false)}
        className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300"
        style={{
          backgroundColor: isActive
            ? theme.blue
            : buttonHovered
              ? theme.bgCardHover
              : "transparent",
          color: isActive ? "#FFFFFF" : buttonHovered ? theme.textPrimary : theme.textSecondary,
          boxShadow: isActive
            ? isDarkMode
              ? `0 0 20px ${theme.blue}30`
              : `0 4px 12px ${theme.blue}25`
            : "none"
        }}
      >
        {label}
      </button>
    );
  };

  // ========== PLATFORM CARD ==========
  const PlatformCard = ({ platform }) => {
    const [cardHovered, setCardHovered] = useState(false);

    return (
      <div
        className="rounded-xl p-5 transition-all duration-300"
        style={{
          backgroundColor: cardHovered ? theme.bgCardHover : theme.bgSecondary,
          border: `1px solid ${cardHovered ? `${platform.color}30` : theme.borderSubtle}`,
          boxShadow: cardHovered
            ? isDarkMode
              ? `0 8px 32px ${theme.shadowSoft}, 0 0 30px ${platform.color}15`
              : `0 8px 24px ${theme.shadowSoft}`
            : "none",
          transform: cardHovered ? "translateY(-4px)" : "translateY(0)"
        }}
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: platform.bgColor,
              border: `1px solid ${platform.color}25`
            }}
          >
            <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
            {platform.name}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs mb-1" style={{ color: theme.textTertiary }}>
              Revenue
            </p>
            <p
              className="font-bold text-lg"
              style={{
                color: platform.color,
                textShadow: isDarkMode ? `0 0 20px ${platform.color}30` : "none"
              }}
            >
              ${(platform.revenue / 1000).toFixed(1)}k
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-3 pt-3"
            style={{ borderTop: `1px solid ${theme.dividerSubtle}` }}
          >
            <div>
              <p className="text-xs mb-1" style={{ color: theme.textTertiary }}>
                ROI
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: platform.roi > 0 ? theme.positive : theme.negative }}
              >
                {platform.roi.toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: theme.textTertiary }}>
                Conv
              </p>
              <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                {platform.conversions}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== TABLE ROW ==========
  const TableRow = ({ platform }) => {
    const [rowHovered, setRowHovered] = useState(false);

    return (
      <tr
        className="transition-all duration-200"
        style={{
          borderBottom: `1px solid ${theme.dividerSubtle}`,
          backgroundColor: rowHovered ? theme.tableRowHover : theme.tableRowBg
        }}
        onMouseEnter={() => setRowHovered(true)}
        onMouseLeave={() => setRowHovered(false)}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: platform.bgColor,
                border: `1px solid ${platform.color}25`
              }}
            >
              <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
              {platform.name}
            </span>
          </div>
        </td>
        <td className="p-4 text-right text-sm font-medium" style={{ color: theme.textSecondary }}>
          {formatValue(platform.spend, "currency")}
        </td>
        <td className="p-4 text-right text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {formatValue(platform.revenue, "currency")}
        </td>
        <td className="p-4 text-right text-sm font-semibold">
          <span style={{ color: platform.profit > 0 ? theme.positive : theme.negative }}>
            {formatValue(platform.profit, "currency")}
          </span>
        </td>
        <td className="p-4 text-right">
          <span
            className="inline-flex px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: platform.roi > 0 ? `${theme.positive}15` : `${theme.negative}15`,
              color: platform.roi > 0 ? theme.positive : theme.negative,
              border: `1px solid ${platform.roi > 0 ? `${theme.positive}30` : `${theme.negative}30`}`
            }}
          >
            {platform.roi.toFixed(1)}%
          </span>
        </td>
        <td className="p-4 text-right text-sm font-medium" style={{ color: theme.textSecondary }}>
          {formatValue(platform.clicks, "number")}
        </td>
        <td className="p-4 text-right text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {formatValue(platform.conversions, "number")}
        </td>
        <td className="p-4 text-right text-sm font-medium" style={{ color: theme.textSecondary }}>
          {formatValue(platform.cpa, "currency")}
        </td>
      </tr>
    );
  };

  // ========== REVENUE BAR ==========
  const RevenueBar = ({ platform, maxRevenue }) => {
    const [barHovered, setBarHovered] = useState(false);

    return (
      <div
        className="flex items-center gap-3"
        onMouseEnter={() => setBarHovered(true)}
        onMouseLeave={() => setBarHovered(false)}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200"
          style={{
            backgroundColor: platform.bgColor,
            border: `1px solid ${platform.color}25`,
            transform: barHovered ? "scale(1.1)" : "scale(1)"
          }}
        >
          <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold w-24" style={{ color: theme.textPrimary }}>
          {platform.name}
        </span>
        <div
          className="flex-1 rounded-full h-8 relative overflow-hidden"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          <div
            className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
            style={{
              width: `${(platform.revenue / maxRevenue) * 100}%`,
              background: `linear-gradient(90deg, ${platform.color}${isDarkMode ? "90" : "CC"} 0%, ${platform.color} 100%)`,
              boxShadow: barHovered
                ? isDarkMode
                  ? `0 0 20px ${platform.color}50`
                  : `0 0 12px ${platform.color}30`
                : isDarkMode
                  ? `0 0 10px ${platform.color}30`
                  : "none"
            }}
          >
            <span
              className="text-xs font-bold drop-shadow-lg"
              style={{ color: isDarkMode ? "#FFFFFF" : "#FFFFFF" }}
            >
              ${(platform.revenue / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ========== ROI BAR ==========
  const ROIBar = ({ platform }) => {
    const [barHovered, setBarHovered] = useState(false);
    const roiColor = platform.roi > 0 ? theme.positive : theme.negative;

    return (
      <div
        className="flex items-center gap-3"
        onMouseEnter={() => setBarHovered(true)}
        onMouseLeave={() => setBarHovered(false)}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200"
          style={{
            backgroundColor: platform.bgColor,
            border: `1px solid ${platform.color}25`,
            transform: barHovered ? "scale(1.1)" : "scale(1)"
          }}
        >
          <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold w-24" style={{ color: theme.textPrimary }}>
          {platform.name}
        </span>
        <div
          className="flex-1 rounded-full h-8 relative overflow-hidden"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          <div
            className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, platform.roi))}%`,
              background: `linear-gradient(90deg, ${roiColor}${isDarkMode ? "90" : "CC"} 0%, ${roiColor} 100%)`,
              boxShadow: barHovered
                ? isDarkMode
                  ? `0 0 20px ${roiColor}50`
                  : `0 0 12px ${roiColor}30`
                : isDarkMode
                  ? `0 0 10px ${roiColor}30`
                  : "none"
            }}
          >
            <span className="text-xs font-bold drop-shadow-lg" style={{ color: "#FFFFFF" }}>
              {platform.roi.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div
      className={`overflow-hidden relative transition-all duration-500 ${className}`}
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${isHovered ? theme.borderHover : theme.borderSubtle}`,
        borderRadius: "24px",
        boxShadow: isHovered ? theme.shadowCardHover : theme.shadowCard
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Glow - Only visible in dark mode */}
      {isDarkMode && (
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.blue}08 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0.5,
            filter: "blur(60px)"
          }}
        />
      )}

      {/* Header */}
      <div
        className="p-6 relative z-10"
        style={{
          borderBottom: `1px solid ${theme.dividerSubtle}`,
          background: `linear-gradient(135deg, ${theme.blue}${isDarkMode ? "08" : "05"} 0%, transparent 100%)`
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${theme.blue}${isDarkMode ? "12" : "10"}`,
                border: `1px solid ${theme.blue}25`
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: theme.blue }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Platform Comparison
              </h3>
              <p className="text-sm" style={{ color: theme.textTertiary }}>
                Analytics across all platforms
              </p>
            </div>
          </div>

          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <ViewModeButton mode="overview" label="Overview" />
            <ViewModeButton mode="detailed" label="Detailed" />
            <ViewModeButton mode="compare" label="Compare" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        {viewMode === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Metric Selector */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <span className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                Compare by:
              </span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium focus:outline-none transition-all cursor-pointer"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  color: theme.inputText
                }}
              >
                {metricOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    style={{ backgroundColor: theme.bgDropdown, color: theme.textPrimary }}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Container */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={activePlatforms}>
                  <defs>
                    {activePlatforms.map((platform) => (
                      <linearGradient
                        key={`gradient-${platform.platform}`}
                        id={`barGradient-${platform.platform}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={platform.color} stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor={platform.color}
                          stopOpacity={isDarkMode ? 0.6 : 0.8}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke={theme.gridLines} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: theme.textTertiary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.borderSubtle }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: theme.textTertiary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.borderSubtle }}
                    tickFormatter={(value) => {
                      if (currentMetric.format === "currency") {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return value > 1000 ? `${(value / 1000).toFixed(0)}k` : value;
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: `${theme.textPrimary}${isDarkMode ? "05" : "08"}` }}
                  />
                  <Bar dataKey={selectedMetric} radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {activePlatforms.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#barGradient-${entry.platform})`}
                        style={{
                          filter: isDarkMode ? `drop-shadow(0 4px 12px ${entry.color}40)` : "none"
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {activePlatforms.map((platform) => (
                <PlatformCard key={platform.platform} platform={platform} />
              ))}
            </div>
          </div>
        )}

        {viewMode === "detailed" && (
          <div
            className="overflow-x-auto rounded-xl animate-fade-in platform-comparison-scrollbar"
            style={{ border: `1px solid ${theme.borderSubtle}` }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: `linear-gradient(135deg, ${theme.tableHeaderBg} 0%, ${theme.bgMuted} 100%)`
                  }}
                >
                  <th
                    className="p-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Platform
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Spend
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Revenue
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Profit
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    ROI
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Clicks
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    Conversions
                  </th>
                  <th
                    className="p-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.textTertiary }}
                  >
                    CPA
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: theme.tableRowBg }}>
                {activePlatforms.map((platform) => (
                  <TableRow key={platform.platform} platform={platform} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "compare" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Comparison */}
              <div
                className="p-6 rounded-xl"
                style={{
                  background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
                  border: `1px solid ${theme.borderSubtle}`
                }}
              >
                <h4 className="font-semibold mb-5 text-base" style={{ color: theme.textPrimary }}>
                  Revenue Comparison
                </h4>
                <div className="space-y-4">
                  {activePlatforms
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((platform) => {
                      const maxRevenue = Math.max(...activePlatforms.map((p) => p.revenue));
                      return (
                        <RevenueBar
                          key={platform.platform}
                          platform={platform}
                          maxRevenue={maxRevenue}
                        />
                      );
                    })}
                </div>
              </div>

              {/* ROI Comparison */}
              <div
                className="p-6 rounded-xl"
                style={{
                  background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
                  border: `1px solid ${theme.borderSubtle}`
                }}
              >
                <h4 className="font-semibold mb-5 text-base" style={{ color: theme.textPrimary }}>
                  ROI Comparison
                </h4>
                <div className="space-y-4">
                  {activePlatforms
                    .sort((a, b) => b.roi - a.roi)
                    .map((platform) => (
                      <ROIBar key={platform.platform} platform={platform} />
                    ))}
                </div>
              </div>
            </div>

            {/* Area Chart Comparison */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <h4 className="font-semibold mb-5 text-base" style={{ color: theme.textPrimary }}>
                Revenue vs Spend Comparison
              </h4>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activePlatforms}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={theme.positive}
                        stopOpacity={isDarkMode ? 0.4 : 0.3}
                      />
                      <stop offset="100%" stopColor={theme.positive} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={theme.negative}
                        stopOpacity={isDarkMode ? 0.4 : 0.3}
                      />
                      <stop offset="100%" stopColor={theme.negative} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke={theme.gridLines} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: theme.textTertiary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.borderSubtle }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.textTertiary }}
                    tickLine={false}
                    axisLine={{ stroke: theme.borderSubtle }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode
                        ? `${theme.chartTooltipBg}F8`
                        : theme.chartTooltipBg,
                      border: `1px solid ${theme.borderSubtle}`,
                      borderRadius: "12px",
                      backdropFilter: "blur(16px)",
                      boxShadow: theme.shadowCard
                    }}
                    labelStyle={{ color: theme.textPrimary, fontWeight: "bold" }}
                    itemStyle={{ color: theme.textSecondary }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.positive}
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke={theme.negative}
                    strokeWidth={2.5}
                    fill="url(#spendGradient)"
                    name="Spend"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Glow - Only visible in dark mode */}
      {isDarkMode && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.blue}40, transparent)`,
            opacity: isHovered ? 1 : 0
          }}
        />
      )}
    </div>
  );
};

export default PlatformComparison;
