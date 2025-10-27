import React, { useState, useEffect } from "react";
// Import platform icons
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

export function CampaignsToolbar({ onApplyFilters, initialFilters = {} }) {
  // Date range options
  const dateRanges = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
    "Custom Range"
  ];
  
  // Timezone options
  const timezones = [
    "America/Los_Angeles",
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];
  
  // Platform options with icons
  const platforms = [
    { id: "google", name: "Google", icon: googleIcon },
    { id: "facebook", name: "Facebook", icon: metaIcon },
    { id: "tiktok", name: "TikTok", icon: tiktokIcon },
    { id: "snap", name: "Snapchat", icon: snapchatIcon },
    { id: "newsbreak", name: "NewsBreak", icon: nbIcon }
  ];
  
  // State management
  const [fromRange, setFromRange] = useState(initialFilters.dateFrom || "Today");
  const [toRange, setToRange] = useState(initialFilters.dateTo || "Yesterday");
  const [tz, setTz] = useState(initialFilters.timezone || "America/Los_Angeles");
  const [title, setTitle] = useState(initialFilters.title || "");
  const [tags, setTags] = useState(initialFilters.tags || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState(initialFilters.platforms || []);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(initialFilters.customRange || {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Handle platform selection - apply filter immediately
  const togglePlatform = (platformId) => {
    let newPlatforms;
    
    // If already selected, remove it
    if (selectedPlatforms.includes(platformId)) {
      newPlatforms = selectedPlatforms.filter(p => p !== platformId);
    } else {
      // Otherwise add it
      newPlatforms = [...selectedPlatforms, platformId];
    }
    
    setSelectedPlatforms(newPlatforms);
    
    // Apply filter immediately
    if (onApplyFilters) {
      onApplyFilters({
        platforms: newPlatforms,
        dateFrom: fromRange,
        dateTo: toRange,
        timezone: tz,
        title,
        tags,
        customRange: customDateRange
      });
    }
    
    // Close menu after selection
    setShowPlatformMenu(false);
  };
  
  // Apply filters
  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        platforms: selectedPlatforms,
        dateFrom: fromRange,
        dateTo: toRange,
        timezone: tz,
        title,
        tags,
        customRange: customDateRange
      });
    }
  };
  
  // Handle form reset
  const resetForm = () => {
    setFromRange("Today");
    setToRange("Yesterday");
    setTz("America/Los_Angeles");
    setTitle("");
    setTags("");
    setSelectedPlatforms([]);
    setCustomDateRange({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    
    // Apply the reset filters
    if (onApplyFilters) {
      onApplyFilters({
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
    }
  };
  
  return (
    <section aria-label="Filters" className="flex flex-col gap-2 rounded-md border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {/* Date range 1 */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-600">From</span>
          <select
            className="bg-transparent outline-none"
            value={fromRange}
            onChange={(e) => setFromRange(e.target.value)}
            aria-label="Date range start"
          >
            {dateRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </label>

        {/* Date range 2 */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-600">To</span>
          <select
            className="bg-transparent outline-none"
            value={toRange}
            onChange={(e) => setToRange(e.target.value)}
            aria-label="Date range end"
          >
            {dateRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </label>

        {/* Custom date range (conditionally rendered) */}
        {(fromRange === "Custom Range" || toRange === "Custom Range") && (
          <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
            <input 
              type="date" 
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
              className="bg-transparent outline-none"
            />
            <span className="text-gray-500">to</span>
            <input 
              type="date"
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
              className="bg-transparent outline-none"
            />
          </div>
        )}

        {/* Timezone */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-600">Timezone</span>
          <select 
            className="bg-transparent outline-none" 
            value={tz} 
            onChange={(e) => setTz(e.target.value)} 
            aria-label="Timezone"
          >
            {timezones.map(timezone => (
              <option key={timezone} value={timezone}>
                {timezone.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        {/* Platform selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPlatformMenu(!showPlatformMenu)}
            className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <span className="text-gray-600">Platforms</span>
            {selectedPlatforms.length > 0 ? (
              <div className="flex -space-x-2">
                {selectedPlatforms.slice(0, 3).map(p => {
                  const platform = platforms.find(plat => plat.id === p);
                  return (
                    <span key={p} className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                      <img src={platform?.icon} alt={platform?.name} className="h-5 w-5" />
                    </span>
                  );
                })}
                {selectedPlatforms.length > 3 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                    +{selectedPlatforms.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 italic">Select...</span>
            )}
            <svg 
              className="h-4 w-4 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPlatformMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowPlatformMenu(false)}
              />
              <div className="absolute left-0 z-40 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-2">
                  <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                    Platforms select...
                  </div>
                  {platforms.map(platform => (
                    <label 
                      key={platform.id}
                      className="flex cursor-pointer items-center rounded px-3 py-2 hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => togglePlatform(platform.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="flex items-center gap-2">
                        <img src={platform.icon} alt={platform.name} className="h-5 w-5" />
                        <span className="text-sm text-gray-700">{platform.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-1 text-sm">
          <span className="text-gray-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Title filter"
            placeholder="Search by title..."
          />
          {title && (
            <button
              className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-200"
              onClick={() => setTitle("")}
              title="Clear title"
              type="button"
            >
              ×
            </button>
          )}
        </label>

        {/* Tags */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-600">Tags</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Tags filter"
            placeholder="e.g. promo, summer..."
          />
          {tags && (
            <button
              className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-200"
              onClick={() => setTags("")}
              title="Clear tags"
              type="button"
            >
              ×
            </button>
          )}
        </label>

        {/* Apply Button */}
        <button
          type="button"
          className="rounded-md border bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={applyFilters}
        >
          Apply Filters
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reset
        </button>

        {/* Spacer */}
        <div className="ms-auto" />
      </div>
    </section>
  );
}

export default CampaignsToolbar;
