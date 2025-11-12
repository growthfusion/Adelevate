import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import DatePickerToggle from "./DatePicker";

// Platform icons mapping
const platformIcons = {
  "google-ads": googleIcon,
  facebook: fb,
  tiktok: tiktokIcon,
  snapchat: snapchatIcon,
  newsbreak: nb,
};

// Platform display names
const platformNames = {
  "google-ads": "Google",
  facebook: "Facebook",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  newsbreak: "NewsBreak",
};

const MediaBuyerDashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [metricsData, setMetricsData] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabletMenuOpen, setTabletMenuOpen] = useState(false);
  // Track which card is expanded - only one card can be expanded at a time
  const [expandedCard, setExpandedCard] = useState(null);

  // Initialize metrics data
  useEffect(() => {
    fetchData();
  }, [selectedPlatform, dateRange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest(".mobile-dropdown")) {
        setMobileMenuOpen(false);
      }
      if (tabletMenuOpen && !event.target.closest(".tablet-dropdown")) {
        setTabletMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, tabletMenuOpen]);

  // Function to fetch data when date range or platform changes
  const fetchData = () => {
    setIsLoading(true);
    // Reset expanded card when data changes
    setExpandedCard(null);

    // Simulate API call with timeout
    setTimeout(() => {
      setMetricsData({
        amount_spent: {
          title: "Amount Spent",
          value: 312587,
          change: 8.2,
          changeType: "positive",
          format: "currency",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 128500,
            facebook: 98750,
            tiktok: 45200,
            snapchat: 26137,
            newsbreak: 14000,
          },
        },
        revenue: {
          title: "Revenue",
          value: 346839,
          change: 12.5,
          changeType: "positive",
          format: "currency",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 142500,
            facebook: 110250,
            tiktok: 54300,
            snapchat: 25789,
            newsbreak: 14000,
          },
        },
        net: {
          title: "Net",
          value: 34251,
          change: 15.8,
          changeType: "positive",
          format: "currency",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 14000,
            facebook: 11500,
            tiktok: 9100,
            snapchat: -348,
            newsbreak: 0,
          },
        },
        roi: {
          title: "ROI",
          value: 10.96,
          change: 4.2,
          changeType: "positive",
          format: "percentage",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 12.5,
            facebook: 11.65,
            tiktok: 9.87,
            snapchat: 8.23,
            newsbreak: 7.5,
          },
        },
        clicks: {
          title: "Clicks",
          value: 210113,
          change: 5.7,
          changeType: "positive",
          format: "number",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 84050,
            facebook: 63033,
            tiktok: 35720,
            snapchat: 18310,
            newsbreak: 9000,
          },
        },
        conversions: {
          title: "Conversions",
          value: 27136,
          change: 7.3,
          changeType: "positive",
          format: "number",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 12500,
            facebook: 8450,
            tiktok: 3600,
            snapchat: 1856,
            newsbreak: 730,
          },
        },
        cpa: {
          title: "CPA",
          value: 11.51,
          change: 2.1,
          changeType: "negative", // lower CPA is better
          format: "currency",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 10.28,
            facebook: 11.68,
            tiktok: 12.56,
            snapchat: 14.08,
            newsbreak: 19.18,
          },
        },
        epc: {
          title: "EPC",
          value: 1.65,
          change: 3.2,
          changeType: "positive",
          format: "currency",
          sparklineData: generateSparklineData(30),
          platformBreakdown: {
            "google-ads": 1.85,
            facebook: 1.75,
            tiktok: 1.52,
            snapchat: 1.41,
            newsbreak: 1.12,
          },
        },
      });
      setIsLoading(false);
    }, 100);
  };

  // Handle date range change
  const handleDateRangeChange = (range, customRange = null) => {
    setDateRange(range);
    if (customRange) {
      setCustomDateRange(customRange);
    }
  };

  // Handle refresh button
  const handleRefresh = () => {
    fetchData();
  };

  // Handle platform change from dropdown
  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
    setMobileMenuOpen(false);
    setTabletMenuOpen(false);
    // Reset expanded card when platform changes
    setExpandedCard(null);
  };

  // Function to toggle card expansion
  const toggleCardExpansion = (cardKey) => {
    if (expandedCard === cardKey) {
      // If clicking the already expanded card, collapse it
      setExpandedCard(null);
    } else {
      // Otherwise, expand this card (and collapse any previously expanded card)
      setExpandedCard(cardKey);
    }
  };

  // Platform options
  const platformOptions = [
    { id: "all", name: "All Platforms", icon: null },
    { id: "google-ads", name: "Google", icon: googleIcon },
    { id: "facebook", name: "Facebook", icon: fb },
    { id: "tiktok", name: "TikTok", icon: tiktokIcon },
    { id: "snapchat", name: "Snapchat", icon: snapchatIcon },
    { id: "newsbreak", name: "NewsBreak", icon: nb },
  ];

  // Get selected platform name and icon
  const selectedPlatformObj = platformOptions.find(
    (p) => p.id === selectedPlatform
  );

  return (
    <div className="p-3 xs:p-4 md:p-6 w-full xs:pt-[10%] ss:pt-[15%] md:pt-[5%] lg:pt-[3%]">
      {/* Main header with filters - Optimized for all device sizes */}
      <div className="mb-4 md:mb-6">
        {/* Mobile Layout (up to 640px) */}
        <div className="sm:hidden">
          <div className="space-y-3">
            {/* Platform Dropdown for Mobile */}
            <div className="mobile-dropdown relative w-full">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none"
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {mobileMenuOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto border border-gray-200">
                  <ul className="py-1">
                    {platformOptions.map((platform) => (
                      <li key={platform.id}>
                        <button
                          onClick={() => handlePlatformChange(platform.id)}
                          className={`flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 focus:outline-none ${
                            selectedPlatform === platform.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {platform.icon ? (
                            <img
                              src={platform.icon}
                              alt={platform.name}
                              className="w-5 h-5 mr-3"
                            />
                          ) : (
                            <div className="w-5 h-5 mr-3"></div>
                          )}
                          {platform.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Date and Refresh Row */}
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <DatePickerToggle
                  selectedRange={dateRange}
                  onRangeChange={handleDateRangeChange}
                  customRange={customDateRange}
                />
              </div>
              <div className="ml-2">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout (640px to 1023px) */}
        <div className="hidden sm:flex lg:hidden flex-col space-y-4">
          <div className="flex items-center justify-between">
            {/* Date Picker */}
            <div className="flex-shrink-0 w-auto">
              <DatePickerToggle
                selectedRange={dateRange}
                onRangeChange={handleDateRangeChange}
                customRange={customDateRange}
              />
            </div>

            {/* Platform Dropdown for Tablet */}
            <div className="tablet-dropdown relative w-64 ml-3">
              <button
                onClick={() => setTabletMenuOpen(!tabletMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    tabletMenuOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {tabletMenuOpen && (
                <div className="absolute z-10 right-0 mt-1 w-64 rounded-md bg-white shadow-lg max-h-60 overflow-auto border border-gray-200">
                  <ul className="py-1">
                    {platformOptions.map((platform) => (
                      <li key={platform.id}>
                        <button
                          onClick={() => handlePlatformChange(platform.id)}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none ${
                            selectedPlatform === platform.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {platform.icon ? (
                            <img
                              src={platform.icon}
                              alt={platform.name}
                              className="w-5 h-5 mr-3"
                            />
                          ) : (
                            <div className="w-5 h-5 mr-3"></div>
                          )}
                          {platform.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="ml-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout (1024px to 1535px) */}
        <div className="hidden lg:flex xl:hidden items-center justify-between">
          {/* Date Picker */}
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Dropdown for Desktop (1024px) */}
          <div className="desktop-dropdown relative w-64 mx-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <div className="flex items-center">
                {selectedPlatformObj.icon && (
                  <img
                    src={selectedPlatformObj.icon}
                    alt={selectedPlatformObj.name}
                    className="w-5 h-5 mr-2"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {selectedPlatformObj.name}
                </span>
              </div>
              <svg
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {mobileMenuOpen && (
              <div className="absolute z-10 right-0 mt-1 w-64 rounded-md bg-white shadow-lg max-h-60 overflow-auto border border-gray-200">
                <ul className="py-1">
                  {platformOptions.map((platform) => (
                    <li key={platform.id}>
                      <button
                        onClick={() => handlePlatformChange(platform.id)}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none ${
                          selectedPlatform === platform.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {platform.icon ? (
                          <img
                            src={platform.icon}
                            alt={platform.name}
                            className="w-5 h-5 mr-3"
                          />
                        ) : (
                          <div className="w-5 h-5 mr-3"></div>
                        )}
                        {platform.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Large Screen Layout (1536px and above) - Buttons for platforms */}
        <div className="hidden xl:flex items-center justify-between">
          {/* Date Picker */}
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Buttons */}
          <div className="flex items-center justify-center flex-grow px-6 space-x-1.5">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap focus:outline-none
                  ${
                    selectedPlatform === platform.id
                      ? "bg-primary/10 text-primary border-primary border"
                      : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                {platform.id !== "all" && platform.icon && (
                  <img
                    src={platform.icon}
                    alt={platform.name}
                    className="w-4 h-4 inline mr-2"
                  />
                )}
                {platform.name}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics grid - Responsive across all breakpoints */}
      {/* Updated grid layout: 
          - Mobile: 1 column (unchanged)
          - Tablet: 1 column (changed from 2 columns)
          - Laptop (1024px): 2 columns (changed from 4 columns)
          - Large screens: 4 columns (unchanged)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 xs:gap-4 md:gap-6 w-full">
        {Object.entries(metricsData).map(([key, metric]) => (
          <MetricCard
            key={key}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            sparklineData={metric.sparklineData}
            format={metric.format}
            platformBreakdown={metric.platformBreakdown}
            selectedPlatform={selectedPlatform}
            metricKey={key}
            isLoading={isLoading}
            isExpanded={expandedCard === key}
            onToggleExpand={() => toggleCardExpansion(key)}
          />
        ))}
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  sparklineData,
  format = "number",
  platformBreakdown = {},
  selectedPlatform = "all",
  metricKey,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const formatValue = (val) => {
    if (format === "currency") {
      if (val >= 1000) {
        return `$${parseFloat(val).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
      }
      return `$${parseFloat(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else if (format === "percentage") {
      return `${val}%`;
    } else if (format === "decimal") {
      return parseFloat(val).toFixed(2);
    }
    return val?.toLocaleString();
  };

  const getChangeColor = () => {
    if (changeType === "positive") return "text-green-500";
    if (changeType === "negative") return "text-red-500";
    return "text-gray-500";
  };

  const getChangeSymbol = () => {
    if (changeType === "positive") return "↑";
    if (changeType === "negative") return "↓";
    return "−";
  };

  const displayValue =
    selectedPlatform !== "all" && platformBreakdown[selectedPlatform]
      ? platformBreakdown[selectedPlatform]
      : value;

  const getCardColor = () => {
    switch (metricKey) {
      case "amount_spent":
        return "bg-blue-50 hover:bg-blue-100 border-blue-200";
      case "revenue":
        return "bg-green-50 hover:bg-green-100 border-green-200";
      case "net":
        return "bg-teal-50 hover:bg-teal-100 border-teal-200";
      case "roi":
        return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
      case "clicks":
        return "bg-indigo-50 hover:bg-indigo-100 border-indigo-200";
      case "conversions":
        return "bg-pink-50 hover:bg-pink-100 border-pink-200";
      case "cpa":
        return "bg-red-50 hover:bg-red-100 border-red-200";
      case "epc":
        return "bg-orange-50 hover:bg-orange-100 border-orange-200";
      default:
        return "bg-gray-50 hover:bg-gray-100 border-gray-200";
    }
  };

  const getGraphColor = () => {
    switch (metricKey) {
      case "amount_spent":
        return "#3B82F6";
      case "revenue":
        return "#10B981";
      case "net":
        return "#14B8A6";
      case "roi":
        return "#FBBF24";
      case "clicks":
        return "#6366F1";
      case "conversions":
        return "#EC4899";
      case "cpa":
        return "#EF4444";
      case "epc":
        return "#F97316";
      default:
        return "#6B7280";
    }
  };

  // Check if there is platform data available for breakdown
  const hasPlatformData = Object.keys(platformBreakdown).length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`border rounded-xl p-4 xs:p-5 md:p-6 shadow-sm ${getCardColor()} animate-pulse min-h-[180px] xs:min-h-[200px] md:min-h-[220px]`}
      >
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3 md:mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2 md:mb-3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4 mb-4 md:mb-6"></div>
        <div className="h-16 md:h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl p-4 xs:p-5 md:p-6 shadow-sm ${getCardColor()} transition-all cursor-pointer min-h-[180px] xs:min-h-[200px] md:min-h-[220px] flex flex-col`}
      onClick={onToggleExpand}
    >
      <div className="flex justify-between items-start mb-1 md:mb-2">
        <h3 className="text-sm xs:text-base font-medium text-gray-700">
          {title}
        </h3>
        {selectedPlatform !== "all" && (
          <div className="flex items-center">
            <img
              src={platformIcons[selectedPlatform]}
              alt={platformNames[selectedPlatform]}
              className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-1.5"
            />
            <span className="text-xs md:text-sm text-gray-500">
              {platformNames[selectedPlatform]}
            </span>
          </div>
        )}
      </div>

      <div className="text-xl xs:text-2xl md:text-3xl font-bold mb-1 md:mb-3">
        {formatValue(displayValue)}
      </div>

      <div className="flex items-center text-xs xs:text-sm mb-2 md:mb-4">
        <span className={`${getChangeColor()} font-medium flex items-center`}>
          {getChangeSymbol()} {Math.abs(change)}%
        </span>
      </div>

      <div className="h-16 ss:h-20 md:h-24 mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sparklineData}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id={`colorGraph-${metricKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={getGraphColor()}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={getGraphColor()}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={getGraphColor()}
              fillOpacity={1}
              fill={`url(#colorGraph-${metricKey})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isExpanded && selectedPlatform === "all" && hasPlatformData && (
        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h4 className="text-xs md:text-sm font-medium text-gray-700">
              Platform Breakdown
            </h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 md:h-4 md:w-4 text-gray-400"
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
          </div>
          <div className="space-y-2 md:space-y-3">
            {Object.entries(platformBreakdown).map(
              ([platform, platformValue]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {platformIcons[platform] && (
                      <img
                        src={platformIcons[platform]}
                        alt={platformNames[platform]}
                        className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2"
                      />
                    )}
                    <span className="text-xs md:text-sm">
                      {platformNames[platform]}
                    </span>
                  </div>
                  <span className="font-medium text-xs md:text-sm">
                    {formatValue(platformValue)}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function generateSparklineData(days) {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 100) + 50,
  }));
}

export default MediaBuyerDashboard;
