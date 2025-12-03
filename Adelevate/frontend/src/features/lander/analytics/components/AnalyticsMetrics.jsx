import React from "react";
import { useSelector } from "react-redux";
import { formatNumber, formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const AnalyticsMetrics = ({ metrics }) => {
  const theme = useSelector(selectThemeColors);

  const metricItems = [
    { key: "views", label: "Views", format: "number" },
    { key: "uniqueVisitors", label: "Unique Visitors", format: "number" },
    { key: "clicks", label: "Clicks", format: "number" },
    { key: "ctr", label: "CTR", format: "percentage" },
    { key: "conversions", label: "Conversions", format: "number" },
    { key: "conversionRate", label: "Conv Rate", format: "percentage" },
    { key: "revenue", label: "Revenue", format: "currency" },
    { key: "roi", label: "ROI", format: "percentage" }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${value}%`;
      default:
        return formatNumber(value);
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
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.textPrimary }}>
        Aggregate Metrics (All Landers)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {metricItems.map(({ key, label, format }) => {
          const metric = metrics[key];
          const isPositive = metric?.change > 0;

          return (
            <div
              key={key}
              className="text-center p-4 rounded-lg"
              style={{
                backgroundColor: theme.bgMuted,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              <p className="text-xs uppercase font-medium mb-1" style={{ color: theme.textTertiary }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                {formatValue(metric?.value || 0, format)}
              </p>
              <div
                className="flex items-center justify-center gap-1 mt-1 text-sm"
                style={{ color: isPositive ? theme.green : theme.red }}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {metric?.change || 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsMetrics;
