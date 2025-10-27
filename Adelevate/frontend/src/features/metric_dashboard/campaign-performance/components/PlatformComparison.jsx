import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Button } from '@/components/ui/Button';
import { generatePlatformComparison } from '@/utils/aiInsights';

// Dummy implementation for getPlatformColors function
const getPlatformColors = (platform) => {
  const colors = {
    'all': {
      gradient: 'from-blue-500 to-blue-600',
      background: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'text-blue-500'
    },
    'google-ads': {
      gradient: 'from-blue-500 to-blue-600',
      background: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'text-blue-500'
    },
    'facebook': {
      gradient: 'from-indigo-500 to-indigo-600',
      background: 'bg-indigo-50',
      border: 'border-indigo-200',
      accent: 'text-indigo-500'
    },
    'tiktok': {
      gradient: 'from-black to-gray-800',
      background: 'bg-gray-100',
      border: 'border-gray-300',
      accent: 'text-gray-800'
    },
    'snapchat': {
      gradient: 'from-yellow-400 to-yellow-500',
      background: 'bg-yellow-50',
      border: 'border-yellow-200',
      accent: 'text-yellow-500'
    }
  };
  
  return colors[platform] || colors['all'];
};

// Dummy implementation for getPlatformIcon function
const getPlatformIcon = (platform) => {
  // This would normally return an icon name based on the platform
  // We'll just return a placeholder since we're not using icons
  return platform;
};

const PlatformComparison = ({ metricsData = [], chartData = [], className = '' }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, ai-analysis
  const [selectedMetric, setSelectedMetric] = useState('roi');

  useEffect(() => {
    generateComparisonData();
  }, [metricsData]);

  const generateComparisonData = async () => {
    setIsLoading(true);
    try {
      // Process platform data for comparison
      const platforms = ['google-ads', 'facebook', 'tiktok', 'snapchat'];
      const processedData = platforms?.map(platform => {
        const spend = metricsData?.find(m => m?.title === 'Amount Spent')?.platformBreakdown?.[platform] || 0;
        const revenue = metricsData?.find(m => m?.title === 'Revenue')?.platformBreakdown?.[platform] || 0;
        const conversions = metricsData?.find(m => m?.title === 'Conversions')?.platformBreakdown?.[platform] || 0;
        const clicks = metricsData?.find(m => m?.title === 'Clicks')?.platformBreakdown?.[platform] || 0;
        const cpa = metricsData?.find(m => m?.title === 'CPA')?.platformBreakdown?.[platform] || 0;
        const roi = spend > 0 ? (revenue - spend) / spend : 0;

        return {
          platform,
          name: platform?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
          spend,
          revenue,
          roi: roi * 100,
          conversions,
          clicks,
          cpa,
          ctr: clicks > 0 ? (conversions / clicks) * 100 : 0,
          profitMargin: revenue > 0 ? ((revenue - spend) / revenue) * 100 : 0,
          costEfficiency: spend > 0 ? revenue / spend : 0,
          score: Math.min(100, Math.max(0, (roi * 30) + (conversions / 100) + ((clicks / 10000) * 10)))
        };
      });

      setComparisonData(processedData);
    } catch (error) {
      console.error('Error generating comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricData = () => {
    return comparisonData?.map(platform => ({
      ...platform,
      value: platform?.[selectedMetric] || 0
    }));
  };

  const getRadarData = () => {
    return comparisonData?.map(platform => ({
      platform: platform?.name,
      ROI: Math.min(100, platform?.roi * 2),
      'Conversion Rate': platform?.ctr * 20,
      'Cost Efficiency': Math.min(100, platform?.costEfficiency * 25),
      'Volume': Math.min(100, platform?.conversions / 50),
      'Profit Margin': Math.max(0, platform?.profitMargin)
    }));
  };

  const metricOptions = [
    { value: 'roi', label: 'ROI %', format: 'percentage' },
    { value: 'revenue', label: 'Revenue', format: 'currency' },
    { value: 'conversions', label: 'Conversions', format: 'number' },
    { value: 'cpa', label: 'CPA', format: 'currency' },
    { value: 'ctr', label: 'CTR %', format: 'percentage' },
    { value: 'score', label: 'Overall Score', format: 'number' }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return `$${value?.toLocaleString()}`;
      case 'percentage':
        return `${value?.toFixed(1)}%`;
      default:
        return value?.toLocaleString();
    }
  };

  const getTopPerformer = () => {
    const metric = selectedMetric;
    return comparisonData?.reduce((best, current) => 
      (current?.[metric] || 0) > (best?.[metric] || 0) ? current : best
    , comparisonData?.[0] || {});
  };

  const topPerformer = getTopPerformer();
  const selectedMetricConfig = metricOptions?.find(m => m?.value === selectedMetric);

  return (
    <div className={`bg-card border border-border rounded-2xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
            <div>
              <h3 className="text-lg font-semibold text-foreground">Platform Comparison</h3>
              <p className="text-sm text-muted-foreground">Cross-platform performance analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              {['overview', 'detailed']?.map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="text-xs h-7 px-3"
                >
                  {mode?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase())}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Metric Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">Compare by:</span>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e?.target?.value)}
                  className="px-3 py-1 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {metricOptions?.map(option => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {topPerformer && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Top Performer:</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-bold ${getPlatformColors(topPerformer?.platform)?.accent}`}>
                      {topPerformer?.platform?.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-foreground">{topPerformer?.name}</span>
                    <span className="text-success">
                      {formatValue(topPerformer?.[selectedMetric], selectedMetricConfig?.format)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMetricData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => formatValue(value, selectedMetricConfig?.format)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value) => [formatValue(value, selectedMetricConfig?.format), selectedMetricConfig?.label]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonData?.map((platform) => {
                const colors = getPlatformColors(platform?.platform);
                return (
                  <div
                    key={platform?.platform}
                    className={`${colors?.background} ${colors?.border} border rounded-xl p-4 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`font-medium ${colors?.accent}`}>
                        {platform?.platform?.substring(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-foreground">{platform?.name}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium text-foreground">{formatValue(platform?.revenue, 'currency')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className={`font-medium ${platform?.roi > 0 ? 'text-success' : 'text-error'}`}>
                          {formatValue(platform?.roi, 'percentage')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium text-foreground">{platform?.score?.toFixed(0)}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="platform" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  {comparisonData?.map((platform, index) => (
                    <Radar
                      key={platform?.platform}
                      name={platform?.name}
                      dataKey={platform?.name}
                      stroke={`hsl(${index * 90}, 70%, 50%)`}
                      fill={`hsl(${index * 90}, 70%, 50%)`}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">Efficiency Leaders</h4>
                {comparisonData?.sort((a, b) => b?.costEfficiency - a?.costEfficiency)?.slice(0, 3)?.map((platform, index) => (
                  <div key={platform?.platform} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm text-foreground">{platform?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-success">
                      {platform?.costEfficiency?.toFixed(2)}x
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">Volume Leaders</h4>
                {comparisonData?.sort((a, b) => b?.conversions - a?.conversions)?.slice(0, 3)?.map((platform, index) => (
                  <div key={platform?.platform} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm text-foreground">{platform?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {platform?.conversions?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">ROI Leaders</h4>
                {comparisonData?.sort((a, b) => b?.roi - a?.roi)?.slice(0, 3)?.map((platform, index) => (
                  <div key={platform?.platform} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm text-foreground">{platform?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-success">
                      {platform?.roi?.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      
      </div>
    </div>
  );
};

export default PlatformComparison;
