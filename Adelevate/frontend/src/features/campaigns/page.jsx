"use client";

import { useState } from "react";
import CampaignsToolbar from "./components/campaigns-toolbar";
import CampaignsTable from "./components/campaigns-table.jsx";

export default function Campaigns() {
  const [filters, setFilters] = useState({
    platforms: [],
    title: "",
    tags: "",
    dateRange: {
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: "last3days",
    },
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <main className="min-h-dvh w-full bg-gray-50">
      <div className="mx-auto max-w-[2000px] px-4 py-6">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-pretty">
          Campaigns
        </h1>

        {/* Toolbar with all filters */}
        <CampaignsToolbar
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
        />

        {/* Table with applied filters */}
        <div className="mt-4 rounded-md border bg-card">
          <CampaignsTable filters={filters} />
        </div>
      </div>
    </main>
  );
}
