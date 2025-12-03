import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Activity, MousePointerClick, CheckCircle, Users } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const RealtimeStats = ({ data }) => {
  const navigate = useNavigate();
  const theme = useSelector(selectThemeColors);

  const stats = [
    {
      label: "Active Users",
      value: data?.activeUsers?.toLocaleString() || 0,
      icon: Users,
      color: theme.blue,
      gradient: `linear-gradient(135deg, ${theme.blue}20 0%, ${theme.cyan}20 100%)`
    },
    {
      label: "Clicks (30 min)",
      value: data?.clicksLast30Min || 0,
      icon: MousePointerClick,
      color: theme.green,
      gradient: `linear-gradient(135deg, ${theme.green}20 0%, ${theme.cyan}20 100%)`
    },
    {
      label: "Conversions (30 min)",
      value: data?.conversionsLast30Min || 0,
      icon: CheckCircle,
      color: theme.purple,
      gradient: `linear-gradient(135deg, ${theme.purple}20 0%, ${theme.blue}20 100%)`
    }
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.textPrimary }}>
            Realtime
            <span className="text-sm font-normal" style={{ color: theme.textSecondary }}>
              (Last 30 Minutes)
            </span>
          </h3>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${theme.green}20`,
              color: theme.green,
              border: `1px solid ${theme.green}40`
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.green }} />
            Auto-refresh: ON
          </div>
        </div>
        <button
          className="text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: theme.blue }}
        >
          View Realtime Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{
                background: stat.gradient,
                border: `1px solid ${stat.color}30`
              }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              >
                <StatIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Active Landers */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.bgMuted,
          border: `1px solid ${theme.borderSubtle}`
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
          Top Active Landers:
        </p>
        <div className="space-y-1">
          {data?.topActiveLanders?.map((lander, idx) => (
            <div
              key={lander.id}
              onClick={() => navigate(`/landers/${lander.id}`)}
              className="flex items-center justify-between text-sm p-1.5 rounded cursor-pointer transition-all"
              style={{ color: theme.textPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span>
                {idx + 1}. {lander.name}
              </span>
              <span style={{ color: theme.textTertiary }}>
                ({lander.activeUsers} users)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeStats;
