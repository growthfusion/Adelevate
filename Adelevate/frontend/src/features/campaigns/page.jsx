import { useState } from "react";
import CampaignsToolbar from "./components/campaigns-toolbar";
import CampaignsTable from "./components/campaigns-table";
import Page from "@/components/search-bar"
function CampaignsPage() {
  const [filters, setFilters] = useState({});
  const [activeGroups, setActiveGroups] = useState([]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyGrouping = (groups) => {
    setActiveGroups(groups);
  };

  return (
    <>
      <Page />
      <div className="space-y-4 p-4">
        <CampaignsToolbar
          onApplyFilters={handleApplyFilters}
          onApplyGrouping={handleApplyGrouping}
          initialFilters={filters}
          initialGroups={activeGroups}
        />
        <CampaignsTable filters={filters} activeGroups={activeGroups} />
      </div>
    </>
  );
}

export default CampaignsPage;
