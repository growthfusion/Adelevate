import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  fetchTopPerformers,
  fetchRecentActivity,
  fetchAIInsights,
  setDateRange,
  selectMetrics,
  selectPerformanceChart,
  selectTopPerformers,
  selectNeedsAttention,
  selectAIInsights,
  selectRecentActivity,
  selectSystemStatus,
  selectDateRange,
  selectLoading,
  selectLastUpdated
} from "../../redux/dashboardSlice";

// Theme support
import { selectThemeColors } from "@/features/theme/themeSlice";

import MetricCard from "../components/MetricCard";
import PerformanceChart from "../components/PerformanceChart";
import QuickActions from "../components/QuickActions";
import TopPerformers from "../components/TopPerformers";
import NeedsAttention from "../components/NeedsAttention";
import AIInsights from "../components/AIInsights";
import RecentActivity from "../components/RecentActivity";
import SystemStatus from "../components/SystemStatus";
import Spinner from "@/shared/components/Spinner";
import { Eye, MousePointerClick, DollarSign, TrendingUp, RefreshCw, Download, BarChart3 } from "lucide-react";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);

  // Selectors
  const metrics = useSelector(selectMetrics);
  const performanceChart = useSelector(selectPerformanceChart);
  const topPerformers = useSelector(selectTopPerformers);
  const needsAttention = useSelector(selectNeedsAttention);
  const aiInsights = useSelector(selectAIInsights);
  const recentActivity = useSelector(selectRecentActivity);
  const systemStatus = useSelector(selectSystemStatus);
  const dateRange = useSelector(selectDateRange);
  const loading = useSelector(selectLoading);
  const lastUpdated = useSelector(selectLastUpdated);

  // Fetch all dashboard data
  const loadDashboard = useCallback(() => {
    dispatch(fetchDashboardData(dateRange));
    dispatch(fetchTopPerformers(5));
    dispatch(fetchRecentActivity(10));
    dispatch(fetchAIInsights());
  }, [dispatch, dateRange]);

  useEffect(() => {
    loadDashboard();

    // Auto refresh every 2 minutes
    const interval = setInterval(() => {
      loadDashboard();
    }, 120000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleDateRangeChange = (e) => {
    dispatch(setDateRange(e.target.value));
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "Never";
    const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  // Metric cards configuration
  const metricCards = [
    {
      title: "Views",
      value: metrics.views?.value || 0,
      change: metrics.views?.change || 0,
      trend: metrics.views?.trend || "up",
      icon: Eye,
      color: theme.blue,
      format: "number"
    },
    {
      title: "Clicks",
      value: metrics.clicks?.value || 0,
      change: metrics.clicks?.change || 0,
      trend: metrics.clicks?.trend || "up",
      icon: MousePointerClick,
      color: theme.green,
      format: "number"
    },
    {
      title: "Revenue",
      value: metrics.revenue?.value || 0,
      change: metrics.revenue?.change || 0,
      trend: metrics.revenue?.trend || "up",
      icon: DollarSign,
      color: theme.purple,
      format: "currency"
    },
    {
      title: "ROI",
      value: metrics.roi?.value || 0,
      change: metrics.roi?.change || 0,
      trend: metrics.roi?.trend || "up",
      icon: TrendingUp,
      color: theme.yellow,
      format: "percentage"
    }
  ];

  if (loading && !lastUpdated) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: theme.bgMain }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="space-y-6">
        {/* Page Header */}
        <div
          className="rounded-xl shadow-sm overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <div className="p-6">
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
                    Dashboard Overview
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                    Real-time performance metrics
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Selector */}
                <select
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  className="px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 transition-all"
                  style={{
                    backgroundColor: theme.bgSecondary,
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

                {/* Export Button */}
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

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: `0 4px 16px ${theme.blue}30`
                  }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div 
              className="mt-4 flex items-center gap-2 text-sm" 
              style={{ color: theme.textSecondary }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: theme.green }}
              />
              Updated {getLastUpdatedText()}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Performance Chart & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PerformanceChart data={performanceChart} />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <SystemStatus status={systemStatus} />
          </div>
        </div>

        {/* Top Performing Landers */}
        <TopPerformers landers={topPerformers} />

        {/* Needs Attention & AI Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <NeedsAttention items={needsAttention} />
          <AIInsights insights={aiInsights} />
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
};

export default DashboardPage;
