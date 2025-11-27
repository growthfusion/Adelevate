import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import MediaBuyerDashboard from "./components/MetricCard";
import PlatformFilter from "./components/PlatformFilter";
import AnalyticsChart from "./components/AnalyticsChart";
import AIInsightsPanel from "./components/AIInsightsPanel";
import PlatformDistribution from "./components/PlatformDistribution";
import PlatformComparison from "./components/PlatformComparison";

// Premium Dark Theme - Same as AnalyticsChart
const theme = {
  bgMain: "#050505",
  bgSecondary: "#0A0A0A",
  bgCard: "#0C0C0C",
  bgCardHover: "#101010",
  bgChart: "#111111",
  bgChartGradient: "#0C0C0C",
  bgMuted: "#0F0F0F",

  borderSubtle: "#1A1A1A",
  borderHover: "#252525",
  borderMuted: "#1E1E1E",
  dividerSubtle: "#161616",

  shadowSoft: "rgba(0, 0, 0, 0.55)",
  shadowDeep: "rgba(0, 0, 0, 0.7)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",

  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textTertiary: "#6B6B6B",
  textMuted: "#525252",

  // Accent colors
  emerald: "#10B981",
  blue: "#2563EB",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  pink: "#EC4899"
};

// Global styles for animations and effects
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .shimmer-effect {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(16, 185, 129, 0.1) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #0A0A0A;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #1A1A1A;
    border-radius: 4px;
    border: 2px solid #0A0A0A;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #252525;
  }
`;

const CampaignPerformanceHub = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [autoRefresh, setAutoRefresh] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Mock data for 6 key metrics with enhanced platform tracking
  const metricsData = [
    {
      title: "Amount Spent",
      change: 12.5,
      changeType: "positive",
      color: "from-blue-500 to-blue-600",
      icon: "CreditCard",
      format: "currency",
      sparklineData: [
        { value: 95000 },
        { value: 98000 },
        { value: 102000 },
        { value: 105000 },
        { value: 107000 }
      ],
      platformBreakdown: {
        "google-ads": 45000,
        facebook: 38000,
        tiktok: 15000,
        snapchat: 9000
      }
    },
    {
      title: "Revenue",
      value: 342000,
      change: 18.3,
      changeType: "positive",
      color: "from-green-500 to-green-600",
      icon: "DollarSign",
      format: "currency",
      sparklineData: [
        { value: 280000 },
        { value: 295000 },
        { value: 315000 },
        { value: 330000 },
        { value: 342000 }
      ],
      platformBreakdown: {
        "google-ads": 145000,
        facebook: 128000,
        tiktok: 52000,
        snapchat: 17000
      }
    },
    {
      title: "ROI",
      value: 3.2,
      change: 8.7,
      changeType: "positive",
      color: "from-cyan-500 to-cyan-600",
      icon: "Target",
      format: "decimal",
      sparklineData: [
        { value: 2.8 },
        { value: 2.9 },
        { value: 3.0 },
        { value: 3.1 },
        { value: 3.2 }
      ],
      platformBreakdown: {
        "google-ads": 3.2,
        facebook: 3.4,
        tiktok: 3.5,
        snapchat: 1.9
      }
    },
    {
      title: "Clicks",
      value: 1250000,
      change: 15.2,
      changeType: "positive",
      color: "from-purple-500 to-purple-600",
      icon: "MousePointer",
      format: "number",
      sparklineData: [
        { value: 1050000 },
        { value: 1120000 },
        { value: 1180000 },
        { value: 1210000 },
        { value: 1250000 }
      ],
      platformBreakdown: {
        "google-ads": 625000,
        facebook: 425000,
        tiktok: 150000,
        snapchat: 50000
      }
    },
    {
      title: "Conversions",
      value: 8420,
      change: 24.6,
      changeType: "positive",
      color: "from-pink-500 to-pink-600",
      icon: "ShoppingCart",
      format: "number",
      sparklineData: [
        { value: 6500 },
        { value: 7200 },
        { value: 7800 },
        { value: 8100 },
        { value: 8420 }
      ],
      platformBreakdown: {
        "google-ads": 3800,
        facebook: 3200,
        tiktok: 1100,
        snapchat: 320
      }
    },
    {
      title: "CPA",
      value: 12.71,
      change: -8.3,
      changeType: "positive",
      color: "from-orange-500 to-orange-600",
      icon: "Calculator",
      format: "currency",
      sparklineData: [
        { value: 14.2 },
        { value: 13.8 },
        { value: 13.2 },
        { value: 12.9 },
        { value: 12.71 }
      ],
      platformBreakdown: {
        "google-ads": 11.84,
        facebook: 11.88,
        tiktok: 13.64,
        snapchat: 28.13
      }
    }
  ];

  // Enhanced analytics chart data with platform-specific data
  const chartData = [
    {
      date: "Oct 8",
      revenue: 45000,
      spend: 12000,
      profit: 33000,
      clicks: 180000,
      conversions: 1200,
      googleAds: { revenue: 18000, spend: 5400, conversions: 540 },
      facebook: { revenue: 15300, spend: 4200, conversions: 408 },
      tiktok: { revenue: 7650, spend: 1800, conversions: 204 },
      snapchat: { revenue: 4050, spend: 600, conversions: 48 }
    },
    {
      date: "Oct 9",
      revenue: 48000,
      spend: 13500,
      profit: 34500,
      clicks: 195000,
      conversions: 1350,
      googleAds: { revenue: 19200, spend: 6075, conversions: 607 },
      facebook: { revenue: 16320, spend: 4725, conversions: 459 },
      tiktok: { revenue: 8160, spend: 2025, conversions: 230 },
      snapchat: { revenue: 4320, spend: 675, conversions: 54 }
    },
    {
      date: "Oct 10",
      revenue: 52000,
      spend: 14200,
      profit: 37800,
      clicks: 210000,
      conversions: 1480,
      googleAds: { revenue: 20800, spend: 6390, conversions: 666 },
      facebook: { revenue: 17680, spend: 4970, conversions: 503 },
      tiktok: { revenue: 8840, spend: 2130, conversions: 252 },
      snapchat: { revenue: 4680, spend: 710, conversions: 59 }
    },
    {
      date: "Oct 11",
      revenue: 49000,
      spend: 13800,
      profit: 35200,
      clicks: 198000,
      conversions: 1320,
      googleAds: { revenue: 19600, spend: 6210, conversions: 594 },
      facebook: { revenue: 16660, spend: 4830, conversions: 449 },
      tiktok: { revenue: 8330, spend: 2070, conversions: 224 },
      snapchat: { revenue: 4410, spend: 690, conversions: 53 }
    },
    {
      date: "Oct 12",
      revenue: 55000,
      spend: 15000,
      profit: 40000,
      clicks: 225000,
      conversions: 1600,
      googleAds: { revenue: 22000, spend: 6750, conversions: 720 },
      facebook: { revenue: 18700, spend: 5250, conversions: 544 },
      tiktok: { revenue: 9350, spend: 2250, conversions: 272 },
      snapchat: { revenue: 4950, spend: 750, conversions: 64 }
    },
    {
      date: "Oct 13",
      revenue: 58000,
      spend: 15800,
      profit: 42200,
      clicks: 240000,
      conversions: 1720,
      googleAds: { revenue: 23200, spend: 7110, conversions: 774 },
      facebook: { revenue: 19720, spend: 5530, conversions: 585 },
      tiktok: { revenue: 9860, spend: 2370, conversions: 293 },
      snapchat: { revenue: 5220, spend: 790, conversions: 68 }
    },
    {
      date: "Oct 14",
      revenue: 61000,
      spend: 16500,
      profit: 44500,
      clicks: 255000,
      conversions: 1850,
      googleAds: { revenue: 24400, spend: 7425, conversions: 833 },
      facebook: { revenue: 20740, spend: 5775, conversions: 629 },
      tiktok: { revenue: 10370, spend: 2475, conversions: 315 },
      snapchat: { revenue: 5490, spend: 825, conversions: 73 }
    },
    {
      date: "Oct 15",
      revenue: 64000,
      spend: 17200,
      profit: 46800,
      clicks: 270000,
      conversions: 1980,
      googleAds: { revenue: 25600, spend: 7740, conversions: 891 },
      facebook: { revenue: 21760, spend: 6020, conversions: 673 },
      tiktok: { revenue: 10880, spend: 2580, conversions: 337 },
      snapchat: { revenue: 5760, spend: 860, conversions: 79 }
    }
  ];

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh !== "off") {
      const interval = setInterval(
        () => {
          handleRefresh();
        },
        parseInt(autoRefresh) * 60 * 1000
      );

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  return (
    <>
      <Helmet>
        <title>Campaign Performance Hub - Premium Analytics</title>
        <meta name="description" content="Advanced campaign performance analytics dashboard" />
      </Helmet>

      <div
        className="min-h-screen relative"
        style={{
          backgroundColor: theme.bgMain,
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.emerald}06, transparent)`
        }}
      >
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${theme.emerald}08 0%, transparent 70%)`,
              filter: "blur(100px)"
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${theme.blue}06 0%, transparent 70%)`,
              filter: "blur(100px)"
            }}
          />
        </div>

        {/* Enhanced Platform Filter Header */}
        <div className="relative z-10">
          <PlatformFilter
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={setSelectedPlatforms}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 pt-6 px-3 sm:px-4 md:px-6 pb-6">
          {/* Top 6 Metrics Grid with Graphs */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <MediaBuyerDashboard />
          </div>

          {/* Analytics and AI Insights Section */}
          <div
            className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Enhanced Analytics Chart */}
            <div className="xl:col-span-2">
              <AnalyticsChart data={chartData} selectedPlatform={selectedPlatforms} />
            </div>

            {/* Advanced AI Insights Panel */}
            <div className="xl:col-span-1">
              <AIInsightsPanel platformData={metricsData} selectedPlatform={selectedPlatforms} />
            </div>
          </div>

          {/* Platform Comparison Section */}
          <div className="mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <PlatformComparison metricsData={metricsData} chartData={chartData} />
          </div>

          {/* Platform Distribution */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <PlatformDistribution />
          </div>

          {/* Enhanced Status Footer */}
          <div
            className="mt-8 pt-6 animate-fade-in"
            style={{
              borderTop: `1px solid ${theme.dividerSubtle}`,
              animationDelay: "0.4s"
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.emerald }}
                />
                <p className="text-xs sm:text-sm" style={{ color: theme.textSecondary }}>
                  Last updated:{" "}
                  <span style={{ color: theme.textPrimary }} className="font-medium">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${theme.emerald}12`,
                    border: `1px solid ${theme.emerald}25`,
                    color: theme.emerald
                  }}
                >
                  Real-time Data
                </div>
                <p className="text-xs" style={{ color: theme.textTertiary }}>
                  Auto-refresh:{" "}
                  <span style={{ color: theme.textSecondary }} className="font-medium">
                    {autoRefresh === "off" ? "Off" : `${autoRefresh}m`}
                  </span>
                </p>
              </div>
            </div>

            {/* Progress bar for next refresh */}
            {autoRefresh !== "off" && (
              <div
                className="mt-4 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <div
                  className="h-full shimmer-effect rounded-full transition-all duration-300"
                  style={{
                    width: isRefreshing ? "100%" : "0%",
                    backgroundColor: theme.emerald
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Decorative bottom gradient */}
        <div
          className="fixed bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.emerald}30, transparent)`
          }}
        />
      </div>
    </>
  );
};

export default CampaignPerformanceHub;
