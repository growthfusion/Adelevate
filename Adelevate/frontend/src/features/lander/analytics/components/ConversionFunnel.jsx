import React from "react";
import { useSelector } from "react-redux";
import { TrendingDown, Users, MousePointerClick, CreditCard, CheckCircle } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const ConversionFunnel = ({ data = [] }) => {
  const theme = useSelector(selectThemeColors);

  const funnelSteps = [
    { icon: Users, label: "Visitors", key: "visitors" },
    { icon: MousePointerClick, label: "Clicks", key: "clicks" },
    { icon: CreditCard, label: "Form Fills", key: "formFills" },
    { icon: CheckCircle, label: "Conversions", key: "conversions" }
  ];

  const colors = [theme.blue, theme.green, theme.yellow, theme.purple];

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadowCard
      }}
    >
      <h3 className="text-lg font-bold mb-6" style={{ color: theme.textPrimary }}>
        Conversion Funnel
      </h3>

      <div className="space-y-4">
        {funnelSteps.map((step, index) => {
          const StepIcon = step.icon;
          const value = data[index]?.value || 0;
          const percentage = data[index]?.percentage || 0;
          const dropoff = data[index]?.dropoff || 0;
          const color = colors[index];

          return (
            <div key={step.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${color}20`,
                      border: `1px solid ${color}40`
                    }}
                  >
                    <StepIcon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                      {step.label}
                    </p>
                    <p className="text-xs" style={{ color: theme.textTertiary }}>
                      {value.toLocaleString()} ({percentage}%)
                    </p>
                  </div>
                </div>
                {dropoff > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.red }}>
                    <TrendingDown className="w-3 h-3" />
                    {dropoff}% dropoff
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div
                className="w-full rounded-full h-3"
                style={{ backgroundColor: theme.bgMuted }}
              >
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-6 pt-4 text-center"
        style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
      >
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Overall Conversion Rate
        </p>
        <p className="text-3xl font-bold mt-1" style={{ color: theme.green }}>
          {data[data.length - 1]?.percentage || 0}%
        </p>
      </div>
    </div>
  );
};

export default ConversionFunnel;

