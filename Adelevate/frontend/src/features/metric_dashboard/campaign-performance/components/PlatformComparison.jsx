import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart
} from "recharts";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const PLATFORM_CONFIG = {
  "google-ads": {
    name: "Google Ads",
    icon: googleIcon,
    color: "#34A853",
    bgColor: "rgba(52, 168, 83, 0.08)"
  },
  facebook: {
    name: "Facebook",
    icon: fb,
    color: "#1877F2",
    bgColor: "rgba(24, 119, 242, 0.08)"
  },
  tiktok: {
    name: "TikTok",
    icon: tiktokIcon,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)"
  },
  snapchat: {
    name: "Snapchat",
    icon: snapchatIcon,
    color: "#FFFC00",
    bgColor: "rgba(255, 252, 0, 0.15)"
  },
  newsbreak: {
    name: "NewsBreak",
    icon: nb,
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.08)"
  }
};

const PlatformComparison = ({ platformData = {}, isLoading = false, className = "" }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [viewMode, setViewMode] = useState("overview");

  useEffect(() => {
    if (Object.keys(platformData).length > 0) {
      generateComparisonData();
    }
  }, [platformData]);

  const generateComparisonData = () => {
    const platforms = ["google-ads", "facebook", "tiktok", "snapchat", "newsbreak"];

    const processedData = platforms.map((platform) => {
      const config = PLATFORM_CONFIG[platform];
      const data = platformData[platform] || {};

      const spend = data.spend || 0;
      const revenue = data.revenue || 0;
      const conversions = data.conversions || 0;
      const clicks = data.clicks || 0;
      const profit = data.profit || 0;
      const roi = data.roi || 0;
      const cpa = data.cpa || 0;
      const epc = data.epc || 0;
      const ctr = clicks > 0 ? (conversions / clicks) * 100 : 0;

      return {
        platform,
        ...config,
        spend,
        revenue,
        roi,
        conversions,
        clicks,
        cpa,
        ctr,
        profit,
        epc
      };
    });

    setComparisonData(processedData);
  };

  const metricOptions = [
    { value: "revenue", label: "Revenue", format: "currency" },
    { value: "spend", label: "Ad Spend", format: "currency" },
    { value: "profit", label: "Profit", format: "currency" },
    { value: "conversions", label: "Conversions", format: "number" },
    { value: "roi", label: "ROI %", format: "percentage" },
    { value: "clicks", label: "Clicks", format: "number" }
  ];

  const formatValue = (value, format) => {
    if (!value && value !== 0) return "0";

    switch (format) {
      case "currency":
        return `$${Math.round(value).toLocaleString()}`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return Math.round(value).toLocaleString();
    }
  };

  const currentMetric = metricOptions.find((m) => m.value === selectedMetric);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <img src={data.icon} alt={data.name} className="w-5 h-5" />
            <p className="font-semibold text-sm">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600">
            {currentMetric.label}:{" "}
            <span className="font-bold text-gray-900">
              {formatValue(payload[0].value, currentMetric.format)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden ${className}`}
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const hasData = comparisonData.some((p) => p.revenue > 0 || p.spend > 0 || p.clicks > 0);

  if (!hasData) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden ${className}`}
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
          <h3 className="text-xl font-bold text-gray-900">Platform Comparison</h3>
          <p className="text-sm text-gray-500 mt-1">Analytics across all platforms</p>
        </div>
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">No platform data available yet</p>
        </div>
      </div>
    );
  }

  const activePlatforms = comparisonData.filter(
    (p) => p.revenue > 0 || p.spend > 0 || p.clicks > 0
  );

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Platform Comparison</h3>
            <p className="text-sm text-gray-500 mt-1">Analytics across all platforms</p>
          </div>

          <div className="flex gap-2 bg-gray-100/80 p-1 rounded-lg">
            {["overview", "detailed", "compare"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
              <span className="text-sm font-semibold text-gray-700">Compare by:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
              >
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gradient-to-br from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={activePlatforms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (currentMetric.format === "currency") {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return value > 1000 ? `${(value / 1000).toFixed(0)}k` : value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey={selectedMetric} radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {activePlatforms.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {activePlatforms.map((platform) => (
                <div
                  key={platform.platform}
                  className="border border-gray-200/60 rounded-xl p-5 hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 bg-white"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: platform.bgColor }}
                    >
                      <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{platform.name}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revenue</p>
                      <p className="font-bold text-lg text-gray-900">
                        ${(platform.revenue / 1000).toFixed(1)}k
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p
                          className={`text-sm font-bold ${platform.roi > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {platform.roi.toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Conv</p>
                        <p className="text-sm font-bold text-gray-900">{platform.conversions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "detailed" && (
          <div className="overflow-x-auto rounded-xl border border-gray-200/60">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-br from-gray-50 to-gray-100/50">
                  <th className="p-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CPA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {activePlatforms.map((platform, index) => (
                  <tr
                    key={platform.platform}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: platform.bgColor }}
                        >
                          <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-sm text-gray-900">{platform.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-700 font-medium">
                      {formatValue(platform.spend, "currency")}
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-gray-900">
                      {formatValue(platform.revenue, "currency")}
                    </td>
                    <td className="p-4 text-right text-sm font-semibold">
                      <span className={platform.profit > 0 ? "text-green-600" : "text-red-600"}>
                        {formatValue(platform.profit, "currency")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          platform.roi > 0
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {platform.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-700 font-medium">
                      {formatValue(platform.clicks, "number")}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-900 font-semibold">
                      {formatValue(platform.conversions, "number")}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-700 font-medium">
                      {formatValue(platform.cpa, "currency")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "compare" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50">
                <h4 className="font-semibold text-gray-900 mb-5 text-base">Revenue Comparison</h4>
                <div className="space-y-4">
                  {activePlatforms
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((platform) => {
                      const maxRevenue = Math.max(...activePlatforms.map((p) => p.revenue));
                      return (
                        <div key={platform.platform} className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: platform.bgColor }}
                          >
                            <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-semibold w-28 text-gray-900">
                            {platform.name}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                            <div
                              className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                              style={{
                                width: `${(platform.revenue / maxRevenue) * 100}%`,
                                backgroundColor: platform.color
                              }}
                            >
                              <span className="text-xs text-white font-bold drop-shadow-sm">
                                ${(platform.revenue / 1000).toFixed(1)}k
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50">
                <h4 className="font-semibold text-gray-900 mb-5 text-base">ROI Comparison</h4>
                <div className="space-y-4">
                  {activePlatforms
                    .sort((a, b) => b.roi - a.roi)
                    .map((platform) => (
                      <div key={platform.platform} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: platform.bgColor }}
                        >
                          <img src={platform.icon} alt={platform.name} className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold w-28 text-gray-900">
                          {platform.name}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, platform.roi))}%`,
                              backgroundColor: platform.roi > 0 ? "#10b981" : "#ef4444"
                            }}
                          >
                            <span className="text-xs text-white font-bold drop-shadow-sm">
                              {platform.roi.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50/50 to-white p-6 rounded-xl border border-gray-200/50">
              <h4 className="font-semibold text-gray-900 mb-5 text-base">
                Revenue vs Spend Comparison
              </h4>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activePlatforms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Spend"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformComparison;
