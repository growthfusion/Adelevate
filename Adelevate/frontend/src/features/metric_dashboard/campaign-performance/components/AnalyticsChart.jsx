import React, { useState } from "react";
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
} from "lucide-react";

const AnalyticsChart = ({ data, className = "" }) => {
  const [activeMetric, setActiveMetric] = useState("All");
  const [chartType, setChartType] = useState("area");

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

  const renderMetrics = () => {
    if (activeMetric === "All") {
      return metrics.filter((m) => m.key !== "All");
    }
    return [metrics.find((m) => m.key === activeMetric)];
  };

  const CustomTooltip = ({ active, payload, label }) => {
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

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  return (
    <div
      className={`bg-card border-2 border-border rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-300 ${className} w-[150%]  mx-auto`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
         
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border">
            <Button
              variant={chartType === "area" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
              className={`relative gap-2 transition-all duration-300 ${
                chartType === "area" ? "shadow-md" : "hover:bg-background/50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Area</span>
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className={`relative gap-2 transition-all duration-300 ${
                chartType === "line" ? "shadow-md" : "hover:bg-background/50"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Line</span>
            </Button>
          </div>

       
        </div>
      </div>

      {/* Metric Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <Button
              key={metric.key}
              variant={activeMetric === metric.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric(metric.key)}
              className={`relative gap-2 transition-all duration-300 ${
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
              <MetricIcon className="w-4 h-4" />
              <span className="font-medium">{metric.label}</span>
              {activeMetric === metric.key && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="bg-muted/30 rounded-2xl p-4 sm:p-6 border border-border/50 mb-4">
        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
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
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)", strokeWidth: 2 }}
                dy={10}
              />

              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)", strokeWidth: 2 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeDasharray: "3 3" }}
              />

              {chartType === "area"
                ? renderMetrics().map((metric) => (
                    <Area
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#color${metric.key})`}
                      animationDuration={1000}
                    />
                  ))
                : renderMetrics().map((metric) => (
                    <Line
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      stroke={metric.color}
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: metric.color,
                        strokeWidth: 2,
                        stroke: "var(--color-background)",
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: metric.color,
                      }}
                      animationDuration={1000}
                    />
                  ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
   
    </div>
  );
};

export default AnalyticsChart;
