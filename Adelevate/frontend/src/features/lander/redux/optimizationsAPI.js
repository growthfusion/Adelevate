const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getSuggestions = async (filters = {}) => {
  await delay(500);

  const suggestions = [
    {
      id: "1",
      landerId: "1",
      landerName: "Bitcoin Trading Academy - Premium",
      priority: "high",
      status: "pending",
      category: "mobile",
      title: "Optimize Mobile User Experience",
      description:
        "Mobile conversion rate is 22% lower than desktop. Heatmap analysis shows users struggling with button sizes and form fields on mobile devices. Mobile represents 43% of your traffic.",
      impact: {
        revenueIncrease: 3200,
        period: "week",
        conversionIncrease: 22
      },
      difficulty: "medium",
      estimatedTime: "3-4 hours",
      changes: [
        "Increase CTA button size from 48px to 64px height",
        "Reduce hero section height on mobile from 100vh to 70vh",
        "Optimize form fields for mobile keyboard input",
        "Implement single-column layout (remove side-by-side elements)",
        "Add touch-friendly spacing between clickable elements"
      ],
      expectedResults: {
        mobileConvRate: { from: 8.2, to: 10.8, change: 22 },
        additionalConversions: 168,
        additionalRevenue: 3360,
        roiIncrease: { from: 340, to: 398, change: 17 }
      },
      generatedAt: "2025-01-22T10:00:00Z"
    },
    {
      id: "2",
      landerId: "1",
      landerName: "Bitcoin Trading Academy - Premium",
      priority: "high",
      status: "pending",
      category: "cta",
      title: "Add Sticky CTA Button on Scroll",
      description:
        "85% of clicks occur above the fold. Adding a sticky CTA that appears after users scroll past the hero section could capture more intent signals and increase conversions.",
      impact: {
        revenueIncrease: 2400,
        period: "week",
        conversionIncrease: 15
      },
      difficulty: "easy",
      estimatedTime: "45 min",
      changes: [
        "Add sticky floating CTA bar that appears on scroll",
        "Position: fixed to bottom on mobile, top-right on desktop",
        "Include close/minimize option to avoid annoyance",
        "Track scroll depth before showing (wait until 30% scroll)"
      ],
      expectedResults: {
        ctr: { from: 18.2, to: 20.9, change: 15 },
        additionalConversions: 125,
        additionalRevenue: 2500
      },
      generatedAt: "2025-01-22T10:00:00Z"
    },
    {
      id: "3",
      landerId: "2",
      landerName: "Stock Market Mastery Course",
      priority: "high",
      status: "pending",
      category: "speed",
      title: "Reduce Page Load Time Critical Issue",
      description:
        "Current load time of 3.2s is causing 28% bounce rate. Google reports that 53% of mobile users abandon pages that take over 3 seconds to load. Competitors average 1.8s.",
      impact: {
        revenueIncrease: 1800,
        period: "week",
        conversionIncrease: 12
      },
      difficulty: "medium",
      estimatedTime: "4-6 hours",
      changes: [
        "Compress hero image from 1.2MB to 280KB (WebP format)",
        "Implement lazy loading for all below-fold images",
        "Defer non-critical JavaScript loading",
        "Enable browser caching (7-day expiry)",
        "Minify CSS and JavaScript bundles",
        "Optimize font loading (use font-display: swap)"
      ],
      expectedResults: {
        loadTime: { from: 3.2, to: 1.6, change: -50 },
        bounceRate: { from: 28, to: 18, change: -35 },
        conversionRate: { from: 9.6, to: 10.8, change: 12 }
      },
      generatedAt: "2025-01-21T14:00:00Z"
    },
    {
      id: "4",
      landerId: "4",
      landerName: "Forex Trading Signals - VIP Access",
      priority: "medium",
      status: "pending",
      category: "trust",
      title: "Add Social Proof Elements",
      description:
        "Pages with testimonials and trust badges convert 34% better. Currently missing prominent social proof above the fold, which is critical for financial offers.",
      impact: {
        revenueIncrease: 1600,
        period: "week",
        conversionIncrease: 10
      },
      difficulty: "easy",
      estimatedTime: "2 hours",
      changes: [
        "Add rotating customer testimonials above fold",
        "Display real-time user counter (e.g., '247 traders active now')",
        "Add trust badges (SSL, verified payments, etc.)",
        "Include win rate statistics prominently",
        "Add member count milestone (e.g., 'Join 50,000+ traders')"
      ],
      expectedResults: {
        trustScore: { from: 65, to: 82, change: 26 },
        conversionRate: { from: 8.0, to: 8.8, change: 10 },
        additionalRevenue: 3200
      },
      generatedAt: "2025-01-21T11:30:00Z"
    },
    {
      id: "5",
      landerId: "3",
      landerName: "Weight Loss Challenge 2025",
      priority: "medium",
      status: "pending",
      category: "content",
      title: "Add Before/After Transformation Gallery",
      description:
        "Health and fitness landers with visual transformations convert 28% better. Currently relying too heavily on text-based testimonials.",
      impact: {
        revenueIncrease: 1200,
        period: "week",
        conversionIncrease: 8
      },
      difficulty: "easy",
      estimatedTime: "1.5 hours",
      changes: [
        "Create before/after image slider (6-8 transformations)",
        "Add user names and timeline to images",
        "Include weight loss numbers prominently",
        "Link to full success stories page"
      ],
      expectedResults: {
        timeOnPage: { from: "2m 12s", to: "3m 45s", change: 42 },
        engagementRate: { from: 34, to: 48, change: 41 }
      },
      generatedAt: "2025-01-20T16:20:00Z"
    },
    {
      id: "6",
      landerId: "5",
      landerName: "NFT Investment Blueprint 2025",
      priority: "low",
      status: "pending",
      category: "urgency",
      title: "Implement Countdown Timer for Limited Offer",
      description:
        "Urgency elements increase conversions by 18% on average. Consider adding a countdown timer for your early bird pricing.",
      impact: {
        revenueIncrease: 900,
        period: "week",
        conversionIncrease: 6
      },
      difficulty: "easy",
      estimatedTime: "1 hour",
      changes: [
        "Add 48-hour countdown timer to hero section",
        "Display 'Early bird pricing ends in...' messaging",
        "Show limited spots remaining counter",
        "Implement session-based urgency (e.g., 'Your spot reserved for 15 min')"
      ],
      expectedResults: {
        urgencyEngagement: { from: 0, to: 45, change: 100 },
        conversionRate: { from: 8.0, to: 8.5, change: 6 }
      },
      generatedAt: "2025-01-19T13:00:00Z"
    }
  ];

  let filtered = [...suggestions];

  if (filters.priority && filters.priority !== "all") {
    filtered = filtered.filter((s) => s.priority === filters.priority);
  }

  if (filters.landerId) {
    filtered = filtered.filter((s) => s.landerId === filters.landerId);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  return {
    suggestions: filtered,
    stats: {
      total: suggestions.length,
      highPriority: suggestions.filter((s) => s.priority === "high").length,
      mediumPriority: suggestions.filter((s) => s.priority === "medium").length,
      lowPriority: suggestions.filter((s) => s.priority === "low").length,
      implemented: 0,
      dismissed: 0
    },
    nextAnalysis: "Monday, Jan 29 at 10:00 AM"
  };
};

export const implementSuggestion = async (id) => {
  await delay(800);
  return { id, status: "implemented", implementedAt: new Date().toISOString() };
};

export const dismissSuggestion = async (id) => {
  await delay(300);
  return { success: true };
};

export const scheduleSuggestion = async (id, date) => {
  await delay(300);
  return { id, status: "scheduled", scheduledDate: date };
};
