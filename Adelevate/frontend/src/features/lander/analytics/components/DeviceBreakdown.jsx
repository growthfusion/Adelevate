import React from "react";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

ChartJS.register(ArcElement, Tooltip, Legend);

const DeviceBreakdown = ({ devices = [] }) => {
  const theme = useSelector(selectThemeColors);

  const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet
  };

  const chartData = {
    labels: devices.map((d) => d.device),
    datasets: [
      {
        data: devices.map((d) => d.percentage),
        backgroundColor: [
          `${theme.blue}CC`,
          `${theme.green}CC`,
          `${theme.yellow}CC`
        ],
        borderColor: [theme.blue, theme.green, theme.yellow],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.bgTooltip,
        titleColor: theme.textPrimary,
        bodyColor: theme.textSecondary,
        borderColor: theme.borderSubtle,
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  const deviceColors = [theme.blue, theme.green, theme.yellow];

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
        Device Breakdown
      </h3>

      {/* Chart */}
      <div className="h-48 mb-4">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {devices.map((device, index) => {
          const DeviceIcon = deviceIcons[device.device] || Smartphone;
          const color = deviceColors[index];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <DeviceIcon className="w-4 h-4" style={{ color: theme.textSecondary }} />
                <span className="text-sm" style={{ color: theme.textPrimary }}>
                  {device.device}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {device.percentage}%
                </span>
                <span className="text-xs ml-2" style={{ color: theme.textTertiary }}>
                  ({device.conversions}% conv)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="w-full mt-4 py-2 text-sm font-medium rounded-lg transition-all"
        style={{
          backgroundColor: theme.bgSecondary,
          color: theme.blue,
          border: `1px solid ${theme.borderSubtle}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${theme.blue}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.bgSecondary;
        }}
      >
        View Device Performance
      </button>
    </div>
  );
};

export default DeviceBreakdown;
