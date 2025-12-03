import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLanderById,
  clearCurrentLander,
  selectCurrentLander,
  selectLoading
} from "../../redux/landerSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";

import Button from "@/shared/components/Button";
import Spinner from "@/shared/components/Spinner";
import {
  ArrowLeft,
  Pause,
  Play,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  ExternalLink,
  Activity,
  CheckCircle
} from "lucide-react";

const LanderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);

  const lander = useSelector(selectCurrentLander);
  const loading = useSelector(selectLoading);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    dispatch(fetchLanderById(id));

    return () => {
      dispatch(clearCurrentLander());
    };
  }, [dispatch, id]);

  if (loading || !lander) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: theme.bgMain }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const getStatusConfig = () => {
    const configs = {
      live: { icon: Activity, color: theme.green, label: "LIVE" },
      paused: { icon: Pause, color: theme.textTertiary, label: "PAUSED" },
      testing: { icon: CheckCircle, color: theme.yellow, label: "TESTING" },
      draft: { icon: Edit, color: theme.blue, label: "DRAFT" }
    };
    return configs[lander.status] || configs.draft;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/lander")}
          className="flex items-center gap-2 font-medium transition-opacity hover:opacity-70"
          style={{ color: theme.textSecondary }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Landers
        </button>

        {/* Header */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.color}40`
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                {lander.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {lander.status === "live" && (
                <Button
                  variant="outline"
                  icon={<Pause className="w-4 h-4" />}
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.borderSubtle,
                    color: theme.textSecondary
                  }}
                >
                  Pause
                </Button>
              )}
              {lander.status === "paused" && (
                <Button
                  variant="success"
                  icon={<Play className="w-4 h-4" />}
                  style={{
                    background: `linear-gradient(135deg, ${theme.green} 0%, ${theme.cyan} 100%)`,
                    color: "#FFFFFF",
                    border: "none"
                  }}
                >
                  Resume
                </Button>
              )}
              <Button
                variant="outline"
                icon={<Edit className="w-4 h-4" />}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                icon={<Copy className="w-4 h-4" />}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                style={{
                  backgroundColor: `${theme.red}15`,
                  borderColor: `${theme.red}40`,
                  color: theme.red
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Lander Info */}
          <div className="flex items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
            <a
              href={`https://${lander.domain}${lander.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-medium hover:opacity-70 transition-opacity"
              style={{ color: theme.blue }}
            >
              {lander.domain}{lander.path}
              <ExternalLink className="w-4 h-4" />
            </a>
            <span>•</span>
            <span>Created: {new Date(lander.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>Last Updated: {new Date(lander.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <div style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}>
            <div className="flex gap-8 px-6">
              {["overview", "analytics", "heatmap", "abtests", "versions", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="py-4 px-2 font-medium text-sm border-b-2 transition-all capitalize"
                  style={{
                    borderColor: activeTab === tab ? theme.blue : "transparent",
                    color: activeTab === tab ? theme.blue : theme.textSecondary
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && <OverviewTab lander={lander} theme={theme} />}
            {activeTab === "analytics" && <AnalyticsTab lander={lander} theme={theme} />}
            {activeTab === "heatmap" && <HeatmapTab lander={lander} theme={theme} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ lander, theme }) => (
  <div className="space-y-6">
    {/* Performance Metrics */}
    <div>
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
        Performance Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(lander.metrics).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: theme.bgMuted,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <p className="text-xs uppercase font-medium mb-1" style={{ color: theme.textTertiary }}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              {key.includes("Rate") || key === "ctr"
                ? `${value}%`
                : key === "revenue"
                  ? `$${value.toLocaleString()}`
                  : key === "roi"
                    ? `${value}%`
                    : key === "speed"
                      ? `${value}s`
                      : value.toLocaleString()}
            </p>
            {lander.trends[key] && (
              <p
                className="text-sm mt-1"
                style={{ color: lander.trends[key].startsWith("+") ? theme.green : theme.red }}
              >
                {lander.trends[key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* AI Suggestions */}
    {lander.aiSuggestions > 0 && (
      <div
        className="p-6 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${theme.purple}10 0%, ${theme.blue}10 100%)`,
          border: `1px solid ${theme.purple}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
              {lander.aiSuggestions} AI Suggestions Available
            </h3>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              We've analyzed your lander and found optimization opportunities
            </p>
          </div>
          <Button
            variant="primary"
            style={{
              background: `linear-gradient(135deg, ${theme.purple} 0%, ${theme.blue} 100%)`,
              color: "#FFFFFF",
              border: "none"
            }}
          >
            View Suggestions
          </Button>
        </div>
      </div>
    )}

    {/* Warnings */}
    {lander.warnings && lander.warnings.length > 0 && (
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: `${theme.yellow}15`,
          border: `1px solid ${theme.yellow}40`
        }}
      >
        <h4 className="font-semibold mb-2" style={{ color: theme.yellow }}>
          Needs Attention
        </h4>
        <ul className="space-y-1">
          {lander.warnings.map((warning, idx) => (
            <li key={idx} className="text-sm" style={{ color: theme.textPrimary }}>
              • {warning}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const AnalyticsTab = ({ lander, theme }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
      Analytics content here...
    </h3>
  </div>
);

const HeatmapTab = ({ lander, theme }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
      Heatmap content here...
    </h3>
  </div>
);

export default LanderDetailPage;
