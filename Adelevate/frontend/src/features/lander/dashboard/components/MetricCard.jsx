import React from "react";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber, formatCurrency, formatPercentage } from "@/shared/utils/formatters";
import { selectThemeColors } from "@/features/theme/themeSlice";

const MetricCard = ({ title, value, change, trend, icon: Icon, color, format = "number" }) => {
  const theme = useSelector(selectThemeColors);
  
  const isPositive = trend === "up";
  const isNeutral = trend === "same";

  const formatValue = (val) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percentage":
        return `${val}%`;
      default:
        return formatNumber(val);
    }
  };

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNeutral) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (isPositive) return theme.green;
    if (isNeutral) return theme.textTertiary;
    return theme.red;
  };

  return (
    <div
      className="rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
            {title}
          </p>
          <h3 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
            {formatValue(value)}
          </h3>

          {/* Trend */}
          <div className="flex items-center gap-1 mt-2">
            <span
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: getTrendColor() }}
            >
              {getTrendIcon()}
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm" style={{ color: theme.textTertiary }}>
              vs last period
            </span>
          </div>
        </div>

        {/* Icon */}
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: `${color}15`,
            border: `1px solid ${color}30`
          }}
        >
          <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="mt-4 h-12">
        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M0,25 L10,22 L20,18 L30,20 L40,15 L50,17 L60,12 L70,14 L80,8 L90,10 L100,5 L100,30 L0,30 Z"
            fill={`url(#gradient-${title})`}
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,25 10,22 20,18 30,20 40,15 50,17 60,12 70,14 80,8 90,10 100,5"
          />
        </svg>
      </div>
    </div>
  );
};

export default MetricCard;
