import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Realistic Mock Data
const MOCK_LANDERS = [
  {
    id: "1",
    name: "Bitcoin Trading Academy - Premium",
    slug: "bitcoin-trading-academy-premium",
    status: "live",
    audience: "crypto",
    domain: "crypto-wealth.io",
    path: "/academy-premium",
    traffic: "Facebook Ads",
    metrics: {
      views: 125840,
      clicks: 22890,
      ctr: 18.2,
      conversions: 2358,
      conversionRate: 10.3,
      revenue: 47160,
      roi: 340,
      speed: 1.2
    },
    trends: {
      views: "+15%",
      clicks: "+12%",
      ctr: "+2.1%",
      conversions: "+25%",
      revenue: "+32%"
    },
    aiSuggestions: 3,
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2025-01-22T14:30:00Z"
  },
  {
    id: "2",
    name: "Stock Market Mastery Course",
    slug: "stock-market-mastery-2025",
    status: "live",
    audience: "finance",
    domain: "tradepro-education.com",
    path: "/mastery-course",
    traffic: "Google Ads",
    metrics: {
      views: 98420,
      clicks: 16540,
      ctr: 16.8,
      conversions: 1587,
      conversionRate: 9.6,
      revenue: 31740,
      roi: 285,
      speed: 1.4
    },
    trends: {
      views: "+8%",
      clicks: "+6%",
      ctr: "+1.8%",
      conversions: "+12%",
      revenue: "+18%"
    },
    aiSuggestions: 2,
    createdAt: "2024-10-10T10:00:00Z",
    updatedAt: "2025-01-21T16:20:00Z"
  },
  {
    id: "3",
    name: "Weight Loss Challenge 2025",
    slug: "30-day-weight-loss-challenge",
    status: "testing",
    audience: "health",
    domain: "fitlife-transformation.net",
    path: "/challenge-2025",
    traffic: "Native Ads",
    metrics: {
      views: 67200,
      clicks: 10752,
      ctr: 16.0,
      conversions: 892,
      conversionRate: 8.3,
      revenue: 17840,
      roi: 180,
      speed: 2.8
    },
    trends: {
      views: "-5%",
      clicks: "-3%",
      ctr: "0%",
      conversions: "-8%",
      revenue: "-12%"
    },
    aiSuggestions: 4,
    warnings: ["Slow load time affecting conversions"],
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2025-01-20T11:15:00Z"
  },
  {
    id: "4",
    name: "Forex Trading Signals - VIP Access",
    slug: "forex-signals-vip-membership",
    status: "live",
    audience: "finance",
    domain: "forex-elite-signals.com",
    path: "/vip-access",
    traffic: "TikTok Ads",
    metrics: {
      views: 89340,
      clicks: 14294,
      ctr: 16.0,
      conversions: 1143,
      conversionRate: 8.0,
      revenue: 34290,
      roi: 245,
      speed: 1.6
    },
    trends: {
      views: "+22%",
      clicks: "+18%",
      ctr: "+3.2%",
      conversions: "+28%",
      revenue: "+35%"
    },
    aiSuggestions: 1,
    createdAt: "2024-11-20T10:00:00Z",
    updatedAt: "2025-01-22T09:45:00Z"
  },
  {
    id: "5",
    name: "NFT Investment Blueprint 2025",
    slug: "nft-investment-blueprint",
    status: "live",
    audience: "crypto",
    domain: "nft-wealth-builder.io",
    path: "/blueprint-2025",
    traffic: "Google Ads",
    metrics: {
      views: 54890,
      clicks: 8783,
      ctr: 16.0,
      conversions: 702,
      conversionRate: 8.0,
      revenue: 21060,
      roi: 198,
      speed: 1.3
    },
    trends: {
      views: "+11%",
      clicks: "+9%",
      ctr: "+1.5%",
      conversions: "+14%",
      revenue: "+22%"
    },
    aiSuggestions: 2,
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2025-01-21T13:20:00Z"
  },
  {
    id: "6",
    name: "Real Estate Investment Webinar",
    slug: "real-estate-investor-training",
    status: "paused",
    audience: "finance",
    domain: "property-profits-academy.com",
    path: "/free-webinar",
    traffic: "Facebook Ads",
    metrics: {
      views: 43200,
      clicks: 6048,
      ctr: 14.0,
      conversions: 423,
      conversionRate: 7.0,
      revenue: 12690,
      roi: 156,
      speed: 1.9
    },
    trends: {
      views: "-12%",
      clicks: "-15%",
      ctr: "-2.8%",
      conversions: "-18%",
      revenue: "-20%"
    },
    aiSuggestions: 5,
    warnings: ["Ad fatigue detected - Consider refreshing creative"],
    createdAt: "2024-09-15T10:00:00Z",
    updatedAt: "2025-01-18T10:30:00Z"
  },
  {
    id: "7",
    name: "AI Trading Bot - Early Access",
    slug: "ai-trading-bot-beta",
    status: "live",
    audience: "crypto",
    domain: "ai-crypto-trader.io",
    path: "/early-access",
    traffic: "YouTube Ads",
    metrics: {
      views: 76540,
      clicks: 13777,
      ctr: 18.0,
      conversions: 1653,
      conversionRate: 12.0,
      revenue: 49590,
      roi: 412,
      speed: 1.1
    },
    trends: {
      views: "+28%",
      clicks: "+32%",
      ctr: "+4.5%",
      conversions: "+40%",
      revenue: "+48%"
    },
    aiSuggestions: 0,
    createdAt: "2024-12-10T10:00:00Z",
    updatedAt: "2025-01-22T16:00:00Z"
  }
];

const MOCK_STATS = {
  total: 47,
  active: 38,
  paused: 5,
  testing: 3,
  needsAttention: 1
};

// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== API FUNCTIONS ====================

export const getAllLanders = async (filters = {}) => {
  await delay(500);

  let filtered = [...MOCK_LANDERS];

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((l) => l.status === filters.status);
  }

  if (filters.audience && filters.audience !== "all") {
    filtered = filtered.filter((l) => l.audience === filters.audience);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(search) ||
        l.slug.toLowerCase().includes(search) ||
        l.domain.toLowerCase().includes(search)
    );
  }

  return {
    landers: filtered,
    stats: MOCK_STATS,
    total: filtered.length
  };
};

export const getLanderById = async (id) => {
  await delay(300);

  const lander = MOCK_LANDERS.find((l) => l.id === id);
  if (!lander) {
    throw new Error("Lander not found");
  }

  return {
    ...lander,
    analytics: {
      performanceChart: [
        { day: "Mon", views: 18200, clicks: 3276, conversions: 337 },
        { day: "Tue", views: 21100, clicks: 3798, conversions: 391 },
        { day: "Wed", views: 19800, clicks: 3564, conversions: 367 },
        { day: "Thu", views: 23400, clicks: 4212, conversions: 434 },
        { day: "Fri", views: 22900, clicks: 4122, conversions: 424 },
        { day: "Sat", views: 17200, clicks: 3096, conversions: 319 },
        { day: "Sun", views: 14240, clicks: 2563, conversions: 264 }
      ],
      devices: {
        desktop: 52,
        mobile: 43,
        tablet: 5
      },
      trafficSources: [
        { source: "Facebook Ads", views: 45, conversions: 11.2, revenue: 21200 },
        { source: "Google Ads", views: 32, conversions: 10.8, revenue: 15100 },
        { source: "Native Ads", views: 18, conversions: 8.9, revenue: 8460 },
        { source: "Direct Traffic", views: 5, conversions: 13.2, revenue: 2400 }
      ]
    },
    heatmap: {
      heroHeadline: 95,
      primaryCTA: 78,
      benefits: 65,
      midCTA: 42,
      testimonials: 23,
      footer: 18
    },
    funnel: [
      { stage: "Landing Page Views", count: 125840, percentage: 100 },
      { stage: "CTA Button Clicked", count: 22890, percentage: 18 },
      { stage: "Form Started", count: 11832, percentage: 9 },
      { stage: "Form Completed", count: 5034, percentage: 4 },
      { stage: "Payment Success", count: 2358, percentage: 2 }
    ]
  };
};

export const createLander = async (landerData) => {
  await delay(800);

  const newLander = {
    id: Date.now().toString(),
    ...landerData,
    status: "draft",
    metrics: {
      views: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      roi: 0,
      speed: 0
    },
    trends: {},
    aiSuggestions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return newLander;
};

export const updateLander = async (id, data) => {
  await delay(500);

  const lander = MOCK_LANDERS.find((l) => l.id === id);
  if (!lander) {
    throw new Error("Lander not found");
  }

  return {
    ...lander,
    ...data,
    updatedAt: new Date().toISOString()
  };
};

export const deleteLander = async (id) => {
  await delay(400);
  return { success: true };
};

export const updateLanderStatus = async (id, status) => {
  await delay(300);
  return { id, status };
};

export const duplicateLander = async (id) => {
  await delay(600);

  const lander = MOCK_LANDERS.find((l) => l.id === id);
  if (!lander) {
    throw new Error("Lander not found");
  }

  return {
    ...lander,
    id: Date.now().toString(),
    name: `${lander.name} (Copy)`,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
