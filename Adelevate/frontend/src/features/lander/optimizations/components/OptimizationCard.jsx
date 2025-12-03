import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  implementSuggestion,
  dismissSuggestion,
  scheduleSuggestion
} from "../../redux/optimizationsSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import { formatCurrency } from "@/shared/utils/formatters";
import {
  CheckCircle,
  XCircle,
  Calendar,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  AlertCircle,
  Brain
} from "lucide-react";

const OptimizationCard = ({ suggestion }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const [expanded, setExpanded] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const getPriorityConfig = () => {
    switch (suggestion.priority) {
      case "high":
        return {
          color: theme.red,
          icon: AlertCircle,
          label: "HIGH PRIORITY"
        };
      case "medium":
        return {
          color: theme.yellow,
          icon: Clock,
          label: "MEDIUM"
        };
      case "low":
        return {
          color: theme.green,
          icon: CheckCircle,
          label: "LOW"
        };
      default:
        return {
          color: theme.blue,
          icon: AlertCircle,
          label: "NORMAL"
        };
    }
  };

  const getDifficultyColor = () => {
    const colors = {
      easy: theme.green,
      medium: theme.yellow,
      hard: theme.red
    };
    return colors[suggestion.difficulty] || theme.blue;
  };

  const handleImplement = () => {
    dispatch(implementSuggestion(suggestion.id));
  };

  const handleDismiss = () => {
    if (confirm("Are you sure you want to dismiss this suggestion?")) {
      dispatch(dismissSuggestion(suggestion.id));
    }
  };

  const handleSchedule = (date) => {
    dispatch(scheduleSuggestion({ id: suggestion.id, date }));
    setShowScheduleModal(false);
  };

  const handleABTest = () => {
    navigate("/ab-tests/create", { state: { suggestion } });
  };

  const priorityConfig = getPriorityConfig();
  const difficultyColor = getDifficultyColor();

  return (
    <>
      <div
        className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: theme.shadowCard
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <span 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${priorityConfig.color}20`,
                color: priorityConfig.color,
                border: `1px solid ${priorityConfig.color}40`
              }}
            >
              <priorityConfig.icon className="w-3 h-3" />
              {priorityConfig.label}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>
                {suggestion.title}
              </h3>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Lander: <span className="font-medium">{suggestion.landerName}</span>
                <button
                  onClick={() => navigate(`/landers/${suggestion.landerId}`)}
                  className="ml-2 hover:opacity-70 transition-opacity"
                  style={{ color: theme.blue }}
                >
                  <ExternalLink className="w-3 h-3 inline" />
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textTertiary }}>
              <Clock className="w-3 h-3" />
              {suggestion.estimatedTime}
            </div>
            <span
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: `${difficultyColor}15`,
                color: difficultyColor,
                border: `1px solid ${difficultyColor}30`
              }}
            >
              {suggestion.difficulty.charAt(0).toUpperCase() + suggestion.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Impact Summary */}
        <div
          className="grid grid-cols-3 gap-4 p-4 rounded-lg mb-4"
          style={{
            background: `linear-gradient(135deg, ${theme.green}10 0%, ${theme.cyan}10 100%)`,
            border: `1px solid ${theme.green}20`
          }}
        >
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: theme.green }}>
              +{formatCurrency(suggestion.impact.revenueIncrease)}
            </p>
            <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>
              per {suggestion.impact.period}
            </p>
          </div>
          <div 
            className="text-center" 
            style={{ 
              borderLeft: `1px solid ${theme.green}20`, 
              borderRight: `1px solid ${theme.green}20` 
            }}
          >
            <p className="text-xl font-bold" style={{ color: theme.green }}>
              +{suggestion.impact.conversionIncrease}%
            </p>
            <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>
              conversion increase
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
              Difficulty
            </p>
            <p className="text-sm font-bold capitalize" style={{ color: theme.textPrimary }}>
              {suggestion.difficulty}
            </p>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mb-4">
          <p className="text-sm flex items-start gap-2" style={{ color: theme.textSecondary }}>
            <Brain className="w-4 h-4 mt-0.5" style={{ color: theme.purple }} />
            <span>
              <strong style={{ color: theme.textPrimary }}>AI Analysis:</strong> {suggestion.description}
            </span>
          </p>
        </div>

        {/* Expandable Section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: theme.blue }}
        >
          {expanded ? "Hide Details" : "Show Details"}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div 
            className="pt-4 space-y-4" 
            style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
          >
            {/* Changes */}
            <div>
              <h4 className="text-sm font-bold mb-2" style={{ color: theme.textPrimary }}>
                Recommended Changes:
              </h4>
              <ul className="space-y-1.5">
                {suggestion.changes.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: theme.textSecondary }}>
                    <TrendingUp className="w-4 h-4 mt-0.5" style={{ color: theme.blue }} />
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Results */}
            <div>
              <h4 className="text-sm font-bold mb-2" style={{ color: theme.textPrimary }}>
                Expected Results:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(suggestion.expectedResults).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: theme.bgMuted,
                      border: `1px solid ${theme.borderSubtle}`
                    }}
                  >
                    <p className="text-xs mb-1 capitalize" style={{ color: theme.textTertiary }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    {typeof value === "object" && value.from !== undefined ? (
                      <p className="text-sm font-bold flex items-center gap-1" style={{ color: theme.textPrimary }}>
                        {value.from} → {value.to}
                        <TrendingUp className="w-3 h-3" style={{ color: theme.green }} />
                        <span style={{ color: theme.green }}>
                          {value.change > 0 ? "+" : ""}
                          {value.change}%
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                        {typeof value === "number" ? value.toLocaleString() : value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div 
          className="flex flex-wrap items-center gap-3 mt-6 pt-4" 
          style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
        >
          <Button
            variant="success"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={handleImplement}
            style={{
              background: `linear-gradient(135deg, ${theme.green} 0%, ${theme.cyan} 100%)`,
              color: "#FFFFFF",
              border: "none",
              boxShadow: `0 4px 12px ${theme.green}30`
            }}
          >
            Implement Now
          </Button>
          <Button
            variant="outline"
            icon={<FlaskConical className="w-4 h-4" />}
            onClick={handleABTest}
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.borderSubtle,
              color: theme.textSecondary
            }}
          >
            A/B Test First
          </Button>
          <Button
            variant="outline"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => setShowScheduleModal(true)}
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.borderSubtle,
              color: theme.textSecondary
            }}
          >
            Schedule
          </Button>
          <Button 
            variant="ghost" 
            icon={<XCircle className="w-4 h-4" />} 
            onClick={handleDismiss}
            style={{ color: theme.red }}
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule Implementation"
        >
          <div className="space-y-4">
            <p style={{ color: theme.textSecondary }}>
              Schedule this optimization for implementation at a later date.
            </p>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 rounded-lg focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.inputBg,
                border: `1px solid ${theme.borderSubtle}`,
                color: theme.textPrimary
              }}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSchedule(new Date())}
                style={{
                  background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default OptimizationCard;
