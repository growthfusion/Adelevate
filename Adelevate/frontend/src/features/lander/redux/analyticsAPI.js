const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAnalytics = async (landerId, dateRange) => {
  await delay(500);

  return {
    metrics: {
      views: { value: 1200000, change: 18 },
      uniqueVisitors: { value: 1100000, change: 16 },
      clicks: { value: 187000, change: 12 },
      ctr: { value: 15.6, change: 2.1 },
      conversions: { value: 18400, change: 24 },
      conversionRate: { value: 9.8, change: 3.2 },
      revenue: { value: 284000, change: 42 },
      roi: { value: 285, change: 28 }
    },
    trendsChart: [
      { week: "Week 1", views: 250000, clicks: 38000, conversions: 3800, revenue: 55000 },
      { week: "Week 2", views: 280000, clicks: 42000, conversions: 4200, revenue: 62000 },
      { week: "Week 3", views: 310000, clicks: 48000, conversions: 4800, revenue: 72000 },
      { week: "Week 4", views: 360000, clicks: 59000, conversions: 5600, revenue: 95000 }
    ],
    trafficSources: [
      { source: "Facebook Ads", views: 52, conversions: 11.2, revenue: 148000 },
      { source: "Google Ads", views: 28, conversions: 10.8, revenue: 79000 },
      { source: "Native Ads", views: 15, conversions: 8.9, revenue: 42000 },
      { source: "Direct", views: 5, conversions: 13.2, revenue: 15000 }
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 52, conversions: 10.2 },
      { device: "Mobile", percentage: 43, conversions: 9.1 },
      { device: "Tablet", percentage: 5, conversions: 8.5 }
    ],
    countryBreakdown: [
      { country: "USA", flag: "🇺🇸", code: "US", views: 456000, revenue: 128000, percentage: 45 },
      {
        country: "United Kingdom",
        flag: "🇬🇧",
        code: "UK",
        views: 218000,
        revenue: 51000,
        percentage: 18
      },
      { country: "Canada", flag: "🇨🇦", code: "CA", views: 145000, revenue: 34000, percentage: 12 },
      { country: "Australia", flag: "🇦🇺", code: "AU", views: 98000, revenue: 28000, percentage: 8 },
      { country: "Germany", flag: "🇩🇪", code: "DE", views: 72000, revenue: 18000, percentage: 6 }
    ],
    funnel: [
      { stage: "Page Views", count: 1200000, percentage: 100, dropoff: 0 },
      { stage: "CTA Clicked", count: 187000, percentage: 15.6, dropoff: 84.4 },
      { stage: "Form Started", count: 84000, percentage: 7, dropoff: 55.1 },
      { stage: "Form Completed", count: 28000, percentage: 2.3, dropoff: 66.7 },
      { stage: "Conversion", count: 18400, percentage: 1.5, dropoff: 34.3 }
    ]
  };
};

export const getRealtimeData = async () => {
  await delay(200);

  return {
    activeUsers: 1247,
    clicksLast30Min: 189,
    conversionsLast30Min: 23,
    topActiveLanders: [
      { id: "1", name: "Crypto-US-v3", activeUsers: 234 },
      { id: "2", name: "Finance-EU-v2", activeUsers: 189 },
      { id: "3", name: "Health-US-v1", activeUsers: 145 }
    ]
  };
};
