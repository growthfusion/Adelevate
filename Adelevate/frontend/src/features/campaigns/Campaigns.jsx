import React, { useState } from "react";
import CampaignsTable from "./CampaignsTable";
import CampaignsToolbar from "./CampaignsToolbar";

// Import platform icons for the tabs
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

function SearchBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-800">Campaign Manager</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Campaign
        </button>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
            JD
          </div>
          <span className="text-sm font-medium text-gray-700">John Doe</span>
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    platforms: [],
    dateFrom: "Today",
    dateTo: "Yesterday",
    timezone: "America/Los_Angeles",
    title: "",
    tags: "",
    customRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });
  
  // Campaign tab options
  const tabs = [
    { id: "all", label: "All_Active_Campaigns", count: 241, icon: "snapchat" },
    { id: "custom", label: "atnb | atmvj | dsp | sep20 | c2", count: 36, icon: "snapchat" },
    { id: "google", label: "Google", count: 78, icon: googleIcon },
    { id: "facebook", label: "Facebook", count: 64, icon: metaIcon },
    { id: "tiktok", label: "TikTok", count: 45, icon: tiktokIcon },
    { id: "snap", label: "Snapchat", count: 36, icon: snapchatIcon },
    { id: "newsbreak", label: "NewsBreak", count: 18, icon: nbIcon },
  ];
  
  // Stats for the dashboard overview
  const stats = [
    { id: 1, name: 'Total Campaigns', value: '385' },
    { id: 2, name: 'Active Campaigns', value: '241' },
    { id: 3, name: 'Total Spend', value: '$12,542.85' },
    { id: 4, name: 'Total Revenue', value: '$24,156.32' },
    { id: 5, name: 'Average ROI', value: '92.5%' },
  ];
  
  // Handle applying filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    
    // If a specific platform is selected, update active tab
    if (newFilters.platforms.length === 1) {
      const platformId = newFilters.platforms[0];
      const matchingTab = tabs.find(tab => tab.id === platformId);
      if (matchingTab) {
        setActiveTab(matchingTab.id);
      }
    }
  };
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update platform filters based on tab
    if (tabId !== "all" && tabId !== "custom" && tabs.find(t => t.id === tabId)) {
      setFilters(prev => ({
        ...prev,
        platforms: [tabId]
      }));
    } else {
      // Clear platform filter for "all" tab
      setFilters(prev => ({
        ...prev,
        platforms: []
      }));
    }
  };
  
  return (
    <>
      <SearchBar />
      <main className="min-h-screen w-full pt-[60px] bg-gray-50">
        <div className="mx-auto max-w-[2000px] px-4 py-4">
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.id} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm">
                <div className="truncate text-sm font-medium text-gray-500">{stat.name}</div>
                <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-4 overflow-x-auto">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab, index) => {
                // Determine if this tab is active
                const isActive = activeTab === tab.id;
                
                return (
                  <div 
                    key={tab.id}
                    className="relative flex-shrink-0"
                  >
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        flex items-center px-4 py-2 text-sm font-medium
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 border border-gray-200 border-b-0 rounded-t-lg' 
                          : 'text-gray-500 hover:text-gray-700'}
                        mx-0.5
                      `}
                    >
                      {index < 2 ? (
                        <span className="flex items-center">
                          <span className="mr-2 h-6 w-6 flex items-center justify-center rounded-full bg-yellow-100">
                            <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm5.211 9.084l-6.973 4.427a1 1 0 0 1-1.519-.95l.14-8.835a1.001 1.001 0 0 1 1.84-.454l6.979 4.427a1 1 0 0 1-.467 1.385z"/>
                            </svg>
                          </span>
                          {tab.label}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <img src={tab.icon} alt={tab.label} className="mr-2 h-5 w-5" />
                          {tab.label}
                        </span>
                      )}
                      
                      {/* Close button for active tabs */}
                      {isActive && index < 2 && (
                        <button 
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index === 0) {
                              setActiveTab("custom");
                            } else {
                              setActiveTab("all");
                            }
                          }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <CampaignsToolbar 
            onApplyFilters={handleApplyFilters} 
            initialFilters={filters}
          />
          
          <div className="mt-3">
            <CampaignsTable 
              platformFilter={filters.platforms}
            />
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Need help managing your campaigns? Contact support at support@example.com</p>
          </div>
        </div>
      </main>
    </>
  );
}
