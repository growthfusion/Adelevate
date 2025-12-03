import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchLanders,
  setFilters,
  setSearchTerm,
  setViewMode,
  selectAllLanders,
  selectLanderStats,
  selectFilters,
  selectLoading,
  selectError
} from "../../redux/landerSlice";

// Theme support
import { selectThemeColors } from "@/features/theme/themeSlice";

import LanderTable from "../components/LanderTable";
import LanderFilters from "../components/LanderFilters";
import LanderStats from "../components/LanderStats";
import Button from "@/shared/components/Button";
import Spinner from "@/shared/components/Spinner";
import { Plus, Search, Grid, List, Rocket } from "lucide-react";

const LandersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector(selectThemeColors);

  const landers = useSelector(selectAllLanders);
  const stats = useSelector(selectLanderStats);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [viewMode, setLocalViewMode] = useState("list");

  useEffect(() => {
    dispatch(fetchLanders(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    const timeoutId = setTimeout(() => {
      dispatch(setSearchTerm(value));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleViewModeChange = (mode) => {
    setLocalViewMode(mode);
    dispatch(setViewMode(mode));
  };

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
        {/* Header */}
        <div
          className="rounded-xl shadow-sm p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: theme.shadowCard
          }}
        >
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
                <Rocket className="w-6 h-6" style={{ color: theme.blue }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                  All Landers
                </h1>
                <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
                  Manage and monitor all your landing pages
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => navigate("/landers/create")}
              style={{
                background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                color: "#FFFFFF",
                border: "none",
                boxShadow: `0 4px 16px ${theme.blue}30`
              }}
            >
              Create New Lander
            </Button>
          </div>

          {/* Search & View Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                style={{ color: theme.textTertiary }}
              />
              <input
                type="text"
                placeholder="Search landers by name, slug, domain..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{
                  backgroundColor: theme.inputBg,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary,
                  outline: "none"
                }}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewModeChange("grid")}
                className="p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: viewMode === "grid" ? `${theme.blue}20` : theme.bgSecondary,
                  color: viewMode === "grid" ? theme.blue : theme.textSecondary,
                  border: `1px solid ${viewMode === "grid" ? theme.blue : theme.borderSubtle}`,
                  boxShadow: viewMode === "grid" ? `0 4px 12px ${theme.blue}30` : "none"
                }}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className="p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: viewMode === "list" ? `${theme.blue}20` : theme.bgSecondary,
                  color: viewMode === "list" ? theme.blue : theme.textSecondary,
                  border: `1px solid ${viewMode === "list" ? theme.blue : theme.borderSubtle}`,
                  boxShadow: viewMode === "list" ? `0 4px 12px ${theme.blue}30` : "none"
                }}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <LanderFilters filters={filters} onChange={handleFilterChange} />

          {/* Stats */}
          <LanderStats stats={stats} totalShowing={landers.length} />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-lg px-4 py-3"
            style={{
              backgroundColor: `${theme.red}15`,
              border: `1px solid ${theme.red}40`,
              color: theme.red
            }}
          >
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Landers Table */}
        <LanderTable landers={landers} viewMode={viewMode} loading={loading} />
      </div>
    </div>
  );
};

export default LandersPage;
