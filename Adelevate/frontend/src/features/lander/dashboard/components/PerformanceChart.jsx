import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { selectThemeColors } from "@/features/theme/themeSlice";
import { Maximize2, Download } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = ({ data = [] }) => {
  const theme = useSelector(selectThemeColors);
  const [activeMetrics, setActiveMetrics] = useState(["views", "clicks", "conversions"]);

  const toggleMetric = (metric) => {
    setActiveMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      activeMetrics.includes("views") && {
        label: "Views",
        data: data.map((d) => d.views),
        borderColor: theme.blue,
        backgroundColor: `${theme.blue}20`,
        fill: true,
        tension: 0.4,
        yAxisID: "y"
      },
      activeMetrics.includes("clicks") && {
        label: "Clicks",
        data: data.map((d) => d.clicks),
        borderColor: theme.green,
        backgroundColor: `${theme.green}20`,
        fill: true,
        tension: 0.4,
        yAxisID: "y"
      },
      activeMetrics.includes("conversions") && {
        label: "Conversions",
        data: data.map((d) => d.conversions),
        borderColor: theme.purple,
        backgroundColor: `${theme.purple}20`,
        fill: true,
        tension: 0.4,
        yAxisID: "y"
      },
      activeMetrics.includes("revenue") && {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        borderColor: theme.yellow,
        backgroundColor: `${theme.yellow}20`,
        fill: true,
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
        <div>
          <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
            Performance Overview
          </h3>
          <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
            Daily metrics trends
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PerformanceChart;
