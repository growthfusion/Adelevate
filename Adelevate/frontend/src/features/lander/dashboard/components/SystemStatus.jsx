import React from "react";
import { useSelector } from "react-redux";
import { CheckCircle, AlertCircle, AlertTriangle, Activity } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const SystemStatus = ({ status }) => {
  const theme = useSelector(selectThemeColors);

  const statusItems = [
    {
      label: status?.allOperational ? "All Systems Operational" : "System Issues Detected",
      icon: status?.allOperational ? CheckCircle : AlertCircle,
      color: status?.allOperational ? theme.green : theme.red
    },
    {
      label: `${status?.activeLanders || 0} Landers Active`,
      icon: Activity,
      color: theme.green
    },
    {
      label: `${status?.needsAttentionCount || 0} Need Attention`,
      icon: status?.needsAttentionCount > 0 ? AlertTriangle : CheckCircle,
      color: status?.needsAttentionCount > 0 ? theme.yellow : theme.green
    },
    {
      label: `${status?.criticalIssues || 0} Critical Issues`,
      icon: status?.criticalIssues > 0 ? AlertCircle : CheckCircle,
      color: status?.criticalIssues > 0 ? theme.red : theme.green
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
      <h4
        className="text-sm font-bold mb-4 uppercase tracking-wide"
        style={{ color: theme.textSecondary }}
      >
        System Status
      </h4>
      <div className="space-y-3">
        {statusItems.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <ItemIcon className="w-4 h-4" style={{ color: item.color }} />
              <span style={{ color: theme.textPrimary }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStatus;
