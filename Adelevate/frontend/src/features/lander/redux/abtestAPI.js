const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllTests = async (filters = {}) => {
  await delay(500);

  const tests = [
    {
      id: "1",
      name: "Hero CTA Button Color & Text",
      landerId: "1",
      landerName: "Bitcoin Trading Academy - Premium",
      status: "active",
      type: "cta",
      startDate: "Jan 15, 2025",
      estimatedEnd: "Jan 29, 2025",
      progress: 78,
      targetConversions: 1000,
      currentConversions: 780,
      control: {
        id: "ctrl-1",
        name: "Control",
        value: "Start Learning Today",
        views: 18420,
        clicks: 2947,
        ctr: 16.0,
        conversions: 421,
        conversionRate: 14.3,
        revenue: 8420
      },
      variant: {
        id: "var-1",
        name: "Variant",
        value: "Get Instant Access Now",
        views: 18380,
        clicks: 3468,
        ctr: 18.9,
        conversions: 489,
        conversionRate: 16.1,
        revenue: 9780
      },
      stats: {
        confidenceLevel: 96,
        pValue: 0.018,
        effectSize: 16.2,
        isSignificant: true,
        winner: "variant",
        projectedAnnualIncrease: 81600
      }
    },
    {
      id: "2",
      name: "Above-Fold Headline Comparison",
      landerId: "2",
      landerName: "Stock Market Mastery Course",
      status: "completed",
      type: "headline",
      startDate: "Dec 28, 2024",
      endDate: "Jan 12, 2025",
      progress: 100,
      targetConversions: 800,
      currentConversions: 814,
      control: {
        id: "ctrl-2",
        name: "Control",
        value: "Learn Stock Trading From Experts",
        views: 24620,
        clicks: 3201,
        ctr: 13.0,
        conversions: 412,
        conversionRate: 12.9,
        revenue: 8240
      },
      variant: {
        id: "var-2",
        name: "Variant",
        value: "Master the Stock Market in 30 Days",
        views: 24580,
        clicks: 3834,
        ctr: 15.6,
        conversions: 488,
        conversionRate: 15.4,
        revenue: 9760
      },
      stats: {
        confidenceLevel: 98,
        pValue: 0.008,
        effectSize: 19.4,
        isSignificant: true,
        winner: "variant",
        appliedDate: "Jan 13, 2025"
      }
    },
    {
      id: "3",
      name: "Trust Badge Placement Test",
      landerId: "4",
      landerName: "Forex Trading Signals - VIP Access",
      status: "active",
      type: "design",
      startDate: "Jan 20, 2025",
      estimatedEnd: "Feb 3, 2025",
      progress: 42,
      targetConversions: 600,
      currentConversions: 252,
      control: {
        id: "ctrl-3",
        name: "Control",
        value: "Badges in Footer",
        views: 12840,
        clicks: 2055,
        ctr: 16.0,
        conversions: 128,
        conversionRate: 6.2,
        revenue: 3840
      },
      variant: {
        id: "var-3",
        name: "Variant",
        value: "Badges Below Hero",
        views: 12920,
        clicks: 2197,
        ctr: 17.0,
        conversions: 124,
        conversionRate: 5.6,
        revenue: 3720
      },
      stats: {
        confidenceLevel: 52,
        pValue: 0.28,
        effectSize: 3.1,
        isSignificant: false,
        winner: null
      }
    },
    {
      id: "4",
      name: "Video vs Static Hero Section",
      landerId: "3",
      landerName: "Weight Loss Challenge 2025",
      status: "scheduled",
      type: "media",
      startDate: "Jan 28, 2025",
      estimatedEnd: "Feb 11, 2025",
      progress: 0,
      targetConversions: 500,
      currentConversions: 0,
      control: {
        id: "ctrl-4",
        name: "Control",
        value: "Static Image Hero",
        views: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0
      },
      variant: {
        id: "var-4",
        name: "Variant",
        value: "Auto-play Video Hero",
        views: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0
      },
      stats: {
        confidenceLevel: 0,
        pValue: 1.0,
        effectSize: 0,
        isSignificant: false,
        winner: null
      }
    }
  ];

  let filteredTests = [...tests];

  if (filters.status && filters.status !== "all") {
    filteredTests = filteredTests.filter((t) => t.status === filters.status);
  }

  return {
    tests: filteredTests,
    stats: {
      total: tests.length,
      active: tests.filter((t) => t.status === "active").length,
      completed: tests.filter((t) => t.status === "completed").length,
      scheduled: tests.filter((t) => t.status === "scheduled").length
    }
  };
};

export const getTestById = async (id) => {
  await delay(300);
  const { tests } = await getAllTests();
  return tests.find((t) => t.id === id);
};

export const createTest = async (testData) => {
  await delay(500);
  return {
    id: Date.now().toString(),
    ...testData,
    status: "active",
    progress: 0,
    currentConversions: 0,
    startDate: new Date().toISOString()
  };
};

export const updateTest = async (id, data) => {
  await delay(300);
  return { id, ...data };
};

export const endTest = async (id, winnerId) => {
  await delay(400);
  return {
    id,
    status: "completed",
    winner: winnerId,
    endDate: new Date().toISOString()
  };
};

export const deleteTest = async (id) => {
  await delay(300);
  return { success: true };
};
