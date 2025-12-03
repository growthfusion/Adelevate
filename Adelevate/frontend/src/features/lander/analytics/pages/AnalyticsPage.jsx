import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalytics,
  fetchRealtimeData,
  setDateRange,
  setSelectedTab,
  selectMetrics,
  selectTrendsChart,
  selectTrafficSources,
  selectDeviceBreakdown,
  selectCountryBreakdown,
  selectFunnel,
  selectRealtime,
  selectFilters,
  selectLoading
} from "../../redux/analyticsSlice";

// Theme support
import { selectThemeColors } from "@/features/theme/themeSlice";

import AnalyticsMetrics from "../components/AnalyticsMetrics";
import AnalyticsChart from "../components/AnalyticsChart";
import TrafficSources from "../components/TrafficSources";
import DeviceBreakdown from "../components/DeviceBreakdown";
import ConversionFunnel from "../components/ConversionFunnel";
import RealtimeStats from "../components/RealtimeStats";
import Spinner from "@/shared/components/Spinner";
import { Download, RefreshCw, BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);

  const metrics = useSelector(selectMetrics);
  const trendsChart = useSelector(selectTrendsChart);
  const trafficSources = useSelector(selectTrafficSources);
  const deviceBreakdown = useSelector(selectDeviceBreakdown);
  const funnel = useSelector(selectFunnel);
  const realtime = useSelector(selectRealtime);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);

  const loadAnalytics = useCallback(() => {
    dispatch(fetchAnalytics({ dateRange: filters.dateRange }));
    dispatch(fetchRealtimeData());
  }, [dispatch, filters.dateRange]);

  useEffect(() => {
    loadAnalytics();

    // Refresh realtime data every 30 seconds
    const realtimeInterval = setInterval(() => {
      dispatch(fetchRealtimeData());
    }, 30000);

    return () => clearInterval(realtimeInterval);
  }, [loadAnalytics, dispatch]);

  const handleDateRangeChange = (e) => {
    dispatch(setDateRange(e.target.value));
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "traffic", label: "Traffic" },
    { id: "conversions", label: "Conversions" },
    { id: "revenue", label: "Revenue" },
    { id: "funnels", label: "Funnels" },
    { id: "cohorts", label: "Cohorts" }
  ];

  if (loading && !metrics.views.value) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: theme.bgMain }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="space-y-6">
        {/* Header */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.blue}20 0%, ${theme.cyan}20 100%)`,
                  border: `1px solid ${theme.blue}30`,
                  boxShadow: `0 4px 16px ${theme.blue}15`
                }}
              >
                <BarChart3 className="w-6 h-6" style={{ color: theme.blue }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  Analytics
                </h1>
                <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                  Comprehensive performance insights across all landers
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range */}
              <select
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                className="px-4 py-2 rounded-lg text-sm focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary,
                  outline: "none"
                }}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>

              {/* Export & Refresh */}
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textSecondary
                }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: `0 4px 16px ${theme.blue}30`
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Realtime Stats */}
        <RealtimeStats data={realtime} />

        {/* Aggregate Metrics */}
        <AnalyticsMetrics metrics={metrics} />

        {/* Charts & Breakdowns */}
        <AnalyticsChart data={trendsChart} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrafficSources sources={trafficSources} />
          <DeviceBreakdown devices={deviceBreakdown} />
        </div>

        {/* Conversion Funnel */}
        <ConversionFunnel data={funnel} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
