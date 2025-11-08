import { useState } from "react";
import DatePickerToggle from "./datepicker.jsx";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Platform icons mapping
const platformIconsMap = {
  google: googleIcon,
  facebook: fb,
  tiktok: tiktokIcon,
  snap: snapchatIcon,
  newsbreak: nb,
};

const PREDEFINED_TAGS = [
  "Mythili",
  "Naga",
  "Shanker",
  "Ramanan",
  "Jai",
  "ArunS",
  "naveen",
  "Ashwin",
  "Raju",
  "Sudhanshu",
  "Hari",
  "Gokulraj",
];

// Available grouping options
const GROUPING_OPTIONS = [
  { id: "date", name: "Date" },
  { id: "hourOfDay", name: "Hour Of Day" },
  { id: "offer", name: "Offer" },
  { id: "landing", name: "Landing" },
];

export function CampaignsToolbar({
  onApplyFilters,
  onApplyGrouping,
  initialFilters = {},
}) {
  const platforms = [
    { id: "google", name: "Google" },
    { id: "facebook", name: "Facebook" },
    { id: "tiktok", name: "TikTok" },
    { id: "snap", name: "Snapchat" },
    { id: "newsbreak", name: "NewsBreak" },
  ];

  const [selectedPlatforms, setSelectedPlatforms] = useState(
    initialFilters.platforms || []
  );
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [title, setTitle] = useState(initialFilters.title || "");
  const [tags, setTags] = useState(initialFilters.tags || "");
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [dateRange, setDateRange] = useState(
    initialFilters.dateRange || {
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: "last3days",
    }
  );


  const [timeZone, setTimeZone] = useState("America/Los_Angeles");
  const [showTimeZoneMenu, setShowTimeZoneMenu] = useState(false);

  // Time zone options
  const timeZoneOptions = [
    { id: "America/Los_Angeles", name: "America/Los_Angeles" },
    { id: "America/New_York", name: "America/New_York" },
    { id: "Europe/London", name: "Europe/London" },
    { id: "Asia/Tokyo", name: "Asia/Tokyo" },
    { id: "Australia/Sydney", name: "Australia/Sydney" },
  ];

  const togglePlatform = (platformId) => {
    let newPlatforms;
    if (selectedPlatforms.includes(platformId)) {
      newPlatforms = selectedPlatforms.filter((p) => p !== platformId);
    } else {
      newPlatforms = [...selectedPlatforms, platformId];
    }
    setSelectedPlatforms(newPlatforms);
    setShowPlatformMenu(false);
  };

  const selectTag = (tag) => {
    setTags(tag);
    setShowTagsMenu(false);
  };

  
  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        platforms: selectedPlatforms,
        title,
        tags,
        dateRange,
        timeZone,
      });
    }
  };

  
  const selectTimeZone = (zone) => {
    setTimeZone(zone);
    setShowTimeZoneMenu(false);
  };

  const resetForm = () => {
    setSelectedPlatforms([]);
    setTitle("");
    setTags("");
  
    setDateRange({
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      key: "last3days",
    });
    setTimeZone("America/Los_Angeles");

    if (onApplyFilters) {
      onApplyFilters({
        platforms: [],
        title: "",
        tags: "",
        dateRange: {
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          key: "last3days",
        },
        timeZone: "America/Los_Angeles",
      });
    }

    if (onApplyGrouping) {
      onApplyGrouping([]);
    }
  };

  return (
    <section
      aria-label="Filters"
      className="flex flex-col gap-2 rounded-md border bg-white p-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Picker */}
        <div>
          <DatePickerToggle
            initialSelection={dateRange}
            onChange={(newRange) => setDateRange(newRange)}
          />
        </div>

        {/* Time Zone Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimeZoneMenu(!showTimeZoneMenu)}
            className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <span className="text-gray-600">Time zone</span>
            <span className="text-xs font-medium text-blue-600">
              {timeZone}
            </span>
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showTimeZoneMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowTimeZoneMenu(false)}
              />
              <div className="absolute left-0 z-40 mt-1 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-2">
                  <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                    Select time zone...
                  </div>
                  {timeZoneOptions.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => selectTimeZone(zone.id)}
                      className={`w-full text-left rounded px-3 py-2 text-sm hover:bg-gray-100 ${
                        timeZone === zone.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

 

   
        {/* Platform selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPlatformMenu(!showPlatformMenu)}
            className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <span className="text-gray-600">Platforms</span>
            {selectedPlatforms.length > 0 ? (
              <span className="text-xs font-medium text-blue-600">
                {selectedPlatforms.length} selected
              </span>
            ) : (
              <span className="text-gray-500 italic">Select...</span>
            )}
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
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
                    Select platforms...
                  </div>
                  {platforms.map((platform) => (
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
                      <img
                        src={platformIconsMap[platform.id]}
                        alt={`${platform.name} icon`}
                        className="h-4 w-4 mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {platform.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <label className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent outline-none placeholder:text-gray-400"
            onKeyDown={(e) => { 
              if(e.key === "Enter") applyFilters();
            }}
            aria-label="Title filter"
            placeholder="Search..."
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

        {/* Tags Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTagsMenu(!showTagsMenu)}
            className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <span className="text-gray-600">Tags</span>
            {tags ? (
              <span className="text-xs font-medium text-blue-600">{tags}</span>
            ) : (
              <span className="text-gray-500 italic">Select...</span>
            )}
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showTagsMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowTagsMenu(false)}
              />
              <div className="absolute left-0 z-40 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-2">
                  <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                    Select a tag...
                  </div>
                  {PREDEFINED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => selectTag(tag)}
                      className={`w-full text-left rounded px-3 py-2 text-sm hover:bg-gray-100 ${
                        tags === tag
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {tags && (
                    <button
                      type="button"
                      onClick={() => selectTag("")}
                      className="w-full text-left rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t mt-1 pt-2"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Apply Button */}
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
          onClick={applyFilters}
        >
          Apply
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Reset
        </button>

      
      </div>
    </section>
  );
}

export default CampaignsToolbar;
