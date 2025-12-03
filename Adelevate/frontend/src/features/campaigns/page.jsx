import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CampaignsToolbar from "./components/campaigns-toolbar";
import CampaignsTable from "./components/campaigns-table";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";
import { fetchAllCampaigns, fetchAdAccounts } from "@/features/campaigns/campaignsSlice";

function CampaignsPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  const { campaigns, isLoading, filters } = useSelector((state) => state.campaigns);

  // Initial data fetch
  useEffect(() => {
    // Fetch ad accounts on mount
    dispatch(fetchAdAccounts());

    // Fetch initial campaigns with default filters
    dispatch(
      fetchAllCampaigns({
        platforms: filters.platforms,
        status: filters.status
      })
    );
  }, [dispatch]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(
      () => {
        // Don't auto-refresh if accounts are selected (user is filtering)
        if (filters.accounts.length === 0) {
          console.log("Auto-refresh campaigns (5 min)");
          dispatch(
            fetchAllCampaigns({
              platforms: filters.platforms,
              status: filters.status
            })
          );
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, [dispatch, filters.platforms, filters.status, filters.accounts]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgMain }}>
      <div className="space-y-4 p-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
              Campaigns
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              Manage and analyze your advertising campaigns across all platforms
            </p>
          </div>

          {/* Campaign count badge */}
          {!isLoading && campaigns.length > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <span style={{ color: theme.textSecondary }}>Total:</span>
              <span className="font-bold" style={{ color: theme.textPrimary }}>
                {campaigns.length.toLocaleString()}
              </span>
              <span style={{ color: theme.textSecondary }}>campaigns</span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <CampaignsToolbar />

        {/* Table */}
        <CampaignsTable />
      </div>
    </div>
  );
}

export default CampaignsPage;
