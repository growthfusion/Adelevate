import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

// Redux Imports
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";
import { selectPlatformData } from "@/features/metrics/metricsSlice";
import { getPlatformColor } from "@/constants/themes";

// Images
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Platform Mappings
const platformIcons = {
  facebook: fb,
  "google-ads": googleIcon,
  tiktok: tiktokIcon,
  snapchat: snapchatIcon,
  newsbreak: nb
};

const platformNames = {
  facebook: "Facebook",
  "google-ads": "Google Ads",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  newsbreak: "NewsBreak"
};

// CSS for animations
const createGlobalStyles = (theme, isDarkMode) => `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse-ring {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  .animate-pulse-ring {
    animation: pulse-ring 2s ease-in-out infinite;
  }

  .glass-card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
`;

const PlatformDistribution = ({ className = "" }) => {
  // Redux Hooks
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);
  const platformData = useSelector(selectPlatformData);

  // Local State
  const [activeBar, setActiveBar] = useState(null);
  const [hoveredPie, setHoveredPie] = useState(null);
  const [card1Hovered, setCard1Hovered] = useState(false);
  const [card2Hovered, setCard2Hovered] = useState(false);
  const [hoveredSpendItem, setHoveredSpendItem] = useState(null);
  const [hoveredRoiItem, setHoveredRoiItem] = useState(null);

  // Inject Styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "platform-dist-styles";
    styleElement.textContent = createGlobalStyles(theme, isDarkMode);

    const oldStyles = document.getElementById("platform-dist-styles");
    if (oldStyles) oldStyles.remove();

    document.head.appendChild(styleElement);
    return () => {
      const el = document.getElementById("platform-dist-styles");
      if (el) el.remove();
    };
  }, [theme, isDarkMode]);

  // Process Data
  const { spendData, roiData, totalSpend, averageROI, bestPerformer } = useMemo(() => {
    const activePlatforms = Object.entries(platformData).filter(
      ([_, metrics]) => metrics.spend > 0 || metrics.revenue > 0
    );

    const totalSpendCalc = activePlatforms.reduce((sum, [_, m]) => sum + m.spend, 0);
    const totalROICalc = activePlatforms.reduce((sum, [_, m]) => sum + m.roi, 0);

    const processedSpend = activePlatforms
      .map(([key, metrics]) => {
        const colors = getPlatformColor(key);
        return {
          id: key,
          platform: platformNames[key] || key,
          spend: metrics.spend,
          percentage: totalSpendCalc > 0 ? Math.round((metrics.spend / totalSpendCalc) * 100) : 0,
          color: colors.primary,
          bgColor: colors.light,
          icon: platformIcons[key]
        };
      })
      .sort((a, b) => b.spend - a.spend);

    const processedROI = activePlatforms
      .map(([key, metrics]) => {
        const colors = getPlatformColor(key);
        return {
          id: key,
          platform: platformNames[key] || key,
          roi: metrics.roi,
          revenue: metrics.revenue,
          trend: metrics.roi > 2 ? "up" : "down",
          change: Math.floor(Math.random() * 15) + 1,
          color: colors.primary,
          bgColor: colors.light,
          icon: platformIcons[key]
        };
      })
      .sort((a, b) => b.roi - a.roi);

    const best =
      processedROI.length > 0
        ? processedROI.reduce((max, item) => (item.roi > max.roi ? item : max))
        : { roi: 0, icon: null };

    return {
      spendData: processedSpend,
      roiData: processedROI,
      totalSpend: totalSpendCalc,
      averageROI:
        activePlatforms.length > 0 ? (totalROICalc / activePlatforms.length).toFixed(1) : 0,
      bestPerformer: best
    };
  }, [platformData]);

  const getTrendSymbol = (trend) => (trend === "up" ? "↑" : "↓");

  // Tooltips
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`animate-fade-in rounded-[16px] p-4 glass-card`}
          style={{
            backgroundColor: isDarkMode ? "rgba(12, 12, 12, 0.95)" : "rgba(255, 255, 255, 0.95)",
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: `0 20px 60px ${theme.shadowDeep}`
          }}
        >
          <div
            className="flex items-center gap-3 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: data.bgColor }}
            >
              <img src={data.icon} alt={data.platform} className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {data.platform}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-6">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Spend
              </span>
              <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                ${data.spend.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Share
              </span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {data.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`animate-fade-in rounded-[16px] p-4 min-w-[180px] glass-card`}
          style={{
            backgroundColor: isDarkMode ? "rgba(12, 12, 12, 0.95)" : "rgba(255, 255, 255, 0.95)",
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: `0 20px 60px ${theme.shadowDeep}`
          }}
        >
          <div
            className="flex items-center gap-3 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: data.bgColor }}
            >
              <img src={data.icon} alt={data.platform} className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {data.platform}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                ROI
              </span>
              <span className="text-sm font-bold" style={{ color: data.color }}>
                {data.roi.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Revenue
              </span>
              <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                ${data.revenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* === LEFT CARD: SPEND DISTRIBUTION === */}
      <div
        className={`relative overflow-hidden transition-all duration-500 glass-card`}
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.6)",
          border: `1px solid ${card1Hovered ? (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: isDarkMode
            ? card1Hovered
              ? "0 20px 50px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.3)"
            : card1Hovered
              ? "0 20px 50px rgba(0,0,0,0.1)"
              : "0 8px 32px rgba(0,0,0,0.04)"
        }}
        onMouseEnter={() => setCard1Hovered(true)}
        onMouseLeave={() => setCard1Hovered(false)}
      >
        {/* Ambient Background Glow */}
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.violet}15 0%, transparent 70%)`,
            opacity: card1Hovered ? 0.6 : 0.2,
            filter: "blur(60px)"
          }}
        />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isDarkMode ? `${theme.violet}15` : `${theme.violet}10`,
                border: `1px solid ${theme.violet}30`
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: theme.violet }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Platform Distribution
              </h3>
              <p className="text-xs" style={{ color: theme.textTertiary }}>
                Ad spend allocation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-8 relative z-10">
          <div className="relative w-56 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {spendData.map((entry, index) => (
                    <linearGradient
                      key={`pieGradient-${index}`}
                      id={`pieGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={hoveredPie !== null ? 105 : 100}
                  paddingAngle={3}
                  dataKey="spend"
                  strokeWidth={0}
                  onMouseEnter={(_, index) => setHoveredPie(index)}
                  onMouseLeave={() => setHoveredPie(null)}
                >
                  {spendData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                      style={{
                        filter:
                          hoveredPie === index ? `drop-shadow(0 0 15px ${entry.color}60)` : "none",
                        transform: hoveredPie === index ? "scale(1.02)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: theme.textPrimary,
                    textShadow: isDarkMode ? `0 0 30px ${theme.violet}30` : "none"
                  }}
                >
                  ${(totalSpend / 1000).toFixed(0)}K
                </div>
                <div className="text-xs mt-1" style={{ color: theme.textTertiary }}>
                  Total Spend
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          {spendData.map((item, index) => {
            const itemHovered = hoveredSpendItem === index;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: itemHovered
                    ? isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)"
                    : "transparent",
                  border: `1px solid ${itemHovered ? `${item.color}30` : "transparent"}`,
                  transform: itemHovered ? "translateX(6px)" : "translateX(0)"
                }}
                onMouseEnter={() => {
                  setHoveredSpendItem(index);
                  setHoveredPie(index);
                }}
                onMouseLeave={() => {
                  setHoveredSpendItem(null);
                  setHoveredPie(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300"
                    style={{
                      backgroundColor: item.bgColor,
                      transform: itemHovered ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    <img src={item.icon} alt={item.platform} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {item.platform}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    ${(item.spend / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs font-medium" style={{ color: item.color }}>
                    {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === RIGHT CARD: ROI COMPARISON === */}
      <div
        className={`relative overflow-hidden transition-all duration-500 glass-card`}
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.6)",
          border: `1px solid ${card2Hovered ? (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: isDarkMode
            ? card2Hovered
              ? "0 20px 50px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.3)"
            : card2Hovered
              ? "0 20px 50px rgba(0,0,0,0.1)"
              : "0 8px 32px rgba(0,0,0,0.04)"
        }}
        onMouseEnter={() => setCard2Hovered(true)}
        onMouseLeave={() => setCard2Hovered(false)}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.emerald}08 0%, transparent 70%)`,
            opacity: card2Hovered ? 0.6 : 0.2,
            filter: "blur(60px)"
          }}
        />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isDarkMode ? `${theme.emerald}15` : `${theme.emerald}10`,
                border: `1px solid ${theme.emerald}30`
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: theme.emerald }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                ROI Comparison
              </h3>
              <p className="text-xs" style={{ color: theme.textTertiary }}>
                Return on investment
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
          <div
            className="rounded-xl p-4 transition-all duration-300"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, ${theme.blue}15 0%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(135deg, ${theme.blue}10 0%, rgba(255,255,255,0) 100%)`,
              border: `1px solid ${theme.blue}20`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse-ring"
                style={{ backgroundColor: theme.blue }}
              />
              <span className="text-xs font-medium" style={{ color: theme.textTertiary }}>
                Avg ROI
              </span>
            </div>
            <div
              className="text-2xl font-bold"
              style={{
                color: theme.textPrimary,
                textShadow: isDarkMode ? `0 0 20px ${theme.blue}30` : "none"
              }}
            >
              {averageROI}x
            </div>
          </div>
          <div
            className="rounded-xl p-4 transition-all duration-300"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, ${theme.emerald}15 0%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(135deg, ${theme.emerald}10 0%, rgba(255,255,255,0) 100%)`,
              border: `1px solid ${theme.emerald}20`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse-ring"
                style={{ backgroundColor: theme.emerald }}
              />
              <span className="text-xs font-medium" style={{ color: theme.textTertiary }}>
                Best Performer
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bestPerformer.icon && <img src={bestPerformer.icon} alt="" className="w-4 h-4" />}
              <span
                className="text-lg font-bold"
                style={{
                  color: theme.textPrimary,
                  textShadow: isDarkMode ? `0 0 20px ${theme.emerald}30` : "none"
                }}
              >
                {bestPerformer.roi.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>

        <div
          className="h-52 mb-6 rounded-xl p-4 relative z-10"
          style={{
            background: isDarkMode
              ? `linear-gradient(180deg, ${theme.bgChart} 0%, rgba(0,0,0,0) 100%)`
              : `linear-gradient(180deg, ${theme.bgChart} 0%, rgba(255,255,255,0) 100%)`,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roiData}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive) {
                  setActiveBar(state.activeTooltipIndex);
                } else {
                  setActiveBar(null);
                }
              }}
              onMouseLeave={() => setActiveBar(null)}
            >
              <defs>
                {roiData.map((entry, index) => (
                  <linearGradient
                    key={`barGradient-${index}`}
                    id={`barGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={theme.gridLines} opacity={0.5} />
              <XAxis
                dataKey="platform"
                stroke={theme.textTertiary}
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: theme.borderSubtle }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                stroke={theme.textTertiary}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: theme.borderSubtle }}
                tickFormatter={(value) => `${value}x`}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              />
              <Bar dataKey="roi" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {roiData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={`url(#barGradient-${index})`}
                    style={{
                      filter:
                        activeBar === index ? `drop-shadow(0 4px 12px ${entry.color}50)` : "none",
                      opacity: activeBar === null || activeBar === index ? 1 : 0.3,
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 relative z-10">
          {roiData.map((item, index) => {
            const cardHovered = hoveredRoiItem === index;
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: cardHovered
                    ? isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)"
                    : "transparent",
                  border: `1px solid ${cardHovered ? `${item.color}30` : theme.borderSubtle}`,
                  transform: cardHovered ? "translateY(-2px)" : "translateY(0)"
                }}
                onMouseEnter={() => {
                  setHoveredRoiItem(index);
                  setActiveBar(index);
                }}
                onMouseLeave={() => {
                  setHoveredRoiItem(null);
                  setActiveBar(null);
                }}
              >
                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <img src={item.icon} alt={item.platform} className="w-4 h-4" />
                    </div>
                    <div>
                      <span
                        className="text-sm font-semibold block"
                        style={{ color: theme.textPrimary }}
                      >
                        {item.platform}
                      </span>
                      <span className="text-xs" style={{ color: theme.textTertiary }}>
                        Rev: ${(item.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: item.color }}>
                      {item.roi.toFixed(2)}x
                    </div>
                    <div
                      className="flex items-center justify-end gap-1 text-xs font-medium"
                      style={{ color: item.trend === "up" ? theme.emerald : theme.red }}
                    >
                      <span>{getTrendSymbol(item.trend)}</span>
                      <span>{item.change}%</span>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full" style={{ backgroundColor: theme.bgMuted }}>
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min((item.roi / 5) * 100, 100)}%`,
                      background: item.color,
                      opacity: 0.8
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlatformDistribution;
