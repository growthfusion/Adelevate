import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";
import { formatNumber, formatCurrency } from "@/shared/utils/formatters";

const TopPerformers = ({ landers = [] }) => {
  const navigate = useNavigate();
  const theme = useSelector(selectThemeColors);

  const getTrendIcon = (trend) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" style={{ color: theme.green }} />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" style={{ color: theme.red }} />;
    return <Minus className="w-4 h-4" style={{ color: theme.textTertiary }} />;
  };

  const getStatusConfig = (status) => {
    const configs = {
      live: { icon: Activity, color: theme.green },
      warning: { icon: AlertCircle, color: theme.yellow },
      critical: { icon: AlertCircle, color: theme.red }
    };
    return configs[status] || configs.live;
  };

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
          Top Performing Landers
        </h3>
        <button
          onClick={() => navigate("/lander")}
          className="text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: theme.blue }}
        >
          View All →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Rank
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Lander
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Views
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                CTR
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Conv Rate
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Revenue
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                ROI
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: theme.textSecondary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {landers.map((lander) => {
              const statusConfig = getStatusConfig(lander.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <tr
                  key={lander.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => navigate(`/landers/${lander.id}`)}
                >
                  <td className="py-4 px-4 text-sm font-bold" style={{ color: theme.textPrimary }}>
                    {lander.rank}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: `${statusConfig.color}20`,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.color}40`
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                      </span>
                      <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                        {lander.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {formatNumber(lander.views)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                        {lander.ctr}%
                      </span>
                      {getTrendIcon(lander.ctrTrend)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                        {lander.conversionRate}%
                      </span>
                      {getTrendIcon(lander.conversionTrend)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                        {formatCurrency(lander.revenue)}
                      </span>
                      {getTrendIcon(lander.revenueTrend)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: lander.roi > 100 ? theme.green : lander.roi > 50 ? theme.yellow : theme.red
                      }}
                    >
                      {lander.roi}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/landers/${lander.id}`);
                      }}
                      className="p-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.blue
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {landers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            No landers data available
          </p>
        </div>
      )}
    </div>
  );
};

export default TopPerformers;
