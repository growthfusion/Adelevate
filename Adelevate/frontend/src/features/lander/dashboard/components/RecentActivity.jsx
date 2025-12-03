import React from "react";
import { useSelector } from "react-redux";
import { Activity } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const RecentActivity = ({ activities = [] }) => {
  const theme = useSelector(selectThemeColors);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${theme.blue}20`,
              border: `1px solid ${theme.blue}30`
            }}
          >
            <Activity className="w-4 h-4" style={{ color: theme.blue }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
            Recent Activity
          </h3>
        </div>
        <button
          className="text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: theme.blue }}
        >
          View All
        </button>
      </div>

      <div className="overflow-hidden">
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg transition-all cursor-pointer"
              style={{
                borderBottom: `1px solid ${theme.borderSubtle}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span className="text-lg">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: theme.textPrimary }}>
                  {activity.message}
                </p>
                <p className="text-xs mt-0.5" style={{ color: theme.textTertiary }}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            No recent activity
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
