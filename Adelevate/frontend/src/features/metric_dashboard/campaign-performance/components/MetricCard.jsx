import React, { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer } from "recharts";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import DatePickerToggle from "./DatePicker";

// Helper function to get API base URL - avoids mixed content issues in production
const getApiBaseUrl = () => {
  // Check for environment variable first (for production)
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CAMPAIGNS_API_URL;
  
  if (apiUrl) {
    // Remove trailing slash and ensure it ends with /v1/campaigns
    const base = apiUrl.replace(/\/$/, '');
    return base.endsWith('/v1/campaigns') ? base : `${base}/v1/campaigns`;
  }
  
  if (import.meta.env.PROD) {
    // In production, use relative path that goes through proxy/backend
    // IMPORTANT: Your web server (nginx/Apache/Cloudflare) must be configured to proxy
    // /api/campaigns/* requests to http://65.109.65.93:8080/v1/campaigns/*
    // This avoids mixed content errors (HTTPS page calling HTTP API)
    return "/api/campaigns";
  }
  
  // In development, use the direct backend URL
  return "http://65.109.65.93:8080/v1/campaigns";
};

// API endpoints
const getApiEndpoints = () => {
  const base = getApiBaseUrl();
  return {
    snapchat: `${base}/snap`,
    facebook: `${base}/meta`
    // Add other endpoints when available
    // tiktok: `${base}/tiktok`,
    // "google-ads": `${base}/google`,
    // newsbreak: `${base}/newsbreak`,
  };
};

const API_ENDPOINTS = getApiEndpoints();

// Platform mapping (API response uses different names)
const PLATFORM_API_MAPPING = {
  snap: "snapchat",
  meta: "facebook"
};

// Platform icons mapping
const platformIcons = {
    facebook: fb,
    snapchat: snapchatIcon,
    "google-ads": googleIcon,
    tiktok: tiktokIcon,
    newsbreak: nb
};

// Platform display names
const platformNames = {
    facebook: "Facebook",
    snapchat: "Snapchat",
    "google-ads": "Google",
    tiktok: "TikTok",
    newsbreak: "NewsBreak"
};

const MediaBuyerDashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState({
    amount_spent: {},
    revenue: {},
    net: {},
    roi: {},
    clicks: {},
    conversions: {},
    cpa: {},
    epc: {}
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabletMenuOpen, setTabletMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [error, setError] = useState(null);
  const [platformData, setPlatformData] = useState({});

  // Initialize metrics data
  useEffect(() => {
    fetchData();
  }, [dateRange, customDateRange]);

  // Update metrics when platform selection changes
  useEffect(() => {
    if (Object.keys(platformData).length > 0) {
      calculateMetrics();
    }
  }, [selectedPlatform, platformData]);

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

  // Function to fetch data from all platform APIs
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setExpandedCard(null);

    try {
      // Fetch data from all available APIs
      const apiPromises = Object.entries(API_ENDPOINTS).map(async ([platform, endpoint]) => {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${platform} data`);
          }
          const data = await response.json();
          return {
            platform: PLATFORM_API_MAPPING[platform] || platform,
            data: data.items || [],
            success: true
          };
        } catch (err) {
          console.error(`Error fetching ${platform}:`, err);
          return {
            platform: PLATFORM_API_MAPPING[platform] || platform,
            data: [],
            success: false
          };
        }
      });

      const results = await Promise.all(apiPromises);

      // Aggregate data by platform
      const aggregatedData = {};

      // Initialize all platforms with 0 values
      const allPlatforms = ["facebook", "snapchat", "tiktok", "google-ads", "newsbreak"];

      allPlatforms.forEach((platform) => {
        aggregatedData[platform] = {
          spend: 0,
          revenue: 0,
          profit: 0,
          roi: 0,
          clicks: 0,
          conversions: 0,
          cpa: 0,
          epc: 0,
          impressions: 0
        };
      });

      // Process fetched data
      results.forEach(({ platform, data, success }) => {
        if (success && data.length > 0) {
          const platformMetrics = data.reduce(
            (acc, campaign) => {
              return {
                spend: acc.spend + (parseFloat(campaign.spend) || 0),
                revenue: acc.revenue + (parseFloat(campaign.revenue) || 0),
                profit: acc.profit + (parseFloat(campaign.profit) || 0),
                clicks: acc.clicks + (parseInt(campaign.clicks) || 0),
                conversions: acc.conversions + (parseInt(campaign.conversions) || 0),
                impressions: acc.impressions + (parseInt(campaign.impressions) || 0)
              };
            },
            {
              spend: 0,
              revenue: 0,
              profit: 0,
              clicks: 0,
              conversions: 0,
              impressions: 0
            }
          );

          // Calculate derived metrics
          const roi =
            platformMetrics.spend > 0
              ? parseFloat(((platformMetrics.profit / platformMetrics.spend) * 100).toFixed(2))
              : 0;
          const cpa =
            platformMetrics.conversions > 0
              ? parseFloat((platformMetrics.spend / platformMetrics.conversions).toFixed(2))
              : 0;
          const epc =
            platformMetrics.clicks > 0
              ? parseFloat((platformMetrics.revenue / platformMetrics.clicks).toFixed(2))
              : 0;

          aggregatedData[platform] = {
            spend: platformMetrics.spend,
            revenue: platformMetrics.revenue,
            profit: platformMetrics.profit,
            roi: roi,
            clicks: platformMetrics.clicks,
            conversions: platformMetrics.conversions,
            cpa: cpa,
            epc: epc,
            impressions: platformMetrics.impressions
          };
        }
      });

      setPlatformData(aggregatedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      setIsLoading(false);
    }
  };

  // Calculate metrics based on selected platform
  const calculateMetrics = () => {
    let dataToUse = {};

    if (selectedPlatform === "all") {
      // Sum all platform data
      const totals = Object.values(platformData).reduce(
        (acc, platform) => ({
          spend: acc.spend + platform.spend,
          revenue: acc.revenue + platform.revenue,
          profit: acc.profit + platform.profit,
          clicks: acc.clicks + platform.clicks,
          conversions: acc.conversions + platform.conversions
        }),
        { spend: 0, revenue: 0, profit: 0, clicks: 0, conversions: 0 }
      );

      // Calculate total derived metrics
      const totalRoi =
        totals.spend > 0 ? parseFloat(((totals.profit / totals.spend) * 100).toFixed(2)) : 0;
      const totalCpa =
        totals.conversions > 0 ? parseFloat((totals.spend / totals.conversions).toFixed(2)) : 0;
      const totalEpc =
        totals.clicks > 0 ? parseFloat((totals.revenue / totals.clicks).toFixed(2)) : 0;

      dataToUse = {
        spend: totals.spend,
        revenue: totals.revenue,
        profit: totals.profit,
        roi: totalRoi,
        clicks: totals.clicks,
        conversions: totals.conversions,
        cpa: totalCpa,
        epc: totalEpc
      };
    } else {
      // Use specific platform data
      dataToUse = platformData[selectedPlatform] || {
        spend: 0,
        revenue: 0,
        profit: 0,
        roi: 0,
        clicks: 0,
        conversions: 0,
        cpa: 0,
        epc: 0
      };
    }

    // Build platform breakdowns (only for "all" view)
    const platformBreakdowns = {
      amount_spent: {},
      revenue: {},
      net: {},
      roi: {},
      clicks: {},
      conversions: {},
      cpa: {},
      epc: {}
    };

    // Only show platforms with data > 0 in breakdown
    Object.entries(platformData).forEach(([platform, metrics]) => {
      if (metrics.spend > 0 || metrics.revenue > 0 || metrics.clicks > 0) {
        platformBreakdowns.amount_spent[platform] = metrics.spend;
        platformBreakdowns.revenue[platform] = metrics.revenue;
        platformBreakdowns.net[platform] = metrics.profit;
        platformBreakdowns.roi[platform] = metrics.roi;
        platformBreakdowns.clicks[platform] = metrics.clicks;
        platformBreakdowns.conversions[platform] = metrics.conversions;
        platformBreakdowns.cpa[platform] = metrics.cpa;
        platformBreakdowns.epc[platform] = metrics.epc;
      }
    });

    // Calculate mock changes (you'll need historical data for real changes)
    const mockChange = (value) => {
      return value > 0 ? parseFloat((Math.random() * 15).toFixed(1)) : 0;
    };

    // Set metrics data
    setMetricsData({
      amount_spent: {
        title: "Amount Spent",
        value: dataToUse.spend,
        change: mockChange(dataToUse.spend),
        changeType: dataToUse.spend > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, dataToUse.spend, "spend"),
        platformBreakdown: platformBreakdowns.amount_spent
      },
      revenue: {
        title: "Revenue",
        value: dataToUse.revenue,
        change: mockChange(dataToUse.revenue),
        changeType: dataToUse.revenue > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, dataToUse.revenue, "revenue"),
        platformBreakdown: platformBreakdowns.revenue
      },
      net: {
        title: "Net",
        value: dataToUse.profit,
        change: mockChange(Math.abs(dataToUse.profit)),
        changeType: dataToUse.profit > 0 ? "positive" : "negative",
        format: "currency",
        sparklineData: generateSparklineData(30, dataToUse.profit, "profit"),
        platformBreakdown: platformBreakdowns.net
      },
      roi: {
        title: "ROI",
        value: dataToUse.roi,
        change: mockChange(dataToUse.roi),
        changeType: dataToUse.roi > 0 ? "positive" : "negative",
        format: "percentage",
        sparklineData: generateSparklineData(30, dataToUse.roi, "roi"),
        platformBreakdown: platformBreakdowns.roi
      },
      clicks: {
        title: "Clicks",
        value: dataToUse.clicks,
        change: mockChange(dataToUse.clicks),
        changeType: dataToUse.clicks > 0 ? "positive" : "neutral",
        format: "number",
        sparklineData: generateSparklineData(30, dataToUse.clicks, "clicks"),
        platformBreakdown: platformBreakdowns.clicks
      },
      conversions: {
        title: "Conversions",
        value: dataToUse.conversions,
        change: mockChange(dataToUse.conversions),
        changeType: dataToUse.conversions > 0 ? "positive" : "neutral",
        format: "number",
        sparklineData: generateSparklineData(30, dataToUse.conversions, "conversions"),
        platformBreakdown: platformBreakdowns.conversions
      },
      cpa: {
        title: "CPA",
        value: dataToUse.cpa,
        change: mockChange(dataToUse.cpa),
        changeType: dataToUse.cpa > 0 ? "negative" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, dataToUse.cpa, "cpa"),
        platformBreakdown: platformBreakdowns.cpa
      },
      epc: {
        title: "EPC",
        value: dataToUse.epc,
        change: mockChange(dataToUse.epc),
        changeType: dataToUse.epc > 0 ? "positive" : "neutral",
        format: "currency",
        sparklineData: generateSparklineData(30, dataToUse.epc, "epc"),
        platformBreakdown: platformBreakdowns.epc
      }
    });
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
    setExpandedCard(null);
  };

  // Function to toggle card expansion
  const toggleCardExpansion = (cardKey) => {
    if (expandedCard === cardKey) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardKey);
    }
  };

  // Platform options
  const platformOptions = [
      { id: "all", name: "All Platforms", icon: null },
      { id: "facebook", name: "Facebook", icon: fb },
      { id: "snapchat", name: "Snapchat", icon: snapchatIcon },
      { id: "google-ads", name: "Google", icon: googleIcon },
      { id: "tiktok", name: "TikTok", icon: tiktokIcon },
      { id: "newsbreak", name: "NewsBreak", icon: nb }
  ];

  // Get selected platform name and icon
  const selectedPlatformObj = platformOptions.find((p) => p.id === selectedPlatform);

  return (
    <div className="p-3 xs:p-4 md:p-6 w-full xs:pt-[25%] ss:pt-[15%] md:pt-[5%] lg:pt-[3%]">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

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
                            <img src={platform.icon} alt={platform.name} className="w-5 h-5 mr-3" />
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
                            <img src={platform.icon} alt={platform.name} className="w-5 h-5 mr-3" />
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
                          <img src={platform.icon} alt={platform.name} className="w-5 h-5 mr-3" />
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
                  <img src={platform.icon} alt={platform.name} className="w-4 h-4 inline mr-2" />
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
  onToggleExpand
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined || isNaN(val)) {
      return format === "currency" ? "$0.00" : "0";
    }

    if (format === "currency") {
      if (Math.abs(val) >= 1000) {
        return `${val < 0 ? "-" : ""}$${Math.abs(val).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`;
      }
      return `${val < 0 ? "-" : ""}$${Math.abs(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } else if (format === "percentage") {
      return `${parseFloat(val).toFixed(2)}%`;
    } else if (format === "decimal") {
      return parseFloat(val).toFixed(2);
    }
    return Math.round(val).toLocaleString();
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
    selectedPlatform !== "all" && platformBreakdown[selectedPlatform] !== undefined
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
        <h3 className="text-sm xs:text-base font-medium text-gray-700">{title}</h3>
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
          <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`colorGraph-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getGraphColor()} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getGraphColor()} stopOpacity={0} />
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
            <h4 className="text-xs md:text-sm font-medium text-gray-700">Platform Breakdown</h4>
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
            {Object.entries(platformBreakdown)
              .filter(([platform, platformValue]) => platformValue > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, platformValue]) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {platformIcons[platform] && (
                      <img
                        src={platformIcons[platform]}
                        alt={platformNames[platform]}
                        className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2"
                      />
                    )}
                    <span className="text-xs md:text-sm">{platformNames[platform]}</span>
                  </div>
                  <span className="font-medium text-xs md:text-sm">
                    {formatValue(platformValue)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Generate sparkline data based on current value and metric type
function generateSparklineData(days, currentValue, metricType = "positive") {
  if (!currentValue || currentValue === 0) {
    // Return flat line at 0 if no data
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      value: 0
    }));
  }

  const data = [];
  const variance = 0.15; // 15% variance
  const trendStrength = 0.3; // How much the trend influences the data

  // Add some randomness to make each chart unique
  const seed = metricType.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < days; i++) {
    // Create a trend that moves toward the current value
    const progress = i / (days - 1);
    const randomFactor = (pseudoRandom(i) - 0.5) * variance * 2;

    // Start at 70% of current value, gradually increase to 100%
    const trendValue = currentValue * (0.7 + progress * trendStrength);
    const value = Math.max(0, trendValue * (1 + randomFactor));

    data.push({
      day: i + 1,
      value: parseFloat(value.toFixed(2))
    });
  }

  // Ensure last value is close to current value
  data[data.length - 1].value = currentValue;

  return data;
}

export default MediaBuyerDashboard;
