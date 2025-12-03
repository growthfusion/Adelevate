import React from "react";
import { useSelector } from "react-redux";
import { Facebook, Search, FileText, Link, Globe } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";
import { selectThemeColors } from "@/features/theme/themeSlice";

const TrafficSources = ({ sources = [] }) => {
  const theme = useSelector(selectThemeColors);

  const getSourceIcon = (source) => {
    if (source.toLowerCase().includes("facebook")) return Facebook;
    if (source.toLowerCase().includes("google")) return Search;
    if (source.toLowerCase().includes("native")) return FileText;
    if (source.toLowerCase().includes("direct")) return Link;
    return Globe;
  };

  const sourceColors = [theme.blue, theme.green, theme.purple, theme.orange, theme.pink];

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
        Traffic Sources
      </h3>

      <div className="space-y-4">
        {sources.map((source, index) => {
          const SourceIcon = getSourceIcon(source.source);
          const color = sourceColors[index % sourceColors.length];
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SourceIcon className="w-4 h-4" style={{ color }} />
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {source.source}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {source.views}%
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="w-full rounded-full h-2 mb-2"
                style={{ backgroundColor: theme.bgMuted }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${source.views}%`,
                    backgroundColor: color
                  }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs" style={{ color: theme.textTertiary }}>
                <span>Conv Rate: {source.conversions}%</span>
                <span>Revenue: {formatCurrency(source.revenue)}</span>
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
        View Details
      </button>
    </div>
  );
};

export default TrafficSources;
