import React, { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import DatePickerToggle from "./DatePicker";

// Premium Dark Theme Color Palette - Enhanced
const theme = {
  // Backgrounds - Deeper, more premium
  bgMain: "#050505",
  bgSecondary: "#0A0A0A",
  bgCard: "#0C0C0C",
  bgCardHover: "#101010",
  bgChart: "#111111",
  bgChartGradient: "#0C0C0C",

  // Borders - More subtle
  borderSubtle: "#1A1A1A",
  borderHover: "#252525",
  dividerSubtle: "#161616",

  // Shadows - Deeper, softer
  shadowSoft: "rgba(0, 0, 0, 0.55)",
  shadowDeep: "rgba(0, 0, 0, 0.7)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",

  // Typography
  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textTertiary: "#6B6B6B",
  textDisabled: "#4A4A4A",

  // Accent colors - Vibrant
  blue: "#3B82F6",
  purple: "#A855F7",
  teal: "#14B8A6",
  yellow: "#FACC15",
  red: "#EF4444",
  green: "#22C55E",
  pink: "#EC4899",
  orange: "#FB923C",

  // Status
  positive: "#22C55E",
  negative: "#EF4444",

  // Chart
  gridLines: "#1E1E1E"
};

// Metric accent colors mapping
const metricAccentColors = {
  amount_spent: theme.blue,
  revenue: theme.green,
  net: theme.teal,
  roi: theme.yellow,
  clicks: theme.purple,
  conversions: theme.pink,
  cpa: theme.red,
  epc: theme.orange
};

// Helper function to get API base URL
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CAMPAIGNS_API_URL;

  if (apiUrl) {
    const base = apiUrl.replace(/\/$/, "");
    return base.endsWith("/v1/campaigns") ? base : `${base}/v1/campaigns`;
  }

  if (import.meta.env.PROD) {
    return "/api/campaigns";
  }

  return "http://65.109.65.93:8080/v1/campaigns";
};

// API endpoints
const getApiEndpoints = () => {
  const base = getApiBaseUrl();
  return {
    snapchat: `${base}/snap`,
    facebook: `${base}/meta`
  };
};

const API_ENDPOINTS = getApiEndpoints();

// Platform mapping
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

// CSS for animations
const globalStyles = `
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  
  .shimmer-loading {
    background: linear-gradient(90deg, #0C0C0C 25%, #1A1A1A 50%, #0C0C0C 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

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

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

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

      const aggregatedData = {};
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

    const mockChange = (value) => {
      return value > 0 ? parseFloat((Math.random() * 15).toFixed(1)) : 0;
    };

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

  const handleDateRangeChange = (range, customRange = null) => {
    setDateRange(range);
    if (customRange) {
      setCustomDateRange(customRange);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
    setMobileMenuOpen(false);
    setTabletMenuOpen(false);
    setExpandedCard(null);
  };

  const toggleCardExpansion = (cardKey) => {
    if (expandedCard === cardKey) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardKey);
    }
  };

  const platformOptions = [
    { id: "all", name: "All Platforms", icon: null },
    { id: "facebook", name: "Facebook", icon: fb },
    { id: "snapchat", name: "Snapchat", icon: snapchatIcon },
    { id: "google-ads", name: "Google", icon: googleIcon },
    { id: "tiktok", name: "TikTok", icon: tiktokIcon },
    { id: "newsbreak", name: "NewsBreak", icon: nb }
  ];

  const selectedPlatformObj = platformOptions.find((p) => p.id === selectedPlatform);

  // Premium Button Component
  const PremiumButton = ({ onClick, disabled, children, isActive, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden transition-all duration-300 ease-out ${className}`}
      style={{
        backgroundColor: isActive ? `${theme.blue}15` : theme.bgCard,
        border: `1px solid ${isActive ? theme.blue : theme.borderSubtle}`,
        borderRadius: "14px",
        boxShadow: isActive
          ? `0 0 40px ${theme.blue}15, ${theme.innerShadow}`
          : `0 4px 20px ${theme.shadowSoft}, ${theme.innerShadow}`
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = theme.bgCardHover;
          e.currentTarget.style.borderColor = theme.borderHover;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = theme.bgCard;
          e.currentTarget.style.borderColor = theme.borderSubtle;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </button>
  );

  // Dropdown Menu Component
  const DropdownMenu = ({ isOpen, options, onSelect, selectedId }) => {
    if (!isOpen) return null;

    return (
      <div
        className="absolute z-50 mt-2 w-full rounded-[16px] overflow-hidden backdrop-blur-xl"
        style={{
          backgroundColor: `${theme.bgCard}F5`,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${theme.blue}08`
        }}
      >
        <ul className="py-2">
          {options.map((option, index) => (
            <li key={option.id}>
              <button
                onClick={() => onSelect(option.id)}
                className="flex items-center w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: selectedId === option.id ? `${theme.blue}12` : "transparent",
                  color: selectedId === option.id ? theme.blue : theme.textSecondary
                }}
                onMouseEnter={(e) => {
                  if (selectedId !== option.id) {
                    e.currentTarget.style.backgroundColor = `${theme.bgCardHover}`;
                    e.currentTarget.style.color = theme.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedId !== option.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                {option.icon ? (
                  <img src={option.icon} alt={option.name} className="w-5 h-5 mr-3 opacity-90" />
                ) : (
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.textTertiary }}
                    />
                  </div>
                )}
                <span className="font-medium">{option.name}</span>
                {selectedId === option.id && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    style={{ color: theme.blue }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      className="p-4 xs:p-5 md:p-8 w-full xs:pt-[25%] ss:pt-[15%] md:pt-[5%] lg:pt-[3%]"
      style={{
        backgroundColor: theme.bgMain,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.blue}08, transparent)`
      }}
    >
      {/* Error message */}
      {error && (
        <div
          className="mb-6 p-5 rounded-[16px] backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.red}08`,
            border: `1px solid ${theme.red}25`,
            boxShadow: `0 0 40px ${theme.red}10`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: `${theme.red}15` }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: theme.red }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p style={{ color: theme.red }} className="text-sm font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 rounded-full transition-all duration-200"
              style={{ color: theme.red }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.red}15`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
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

      {/* Main header with filters */}
      <div className="mb-6 md:mb-8">
        {/* Mobile Layout (up to 640px) */}
        <div className="sm:hidden">
          <div className="space-y-4">
            {/* Platform Dropdown for Mobile */}
            <div className="mobile-dropdown relative w-full">
              <PremiumButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-3"
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-3"
                    />
                  )}
                  <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-300 ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: theme.textSecondary }}
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
              </PremiumButton>

              <DropdownMenu
                isOpen={mobileMenuOpen}
                options={platformOptions}
                onSelect={handlePlatformChange}
                selectedId={selectedPlatform}
              />
            </div>

            {/* Date and Refresh Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-grow">
                <DatePickerToggle
                  selectedRange={dateRange}
                  onRangeChange={handleDateRangeChange}
                  customRange={customDateRange}
                />
              </div>
              <PremiumButton onClick={handleRefresh} disabled={isLoading} className="px-4 py-3">
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    style={{ color: theme.blue }}
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    style={{ color: theme.textSecondary }}
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
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Tablet Layout (640px to 1023px) */}
        <div className="hidden sm:flex lg:hidden flex-col space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0 w-auto">
              <DatePickerToggle
                selectedRange={dateRange}
                onRangeChange={handleDateRangeChange}
                customRange={customDateRange}
              />
            </div>

            {/* Platform Dropdown for Tablet */}
            <div className="tablet-dropdown relative w-64">
              <PremiumButton
                onClick={() => setTabletMenuOpen(!tabletMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5"
              >
                <div className="flex items-center">
                  {selectedPlatformObj.icon && (
                    <img
                      src={selectedPlatformObj.icon}
                      alt={selectedPlatformObj.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    {selectedPlatformObj.name}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-300 ${
                    tabletMenuOpen ? "rotate-180" : ""
                  }`}
                  style={{ color: theme.textSecondary }}
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
              </PremiumButton>

              <DropdownMenu
                isOpen={tabletMenuOpen}
                options={platformOptions}
                onSelect={handlePlatformChange}
                selectedId={selectedPlatform}
              />
            </div>

            {/* Refresh Button */}
            <PremiumButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2.5"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  style={{ color: theme.blue }}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  style={{ color: theme.textSecondary }}
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
              <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Refresh
              </span>
            </PremiumButton>
          </div>
        </div>

        {/* Desktop Layout (1024px to 1535px) */}
        <div className="hidden lg:flex xl:hidden items-center justify-between gap-4">
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Dropdown for Desktop */}
          <div className="desktop-dropdown relative w-64">
            <PremiumButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5"
            >
              <div className="flex items-center">
                {selectedPlatformObj.icon && (
                  <img
                    src={selectedPlatformObj.icon}
                    alt={selectedPlatformObj.name}
                    className="w-5 h-5 mr-2"
                  />
                )}
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {selectedPlatformObj.name}
                </span>
              </div>
              <svg
                className={`h-5 w-5 transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-180" : ""
                }`}
                style={{ color: theme.textSecondary }}
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
            </PremiumButton>

            <DropdownMenu
              isOpen={mobileMenuOpen}
              options={platformOptions}
              onSelect={handlePlatformChange}
              selectedId={selectedPlatform}
            />
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <PremiumButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-5 py-2.5"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  style={{ color: theme.blue }}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  style={{ color: theme.textSecondary }}
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
              <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Refresh
              </span>
            </PremiumButton>
          </div>
        </div>

        {/* Large Screen Layout (1536px and above) */}
        <div className="hidden xl:flex items-center justify-between">
          <div className="flex-shrink-0 w-auto">
            <DatePickerToggle
              selectedRange={dateRange}
              onRangeChange={handleDateRangeChange}
              customRange={customDateRange}
            />
          </div>

          {/* Platform Buttons */}
          <div className="flex items-center justify-center flex-grow px-8 gap-2">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap focus:outline-none overflow-hidden group"
                style={{
                  backgroundColor:
                    selectedPlatform === platform.id ? `${theme.blue}12` : theme.bgCard,
                  border: `1px solid ${selectedPlatform === platform.id ? `${theme.blue}50` : theme.borderSubtle}`,
                  color: selectedPlatform === platform.id ? theme.blue : theme.textSecondary,
                  boxShadow:
                    selectedPlatform === platform.id
                      ? `0 0 40px ${theme.blue}18, inset 0 1px 0 ${theme.blue}15`
                      : `0 2px 8px ${theme.shadowSoft}, ${theme.innerShadow}`
                }}
                onMouseEnter={(e) => {
                  if (selectedPlatform !== platform.id) {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    e.currentTarget.style.borderColor = theme.borderHover;
                    e.currentTarget.style.color = theme.textPrimary;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPlatform !== platform.id) {
                    e.currentTarget.style.backgroundColor = theme.bgCard;
                    e.currentTarget.style.borderColor = theme.borderSubtle;
                    e.currentTarget.style.color = theme.textSecondary;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <span className="flex items-center relative z-10">
                  {platform.id !== "all" && platform.icon && (
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-4 h-4 mr-2 opacity-90"
                    />
                  )}
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex-shrink-0">
            <PremiumButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-5 py-2.5"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  style={{ color: theme.blue }}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  style={{ color: theme.textSecondary }}
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
              <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Refresh
              </span>
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 xs:gap-5 md:gap-6 w-full">
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
            theme={theme}
            accentColor={metricAccentColors[key]}
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
  theme,
  accentColor
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
    if (changeType === "positive") return theme.positive;
    if (changeType === "negative") return theme.negative;
    return theme.textSecondary;
  };

  const getChangeIcon = () => {
    if (changeType === "positive") {
      return (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (changeType === "negative") {
      return (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return <span className="mr-1">−</span>;
  };

  const displayValue =
    selectedPlatform !== "all" && platformBreakdown[selectedPlatform] !== undefined
      ? platformBreakdown[selectedPlatform]
      : value;

  const hasPlatformData = Object.keys(platformBreakdown).length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div
        className="rounded-[18px] p-5 xs:p-6 md:p-7 min-h-[200px] xs:min-h-[220px] md:min-h-[240px]"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: `0 8px 32px ${theme.shadowSoft}, ${theme.innerShadow}`
        }}
      >
        <div className="shimmer-loading h-4 rounded-lg w-1/2 mb-4"></div>
        <div className="shimmer-loading h-10 rounded-lg w-3/4 mb-3"></div>
        <div className="shimmer-loading h-3 rounded-lg w-1/4 mb-6"></div>
        <div className="h-20 md:h-24 rounded-xl" style={{ backgroundColor: theme.bgChart }}></div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-[18px] p-5 xs:p-6 md:p-7 transition-all duration-500 ease-out cursor-pointer min-h-[200px] xs:min-h-[220px] md:min-h-[240px] flex flex-col overflow-hidden group"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${isHovered ? `${accentColor}30` : theme.borderSubtle}`,
        boxShadow: isHovered
          ? `0 20px 60px ${theme.shadowDeep}, 0 0 60px ${accentColor}12, inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 8px 32px ${theme.shadowSoft}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        transform: isHovered ? "translateY(-4px)" : "translateY(0)"
      }}
      onClick={onToggleExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow effect */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0.4,
          filter: "blur(40px)"
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-2 md:mb-3 relative z-10">
        <div className="flex items-center">
         
          <h3
            className="text-sm xs:text-base font-medium tracking-wide"
            style={{ color: theme.textSecondary }}
          >
            {title}
          </h3>
        </div>
        {selectedPlatform !== "all" && (
          <div className="flex items-center">
            <img
              src={platformIcons[selectedPlatform]}
              alt={platformNames[selectedPlatform]}
              className="w-4 h-4 md:w-5 md:h-5 mr-1.5 opacity-80"
            />
            <span className="text-xs md:text-sm" style={{ color: theme.textTertiary }}>
              {platformNames[selectedPlatform]}
            </span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div
        className="text-2xl xs:text-3xl md:text-4xl font-bold mb-2 md:mb-3 relative z-10 tracking-tight"
        style={{
          color: accentColor,
          textShadow: `0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`
        }}
      >
        {formatValue(displayValue)}
      </div>

      {/* Change Indicator */}
      <div className="flex items-center text-xs xs:text-sm mb-4 md:mb-5 relative z-10">
        <span
          className="font-semibold flex items-center px-2 py-0.5 rounded-full"
          style={{
            color: getChangeColor(),
            backgroundColor: `${getChangeColor()}12`
          }}
        >
          {getChangeIcon()}
          {Math.abs(change)}%
        </span>
       
      </div>

      {/* Chart */}
      <div
        className="h-20 ss:h-24 md:h-28 mt-auto rounded-xl overflow-hidden relative z-10"
        style={{
          background: `linear-gradient(180deg, ${theme.bgChart} 0%, ${theme.bgChartGradient} 100%)`
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`gradient-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
                <stop offset="40%" stopColor={accentColor} stopOpacity={0.1} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
              <filter id={`glow-${metricKey}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={2.2}
              fillOpacity={1}
              fill={`url(#gradient-${metricKey})`}
              filter={`url(#glow-${metricKey})`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Breakdown (Expanded) */}
      {isExpanded && selectedPlatform === "all" && hasPlatformData && (
        <div
          className="mt-5 md:mt-6 pt-4 md:pt-5 relative z-10"
          style={{ borderTop: `1px solid ${theme.dividerSubtle}` }}
        >
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h4
              className="text-xs md:text-sm font-semibold tracking-wide"
              style={{ color: theme.textSecondary }}
            >
              Platform Breakdown
            </h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-300"
              style={{
                color: theme.textTertiary,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0)"
              }}
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
          <div className="space-y-2.5 md:space-y-3">
            {Object.entries(platformBreakdown)
              .filter(([, platformValue]) => platformValue > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, platformValue]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.borderSubtle}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    e.currentTarget.style.borderColor = theme.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bgSecondary;
                    e.currentTarget.style.borderColor = theme.borderSubtle;
                  }}
                >
                  <div className="flex items-center">
                    {platformIcons[platform] && (
                      <img
                        src={platformIcons[platform]}
                        alt={platformNames[platform]}
                        className="w-5 h-5 md:w-6 md:h-6 mr-2.5 opacity-90"
                      />
                    )}
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {platformNames[platform]}
                    </span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                    {formatValue(platformValue)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Subtle bottom border glow on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
          opacity: isHovered ? 1 : 0
        }}
      />
    </div>
  );
};

// Generate sparkline data
function generateSparklineData(days, currentValue, metricType = "positive") {
  if (!currentValue || currentValue === 0) {
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      value: 0
    }));
  }

  const data = [];
  const variance = 0.15;
  const trendStrength = 0.3;

  const seed = metricType.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRandom = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < days; i++) {
    const progress = i / (days - 1);
    const randomFactor = (pseudoRandom(i) - 0.5) * variance * 2;
    const trendValue = currentValue * (0.7 + progress * trendStrength);
    const value = Math.max(0, trendValue * (1 + randomFactor));

    data.push({
      day: i + 1,
      value: parseFloat(value.toFixed(2))
    });
  }

  data[data.length - 1].value = currentValue;

  return data;
}

export default MediaBuyerDashboard;
