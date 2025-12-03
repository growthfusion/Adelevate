import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { endTest, deleteTest } from "../../redux/abtestSlice";
import { selectThemeColors } from "@/features/theme/themeSlice";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import { formatCurrency } from "@/shared/utils/formatters";
import {
  Play,
  Pause,
  Trash2,
  TrendingUp,
  TrendingDown,
  Trophy,
  BarChart2,
  Activity,
  CheckCircle
} from "lucide-react";

const ABTestCard = ({ test }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const [showEndModal, setShowEndModal] = useState(false);

  const isActive = test.status === "active";
  const isCompleted = test.status === "completed";
  const hasWinner = test.stats?.isSignificant && test.stats?.winner;

  const getStatusBadge = () => {
    switch (test.status) {
      case "active":
        return (
          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${theme.red}20`,
              color: theme.red,
              border: `1px solid ${theme.red}40`
            }}
          >
            <Activity className="w-3 h-3 animate-pulse" />
            Active
          </span>
        );
      case "completed":
        return (
          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${theme.green}20`,
              color: theme.green,
              border: `1px solid ${theme.green}40`
            }}
          >
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "scheduled":
        return (
          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${theme.blue}20`,
              color: theme.blue,
              border: `1px solid ${theme.blue}40`
            }}
          >
            Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  const handleEndTest = (winnerId) => {
    dispatch(endTest({ id: test.id, winnerId }));
    setShowEndModal(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this test?")) {
      dispatch(deleteTest(test.id));
    }
  };

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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge()}
              <span className="text-xs font-medium" style={{ color: theme.textTertiary }}>
                {test.landerName}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>
              {test.name}
            </h3>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Started: {test.startDate}
              {test.estimatedEnd && ` • Est. completion: ${test.estimatedEnd}`}
              {test.endDate && ` • Ended: ${test.endDate}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isActive && hasWinner && (
              <Button
                variant="success"
                size="sm"
                icon={<Trophy className="w-4 h-4" />}
                onClick={() => setShowEndModal(true)}
                style={{
                  background: `linear-gradient(135deg, ${theme.green} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Apply Winner
              </Button>
            )}
            {isCompleted && (
              <Button
                variant="outline"
                size="sm"
                icon={<BarChart2 className="w-4 h-4" />}
                onClick={() => navigate(`/ab-tests/${test.id}`)}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                View Report
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
              style={{ color: theme.red }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span style={{ color: theme.textSecondary }}>
                Progress: {test.progress}% ({test.currentConversions}/{test.targetConversions} conversions)
              </span>
            </div>
            <div 
              className="w-full rounded-full h-2" 
              style={{ backgroundColor: theme.bgMuted }}
            >
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${test.progress}%`,
                  background: `linear-gradient(90deg, ${theme.blue} 0%, ${theme.cyan} 100%)`
                }}
              />
            </div>
          </div>
        )}

        {/* Variants Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Control */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: test.stats?.winner === "control" ? `${theme.green}10` : theme.bgMuted,
              border: `1px solid ${test.stats?.winner === "control" ? theme.green : theme.borderSubtle}`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                CONTROL (50%)
              </span>
              {test.stats?.winner === "control" && (
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: theme.green }}>
                  <Trophy className="w-3 h-3" /> Winner
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
              "{test.control.value}"
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p style={{ color: theme.textTertiary }}>Views</p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  {test.control.views.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Clicks</p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  {test.control.clicks.toLocaleString()} ({test.control.ctr}%)
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Conversions</p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  {test.control.conversions} ({test.control.conversionRate}%)
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Revenue</p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  {formatCurrency(test.control.revenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Variant */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: test.stats?.winner === "variant" ? `${theme.green}10` : theme.bgMuted,
              border: `1px solid ${test.stats?.winner === "variant" ? theme.green : theme.borderSubtle}`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                VARIANT (50%)
              </span>
              {test.stats?.winner === "variant" && (
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: theme.green }}>
                  <Trophy className="w-3 h-3" /> Winner
                </span>
              )}
            </div>
            <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
              "{test.variant.value}"
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p style={{ color: theme.textTertiary }}>Views</p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  {test.variant.views.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Clicks</p>
                <p className="font-bold flex items-center gap-1" style={{ color: theme.textPrimary }}>
                  {test.variant.clicks.toLocaleString()} ({test.variant.ctr}%)
                  {test.variant.ctr > test.control.ctr && (
                    <TrendingUp className="w-3 h-3" style={{ color: theme.green }} />
                  )}
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Conversions</p>
                <p className="font-bold flex items-center gap-1" style={{ color: theme.textPrimary }}>
                  {test.variant.conversions} ({test.variant.conversionRate}%)
                  {test.variant.conversionRate > test.control.conversionRate && (
                    <TrendingUp className="w-3 h-3" style={{ color: theme.green }} />
                  )}
                </p>
              </div>
              <div>
                <p style={{ color: theme.textTertiary }}>Revenue</p>
                <p className="font-bold flex items-center gap-1" style={{ color: theme.textPrimary }}>
                  {formatCurrency(test.variant.revenue)}
                  {test.variant.revenue > test.control.revenue && (
                    <TrendingUp className="w-3 h-3" style={{ color: theme.green }} />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Analysis */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: test.stats?.isSignificant ? `${theme.green}10` : theme.bgMuted,
            border: `1px solid ${test.stats?.isSignificant ? theme.green : theme.borderSubtle}`
          }}
        >
          <h4 className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
            Statistical Analysis
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <p style={{ color: theme.textTertiary }}>Confidence Level</p>
              <p
                className="font-bold"
                style={{ color: test.stats?.confidenceLevel >= 95 ? theme.green : theme.textPrimary }}
              >
                {test.stats?.confidenceLevel}%
              </p>
            </div>
            <div>
              <p style={{ color: theme.textTertiary }}>P-value</p>
              <p
                className="font-bold"
                style={{ color: test.stats?.pValue < 0.05 ? theme.green : theme.textPrimary }}
              >
                {test.stats?.pValue}
              </p>
            </div>
            <div>
              <p style={{ color: theme.textTertiary }}>Effect Size</p>
              <p className="font-bold" style={{ color: theme.textPrimary }}>
                +{test.stats?.effectSize}%
              </p>
            </div>
            <div>
              <p style={{ color: theme.textTertiary }}>Status</p>
              {test.stats?.isSignificant ? (
                <p className="font-bold flex items-center gap-1" style={{ color: theme.green }}>
                  <Trophy className="w-3 h-3" />
                  Winner: {test.stats?.winner === "variant" ? "Variant" : "Control"}
                </p>
              ) : (
                <p className="font-bold" style={{ color: theme.textSecondary }}>
                  Not significant
                </p>
              )}
            </div>
          </div>

          {test.stats?.projectedAnnualIncrease && (
            <div 
              className="mt-4 pt-4" 
              style={{ borderTop: `1px solid ${theme.green}30` }}
            >
              <p className="text-xs font-medium" style={{ color: theme.green }}>
                Expected annual revenue increase:{" "}
                <span className="font-bold">
                  {formatCurrency(test.stats.projectedAnnualIncrease)}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* End Test Modal */}
      {showEndModal && (
        <Modal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          title="Apply Winning Variant"
        >
          <div className="space-y-4">
            <p style={{ color: theme.textSecondary }}>
              Are you sure you want to end this test and apply the winning variant to 100% of traffic?
            </p>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${theme.green}15`,
                border: `1px solid ${theme.green}40`
              }}
            >
              <p className="font-semibold mb-1" style={{ color: theme.green }}>
                Winner: {test.stats?.winner === "variant" ? "Variant" : "Control"}
              </p>
              <p className="text-sm mb-2" style={{ color: theme.textPrimary }}>
                "{test.stats?.winner === "variant" ? test.variant.value : test.control.value}"
              </p>
              <p className="text-sm font-semibold" style={{ color: theme.green }}>
                +{test.stats?.effectSize}% improvement in conversions
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEndModal(false)}
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                  color: theme.textSecondary
                }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => handleEndTest(test.stats?.winner)}
                style={{
                  background: `linear-gradient(135deg, ${theme.green} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none"
                }}
              >
                Apply Winner
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ABTestCard;
