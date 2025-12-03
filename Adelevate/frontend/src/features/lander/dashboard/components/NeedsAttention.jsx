import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const NeedsAttention = ({ items = [] }) => {
  const navigate = useNavigate();
  const theme = useSelector(selectThemeColors);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "critical":
        return { icon: AlertCircle, color: theme.red };
      case "warning":
        return { icon: AlertTriangle, color: theme.yellow };
      default:
        return { icon: CheckCircle, color: theme.green };
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: theme.shadowCard
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
          Needs Attention
        </h3>
        <div className="text-center py-8">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
            style={{
              backgroundColor: `${theme.green}15`,
              border: `1px solid ${theme.green}30`
            }}
          >
            <CheckCircle className="w-6 h-6" style={{ color: theme.green }} />
          </div>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            All landers are performing well!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${theme.yellow}20`,
            border: `1px solid ${theme.yellow}30`
          }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: theme.yellow }} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Needs Attention
        </h3>
        <span
          className="px-2 py-0.5 text-xs font-bold rounded-full"
          style={{
            backgroundColor: `${theme.yellow}20`,
            color: theme.yellow
          }}
        >
          {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const severityConfig = getSeverityConfig(item.severity);
          const SeverityIcon = severityConfig.icon;
          
          return (
            <div
              key={item.id}
              className="p-4 rounded-lg transition-all"
              style={{
                backgroundColor: `${severityConfig.color}10`,
                border: `1px solid ${severityConfig.color}30`
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SeverityIcon className="w-4 h-4" style={{ color: severityConfig.color }} />
                  <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                    {item.name}
                  </span>
                </div>
              </div>
              <p className="text-sm mb-2" style={{ color: severityConfig.color }}>
                {item.issue}
              </p>
              {item.cause && (
                <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
                  Possible cause: {item.cause}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {item.actions.map((action, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                    style={{
                      backgroundColor: idx === 0 
                        ? `${theme.blue}` 
                        : theme.bgSecondary,
                      color: idx === 0 ? "#FFFFFF" : theme.textSecondary,
                      border: `1px solid ${idx === 0 ? "transparent" : theme.borderSubtle}`
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NeedsAttention;
