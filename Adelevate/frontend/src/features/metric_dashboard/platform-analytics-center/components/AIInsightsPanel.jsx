import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const AIInsightsPanel = ({ isCollapsed, onToggleCollapse }) => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const insightTypes = {
    optimization: { symbol: '⚡', color: 'text-warning bg-warning/10' },
    anomaly: { symbol: '⚠️', color: 'text-error bg-error/10' },
    opportunity: { symbol: '📈', color: 'text-success bg-success/10' },
    recommendation: { symbol: '💡', color: 'text-primary bg-primary/10' },
    alert: { symbol: '🔔', color: 'text-destructive bg-destructive/10' }
  };

  const mockInsights = [
    {
      id: 1,
      type: 'optimization',
      title: 'Budget Reallocation Opportunity',
      description: `Google Ads campaigns are showing 23% higher ROI than Meta Ads. Consider reallocating $2,400 from underperforming Meta campaigns to high-performing Google Search campaigns.`,
      confidence: 92,
      impact: 'High',
      timeframe: '7-14 days',
      metrics: {
        expectedROIIncrease: '+18.5%',
        projectedRevenue: '+$4,320',
        riskLevel: 'Low'
      },
      actionItems: [
        'Pause 3 underperforming Meta campaigns with ROI < 150%',
        'Increase budget for "Holiday Sale - Search" campaign by $800/day',
        'Monitor performance for 7 days and adjust accordingly'
      ],
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Unusual CPA Spike Detected',
      description: `TikTok Ads CPA increased by 45% in the last 48 hours. This deviation is 2.3 standard deviations above normal patterns and requires immediate attention.`,
      confidence: 87,
      impact: 'Medium',
      timeframe: 'Immediate',
      metrics: {
        currentCPA: '$52.30',
        normalCPA: '$36.20',
        affectedCampaigns: '4 campaigns'
      },
      actionItems: [
        'Review audience targeting for affected campaigns',
        'Check for increased competition or market changes',
        'Consider pausing campaigns until CPA normalizes'
      ],
      timestamp: new Date(Date.now() - 900000) // 15 minutes ago
    },
    {
      id: 3,
      type: 'opportunity',
      title: 'Scaling Opportunity Identified',
      description: `Microsoft Ads "B2B Lead Gen" campaign has maintained consistent 280% ROI with low impression share. Opportunity to scale budget by 150% with minimal risk.`,
      confidence: 94,
      impact: 'High',
      timeframe: '3-5 days',
      metrics: {
        currentImpressionShare: '34%',
        scalingPotential: '+150%',
        projectedROI: '265-295%'
      },
      actionItems: [
        'Increase daily budget from $200 to $500',
        'Expand keyword targeting to related high-intent terms',
        'Monitor impression share and adjust bids accordingly'
      ],
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 4,
      type: 'recommendation',
      title: 'Cross-Platform Audience Insights',
      description: `LinkedIn Ads audience segment "Marketing Directors 35-45" shows 340% ROI. Similar audience available on Meta Ads with 67% lower CPA potential.`,
      confidence: 89,
      impact: 'Medium',
      timeframe: '5-7 days',
      metrics: {
        linkedinROI: '340%',
        metaCPAPotential: '-67%',
        audienceSize: '2.3M users'
      },
      actionItems: [
        'Create lookalike audience on Meta based on LinkedIn converters',
        'Test similar messaging and creative approach',
        'Start with $100/day budget and scale based on performance'
      ],
      timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    },
    {
      id: 5,
      type: 'alert',
      title: 'Budget Depletion Warning',
      description: `Snapchat Ads account will exhaust monthly budget in 3 days at current spend rate. Consider budget adjustment or campaign optimization to extend reach.`,
      confidence: 96,
      impact: 'Medium',
      timeframe: '2-3 days',
      metrics: {
        remainingBudget: '$1,240',
        dailySpendRate: '$420',
        daysRemaining: '2.95 days'
      },
      actionItems: [
        'Reduce daily budgets by 25% across all campaigns',
        'Pause lowest-performing ad sets',
        'Request budget increase if performance justifies it'
      ],
      timestamp: new Date(Date.now() - 10800000) // 3 hours ago
    }
  ];

  useEffect(() => {
    // Simulate loading insights
    setIsLoading(true);
    setTimeout(() => {
      setInsights(mockInsights);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 75) return 'text-primary';
    if (confidence >= 60) return 'text-warning';
    return 'text-error';
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleRefreshInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate new insights with slight variations
      const refreshedInsights = mockInsights?.map(insight => ({
        ...insight,
        confidence: Math.max(60, insight?.confidence + (Math.random() - 0.5) * 10),
        timestamp: new Date(Date.now() - Math.random() * 7200000)
      }));
      setInsights(refreshedInsights);
      setIsLoading(false);
    }, 1000);
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          variant="default"
          size="sm"
          onClick={onToggleCollapse}
          className="rounded-l-lg rounded-r-none shadow-lg"
        >
          ◀ AI Insights
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-card border-l border-border shadow-lg z-30 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-primary">🧠</span>
            <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshInsights}
              loading={isLoading}
            >
              {isLoading ? "Loading..." : "↻"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
            >
              ▶
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered recommendations and anomaly detection
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin">⏳</div>
              <span className="text-sm">Analyzing data...</span>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {insights?.map((insight) => {
              const typeConfig = insightTypes?.[insight?.type];
              return (
                <div
                  key={insight?.id}
                  className={`
                    border border-border rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${selectedInsight?.id === insight?.id 
                      ? 'ring-2 ring-primary bg-primary/5' :'hover:bg-muted/30'
                    }
                  `}
                  onClick={() => setSelectedInsight(selectedInsight?.id === insight?.id ? null : insight)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig?.color}`}>
                      <span>{typeConfig?.symbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {insight?.title}
                        </h4>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTimeAgo(insight?.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {insight?.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getImpactColor(insight?.impact)}`}>
                            {insight?.impact} Impact
                          </span>
                          <span className={`text-xs font-medium ${getConfidenceColor(insight?.confidence)}`}>
                            {insight?.confidence}% confidence
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {selectedInsight?.id === insight?.id ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedInsight?.id === insight?.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-foreground mb-2">Key Metrics</h5>
                        <div className="space-y-1">
                          {Object.entries(insight?.metrics)?.map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-muted-foreground capitalize">
                                {key?.replace(/([A-Z])/g, ' $1')?.trim()}:
                              </span>
                              <span className="font-mono text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-foreground mb-2">Recommended Actions</h5>
                        <ul className="space-y-1">
                          {insight?.actionItems?.map((action, index) => (
                            <li key={index} className="flex items-start space-x-2 text-xs">
                              <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                              <span className="text-muted-foreground">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Expected timeframe: {insight?.timeframe}
                        </span>
                        <Button variant="outline" size="sm" className="text-xs">
                          Implement
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{insights?.length} insights available</span>
          <span>Updated {formatTimeAgo(new Date(Date.now() - 300000))}</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
