import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteLander, toggleLanderStatus } from "../../redux/landerSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";
import {
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import Button from "@/shared/components/Button";
import Spinner from "@/shared/components/Spinner";

const LanderTable = ({ landers, viewMode, loading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);

  if (loading) {
    return (
      <div
        className="rounded-xl p-12"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: theme.shadowCard
        }}
      >
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (landers.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px dashed ${theme.borderSubtle}`,
          boxShadow: theme.shadowCard
        }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{
            backgroundColor: `${theme.blue}10`,
            border: `2px dashed ${theme.blue}30`
          }}
        >
          <FileText className="w-8 h-8" style={{ color: theme.blue }} />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: theme.textPrimary }}>
          No landers found
        </h3>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Try adjusting your filters or create a new lander
        </p>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      live: { icon: Activity, color: theme.green },
      paused: { icon: Pause, color: theme.textTertiary },
      testing: { icon: CheckCircle, color: theme.yellow },
      draft: { icon: FileText, color: theme.blue }
    };
    return configs[status] || configs.draft;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleToggleStatus = (e, lander) => {
    e.stopPropagation();
    const newStatus = lander.status === "live" ? "paused" : "live";
    dispatch(toggleLanderStatus({ id: lander.id, status: newStatus }));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lander?")) {
      dispatch(deleteLander(id));
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: theme.bgSecondary, borderBottom: `1px solid ${theme.borderSubtle}` }}>
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Lander Name
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Views
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Clicks
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                CTR
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Conv
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Revenue
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                ROI
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {landers.map((lander, idx) => {
              const statusConfig = getStatusConfig(lander.status);
              const StatusIcon = statusConfig.icon;
              const hasWarnings = lander.warnings && lander.warnings.length > 0;

              return (
                <tr
                  key={lander.id}
                  onClick={() => navigate(`/landers/${lander.id}`)}
                  className="cursor-pointer transition-all"
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
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: `${statusConfig.color}20`,
                        color: statusConfig.color,
                        border: `1px solid ${statusConfig.color}40`
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {lander.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                        {lander.name}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                        {lander.slug}
                      </div>
                      <div className="text-xs mt-1" style={{ color: theme.textTertiary }}>
                        Traffic: {lander.traffic}
                        {lander.metrics.speed && ` • ${lander.metrics.speed}s`}
                      </div>
                      {lander.aiSuggestions > 0 && (
                        <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: theme.purple }}>
                          <AlertCircle className="w-3 h-3" />
                          {lander.aiSuggestions} AI suggestions
                        </div>
                      )}
                      {hasWarnings && (
                        <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: theme.yellow }}>
                          <AlertCircle className="w-3 h-3" />
                          {lander.warnings[0]}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                        {formatNumber(lander.metrics.views)}
                      </div>
                      {lander.trends.views && (
                        <div className="text-sm flex items-center gap-1" style={{
                          color: lander.trends.views.startsWith("+") ? theme.green : theme.red
                        }}>
                          {lander.trends.views.startsWith("+") ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {lander.trends.views}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-semibold" style={{ color: theme.textPrimary }}>
                      {formatNumber(lander.metrics.clicks)}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                        {lander.metrics.ctr}%
                      </div>
                      {lander.trends.ctr && (
                        <div className="text-sm" style={{
                          color: lander.trends.ctr.startsWith("+") ? theme.green : theme.red
                        }}>
                          {lander.trends.ctr}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                        {lander.metrics.conversionRate}%
                      </div>
                      {lander.trends.conversions && (
                        <div className="text-sm" style={{
                          color: lander.trends.conversions.startsWith("+") ? theme.green : theme.red
                        }}>
                          {lander.trends.conversions}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold" style={{ color: theme.textPrimary }}>
                        ${formatNumber(lander.metrics.revenue)}
                      </div>
                      {lander.trends.revenue && (
                        <div className="text-sm" style={{
                          color: lander.trends.revenue.startsWith("+") ? theme.green : theme.red
                        }}>
                          {lander.trends.revenue}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold"
                        style={{
                          color: lander.metrics.roi > 200 ? theme.green :
                                 lander.metrics.roi > 100 ? theme.yellow :
                                 theme.red
                        }}
                      >
                        {lander.metrics.roi}%
                      </span>
                      {lander.metrics.roi > 200 && <TrendingUp className="w-4 h-4" style={{ color: theme.green }} />}
                      {lander.metrics.roi < 100 && <TrendingDown className="w-4 h-4" style={{ color: theme.red }} />}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/landers/${lander.id}`)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          color: theme.blue,
                          border: `1px solid ${theme.borderSubtle}`
                        }}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/landers/${lander.id}/edit`);
                        }}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          color: theme.textSecondary,
                          border: `1px solid ${theme.borderSubtle}`
                        }}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleToggleStatus(e, lander)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          color: lander.status === "live" ? theme.yellow : theme.green,
                          border: `1px solid ${theme.borderSubtle}`
                        }}
                        title={lander.status === "live" ? "Pause" : "Resume"}
                      >
                        {lander.status === "live" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, lander.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: `${theme.red}15`,
                          color: theme.red,
                          border: `1px solid ${theme.red}30`
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: theme.bgSecondary,
          borderTop: `1px solid ${theme.borderSubtle}`
        }}
      >
        <div className="text-sm" style={{ color: theme.textSecondary }}>
          Showing 1-{landers.length} of {landers.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-lg transition-all"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textSecondary
            }}
          >
            ◄ Prev
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-lg font-bold"
            style={{
              backgroundColor: theme.blue,
              color: "#FFFFFF"
            }}
          >
            1
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-lg transition-all"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textSecondary
            }}
          >
            2
          </button>
          <button
            className="px-3 py-1.5 text-sm rounded-lg transition-all"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textSecondary
            }}
          >
            Next ►
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanderTable;
