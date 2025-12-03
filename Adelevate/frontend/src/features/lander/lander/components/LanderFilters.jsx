import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Filter, X } from "lucide-react";
import { selectThemeColors } from "@/features/theme/themeSlice";

const LanderFilters = ({ filters, onChange }) => {
  const theme = useSelector(selectThemeColors);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      status: "all",
      audience: "all",
      performance: "all",
      dateRange: "last7days"
    });
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.audience !== "all" || filters.performance !== "all";

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.borderSubtle}`,
          color: theme.textPrimary
        }}
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
        {hasActiveFilters && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: theme.blue,
              color: "#FFFFFF"
            }}
          >
            Active
          </span>
        )}
      </button>

      {showFilters && (
        <div
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: theme.bgMuted,
            border: `1px solid ${theme.borderSubtle}`
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary,
                  outline: "none"
                }}
              >
                <option value="all">All</option>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
                <option value="testing">Testing</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                Audience
              </label>
              <select
                value={filters.audience}
                onChange={(e) => handleFilterChange("audience", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary,
                  outline: "none"
                }}
              >
                <option value="all">All</option>
                <option value="crypto">Crypto</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
                <option value="ecommerce">E-commerce</option>
              </select>
            </div>

            {/* Performance Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                Performance
              </label>
              <select
                value={filters.performance}
                onChange={(e) => handleFilterChange("performance", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary,
                  outline: "none"
                }}
              >
                <option value="all">All</option>
                <option value="top25">Top 25%</option>
                <option value="bottom25">Bottom 25%</option>
                <option value="needsAttention">Needs Attention</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:ring-2 transition-all"
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
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: theme.blue }}
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LanderFilters;
