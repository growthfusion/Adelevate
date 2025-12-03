import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuggestions,
  setFilters,
  selectAllSuggestions,
  selectStats,
  selectFilters,
  selectLoading,
  selectNextAnalysis
} from "../../redux/optimizationsSlice";

// Theme support
import { selectThemeColors } from "@/features/theme/themeSlice";

import OptimizationCard from "../components/OptimizationCard";
import Button from "@/shared/components/Button";
import Spinner from "@/shared/components/Spinner";
import { Zap, RefreshCw, Sparkles, Target, TrendingUp, Brain, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const OptimizationsPage = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const suggestions = useSelector(selectAllSuggestions);
  const stats = useSelector(selectStats);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const nextAnalysis = useSelector(selectNextAnalysis);
  const theme = useSelector(selectThemeColors);

  useEffect(() => {
    dispatch(fetchSuggestions(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleRunAnalysis = () => {
    dispatch(fetchSuggestions(filters));
  };

  const priorityTabs = [
    { 
      key: "all", 
      label: "All Suggestions", 
      count: stats.total, 
      icon: Sparkles, 
      color: theme.blue 
    },
    { 
      key: "high", 
      label: "High Priority", 
      count: stats.highPriority, 
      icon: AlertCircle, 
      color: theme.red
    },
    { 
      key: "medium", 
      label: "Medium", 
      count: stats.mediumPriority, 
      icon: Target, 
      color: theme.yellow
    },
    { 
      key: "low", 
      label: "Low", 
      count: stats.lowPriority, 
      icon: CheckCircle2, 
      color: theme.green
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" style={{ backgroundColor: theme.bgMain }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bgMain }}>
      <div className="space-y-6">
        {/* Header Section */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
          <div className="p-6">
            {/* Title & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.yellow}20 0%, ${theme.orange}20 100%)`,
                    border: `1px solid ${theme.yellow}30`,
                    boxShadow: `0 4px 16px ${theme.yellow}15`
                  }}
                >
                  <Brain className="w-6 h-6" style={{ color: theme.yellow }} />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    AI Optimization Queue
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                    AI-powered suggestions based on performance analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: `${theme.blue}15`,
                    border: `1px solid ${theme.blue}30`
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: theme.blue }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Next Analysis
                    </p>
                    <p className="text-xs font-bold" style={{ color: theme.blue }}>
                      {nextAnalysis}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  icon={<Zap className="w-4 h-4" />}
                  onClick={handleRunAnalysis}
                  style={{
                    background: `linear-gradient(135deg, ${theme.yellow} 0%, ${theme.orange} 100%)`,
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: `0 4px 16px ${theme.yellow}30`,
                    padding: "0.625rem 1.25rem"
                  }}
                >
                  Run Analysis
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  label: "Total Suggestions", 
                  value: stats.total, 
                  icon: Sparkles, 
                  color: theme.blue,
                  change: "Active"
                },
                { 
                  label: "High Priority", 
                  value: stats.highPriority, 
                  icon: AlertCircle, 
                  color: theme.red,
                  change: "Urgent"
                },
                { 
                  label: "Implemented", 
                  value: stats.implemented, 
                  icon: TrendingUp, 
                  color: theme.green,
                  change: "+15%"
                },
                { 
                  label: "Est. Revenue", 
                  value: "$12.5K", 
                  icon: Target, 
                  color: theme.yellow,
                  change: "Monthly"
                }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: theme.bgMuted,
                    border: `1px solid ${theme.borderSubtle}`,
                    boxShadow: theme.shadowSoft
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${stat.color}15`,
                        border: `1px solid ${stat.color}20`
                      }}
                    >
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${stat.color}15`,
                        color: stat.color
                      }}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4" style={{ borderTop: `1px solid ${theme.borderSubtle}` }}>
              {priorityTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange("priority", tab.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: filters.priority === tab.key ? `${tab.color}15` : theme.bgSecondary,
                    color: filters.priority === tab.key ? tab.color : theme.textSecondary,
                    border: `1px solid ${filters.priority === tab.key ? `${tab.color}40` : theme.borderSubtle}`
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: filters.priority === tab.key ? tab.color : theme.bgMuted,
                      color: filters.priority === tab.key ? "#FFFFFF" : theme.textTertiary
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        {suggestions.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px dashed ${theme.borderSubtle}`,
              boxShadow: theme.shadowCard
            }}
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: `${theme.green}10`,
                border: `2px dashed ${theme.green}30`
              }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: theme.green }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
              No optimization suggestions
            </h3>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
              All your landers are performing optimally
            </p>
            <p className="text-xs mb-6" style={{ color: theme.textTertiary }}>
              Run analysis to check for new opportunities
            </p>
            <Button
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRunAnalysis}
              style={{
                backgroundColor: theme.bgSecondary,
                borderColor: theme.borderSubtle,
                color: theme.textSecondary
              }}
            >
              Run Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <OptimizationCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationsPage;
