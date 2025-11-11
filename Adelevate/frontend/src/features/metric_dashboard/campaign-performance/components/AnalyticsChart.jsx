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
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/Button";
import {
  Maximize2,
  TrendingUp,
  DollarSign,
  CreditCard,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AnalyticsChart = ({ data, className = "" }) => {
  const [activeMetric, setActiveMetric] = useState("All");
  const [chartType, setChartType] = useState("area");
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [deviceType, setDeviceType] = useState("desktop");

  // Detect device type on mount and when window is resized
  useEffect(() => {
    const detectDeviceType = () => {
      if (typeof window === "undefined") return "desktop";

      const width = window.innerWidth;
      if (width < 640) return "mobile";
      if (width < 1024) return "tablet";
      return "desktop";
    };

    setDeviceType(detectDeviceType());

    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileOrTablet = deviceType === "mobile" || deviceType === "tablet";
  const isMobile = deviceType === "mobile";

  const metrics = [
    {
      key: "All",
      label: "All Metrics",
      color: "#10B981",
      icon: BarChart3,
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      key: "revenue",
      label: "Revenue",
      color: "#10B981",
      icon: DollarSign,
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      key: "spend",
      label: "Spend",
      color: "#2563EB",
      icon: CreditCard,
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      key: "profit",
      label: "Profit",
      color: "#06B6D4",
      icon: TrendingUp,
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
    {
      key: "clicks",
      label: "Clicks",
      color: "#8B5CF6",
      icon: MousePointer,
      bgColor: "bg-violet-50 dark:bg-violet-950",
      borderColor: "border-violet-200 dark:border-violet-800",
    },
    {
      key: "conversions",
      label: "Conversions",
      color: "#EC4899",
      icon: ShoppingCart,
      bgColor: "bg-pink-50 dark:bg-pink-950",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
  ];

  // Methods for navigating between data points
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
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e) => {
    const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;

    // Detect horizontal swipe (at least 50px movement)
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swiped left, go to next data point
        handleNextPoint();
      } else {
        // Swiped right, go to previous data point
        handlePreviousPoint();
      }
    }
  };

  // Desktop-only tooltip component
  const DesktopTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border-2 border-border rounded-xl p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">{label}</p>
          </div>
          <div className="space-y-2.5">
            {payload.map((entry, index) => {
              const metric = metrics.find((m) => m.key === entry.dataKey);
              const isMonetary = ["revenue", "spend", "profit"].includes(
                entry.dataKey
              );
              const MetricIcon = metric?.icon;

              return (
                <div
                  key={`tooltip-${index}`}
                  className={`flex items-center justify-between gap-4 p-2 rounded-lg ${metric?.bgColor} ${metric?.borderColor} border transition-all hover:scale-105`}
                >
                  <div className="flex items-center gap-2">
                    {MetricIcon && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: entry.color + "20" }}
                      >
                        <MetricIcon
                          className="w-4 h-4"
                          style={{ color: entry.color }}
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {metric?.label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: entry.color }}
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

  // Custom tooltip that sets the active point for mobile/tablet but only shows on desktop
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the current index in data array
      const currentIndex = data.findIndex((item) => item.date === label);

      // If on mobile/tablet, store the active index for navigation but don't show tooltip
      if (
        isMobileOrTablet &&
        activePointIndex !== currentIndex &&
        currentIndex !== -1
      ) {
        setActivePointIndex(currentIndex);
      }

      // Only return the actual tooltip component for desktop
      return isMobileOrTablet ? null : (
        <DesktopTooltip active={active} payload={payload} label={label} />
      );
    }
    return null;
  };

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  // Helper to get responsive chart settings
  const getChartSettings = () => {
    const settings = {
      fontSize: 12,
      strokeWidth: 3,
      margin: { top: 20, right: 10, left: -20, bottom: 5 },
      dotRadius: 4,
      activeDotRadius: 6,
      interval: 0,
    };

    if (deviceType === "mobile") {
      return {
        ...settings,
        fontSize: 9,
        strokeWidth: 2,
        margin: { top: 15, right: 5, left: -25, bottom: 5 },
        dotRadius: 3,
        activeDotRadius: 5,
        interval: 1,
      };
    }

    if (deviceType === "tablet") {
      return {
        ...settings,
        fontSize: 10,
        strokeWidth: 2.5,
        margin: { top: 20, right: 5, left: -22, bottom: 5 },
        dotRadius: 3.5,
        activeDotRadius: 5.5,
        interval: "preserveStartEnd",
      };
    }

    return settings;
  };

  const chartSettings = getChartSettings();

  // Get the active data point if available
  const activeData = activePointIndex !== null ? data[activePointIndex] : null;

  return (
    <div
      className={`bg-card border-2 border-border rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 lg:p-8 transition-all duration-300 ${className} w-full sm:w-[95%] md:w-[100%] lg:w-[150%] mx-auto`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Any header content here */}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-border">
            <Button
              variant={chartType === "area" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
              className={`relative gap-1.5 sm:gap-2 text-xs sm:text-sm py-1 sm:py-1.5 px-2 sm:px-2.5 h-auto transition-all duration-300 ${
                chartType === "area" ? "shadow-md" : "hover:bg-background/50"
              }`}
            >
              <BarChart3 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Area</span>
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className={`relative gap-1.5 sm:gap-2 text-xs sm:text-sm py-1 sm:py-1.5 px-2 sm:px-2.5 h-auto transition-all duration-300 ${
                chartType === "line" ? "shadow-md" : "hover:bg-background/50"
              }`}
            >
              <Activity className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Line</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Date Navigation - Show above chart when a point is active */}
      {isMobileOrTablet && activeData && (
        <div className="flex items-center justify-between mb-4 py-2 px-3 bg-muted/30 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPoint}
            disabled={activePointIndex === 0}
            className="p-1.5 h-auto"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <p className="text-sm font-bold text-foreground">
              {activeData.date}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPoint}
            disabled={activePointIndex === data.length - 1}
            className="p-1.5 h-auto"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Metric Filter Buttons */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <Button
              key={metric.key}
              variant={activeMetric === metric.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric(metric.key)}
              className={`relative gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm py-1 xs:py-1.5 px-2 h-auto transition-all duration-300 ${
                activeMetric === metric.key
                  ? `shadow-lg ${metric.bgColor} ${metric.borderColor} hover:scale-105`
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              style={
                activeMetric === metric.key
                  ? {
                      backgroundColor: metric.color + "15",
                      borderColor: metric.color + "50",
                      color: metric.color,
                    }
                  : {}
              }
            >
              <MetricIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              {deviceType === "mobile" ? (
                <span className="font-medium">
                  {metric.label.substring(0, 3)}
                </span>
              ) : (
                <span className="font-medium">{metric.label}</span>
              )}
              {activeMetric === metric.key && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 sm:w-8 h-0.5 sm:h-1 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="bg-muted/30 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-4 md:p-6 border border-border/50 mb-4">
        <div className="h-40 xs:h-48 sm:h-64 md:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={data}
              margin={chartSettings.margin}
              onClick={(data) => {
                if (
                  isMobileOrTablet &&
                  data &&
                  data.activeTooltipIndex !== undefined
                ) {
                  setActivePointIndex(data.activeTooltipIndex);
                }
              }}
            >
              {/* Gradients */}
              {renderMetrics().map((metric) => (
                <defs key={`gradient-${metric.key}`}>
                  <linearGradient
                    id={`color${metric.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={metric.color}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={metric.color}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
              ))}

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
                horizontal={true}
                opacity={0.5}
              />

              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                fontSize={chartSettings.fontSize}
                fontWeight={600}
                tickLine={false}
                axisLine={{
                  stroke: "var(--color-border)",
                  strokeWidth: isMobile ? 1 : 2,
                }}
                dy={5}
                interval={chartSettings.interval}
                tick={{
                  fontSize: chartSettings.fontSize,
                }}
              />

              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={chartSettings.fontSize}
                fontWeight={600}
                tickLine={false}
                axisLine={{
                  stroke: "var(--color-border)",
                  strokeWidth: isMobile ? 1 : 2,
                }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
                tick={{
                  fontSize: chartSettings.fontSize,
                }}
              />

              {/* Only use tooltip on desktop */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={isMobileOrTablet ? false : { strokeDasharray: "3 3" }}
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
                      animationDuration={1000}
                      activeDot={{
                        r: chartSettings.activeDotRadius,
                        stroke: "var(--color-background)",
                        strokeWidth: isMobile ? 1 : 2,
                        fill: metric.color,
                        onClick: (data) => {
                          // Custom click handler for dots
                          if (isMobileOrTablet) {
                            const idx = data.index;
                            setActivePointIndex(idx);
                          }
                        },
                      }}
                      dot={
                        activePointIndex !== null && isMobileOrTablet
                          ? {
                              r: (props) =>
                                props.index === activePointIndex
                                  ? chartSettings.activeDotRadius
                                  : chartSettings.dotRadius,
                              fill: (props) =>
                                props.index === activePointIndex
                                  ? metric.color
                                  : "var(--color-background)",
                              stroke: metric.color,
                              strokeWidth: 1.5,
                            }
                          : false
                      }
                    />
                  ))
                : renderMetrics().map((metric) => (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={chartSettings.strokeWidth}
                      dot={
                        activePointIndex !== null && isMobileOrTablet
                          ? {
                              r: (props) =>
                                props.index === activePointIndex
                                  ? chartSettings.activeDotRadius
                                  : chartSettings.dotRadius,
                              fill: (props) =>
                                props.index === activePointIndex
                                  ? metric.color
                                  : "var(--color-background)",
                              stroke: metric.color,
                              strokeWidth: 1.5,
                            }
                          : {
                              r: chartSettings.dotRadius,
                              fill: metric.color,
                              strokeWidth: isMobileOrTablet ? 1 : 2,
                              stroke: "var(--color-background)",
                            }
                      }
                      activeDot={{
                        r: chartSettings.activeDotRadius,
                        strokeWidth: isMobileOrTablet ? 1 : 2,
                        fill: metric.color,
                        onClick: (data) => {
                          // Custom click handler for dots
                          if (isMobileOrTablet) {
                            const idx = data.index;
                            setActivePointIndex(idx);
                          }
                        },
                      }}
                      animationDuration={1000}
                    />
                  ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mobile/Tablet Data Summary Panel */}
      {isMobileOrTablet && activeData && (
        <div className="animate-in slide-in-from-bottom fade-in duration-200 mt-2 sm:mt-4 p-2 sm:p-3 border rounded-lg bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            {renderMetrics().map((metric) => {
              const isMonetary = ["revenue", "spend", "profit"].includes(
                metric.key
              );
              return (
                <div
                  key={metric.key}
                  className={`p-2 sm:p-3 rounded-lg border ${metric.bgColor} ${metric.borderColor}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1">
                      <metric.icon
                        className="w-3.5 h-3.5"
                        style={{ color: metric.color }}
                      />
                      <p className="text-xs text-foreground font-medium">
                        {metric.label}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color + "40" }}
                    ></div>
                  </div>
                  <p
                    className="text-sm sm:text-base font-bold text-center sm:text-right mt-1"
                    style={{ color: metric.color }}
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

      {/* Navigation Indicators for Mobile/Tablet */}
      {isMobileOrTablet && data.length > 0 && (
        <div className="flex justify-center gap-1 mt-4 pb-1">
          {Array.from({ length: Math.min(data.length, 9) }).map((_, idx) => {
            const isActive =
              data.length <= 9
                ? idx === activePointIndex
                : idx === Math.floor((activePointIndex * 9) / data.length);

            return (
              <div
                key={`indicator-${idx}`}
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? "w-4 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
