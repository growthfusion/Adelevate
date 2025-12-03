// Realistic Mock Data for Lander Dashboard
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDashboardData = async (dateRange) => {
  await delay(500);

  return {
    metrics: {
      views: { value: 587420, change: 12, trend: "up" },
      clicks: { value: 94387, change: 8, trend: "up" },
      revenue: { value: 156480, change: 24, trend: "up" },
      roi: { value: 312, change: 18, trend: "up" },
      conversions: { value: 9247, change: 15, trend: "up" },
      ctr: { value: 16.1, change: 2.1, trend: "up" }
    },
    performanceChart: [
      { day: "Mon", views: 78000, clicks: 12480, conversions: 1248, revenue: 18720 },
      { day: "Tue", views: 85000, clicks: 13600, conversions: 1360, revenue: 20400 },
      { day: "Wed", views: 82000, clicks: 13120, conversions: 1312, revenue: 19680 },
      { day: "Thu", views: 91000, clicks: 14560, conversions: 1456, revenue: 21840 },
      { day: "Fri", views: 95000, clicks: 15200, conversions: 1520, revenue: 22800 },
      { day: "Sat", views: 88000, clicks: 14080, conversions: 1408, revenue: 21120 },
      { day: "Sun", views: 68420, clicks: 11347, conversions: 943, revenue: 31920 }
    ],
    systemStatus: {
      allOperational: true,
      activeLanders: 38,
      needsAttentionCount: 3,
      criticalIssues: 0
    },
    needsAttention: [
      {
        id: "1",
        name: "Real Estate Investment Webinar",
        issue: "Traffic down 25% from last week",
        cause: "Possible ad fatigue or audience saturation",
        severity: "warning",
        actions: ["Refresh Creative", "Pause Campaign", "A/B Test New Angles"]
      },
      {
        id: "2",
        name: "Weight Loss Challenge 2025",
        issue: "High bounce rate (78%) detected",
        cause: "Users leaving within 5 seconds - possible mismatch",
        severity: "warning",
        actions: ["View Heatmap", "Check Traffic Source", "Optimize Load Time"]
      },
      {
        id: "3",
        name: "Stock Market Mastery Course",
        issue: "Slow page load time (3.2s average)",
        cause: "Large images and unoptimized assets",
        severity: "critical",
        actions: ["Optimize Images", "Enable CDN", "Compress Assets"]
      }
    ]
  };
};

export const getTopPerformers = async (limit) => {
  await delay(300);

  return [
    {
      id: "7",
      rank: 1,
      name: "AI Trading Bot - Early Access",
      status: "live",
      views: 76540,
      ctr: 18.0,
      ctrTrend: "up",
      conversionRate: 12.0,
      conversionTrend: "up",
      revenue: 49590,
      revenueTrend: "up",
      roi: 412
    },
    {
      id: "1",
      rank: 2,
      name: "Bitcoin Trading Academy - Premium",
      status: "live",
      views: 125840,
      ctr: 18.2,
      ctrTrend: "up",
      conversionRate: 10.3,
      conversionTrend: "up",
      revenue: 47160,
      revenueTrend: "up",
      roi: 340
    },
    {
      id: "4",
      rank: 3,
      name: "Forex Trading Signals - VIP Access",
      status: "live",
      views: 89340,
      ctr: 16.0,
      ctrTrend: "up",
      conversionRate: 8.0,
      conversionTrend: "same",
      revenue: 34290,
      revenueTrend: "up",
      roi: 245
    },
    {
      id: "2",
      rank: 4,
      name: "Stock Market Mastery Course",
      status: "warning",
      views: 98420,
      ctr: 16.8,
      ctrTrend: "down",
      conversionRate: 9.6,
      conversionTrend: "down",
      revenue: 31740,
      revenueTrend: "down",
      roi: 285
    },
    {
      id: "5",
      rank: 5,
      name: "NFT Investment Blueprint 2025",
      status: "live",
      views: 54890,
      ctr: 16.0,
      ctrTrend: "up",
      conversionRate: 8.0,
      conversionTrend: "up",
      revenue: 21060,
      revenueTrend: "up",
      roi: 198
    }
  ].slice(0, limit);
};

export const getRecentActivity = async (limit) => {
  await delay(300);

  return [
    {
      id: "1",
      type: "deploy",
      icon: "✓",
      message: "AI Trading Bot - Early Access deployed successfully",
      time: "2 min ago",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: "2",
      type: "test",
      icon: "T",
      message: 'A/B Test "Hero CTA Button" reached statistical significance',
      time: "15 min ago",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      type: "ai",
      icon: "A",
      message: "AI generated 5 high-priority suggestions for Stock Market Mastery",
      time: "1 hour ago",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: "4",
      type: "report",
      icon: "R",
      message: "Weekly performance report: +24% revenue increase",
      time: "2 hours ago",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "5",
      type: "success",
      icon: "S",
      message: "Bitcoin Trading Academy conversion rate increased by 25%",
      time: "3 hours ago",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "6",
      type: "alert",
      icon: "!",
      message: "Real Estate Webinar showing signs of ad fatigue",
      time: "5 hours ago",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ].slice(0, limit);
};

export const getAIInsights = async () => {
  await delay(400);

  return {
    totalAnalyzed: 38,
    insights: [
      {
        id: "1",
        type: "opportunity",
        icon: "O",
        title: "Mobile users convert 22% better on crypto offers",
        recommendation: "Prioritize mobile optimization for crypto landing pages",
        impact: "high"
      },
      {
        id: "2",
        type: "optimization",
        icon: "P",
        title: "CTAs placed above fold get 3.2x more clicks",
        recommendation: "Move primary CTA buttons higher on all landers",
        impact: "high"
      },
      {
        id: "3",
        type: "insight",
        icon: "I",
        title: "Video testimonials increase trust signals by 45%",
        recommendation: "Add video testimonials to high-traffic landers",
        impact: "medium"
      },
      {
        id: "4",
        type: "trend",
        icon: "T",
        title: "Urgency timers boost conversions by 18% on average",
        recommendation: "Implement countdown timers on finance offers",
        impact: "medium"
      }
    ]
  };
};
