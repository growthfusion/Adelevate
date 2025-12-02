import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";

// Redux imports
import { selectThemeColors } from "@/features/theme/themeSlice";
import {
  selectSelectedPlatform,
  selectDateRange,
  selectAutoRefresh,
  setSelectedPlatform,
  setDateRange,
  setAutoRefresh
} from "@/features/filters/filtersSlice";
import { fetchMetrics, selectLastUpdated, selectIsLoading } from "@/features/metrics/metricsSlice";

// Components
import MediaBuyerDashboard from "./components/MetricCard";
import PlatformFilter from "./components/PlatformFilter";
import AnalyticsChart from "./components/AnalyticsChart";
import PlatformDistribution from "./components/PlatformDistribution";
import PlatformComparison from "./components/PlatformComparison";

// Global styles for animations and effects
const createGlobalStyles = (theme) => `
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
      ${theme.emerald || theme.green}1A 50%,
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
    background: ${theme.bgSecondary};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${theme.borderSubtle};
    border-radius: 4px;
    border: 2px solid ${theme.bgSecondary};
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.borderHover};
  }
`;

const CampaignPerformanceHub = () => {
  const dispatch = useDispatch();

  // ========== REDUX STATE ==========
  const theme = useSelector(selectThemeColors);
  const selectedPlatforms = useSelector(selectSelectedPlatform);
  const dateRange = useSelector(selectDateRange);
  const autoRefresh = useSelector(selectAutoRefresh);
  const lastUpdated = useSelector(selectLastUpdated);
  const isLoading = useSelector(selectIsLoading);

  // ========== LOCAL STATE ==========
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ========== INJECT GLOBAL STYLES ==========
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "campaign-hub-styles";
    styleElement.textContent = createGlobalStyles(theme);

    const oldStyles = document.getElementById("campaign-hub-styles");
    if (oldStyles && oldStyles !== styleElement) {
      oldStyles.remove();
    }

    document.head.appendChild(styleElement);
    return () => {
      const el = document.getElementById("campaign-hub-styles");
      if (el) el.remove();
    };
  }, [theme]);

  // ========== AUTO-REFRESH ==========
  useEffect(() => {
    if (autoRefresh !== "off" && autoRefresh) {
      const intervalMs = parseInt(autoRefresh) * 60 * 1000;
      const interval = setInterval(() => {
        handleRefresh();
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // ========== HANDLERS ==========
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchMetrics({ dateRange }));
    setIsRefreshing(false);
  };

  const handlePlatformChange = (platform) => {
    dispatch(setSelectedPlatform(platform));
  };

  const handleDateRangeChange = (range, customRange = null) => {
    dispatch(setDateRange({ range, customRange }));
  };

  const handleAutoRefreshChange = (value) => {
    dispatch(setAutoRefresh(value));
  };

  // ========== FORMAT TIME ==========
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    return new Date(lastUpdated).toLocaleTimeString();
  };

  // ========== RENDER ==========
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
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.emerald || theme.green}06, transparent)`
        }}
      >
        {/* Ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, ${theme.emerald || theme.green}08 0%, transparent 70%)`,
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

        {/* Platform Filter Header */}
        <div className="relative z-10">
          <PlatformFilter
            selectedPlatforms={selectedPlatforms}
            onPlatformChange={handlePlatformChange}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={handleAutoRefreshChange}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing || isLoading}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 pt-6 px-3 sm:px-4 md:px-6 pb-6">
          {/* Top Metrics Grid */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <MediaBuyerDashboard />
          </div>

          {/* Analytics Chart Section */}
          <div
            className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="xl:col-span-2">
              <AnalyticsChart />
            </div>
          </div>

          {/* Platform Comparison Section */}
          <div className="mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <PlatformComparison />
          </div>

          {/* Platform Distribution */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <PlatformDistribution />
          </div>

          {/* Status Footer */}
          <div
            className="mt-8 pt-6 animate-fade-in"
            style={{
              borderTop: `1px solid ${theme.dividerSubtle || theme.borderSubtle}`,
              animationDelay: "0.4s"
            }}
          >
         

            {/* Progress bar for refresh */}
            {autoRefresh !== "off" && (
              <div
                className="mt-4 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <div
                  className="h-full shimmer-effect rounded-full transition-all duration-300"
                  style={{
                    width: isRefreshing || isLoading ? "100%" : "0%",
                    backgroundColor: theme.emerald || theme.green
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
            background: `linear-gradient(90deg, transparent, ${theme.emerald || theme.green}30, transparent)`
          }}
        />
      </div>
    </>
  );
};

export default CampaignPerformanceHub;
