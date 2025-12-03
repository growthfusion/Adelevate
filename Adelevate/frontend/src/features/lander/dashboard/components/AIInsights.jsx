import React from "react";
import { useSelector } from "react-redux";
import { Brain, TrendingUp, Target, Lightbulb } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const AIInsights = ({ insights = {} }) => {
  const theme = useSelector(selectThemeColors);
  const { totalAnalyzed = 0, insights: insightsList = [] } = insights;

  const getImpactConfig = (impact) => {
    switch (impact) {
      case "high":
        return { color: theme.green, icon: TrendingUp };
      case "medium":
        return { color: theme.yellow, icon: Target };
      default:
        return { color: theme.blue, icon: Lightbulb };
    }
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
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${theme.purple}20`,
            border: `1px solid ${theme.purple}30`
          }}
        >
          <Brain className="w-4 h-4" style={{ color: theme.purple }} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          AI Insights
        </h3>
      </div>

      {totalAnalyzed > 0 && (
        <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
          Based on <span className="font-semibold">{totalAnalyzed}</span> landers analyzed
        </p>
      )}

      <div className="space-y-3">
        {insightsList.map((insight) => {
          const impactConfig = getImpactConfig(insight.impact);
          const ImpactIcon = impactConfig.icon;
          
          return (
            <div
              key={insight.id}
              className="p-3 rounded-lg transition-all"
              style={{
                backgroundColor: theme.bgMuted,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${impactConfig.color}15`,
                    border: `1px solid ${impactConfig.color}30`
                  }}
                >
                  <ImpactIcon className="w-3 h-3" style={{ color: impactConfig.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>
                    {insight.title}
                  </p>
                  <p className="text-xs mb-2" style={{ color: theme.blue }}>
                    → {insight.recommendation}
                  </p>
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-semibold rounded"
                    style={{
                      backgroundColor: `${impactConfig.color}20`,
                      color: impactConfig.color,
                      border: `1px solid ${impactConfig.color}40`
                    }}
                  >
                    {insight.impact} impact
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="w-full mt-4 py-2 text-sm font-medium rounded-lg transition-all"
        style={{
          backgroundColor: theme.bgSecondary,
          color: theme.blue,
          border: `1px solid ${theme.borderSubtle}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${theme.blue}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.bgSecondary;
        }}
      >
        View All Insights
      </button>
    </div>
  );
};

export default AIInsights;
