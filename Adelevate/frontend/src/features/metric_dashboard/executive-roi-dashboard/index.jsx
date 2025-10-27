import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/ui/Header';
import ExecutiveKPICard from './components/ExecutiveKPICard';
import RevenueSpendChart from './components/RevenueSpendChart';
import PlatformComparisonMatrix from './components/PlatformComparisonMatrix';
import ExecutiveInsightsPanel from './components/ExecutiveInsightsPanel';
import ExecutiveControlPanel from './components/ExecutiveControlPanel';

const ExecutiveROIDashboard = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [platformView, setPlatformView] = useState('consolidated');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock executive KPI data
  const executiveKPIs = [
    {
      title: "Total Advertising Spend",
      value: "$2.4M",
      change: "+12.5%",
      changeType: "positive",
      icon: "CreditCard",
      color: "primary",
      subtitle: "Across all platforms",
      trend: [85, 92, 78, 95, 88, 94, 100, 96, 89, 93, 97, 91]
    },
    {
      title: "Revenue Generated",
      value: "$8.7M",
      change: "+18.3%",
      changeType: "positive",
      icon: "TrendingUp",
      color: "success",
      subtitle: "Total attributed revenue",
      trend: [70, 75, 82, 88, 85, 92, 89, 95, 98, 94, 100, 97]
    },
    {
      title: "Overall ROI",
      value: "362%",
      change: "+5.8%",
      changeType: "positive",
      icon: "Target",
      color: "warning",
      subtitle: "Return on investment",
      trend: [88, 85, 90, 87, 92, 89, 94, 91, 96, 93, 98, 100]
    },
    {
      title: "Net Profit Margin",
      value: "$6.3M",
      change: "+22.1%",
      changeType: "positive",
      icon: "PiggyBank",
      color: "info",
      subtitle: "After advertising costs",
      trend: [65, 70, 68, 75, 72, 78, 82, 85, 88, 92, 95, 100]
    }
  ];

  // Mock revenue and spend trend data
  const revenueSpendData = [
    { date: "2024-09-15", revenue: 285000, spend: 78000 },
    { date: "2024-09-16", revenue: 312000, spend: 82000 },
    { date: "2024-09-17", revenue: 298000, spend: 79000 },
    { date: "2024-09-18", revenue: 334000, spend: 85000 },
    { date: "2024-09-19", revenue: 356000, spend: 88000 },
    { date: "2024-09-20", revenue: 289000, spend: 76000 },
    { date: "2024-09-21", revenue: 267000, spend: 71000 },
    { date: "2024-09-22", revenue: 378000, spend: 92000 },
    { date: "2024-09-23", revenue: 345000, spend: 87000 },
    { date: "2024-09-24", revenue: 398000, spend: 95000 },
    { date: "2024-09-25", revenue: 412000, spend: 98000 },
    { date: "2024-09-26", revenue: 387000, spend: 89000 },
    { date: "2024-09-27", revenue: 423000, spend: 102000 },
    { date: "2024-09-28", revenue: 445000, spend: 108000 },
    { date: "2024-09-29", revenue: 398000, spend: 94000 },
    { date: "2024-09-30", revenue: 456000, spend: 112000 },
    { date: "2024-10-01", revenue: 478000, spend: 118000 },
    { date: "2024-10-02", revenue: 434000, spend: 105000 },
    { date: "2024-10-03", revenue: 467000, spend: 115000 },
    { date: "2024-10-04", revenue: 489000, spend: 121000 },
    { date: "2024-10-05", revenue: 512000, spend: 125000 },
    { date: "2024-10-06", revenue: 498000, spend: 119000 },
    { date: "2024-10-07", revenue: 523000, spend: 128000 },
    { date: "2024-10-08", revenue: 545000, spend: 134000 },
    { date: "2024-10-09", revenue: 567000, spend: 138000 },
    { date: "2024-10-10", revenue: 589000, spend: 142000 },
    { date: "2024-10-11", revenue: 612000, spend: 148000 },
    { date: "2024-10-12", revenue: 598000, spend: 145000 },
    { date: "2024-10-13", revenue: 634000, spend: 152000 },
    { date: "2024-10-14", revenue: 656000, spend: 158000 }
  ];

  // Mock platform comparison data
  const platformData = [
    {
      id: 'google-ads',
      name: 'Google Ads',
      icon: 'Search',
      color: 'bg-blue-500',
      revenue: 3200000,
      spend: 890000,
      roi: 359.6,
      conversions: 12450,
      campaigns: 24,
      performanceScore: 92
    },
    {
      id: 'facebook-ads',
      name: 'Meta Ads',
      icon: 'Users',
      color: 'bg-blue-600',
      revenue: 2800000,
      spend: 750000,
      roi: 373.3,
      conversions: 9870,
      campaigns: 18,
      performanceScore: 88
    },
    {
      id: 'tiktok-ads',
      name: 'TikTok Ads',
      icon: 'Video',
      color: 'bg-black',
      revenue: 1900000,
      spend: 520000,
      roi: 365.4,
      conversions: 7650,
      campaigns: 12,
      performanceScore: 85
    },
    {
      id: 'snapchat-ads',
      name: 'Snapchat Ads',
      icon: 'Camera',
      color: 'bg-yellow-400',
      revenue: 800000,
      spend: 240000,
      roi: 333.3,
      conversions: 3200,
      campaigns: 8,
      performanceScore: 78
    }
  ];

  // Mock AI insights data
  const aiInsights = {
    opportunities: [
      {
        title: "Scale High-Performing TikTok Campaigns",
        description: "TikTok campaigns show 15% higher conversion rates than platform average. Increasing budget by 25% could generate additional $180K revenue.",
        priority: "high",
        impact: "high",
        icon: "TrendingUp",
        metrics: [
          { label: "Potential Revenue", value: "+$180K" },
          { label: "ROI Increase", value: "+15%" }
        ],
        action: "Increase Budget"
      },
      {
        title: "Optimize Google Ads Audience Targeting",
        description: "Lookalike audiences show 22% better performance. Expanding to similar segments could improve overall campaign efficiency.",
        priority: "medium",
        impact: "medium",
        icon: "Target",
        metrics: [
          { label: "CPA Reduction", value: "-22%" },
          { label: "Reach Increase", value: "+35%" }
        ],
        action: "Expand Targeting"
      }
    ],
    risks: [
      {
        title: "Snapchat Campaign Fatigue Detected",
        description: "Creative performance declining 8% week-over-week. Audience fatigue may impact conversion rates if not addressed.",
        priority: "medium",
        impact: "medium",
        icon: "AlertTriangle",
        metrics: [
          { label: "Performance Drop", value: "-8%" },
          { label: "Frequency", value: "4.2x" }
        ],
        action: "Refresh Creatives"
      },
      {
        title: "Budget Concentration Risk",
        description: "65% of spend concentrated on Google Ads. Platform diversification recommended to reduce dependency risk.",
        priority: "low",
        impact: "medium",
        icon: "AlertCircle",
        metrics: [
          { label: "Concentration", value: "65%" },
          { label: "Risk Score", value: "Medium" }
        ],
        action: "Diversify Spend"
      }
    ],
    recommendations: [
      {
        title: "Implement Cross-Platform Attribution",
        description: "Enhanced attribution modeling could reveal 12-18% more accurate ROI calculations and optimize budget allocation.",
        priority: "high",
        impact: "high",
        icon: "BarChart3",
        metrics: [
          { label: "Accuracy Gain", value: "+15%" },
          { label: "Budget Efficiency", value: "+12%" }
        ],
        action: "Setup Attribution"
      },
      {
        title: "Launch Seasonal Campaign Strategy",
        description: "Q4 seasonal trends indicate 28% revenue opportunity. Early campaign preparation recommended for maximum impact.",
        priority: "medium",
        impact: "high",
        icon: "Calendar",
        metrics: [
          { label: "Revenue Opportunity", value: "+28%" },
          { label: "Preparation Time", value: "3 weeks" }
        ],
        action: "Plan Q4 Strategy"
      }
    ]
  };

  const handleDateRangeChange = (newRange) => {
    setIsLoading(true);
    setDateRange(newRange);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handlePlatformToggle = (view) => {
    setPlatformView(view);
  };

  const handleComparisonToggle = (mode) => {
    setComparisonMode(mode);
  };

  const handleExport = (format) => {
    console.log(`Exporting executive report in ${format} format`);
    // Implement export functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Executive ROI Dashboard - AdSage Analytics</title>
        <meta name="description" content="Strategic advertising performance overview and budget allocation guidance for Marketing Directors and senior stakeholders." />
      </Helmet>
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Executive ROI Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Strategic insights and performance overview for executive decision-making
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span>Live data • Updated 2 minutes ago</span>
              </div>
            </div>
          </div>

          {/* Executive Control Panel */}
          <ExecutiveControlPanel
            onDateRangeChange={handleDateRangeChange}
            onPlatformToggle={handlePlatformToggle}
            onComparisonToggle={handleComparisonToggle}
            onExport={handleExport}
            className="mb-8"
          />

          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {executiveKPIs?.map((kpi, index) => (
              <ExecutiveKPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                change={kpi?.change}
                changeType={kpi?.changeType}
                icon={kpi?.icon}
                color={kpi?.color}
                subtitle={kpi?.subtitle}
                trend={kpi?.trend}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            
            {/* Revenue & Spend Chart - Takes 2 columns */}
            <div className="xl:col-span-2">
              <RevenueSpendChart 
                data={revenueSpendData}
                className="h-full"
              />
            </div>

            {/* AI Insights Panel - Takes 1 column */}
            <div className="xl:col-span-1">
              <ExecutiveInsightsPanel 
                insights={aiInsights}
                className="h-full"
              />
            </div>
          </div>

          {/* Platform Comparison Matrix */}
          <PlatformComparisonMatrix 
            platforms={platformData}
            className="mb-8"
          />

          {/* Footer Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  362%
                </div>
                <div className="text-sm text-muted-foreground">
                  Average ROI Across Platforms
                </div>
                <div className="text-xs text-success mt-1">
                  +5.8% vs last period
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  4
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Advertising Platforms
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  All systems operational
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  87%
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Performance Score
                </div>
                <div className="text-xs text-success mt-1">
                  +3% improvement
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExecutiveROIDashboard;