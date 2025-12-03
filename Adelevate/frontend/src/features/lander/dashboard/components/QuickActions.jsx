import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, BarChart3, FlaskConical, Zap, Settings } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const QuickActions = () => {
  const navigate = useNavigate();
  const theme = useSelector(selectThemeColors);

  const actions = [
    {
      icon: Plus,
      label: "Create New Lander",
      onClick: () => navigate("/landers/create"),
      color: theme.blue
    },
    {
      icon: BarChart3,
      label: "View Full Analytics",
      onClick: () => navigate("/analytics"),
      color: theme.cyan
    },
    {
      icon: FlaskConical,
      label: "Create A/B Test",
      onClick: () => navigate("/ab-tests/create"),
      color: theme.purple
    },
    {
      icon: Zap,
      label: "View Optimizations",
      onClick: () => navigate("/optimizations"),
      color: theme.yellow
    },
    {
      icon: Settings,
      label: "Integration Settings",
      onClick: () => navigate("/settings/integrations"),
      color: theme.textSecondary
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
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
        Quick Actions
      </h3>

      <div className="space-y-2">
        {actions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium"
              style={{
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.borderSubtle}`,
                color: theme.textPrimary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
                e.currentTarget.style.borderColor = `${action.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgSecondary;
                e.currentTarget.style.borderColor = theme.borderSubtle;
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${action.color}15`,
                  border: `1px solid ${action.color}30`
                }}
              >
                <ActionIcon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <span className="text-sm">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
