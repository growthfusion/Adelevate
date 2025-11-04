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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";

// Import icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Platform configuration
const PLATFORM_CONFIG = {
  "google-ads": {
    name: "Google Ads",
    icon: googleIcon,
    color: "#4285F4",
    bgColor: "rgba(66, 133, 244, 0.08)",
  },
  facebook: {
    name: "Facebook",
    icon: fb,
    color: "#1877F2",
    bgColor: "rgba(24, 119, 242, 0.08)",
  },
  tiktok: {
    name: "TikTok",
    icon: tiktokIcon,
    color: "#FF0050",
    bgColor: "rgba(255, 0, 80, 0.08)",
  },
  snapchat: {
    name: "Snapchat",
    icon: snapchatIcon,
    color: "#FFFC00",
    bgColor: "rgba(255, 252, 0, 0.08)",
  },
  newsbreak: {
    name: "NewsBreak",
    icon: nb,
    color: "#00D4AA",
    bgColor: "rgba(0, 212, 170, 0.08)",
  },
};

const PlatformComparison = ({ metricsData = [], className = "" }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [viewMode, setViewMode] = useState("overview");

  useEffect(() => {
    generateComparisonData();
  }, [metricsData]);

  const generateComparisonData = () => {
    const platforms = [
      "google-ads",
      "facebook",
      "tiktok",
      "snapchat",
      "newsbreak",
    ];

    const processedData = platforms.map((platform) => {
      const config = PLATFORM_CONFIG[platform];

      // Use real data if available, otherwise use sample data
      const spend =
        metricsData?.find((m) => m?.title === "Amount Spent")
          ?.platformBreakdown?.[platform] ||
        Math.floor(Math.random() * 30000) + 10000;
      const revenue =
        metricsData?.find((m) => m?.title === "Revenue")?.platformBreakdown?.[
          platform
        ] || Math.floor(Math.random() * 50000) + 20000;
      const conversions =
        metricsData?.find((m) => m?.title === "Conversions")
          ?.platformBreakdown?.[platform] ||
        Math.floor(Math.random() * 500) + 100;
      const clicks =
        metricsData?.find((m) => m?.title === "Clicks")?.platformBreakdown?.[
          platform
        ] || Math.floor(Math.random() * 5000) + 1000;

      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;
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
        profit: revenue - spend,
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
    { value: "clicks", label: "Clicks", format: "number" },
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

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-sm">
            {currentMetric.label}:{" "}
            <span className="font-bold" style={{ color: data.color }}>
              {formatValue(payload[0].value, currentMetric.format)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Platform Comparison
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Analytics across all platforms
            </p>
          </div>

          <div className="flex gap-2">
            {["overview", "detailed", "compare"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === mode
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Overview View */}
        {viewMode === "overview" && (
          <div className="space-y-6">
            {/* Metric Selector */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Metric:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm focus:outline-none"
              >
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (currentMetric.format === "currency") {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return value > 1000
                        ? `${(value / 1000).toFixed(0)}k`
                        : value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={selectedMetric} radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {comparisonData.map((platform) => (
                <motion.div
                  key={platform.platform}
                  whileHover={{ y: -4 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  style={{ backgroundColor: platform.bgColor }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-6 h-6"
                    />
                    <span className="font-semibold text-sm">
                      {platform.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-bold text-gray-900">
                        ${(platform.revenue / 1000).toFixed(1)}k
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">ROI</p>
                        <p
                          className={`text-sm font-semibold ${
                            platform.roi > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {platform.roi.toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Conv</p>
                        <p className="text-sm font-semibold">
                          {platform.conversions}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed View */}
        {viewMode === "detailed" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Platform
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Spend
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Revenue
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Profit
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    ROI
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Clicks
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Conversions
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    CPA
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((platform) => (
                  <tr
                    key={platform.platform}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-sm">
                          {platform.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-sm">
                      {formatValue(platform.spend, "currency")}
                    </td>
                    <td className="p-3 text-right text-sm font-medium">
                      {formatValue(platform.revenue, "currency")}
                    </td>
                    <td className="p-3 text-right text-sm">
                      <span
                        className={
                          platform.profit > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {formatValue(platform.profit, "currency")}
                      </span>
                    </td>
                    <td className="p-3 text-right text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          platform.roi > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {platform.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-sm">
                      {formatValue(platform.clicks, "number")}
                    </td>
                    <td className="p-3 text-right text-sm">
                      {formatValue(platform.conversions, "number")}
                    </td>
                    <td className="p-3 text-right text-sm">
                      {formatValue(platform.cpa, "currency")}
                    </td>
                    <td className="p-3 text-right text-sm">
                      {platform.ctr.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Compare View */}
        {viewMode === "compare" && (
          <div className="space-y-6">
            {/* Side by Side Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Comparison */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Revenue Comparison
                </h4>
                <div className="space-y-2">
                  {comparisonData
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((platform) => (
                      <div
                        key={platform.platform}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium w-24">
                          {platform.name}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${
                                (platform.revenue /
                                  Math.max(
                                    ...comparisonData.map((p) => p.revenue)
                                  )) *
                                100
                              }%`,
                              backgroundColor: platform.color,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              ${(platform.revenue / 1000).toFixed(1)}k
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ROI Comparison */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  ROI Comparison
                </h4>
                <div className="space-y-2">
                  {comparisonData
                    .sort((a, b) => b.roi - a.roi)
                    .map((platform) => (
                      <div
                        key={platform.platform}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium w-24">
                          {platform.name}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, platform.roi)
                              )}%`,
                              backgroundColor:
                                platform.roi > 0 ? "#10b981" : "#ef4444",
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {platform.roi.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Performance Matrix */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4">
                Performance Matrix
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {comparisonData.map((platform) => (
                  <div key={platform.platform} className="text-center">
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <h5 className="font-semibold text-sm mb-2">
                      {platform.name}
                    </h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Spend:</span>
                        <span className="font-medium">
                          ${(platform.spend / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Revenue:</span>
                        <span className="font-medium">
                          ${(platform.revenue / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ROI:</span>
                        <span
                          className={`font-medium ${
                            platform.roi > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {platform.roi.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conv:</span>
                        <span className="font-medium">
                          {platform.conversions}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Metric Comparison */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                All Metrics Comparison
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
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
