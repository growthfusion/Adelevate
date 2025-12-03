import React from "react";
import { useSelector } from "react-redux";
import { Activity, Pause, FlaskConical, AlertCircle } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const LanderStats = ({ stats, totalShowing }) => {
  const theme = useSelector(selectThemeColors);

  const statItems = [
    {
      label: "Active",
      value: stats.active,
      color: theme.green,
      icon: Activity
    },
    {
      label: "Testing",
      value: stats.testing,
      color: theme.yellow,
      icon: FlaskConical
    },
    {
      label: "Paused",
      value: stats.paused,
      color: theme.textTertiary,
      icon: Pause
    },
    {
      label: "Needs Attention",
      value: stats.needsAttention,
      color: theme.orange,
      icon: AlertCircle
    }
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-6 mt-4 pt-4"
      style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
    >
      <div className="text-sm" style={{ color: theme.textSecondary }}>
        Showing <span className="font-semibold" style={{ color: theme.textPrimary }}>{totalShowing}</span> of{" "}
        <span className="font-semibold" style={{ color: theme.textPrimary }}>{stats.total}</span> landers
      </div>

      <div className="flex items-center gap-4 text-sm">
        {statItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${item.color}20`,
                  border: `1px solid ${item.color}30`
                }}
              >
                <ItemIcon className="w-3 h-3" style={{ color: item.color }} />
              </div>
              <span style={{ color: theme.textSecondary }}>
                <span className="font-semibold" style={{ color: theme.textPrimary }}>
                  {item.value}
                </span>{" "}
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanderStats;
