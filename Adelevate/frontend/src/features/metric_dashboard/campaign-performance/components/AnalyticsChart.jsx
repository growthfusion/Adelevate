import React, { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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

  // Accent colors
  emerald: "#10B981",
  blue: "#2563EB",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  pink: "#EC4899",

  gridLines: "#1E1E1E"
};

// CSS Animations
const globalStyles = `
  @keyframes pulse-subtle {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
  
  .chart-glow {
    filter: drop-shadow(0 0 8px currentColor);
  }
`;

const AnalyticsChart = ({ data, className = "" }) => {
  const [activeMetric, setActiveMetric] = useState("All");
  const [chartType, setChartType] = useState("area");
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [deviceType, setDeviceType] = useState("desktop");
  const [isHovered, setIsHovered] = useState(false);

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Detect device type
  useEffect(() => {
    const detectDeviceType = () => {
      if (typeof window === "undefined") return "desktop";
      const width = window.innerWidth;
      if (width < 640) return "mobile";
      if (width < 1024) return "tablet";
      return "desktop";
    };

    setDeviceType(detectDeviceType());
    const handleResize = () => setDeviceType(detectDeviceType());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileOrTablet = deviceType === "mobile" || deviceType === "tablet";
  const isMobile = deviceType === "mobile";

  const metrics = [
    {
      key: "All",
      label: "All Metrics",
      color: theme.emerald,
      icon: BarChart3
    },
    {
      key: "revenue",
      label: "Revenue",
      color: theme.emerald,
      icon: DollarSign
    },
    {
      key: "spend",
      label: "Spend",
      color: theme.blue,
      icon: CreditCard
    },
    {
      key: "profit",
      label: "Profit",
      color: theme.cyan,
      icon: TrendingUp
    },
    {
      key: "clicks",
      label: "Clicks",
      color: theme.violet,
      icon: MousePointer
    },
    {
      key: "conversions",
      label: "Conversions",
      color: theme.pink,
      icon: ShoppingCart
    }
  ];

  const handleNextPoint = () => {
    if (activePointIndex !== null && activePointIndex < data.length - 1) {
      setActivePointIndex(activePointIndex + 1);
    } else if (activePointIndex === null && data.length > 0) {
      setActivePointIndex(0);
    }
  };

  const handlePreviousPoint = () => {
    if (activePointIndex !== null && activePointIndex > 0) {
      setActivePointIndex(activePointIndex - 1);
    }
  };

  const renderMetrics = () => {
    if (activeMetric === "All") {
      return metrics.filter((m) => m.key !== "All");
    }
    return [metrics.find((m) => m.key === activeMetric)];
  };

  // Touch gesture handling
  const touchStartRef = useRef({ x: 0, y: 0 });

  const onTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const onTouchEnd = (e) => {
    const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNextPoint();
      } else {
        handlePreviousPoint();
      }
    }
  };

  // Premium Tooltip Component
  const PremiumTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: `${theme.bgCard}F8`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.borderSubtle}`,
            borderRadius: "16px",
            padding: "16px",
            boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${theme.emerald}10`
          }}
        >
          <div
            className="flex items-center gap-2 mb-3 pb-3"
            style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.emerald}15` }}
            >
              <Calendar className="w-4 h-4" style={{ color: theme.emerald }} />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {label}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry, index) => {
              const metric = metrics.find((m) => m.key === entry.dataKey);
              const isMonetary = ["revenue", "spend", "profit"].includes(entry.dataKey);
              const MetricIcon = metric?.icon;

              return (
                <div
                  key={`tooltip-${index}`}
                  className="flex items-center justify-between gap-6 p-2.5 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: `${entry.color}08`,
                    border: `1px solid ${entry.color}20`
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {MetricIcon && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${entry.color}15` }}
                      >
                        <MetricIcon className="w-4 h-4" style={{ color: entry.color }} />
                      </div>
                    )}
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {metric?.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: entry.color,
                      textShadow: `0 0 20px ${entry.color}40`
                    }}
                  >
                    {isMonetary
                      ? `$${entry.value?.toLocaleString()}`
                      : entry.value?.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const currentIndex = data.findIndex((item) => item.date === label);
      if (isMobileOrTablet && activePointIndex !== currentIndex && currentIndex !== -1) {
        setActivePointIndex(currentIndex);
      }
      return isMobileOrTablet ? null : (
        <PremiumTooltip active={active} payload={payload} label={label} />
      );
    }
    return null;
  };

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  const getChartSettings = () => {
    const settings = {
      fontSize: 11,
      strokeWidth: 2.5,
      margin: { top: 20, right: 10, left: -20, bottom: 5 },
      dotRadius: 4,
      activeDotRadius: 7,
      interval: 0
    };

    if (deviceType === "mobile") {
      return {
        ...settings,
        fontSize: 9,
        strokeWidth: 2,
        margin: { top: 15, right: 5, left: -25, bottom: 5 },
        dotRadius: 3,
        activeDotRadius: 5,
        interval: 1
      };
    }

    if (deviceType === "tablet") {
      return {
        ...settings,
        fontSize: 10,
        strokeWidth: 2.2,
        margin: { top: 20, right: 5, left: -22, bottom: 5 },
        dotRadius: 3.5,
        activeDotRadius: 6,
        interval: "preserveStartEnd"
      };
    }

    return settings;
  };

  const chartSettings = getChartSettings();
  const activeData = activePointIndex !== null ? data[activePointIndex] : null;

  // Premium Button Component
  const MetricButton = ({ metric, isActive, onClick }) => {
    const [buttonHovered, setButtonHovered] = useState(false);
    const MetricIcon = metric.icon;

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setButtonHovered(true)}
        onMouseLeave={() => setButtonHovered(false)}
        className="relative flex items-center gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm py-1.5 xs:py-2 px-2.5 xs:px-3 sm:px-4 rounded-xl transition-all duration-300 font-medium overflow-hidden"
        style={{
          backgroundColor: isActive ? `${metric.color}12` : theme.bgCard,
          border: `1px solid ${isActive ? `${metric.color}40` : buttonHovered ? theme.borderHover : theme.borderSubtle}`,
          color: isActive ? metric.color : buttonHovered ? theme.textPrimary : theme.textSecondary,
          boxShadow: isActive
            ? `0 0 30px ${metric.color}15, inset 0 1px 0 ${metric.color}10`
            : buttonHovered
              ? `0 4px 20px ${theme.shadowSoft}`
              : "none",
          transform: buttonHovered && !isActive ? "translateY(-1px)" : "translateY(0)"
        }}
      >
        <MetricIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>{deviceType === "mobile" ? metric.label.substring(0, 3) : metric.label}</span>
        {isActive && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
            style={{
              width: "60%",
              backgroundColor: metric.color,
              boxShadow: `0 0 10px ${metric.color}`
            }}
          />
        )}
      </button>
    );
  };

  // Chart Type Toggle Button
  const ChartToggleButton = ({ type, icon: Icon, label, isActive }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <button
        onClick={() => setChartType(type)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg transition-all duration-300 font-medium"
        style={{
          backgroundColor: isActive ? theme.emerald : hovered ? theme.bgCardHover : "transparent",
          color: isActive ? theme.textPrimary : hovered ? theme.textPrimary : theme.textSecondary,
          boxShadow: isActive ? `0 0 20px ${theme.emerald}30` : "none"
        }}
      >
        <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 ${className} w-full sm:w-[95%] md:w-[100%] lg:w-[150%] mx-auto`}
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${isHovered ? theme.borderHover : theme.borderSubtle}`,
        borderRadius: isMobile ? "16px" : "24px",
        padding: isMobile ? "16px" : deviceType === "tablet" ? "20px" : "28px",
        boxShadow: `0 8px 40px ${theme.shadowSoft}, ${theme.innerShadow}`
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-32 -right-32 w-64 h-64 rounded-full transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.emerald}08 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0.5,
          filter: "blur(60px)"
        }}
      />

      {/* Header Section */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 sm:pb-5 relative z-10"
        style={{ borderBottom: `1px solid ${theme.dividerSubtle}` }}
      >
        <div className="flex items-center gap-3">
         
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: theme.textPrimary }}>
              Performance Analytics
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: theme.textTertiary }}>
              Track your key metrics
            </p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div
          className="flex items-center p-1 rounded-xl"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <ChartToggleButton
            type="area"
            icon={BarChart3}
            label="Area"
            isActive={chartType === "area"}
          />
          <ChartToggleButton
            type="line"
            icon={Activity}
            label="Line"
            isActive={chartType === "line"}
          />
        </div>
      </div>

      {/* Mobile/Tablet Date Navigation */}
      {isMobileOrTablet && activeData && (
        <div
          className="animate-slide-up flex items-center justify-between mb-4 py-3 px-4 rounded-xl"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <button
            onClick={handlePreviousPoint}
            disabled={activePointIndex === 0}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: activePointIndex === 0 ? "transparent" : theme.bgCard,
              opacity: activePointIndex === 0 ? 0.4 : 1,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: theme.textSecondary }} />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${theme.emerald}15` }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: theme.emerald }} />
            </div>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {activeData.date}
            </p>
          </div>

          <button
            onClick={handleNextPoint}
            disabled={activePointIndex === data.length - 1}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: activePointIndex === data.length - 1 ? "transparent" : theme.bgCard,
              opacity: activePointIndex === data.length - 1 ? 0.4 : 1,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: theme.textSecondary }} />
          </button>
        </div>
      )}

      {/* Metric Filter Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-5 sm:mb-6 relative z-10">
        {metrics.map((metric) => (
          <MetricButton
            key={metric.key}
            metric={metric}
            isActive={activeMetric === metric.key}
            onClick={() => setActiveMetric(metric.key)}
          />
        ))}
      </div>

      {/* Chart Container */}
      <div
        className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-4"
        style={{
          background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`,
          border: `1px solid ${theme.borderSubtle}`,
          padding: isMobile ? "12px" : deviceType === "tablet" ? "16px" : "24px"
        }}
      >
        {/* Chart glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${
              activeMetric !== "All"
                ? metrics.find((m) => m.key === activeMetric)?.color + "08"
                : theme.emerald + "05"
            } 0%, transparent 70%)`
          }}
        />

        <div className="h-44 xs:h-52 sm:h-64 md:h-72 lg:h-80 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={data}
              margin={chartSettings.margin}
              onClick={(data) => {
                if (isMobileOrTablet && data && data.activeTooltipIndex !== undefined) {
                  setActivePointIndex(data.activeTooltipIndex);
                }
              }}
            >
              {/* Enhanced Gradients */}
              {renderMetrics().map((metric) => (
                <defs key={`gradient-${metric.key}`}>
                  <linearGradient id={`color${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                    <stop offset="50%" stopColor={metric.color} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                  <filter id={`glow-${metric.key}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              ))}

              <CartesianGrid
                strokeDasharray="4 4"
                stroke={theme.gridLines}
                vertical={false}
                horizontal={true}
                opacity={0.5}
              />

              <XAxis
                dataKey="date"
                stroke={theme.textTertiary}
                fontSize={chartSettings.fontSize}
                fontWeight={500}
                tickLine={false}
                axisLine={{ stroke: theme.borderSubtle, strokeWidth: 1 }}
                dy={8}
                interval={chartSettings.interval}
              />

              <YAxis
                stroke={theme.textTertiary}
                fontSize={chartSettings.fontSize}
                fontWeight={500}
                tickLine={false}
                axisLine={{ stroke: theme.borderSubtle, strokeWidth: 1 }}
                tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
                dx={-5}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={
                  isMobileOrTablet
                    ? false
                    : {
                        stroke: theme.textTertiary,
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                        opacity: 0.5
                      }
                }
                isAnimationActive={!isMobileOrTablet}
              />

              {chartType === "area"
                ? renderMetrics().map((metric) => (
                    <Area
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={chartSettings.strokeWidth}
                      fillOpacity={1}
                      fill={`url(#color${metric.key})`}
                      filter={`url(#glow-${metric.key})`}
                      animationDuration={800}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      activeDot={{
                        r: chartSettings.activeDotRadius,
                        stroke: theme.bgCard,
                        strokeWidth: 2,
                        fill: metric.color,
                        style: { filter: `drop-shadow(0 0 6px ${metric.color})` }
                      }}
                      dot={false}
                    />
                  ))
                : renderMetrics().map((metric) => (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={chartSettings.strokeWidth}
                      filter={`url(#glow-${metric.key})`}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={{
                        r: chartSettings.dotRadius,
                        fill: theme.bgCard,
                        stroke: metric.color,
                        strokeWidth: 2
                      }}
                      activeDot={{
                        r: chartSettings.activeDotRadius,
                        stroke: theme.bgCard,
                        strokeWidth: 2,
                        fill: metric.color,
                        style: { filter: `drop-shadow(0 0 6px ${metric.color})` }
                      }}
                      animationDuration={800}
                    />
                  ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mobile/Tablet Data Summary Panel */}
      {isMobileOrTablet && activeData && (
        <div
          className="animate-slide-up mt-4 p-3 sm:p-4 rounded-xl"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {renderMetrics().map((metric) => {
              const isMonetary = ["revenue", "spend", "profit"].includes(metric.key);
              const MetricIcon = metric.icon;

              return (
                <div
                  key={metric.key}
                  className="p-3 sm:p-4 rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: `${metric.color}08`,
                    border: `1px solid ${metric.color}20`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${metric.color}15` }}
                    >
                      <MetricIcon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      {metric.label}
                    </p>
                  </div>
                  <p
                    className="text-lg sm:text-xl font-bold"
                    style={{
                      color: metric.color,
                      textShadow: `0 0 20px ${metric.color}30`
                    }}
                  >
                    {isMonetary
                      ? `$${activeData[metric.key]?.toLocaleString()}`
                      : activeData[metric.key]?.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Indicators */}
      {isMobileOrTablet && data.length > 0 && (
        <div className="flex justify-center gap-1.5 mt-5 pb-1">
          {Array.from({ length: Math.min(data.length, 9) }).map((_, idx) => {
            const isActive =
              data.length <= 9
                ? idx === activePointIndex
                : idx === Math.floor((activePointIndex * 9) / data.length);

            return (
              <div
                key={`indicator-${idx}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: isActive ? theme.emerald : theme.textMuted,
                  boxShadow: isActive ? `0 0 10px ${theme.emerald}50` : "none"
                }}
              />
            );
          })}
        </div>
      )}

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.emerald}40, transparent)`,
          opacity: isHovered ? 1 : 0
        }}
      />
    </div>
  );
};

export default AnalyticsChart;
