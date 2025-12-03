import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart2, TrendingUp, Maximize2, Download } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsChart = ({ data = [] }) => {
  const theme = useSelector(selectThemeColors);
  const [chartType, setChartType] = useState("line");
  const [activeMetrics, setActiveMetrics] = useState(["views", "clicks", "conversions", "revenue"]);

  const toggleMetric = (metric) => {
    setActiveMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const metricColors = {
    views: { border: theme.blue, bg: `${theme.blue}20` },
    clicks: { border: theme.green, bg: `${theme.green}20` },
    conversions: { border: theme.purple, bg: `${theme.purple}20` },
    revenue: { border: theme.yellow, bg: `${theme.yellow}20` }
  };

  const chartData = {
    labels: data.map((d) => d.week),
    datasets: [
      activeMetrics.includes("views") && {
        label: "Views",
        data: data.map((d) => d.views),
        borderColor: metricColors.views.border,
        backgroundColor: chartType === "line" ? metricColors.views.bg : metricColors.views.border,
        fill: chartType === "line",
        tension: 0.4
      },
      activeMetrics.includes("clicks") && {
        label: "Clicks",
        data: data.map((d) => d.clicks),
        borderColor: metricColors.clicks.border,
        backgroundColor: chartType === "line" ? metricColors.clicks.bg : metricColors.clicks.border,
        fill: chartType === "line",
        tension: 0.4
      },
      activeMetrics.includes("conversions") && {
        label: "Conversions",
        data: data.map((d) => d.conversions),
        borderColor: metricColors.conversions.border,
        backgroundColor: chartType === "line" ? metricColors.conversions.bg : metricColors.conversions.border,
        fill: chartType === "line",
        tension: 0.4
      },
      activeMetrics.includes("revenue") && {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        borderColor: metricColors.revenue.border,
        backgroundColor: chartType === "line" ? metricColors.revenue.bg : metricColors.revenue.border,
        fill: chartType === "line",
        tension: 0.4,
        yAxisID: "y1"
      }
    ].filter(Boolean)
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.bgTooltip,
        titleColor: theme.textPrimary,
        bodyColor: theme.textSecondary,
        borderColor: theme.borderSubtle,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.borderSubtle,
          drawBorder: false
        },
        ticks: {
          color: theme.textSecondary
        }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        grid: {
          color: theme.borderSubtle,
          drawBorder: false
        },
        ticks: {
          color: theme.textSecondary
        }
      },
      y1: {
        type: "linear",
        display: false,
        position: "right"
      }
    }
  };

  const metrics = [
    { key: "views", label: "Views", color: theme.blue },
    { key: "clicks", label: "Clicks", color: theme.green },
    { key: "conversions", label: "Conversions", color: theme.purple },
    { key: "revenue", label: "Revenue", color: theme.yellow }
  ];

  const ChartComponent = chartType === "line" ? Line : Bar;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Performance Trends
        </h3>
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChartType("line")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: chartType === "line" ? `${theme.blue}20` : theme.bgSecondary,
                color: chartType === "line" ? theme.blue : theme.textSecondary,
                border: `1px solid ${chartType === "line" ? `${theme.blue}40` : theme.borderSubtle}`
              }}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("bar")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: chartType === "bar" ? `${theme.blue}20` : theme.bgSecondary,
                color: chartType === "bar" ? theme.blue : theme.textSecondary,
                border: `1px solid ${chartType === "bar" ? `${theme.blue}40` : theme.borderSubtle}`
              }}
            >
              Bar
            </button>
          </div>

          <button
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => toggleMetric(metric.key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeMetrics.includes(metric.key) ? `${metric.color}20` : theme.bgSecondary,
              color: activeMetrics.includes(metric.key) ? metric.color : theme.textSecondary,
              border: `1px solid ${activeMetrics.includes(metric.key) ? `${metric.color}40` : theme.borderSubtle}`
            }}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ChartComponent data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
