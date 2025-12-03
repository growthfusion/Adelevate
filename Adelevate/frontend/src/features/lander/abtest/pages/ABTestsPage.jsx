import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchTests,
  setFilters,
  selectAllTests,
  selectStats,
  selectFilters,
  selectLoading
} from "../../redux/abtestSlice";

// Theme support
import { selectThemeColors } from "@/features/theme/themeSlice";

import ABTestCard from "../components/ABTestCard";
import Button from "@/shared/components/Button";
import Spinner from "@/shared/components/Spinner";
import { Plus, FlaskConical, TrendingUp, Activity, CheckCircle, Calendar, Award } from "lucide-react";

const ABTestsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selectors
  const tests = useSelector(selectAllTests);
  const stats = useSelector(selectStats);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const theme = useSelector(selectThemeColors);

  useEffect(() => {
    dispatch(fetchTests(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const statusTabs = [
    { key: "all", label: "All Tests", count: stats.total, icon: FlaskConical, color: theme.blue },
    { key: "active", label: "Active", count: stats.active, icon: Activity, color: theme.red },
    { key: "completed", label: "Completed", count: stats.completed, icon: CheckCircle, color: theme.green },
    { key: "scheduled", label: "Scheduled", count: stats.scheduled, icon: Calendar, color: theme.purple }
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
                    background: `linear-gradient(135deg, ${theme.blue}20 0%, ${theme.cyan}20 100%)`,
                    border: `1px solid ${theme.blue}30`,
                    boxShadow: `0 4px 16px ${theme.blue}15`
                  }}
                >
                  <FlaskConical className="w-6 h-6" style={{ color: theme.blue }} />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    A/B Testing
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                    Create and manage split tests to optimize conversion rates
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate("/ab-tests/create")}
                style={{
                  background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: `0 4px 16px ${theme.blue}30`,
                  padding: "0.625rem 1.25rem"
                }}
              >
                Create Test
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Tests", value: stats.total, icon: FlaskConical, color: theme.blue, change: "+12%" },
                { label: "Active", value: stats.active, icon: Activity, color: theme.red, change: "Live" },
                { label: "Completed", value: stats.completed, icon: CheckCircle, color: theme.green, change: "+8%" },
                { label: "Win Rate", value: "68%", icon: Award, color: theme.yellow, change: "+5%" }
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
                        backgroundColor: `${theme.green}15`,
                        color: theme.green
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
            <div className="flex gap-2 mt-6 pt-4" style={{ borderTop: `1px solid ${theme.borderSubtle}` }}>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange("status", tab.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: filters.status === tab.key ? `${tab.color}15` : theme.bgSecondary,
                    color: filters.status === tab.key ? tab.color : theme.textSecondary,
                    border: `1px solid ${filters.status === tab.key ? `${tab.color}40` : theme.borderSubtle}`
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: filters.status === tab.key ? tab.color : theme.bgMuted,
                      color: filters.status === tab.key ? "#FFFFFF" : theme.textTertiary
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
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
                backgroundColor: `${theme.blue}10`,
                border: `2px dashed ${theme.blue}30`
              }}
            >
              <FlaskConical className="w-8 h-8" style={{ color: theme.blue }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
              No A/B tests found
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
              Create your first A/B test to start optimizing your landers
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate("/ab-tests/create")}
              style={{
                background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                color: "#FFFFFF",
                border: "none",
                boxShadow: `0 4px 16px ${theme.blue}30`
              }}
            >
              Create Your First Test
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ABTestsPage;
