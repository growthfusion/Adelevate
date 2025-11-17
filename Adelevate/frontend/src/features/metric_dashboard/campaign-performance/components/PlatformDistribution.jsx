import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/Button";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const PlatformDistribution = ({ className = "" }) => {
  const [activeBar, setActiveBar] = useState(null);

  const spendData = [
    {
      platform: "Google Ads",
      spend: 45000,
      percentage: 42,
      color: "#34A853",
      icon: googleIcon,
    },
    {
      platform: "Facebook",
      spend: 32000,
      percentage: 30,
      color: "#1877F2",
      icon: fb,
    },
    {
      platform: "TikTok",
      spend: 18000,
      percentage: 17,
      color: "#8B5CF6",
      icon: tiktokIcon,
    },
    {
      platform: "Snapchat",
      spend: 12000,
      percentage: 11,
      color: "#FFFC00",
      icon: snapchatIcon,
    },
    {
      platform: "NewsBreak",
      spend: 8000,
      percentage: 7,
      color: "#EF4444",
      icon: nb,
    },
  ];

  const roiTrendData = [
    {
      platform: "Google Ads",
      roi: 3.2,
      trend: "up",
      change: 8,
      color: "#34A853",
      icon: googleIcon,
      revenue: 144000,
    },
    {
      platform: "Facebook",
      roi: 4.1,
      trend: "up",
      change: 15,
      color: "#1877F2",
      icon: fb,
      revenue: 131200,
    },
    {
      platform: "TikTok",
      roi: 2.8,
      trend: "down",
      change: -5,
      color: "#8B5CF6",
      icon: tiktokIcon,
      revenue: 50400,
    },
    {
      platform: "Snapchat",
      roi: 3.7,
      trend: "up",
      change: 12,
      color: "#FFFC00",
      icon: snapchatIcon,
      revenue: 44400,
    },
    {
      platform: "NewsBreak",
      roi: 3.5,
      trend: "up",
      change: 10,
      color: "#EF4444",
      icon: nb,
      revenue: 28000,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <img src={data?.icon} alt={data?.platform} className="w-4 h-4" />
            <p className="text-sm font-semibold text-foreground">
              {data?.platform}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Spend:{" "}
              <span className="font-semibold text-foreground">
                ${data?.spend?.toLocaleString()}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Share:{" "}
              <span className="font-semibold text-foreground">
                {data?.percentage}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${data?.color}20` }}
            >
              <img src={data?.icon} alt={data?.platform} className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {data?.platform}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">ROI:</span>
              <span className="text-sm font-bold text-foreground">
                {data?.roi?.toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Revenue:</span>
              <span className="text-sm font-semibold text-foreground">
                ${(data?.revenue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Trend:</span>
              <span
                className={`text-sm font-semibold ${
                  data?.trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {data?.trend === "up" ? "↑" : "↓"} {Math.abs(data?.change)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendSymbol = (trend) => (trend === "up" ? "↑" : "↓");

  const averageROI = (
    roiTrendData.reduce((sum, item) => sum + item.roi, 0) / roiTrendData.length
  ).toFixed(1);
  const bestPerformer = roiTrendData.reduce((max, item) =>
    item.roi > max.roi ? item : max
  );

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Platform Spend Distribution */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-foreground">
            Platform Distribution
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            •••
          </Button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="relative w-56 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="spend"
                  strokeWidth={0}
                >
                  {spendData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry?.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  $
                  {(
                    spendData.reduce((sum, item) => sum + item.spend, 0) / 1000
                  ).toFixed(0)}
                  K
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Spend
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {spendData?.map((item) => (
            <div
              key={item?.platform}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item?.color}15` }}
                  >
                    <img
                      src={item?.icon}
                      alt={item?.platform}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {item?.platform}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  ${(item?.spend / 1000).toFixed(0)}K
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: item?.color }}
                >
                  {item?.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Comparison - Enhanced */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            ROI Comparison
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            •••
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Avg ROI
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {averageROI}x
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-muted-foreground">
                Best
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img src={bestPerformer.icon} alt="" className="w-4 h-4" />
              <span className="text-lg font-bold text-foreground">
                {bestPerformer.roi}x
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-52 mb-6 bg-accent/20 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roiTrendData}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive) {
                  setActiveBar(state.activeTooltipIndex);
                } else {
                  setActiveBar(null);
                }
              }}
              onMouseLeave={() => setActiveBar(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="platform"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}x`}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ fill: "var(--color-accent)", opacity: 0.1 }}
              />
              <Bar dataKey="roi" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {roiTrendData?.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry?.color}
                    opacity={
                      activeBar === null || activeBar === index ? 1 : 0.3
                    }
                    className="transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform ROI Cards */}
        <div className="space-y-2">
          {roiTrendData?.map((item, index) => (
            <div
              key={item?.platform}
              className="relative overflow-hidden rounded-xl border border-border/50 hover:border-border transition-all duration-200 group cursor-pointer"
              onMouseEnter={() => setActiveBar(index)}
              onMouseLeave={() => setActiveBar(null)}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: `linear-gradient(90deg, ${item?.color}08 0%, transparent 100%)`,
                }}
              />

              <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${item?.color}20` }}
                  >
                    <img
                      src={item?.icon}
                      alt={item?.platform}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      {item?.platform}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Revenue: ${(item?.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">
                      {item?.roi?.toFixed(1)}x
                    </div>
                    <div className="text-xs text-muted-foreground">ROI</div>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold min-w-[70px] justify-center ${
                      item?.trend === "up"
                        ? "bg-green-500/15 text-green-600 border border-green-500/20"
                        : "bg-red-500/15 text-red-600 border border-red-500/20"
                    }`}
                  >
                    <span className="text-base">
                      {getTrendSymbol(item?.trend)}
                    </span>
                    <span>{Math.abs(item?.change)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-accent/30">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(item?.roi / 5) * 100}%`,
                    backgroundColor: item?.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformDistribution;
