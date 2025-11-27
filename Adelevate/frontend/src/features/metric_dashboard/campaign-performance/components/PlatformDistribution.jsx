import React, { useState, useEffect } from "react";
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
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Premium Dark Theme
const theme = {
  bgMain: "#050505",
  bgSecondary: "#0A0A0A",
  bgCard: "#0C0C0C",
  bgCardHover: "#101010",
  bgChart: "#111111",
  bgChartGradient: "#0C0C0C",
  bgMuted: "#0F0F0F",

  borderSubtle: "#1A1A1A",
  borderHover: "#252525",
  borderMuted: "#1E1E1E",
  dividerSubtle: "#161616",

  shadowSoft: "rgba(0, 0, 0, 0.55)",
  shadowDeep: "rgba(0, 0, 0, 0.7)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",

  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textTertiary: "#6B6B6B",
  textMuted: "#525252",

  emerald: "#10B981",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  pink: "#EC4899",
  red: "#EF4444",
  yellow: "#FACC15",
  orange: "#FB923C",

  gridLines: "#1E1E1E"
};

// CSS for animations
const globalStyles = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
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
`;

const PlatformDistribution = ({ className = "" }) => {
  const [activeBar, setActiveBar] = useState(null);
  const [hoveredPie, setHoveredPie] = useState(null);
  const [card1Hovered, setCard1Hovered] = useState(false);
  const [card2Hovered, setCard2Hovered] = useState(false);

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  const spendData = [
    {
      platform: "Google Ads",
      spend: 45000,
      percentage: 42,
      color: "#34A853",
      bgColor: "rgba(52, 168, 83, 0.12)",
      icon: googleIcon
    },
    {
      platform: "Facebook",
      spend: 32000,
      percentage: 30,
      color: "#1877F2",
      bgColor: "rgba(24, 119, 242, 0.12)",
      icon: fb
    },
    {
      platform: "TikTok",
      spend: 18000,
      percentage: 17,
      color: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.12)",
      icon: tiktokIcon
    },
    {
      platform: "Snapchat",
      spend: 12000,
      percentage: 11,
      color: "#FFFC00",
      bgColor: "rgba(255, 252, 0, 0.12)",
      icon: snapchatIcon
    },
    {
      platform: "NewsBreak",
      spend: 8000,
      percentage: 7,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      icon: nb
    }
  ];

  const roiTrendData = [
    {
      platform: "Google Ads",
      roi: 3.2,
      trend: "up",
      change: 8,
      color: "#34A853",
      bgColor: "rgba(52, 168, 83, 0.12)",
      icon: googleIcon,
      revenue: 144000
    },
    {
      platform: "Facebook",
      roi: 4.1,
      trend: "up",
      change: 15,
      color: "#1877F2",
      bgColor: "rgba(24, 119, 242, 0.12)",
      icon: fb,
      revenue: 131200
    },
    {
      platform: "TikTok",
      roi: 2.8,
      trend: "down",
      change: -5,
      color: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.12)",
      icon: tiktokIcon,
      revenue: 50400
    },
    {
      platform: "Snapchat",
      roi: 3.7,
      trend: "up",
      change: 12,
      color: "#FFFC00",
      bgColor: "rgba(255, 252, 0, 0.12)",
      icon: snapchatIcon,
      revenue: 44400
    },
    {
      platform: "NewsBreak",
      roi: 3.5,
      trend: "up",
      change: 10,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      icon: nb,
      revenue: 28000
    }
  ];

  // Premium Dark Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: `${theme.bgCard}F8`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: "16px",
            padding: "16px",
            boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${data?.color}15`
          }}
        >
          <div
            className="flex items-center gap-3 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: data?.bgColor,
                border: `1px solid ${data?.color}30`
              }}
            >
              <img src={data?.icon} alt={data?.platform} className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {data?.platform}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-6">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Spend
              </span>
              <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                ${data?.spend?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Share
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: data?.color,
                  textShadow: `0 0 20px ${data?.color}40`
                }}
              >
                {data?.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Premium Dark Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: `${theme.bgCard}F8`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: "16px",
            padding: "16px",
            minWidth: "200px",
            boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${data?.color}15`
          }}
        >
          <div
            className="flex items-center gap-3 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: data?.bgColor,
                border: `1px solid ${data?.color}30`
              }}
            >
              <img src={data?.icon} alt={data?.platform} className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {data?.platform}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                ROI
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: data?.color,
                  textShadow: `0 0 20px ${data?.color}40`
                }}
              >
                {data?.roi?.toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Revenue
              </span>
              <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                ${(data?.revenue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: theme.textTertiary }}>
                Trend
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: data?.trend === "up" ? theme.emerald : theme.red
                }}
              >
                {data?.trend === "up" ? "↑" : "↓"} {Math.abs(data?.change)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendSymbol = (trend) => (trend === "up" ? "↑" : "↓");

  const averageROI = (
    roiTrendData.reduce((sum, item) => sum + item.roi, 0) / roiTrendData.length
  ).toFixed(1);

  const bestPerformer = roiTrendData.reduce((max, item) => (item.roi > max.roi ? item : max));

  const totalSpend = spendData.reduce((sum, item) => sum + item.spend, 0);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Platform Spend Distribution */}
      <div
        className="relative overflow-hidden transition-all duration-500"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${card1Hovered ? theme.borderHover : theme.borderSubtle}`,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: `0 8px 40px ${theme.shadowSoft}, ${theme.innerShadow}`
        }}
        onMouseEnter={() => setCard1Hovered(true)}
        onMouseLeave={() => setCard1Hovered(false)}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.blue}08 0%, transparent 70%)`,
            opacity: card1Hovered ? 1 : 0.5,
            filter: "blur(60px)"
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${theme.violet}12`,
                border: `1px solid ${theme.violet}25`
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
          <button
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textSecondary
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>

        {/* Pie Chart */}
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
                  {spendData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                      style={{
                        filter:
                          hoveredPie === index ? `drop-shadow(0 0 12px ${entry.color}60)` : "none",
                        transform: hoveredPie === index ? "scale(1.02)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: theme.textPrimary,
                    textShadow: `0 0 30px ${theme.violet}30`
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

        {/* Platform List */}
        <div className="space-y-2 relative z-10">
          {spendData?.map((item, index) => {
            const [itemHovered, setItemHovered] = useState(false);

            return (
              <div
                key={item?.platform}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: itemHovered ? theme.bgCardHover : "transparent",
                  border: `1px solid ${itemHovered ? `${item.color}30` : "transparent"}`,
                  transform: itemHovered ? "translateX(8px)" : "translateX(0)"
                }}
                onMouseEnter={() => {
                  setItemHovered(true);
                  setHoveredPie(index);
                }}
                onMouseLeave={() => {
                  setItemHovered(false);
                  setHoveredPie(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300"
                    style={{
                      backgroundColor: item?.bgColor,
                      border: `1px solid ${item?.color}25`,
                      transform: itemHovered ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    <img src={item?.icon} alt={item?.platform} className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {item?.platform}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    ${(item?.spend / 1000).toFixed(0)}K
                  </div>
                  <div
                    className="text-xs font-medium"
                    style={{
                      color: item?.color,
                      textShadow: itemHovered ? `0 0 10px ${item?.color}50` : "none"
                    }}
                  >
                    {item?.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.violet}40, transparent)`,
            opacity: card1Hovered ? 1 : 0
          }}
        />
      </div>

      {/* ROI Comparison */}
      <div
        className="relative overflow-hidden transition-all duration-500"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${card2Hovered ? theme.borderHover : theme.borderSubtle}`,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: `0 8px 40px ${theme.shadowSoft}, ${theme.innerShadow}`
        }}
        onMouseEnter={() => setCard2Hovered(true)}
        onMouseLeave={() => setCard2Hovered(false)}
      >
        {/* Ambient Glow */}
        <div
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.emerald}08 0%, transparent 70%)`,
            opacity: card2Hovered ? 1 : 0.5,
            filter: "blur(60px)"
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${theme.emerald}12`,
                border: `1px solid ${theme.emerald}25`
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
          <button
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textSecondary
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
          <div
            className="rounded-xl p-4 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${theme.blue}12 0%, ${theme.blue}05 100%)`,
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
                textShadow: `0 0 20px ${theme.blue}30`
              }}
            >
              {averageROI}x
            </div>
          </div>
          <div
            className="rounded-xl p-4 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${theme.emerald}12 0%, ${theme.emerald}05 100%)`,
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
              <img src={bestPerformer.icon} alt="" className="w-4 h-4" />
              <span
                className="text-lg font-bold"
                style={{
                  color: theme.textPrimary,
                  textShadow: `0 0 20px ${theme.emerald}30`
                }}
              >
                {bestPerformer.roi}x
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          className="h-52 mb-6 rounded-xl p-4 relative z-10"
          style={{
            background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roiTrendData}
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
                {roiTrendData.map((entry, index) => (
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
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: `${theme.textPrimary}05` }} />
              <Bar dataKey="roi" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {roiTrendData?.map((entry, index) => (
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

        {/* Platform ROI Cards */}
        <div className="space-y-2 relative z-10">
          {roiTrendData?.map((item, index) => {
            const [cardHovered, setCardHovered] = useState(false);

            return (
              <div
                key={item?.platform}
                className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: cardHovered ? theme.bgCardHover : theme.bgSecondary,
                  border: `1px solid ${cardHovered ? `${item.color}30` : theme.borderSubtle}`,
                  boxShadow: cardHovered
                    ? `0 8px 32px ${theme.shadowSoft}, 0 0 20px ${item.color}10`
                    : "none",
                  transform: cardHovered ? "translateY(-2px)" : "translateY(0)"
                }}
                onMouseEnter={() => {
                  setCardHovered(true);
                  setActiveBar(index);
                }}
                onMouseLeave={() => {
                  setCardHovered(false);
                  setActiveBar(null);
                }}
              >
                {/* Background gradient on hover */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, ${item?.color}08 0%, transparent 100%)`,
                    opacity: cardHovered ? 1 : 0
                  }}
                />

                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300"
                      style={{
                        backgroundColor: item?.bgColor,
                        border: `1px solid ${item?.color}25`,
                        transform: cardHovered ? "scale(1.1)" : "scale(1)"
                      }}
                    >
                      <img src={item?.icon} alt={item?.platform} className="w-5 h-5" />
                    </div>
                    <div>
                      <span
                        className="text-sm font-semibold block"
                        style={{ color: theme.textPrimary }}
                      >
                        {item?.platform}
                      </span>
                      <span className="text-xs" style={{ color: theme.textTertiary }}>
                        Revenue: ${(item?.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className="text-xl font-bold"
                        style={{
                          color: item?.color,
                          textShadow: cardHovered ? `0 0 20px ${item?.color}40` : "none"
                        }}
                      >
                        {item?.roi?.toFixed(1)}x
                      </div>
                      <div className="text-xs" style={{ color: theme.textTertiary }}>
                        ROI
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold min-w-[70px] justify-center"
                      style={{
                        backgroundColor:
                          item?.trend === "up" ? `${theme.emerald}15` : `${theme.red}15`,
                        color: item?.trend === "up" ? theme.emerald : theme.red,
                        border: `1px solid ${item?.trend === "up" ? `${theme.emerald}30` : `${theme.red}30`}`
                      }}
                    >
                      <span className="text-base">{getTrendSymbol(item?.trend)}</span>
                      <span>{Math.abs(item?.change)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1" style={{ backgroundColor: theme.bgMuted }}>
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(item?.roi / 5) * 100}%`,
                      background: `linear-gradient(90deg, ${item?.color}80 0%, ${item?.color} 100%)`,
                      boxShadow: cardHovered ? `0 0 10px ${item?.color}50` : "none"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.emerald}40, transparent)`,
            opacity: card2Hovered ? 1 : 0
          }}
        />
      </div>
    </div>
  );
};

export default PlatformDistribution;
