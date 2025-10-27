import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Select } from "@/components/ui/select";

const CorrelationMatrix = () => {
  const [xAxisMetric, setXAxisMetric] = useState('spend');
  const [yAxisMetric, setYAxisMetric] = useState('revenue');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showRegression, setShowRegression] = useState(true);

  const metricOptions = [
    { value: 'spend', label: 'Amount Spent ($)' },
    { value: 'revenue', label: 'Revenue Generated ($)' },
    { value: 'conversions', label: 'Total Conversions' },
    { value: 'clicks', label: 'Total Clicks' },
    { value: 'impressions', label: 'Total Impressions' },
    { value: 'cpa', label: 'Cost Per Acquisition ($)' },
    { value: 'ctr', label: 'Click-Through Rate (%)' },
    { value: 'conversion-rate', label: 'Conversion Rate (%)' },
    { value: 'roi', label: 'Return on Investment (%)' }
  ];

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'google-ads', label: 'Google Ads', color: '#4285F4' },
    { value: 'facebook-ads', label: 'Meta Ads', color: '#1877F2' },
    { value: 'tiktok-ads', label: 'TikTok Ads', color: '#FF0050' },
    { value: 'snapchat-ads', label: 'Snapchat Ads', color: '#FFFC00' },
    { value: 'microsoft-ads', label: 'Microsoft Ads', color: '#00BCF2' },
    { value: 'linkedin-ads', label: 'LinkedIn Ads', color: '#0A66C2' }
  ];

  // Generate correlation data
  const generateCorrelationData = () => {
    const platforms = ['google-ads', 'facebook-ads', 'tiktok-ads', 'snapchat-ads', 'microsoft-ads', 'linkedin-ads'];
    const data = [];

    platforms?.forEach(platform => {
      if (selectedPlatform !== 'all' && selectedPlatform !== platform) return;

      // Generate 30 data points per platform (representing campaigns)
      for (let i = 0; i < 30; i++) {
        const baseSpend = Math.random() * 5000 + 500;
        const platformMultiplier = {
          'google-ads': 1.2,
          'facebook-ads': 1.0,
          'tiktok-ads': 0.8,
          'snapchat-ads': 0.7,
          'microsoft-ads': 1.1,
          'linkedin-ads': 0.9
        }?.[platform];

        const spend = baseSpend * platformMultiplier;
        const revenue = spend * (2.5 + Math.random() * 1.5) * platformMultiplier;
        const conversions = Math.floor(spend / (35 + Math.random() * 20));
        const clicks = Math.floor(spend / (0.8 + Math.random() * 0.4));
        const impressions = clicks * (20 + Math.random() * 15);
        const cpa = spend / conversions;
        const ctr = (clicks / impressions) * 100;
        const conversionRate = (conversions / clicks) * 100;
        const roi = ((revenue - spend) / spend) * 100;

        data?.push({
          platform,
          platformLabel: platformOptions?.find(p => p?.value === platform)?.label || platform,
          platformColor: platformOptions?.find(p => p?.value === platform)?.color || '#64748B',
          spend: Math.round(spend),
          revenue: Math.round(revenue),
          conversions,
          clicks,
          impressions,
          cpa: Math.round(cpa * 100) / 100,
          ctr: Math.round(ctr * 100) / 100,
          'conversion-rate': Math.round(conversionRate * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          campaignId: `${platform}-campaign-${i + 1}`
        });
      }
    });

    return data;
  };

  const correlationData = generateCorrelationData();

  const getMetricValue = (item, metric) => {
    return item?.[metric] || 0;
  };

  const formatAxisLabel = (value, metric) => {
    if (metric === 'spend' || metric === 'revenue' || metric === 'cpa') {
      return `$${value?.toLocaleString()}`;
    } else if (metric === 'ctr' || metric === 'conversion-rate' || metric === 'roi') {
      return `${value}%`;
    } else {
      return value?.toLocaleString();
    }
  };

  const calculateCorrelation = () => {
    if (correlationData?.length < 2) return 0;

    const xValues = correlationData?.map(item => getMetricValue(item, xAxisMetric));
    const yValues = correlationData?.map(item => getMetricValue(item, yAxisMetric));

    const n = xValues?.length;
    const sumX = xValues?.reduce((a, b) => a + b, 0);
    const sumY = yValues?.reduce((a, b) => a + b, 0);
    const sumXY = xValues?.reduce((sum, x, i) => sum + x * yValues?.[i], 0);
    const sumX2 = xValues?.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = yValues?.reduce((sum, y) => sum + y * y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();

  const getCorrelationStrength = (r) => {
    const abs = Math.abs(r);
    if (abs >= 0.8) return { label: 'Very Strong', color: 'text-success' };
    if (abs >= 0.6) return { label: 'Strong', color: 'text-primary' };
    if (abs >= 0.4) return { label: 'Moderate', color: 'text-warning' };
    if (abs >= 0.2) return { label: 'Weak', color: 'text-muted-foreground' };
    return { label: 'Very Weak', color: 'text-error' };
  };

  const correlationStrength = getCorrelationStrength(correlation);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-modal p-3">
          <p className="text-sm font-medium text-foreground mb-2">{data?.campaignId}</p>
          <p className="text-xs text-muted-foreground mb-1">{data?.platformLabel}</p>
          <div className="space-y-1">
            <div className="flex justify-between space-x-4 text-xs">
              <span className="text-muted-foreground">
                {metricOptions?.find(m => m?.value === xAxisMetric)?.label}:
              </span>
              <span className="font-mono text-foreground">
                {formatAxisLabel(getMetricValue(data, xAxisMetric), xAxisMetric)}
              </span>
            </div>
            <div className="flex justify-between space-x-4 text-xs">
              <span className="text-muted-foreground">
                {metricOptions?.find(m => m?.value === yAxisMetric)?.label}:
              </span>
              <span className="font-mono text-foreground">
                {formatAxisLabel(getMetricValue(data, yAxisMetric), yAxisMetric)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-primary">📊</span>
            <h3 className="text-lg font-semibold text-foreground">Platform Performance Correlation</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Reset View
            </Button>
            <Button variant="ghost" size="sm">
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Select
            label="X-Axis Metric"
            options={metricOptions}
            value={xAxisMetric}
            onChange={setXAxisMetric}
          />
          
          <Select
            label="Y-Axis Metric"
            options={metricOptions}
            value={yAxisMetric}
            onChange={setYAxisMetric}
          />

          <Select
            label="Platform Filter"
            options={platformOptions}
            value={selectedPlatform}
            onChange={setSelectedPlatform}
          />

          <div className="flex items-end">
            <Button
              variant={showRegression ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRegression(!showRegression)}
            >
              Regression Line
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Correlation Coefficient:</span>
              <span className="ml-2 font-mono font-medium text-foreground">
                {correlation?.toFixed(3)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Strength:</span>
              <span className={`ml-2 font-medium ${correlationStrength?.color}`}>
                {correlationStrength?.label}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {correlationData?.length} data points
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                type="number" 
                dataKey={xAxisMetric}
                name={metricOptions?.find(m => m?.value === xAxisMetric)?.label}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => formatAxisLabel(value, xAxisMetric)}
              />
              <YAxis 
                type="number" 
                dataKey={yAxisMetric}
                name={metricOptions?.find(m => m?.value === yAxisMetric)?.label}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => formatAxisLabel(value, yAxisMetric)}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {selectedPlatform === 'all' ? (
                platformOptions?.slice(1)?.map(platform => (
                  <Scatter
                    key={platform?.value}
                    name={platform?.label}
                    data={correlationData?.filter(item => item?.platform === platform?.value)}
                    fill={platform?.color}
                    fillOpacity={0.7}
                  />
                ))
              ) : (
                <Scatter
                  name={platformOptions?.find(p => p?.value === selectedPlatform)?.label}
                  data={correlationData}
                  fill={platformOptions?.find(p => p?.value === selectedPlatform)?.color || '#64748B'}
                  fillOpacity={0.7}
                />
              )}

              {showRegression && correlation !== 0 && (
                <ReferenceLine 
                  segment={[
                    { x: Math.min(...correlationData?.map(d => getMetricValue(d, xAxisMetric))), 
                      y: Math.min(...correlationData?.map(d => getMetricValue(d, yAxisMetric))) },
                    { x: Math.max(...correlationData?.map(d => getMetricValue(d, xAxisMetric))), 
                      y: Math.max(...correlationData?.map(d => getMetricValue(d, yAxisMetric))) }
                  ]}
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Interpretation:</span>
            <p className="text-foreground mt-1">
              {correlation > 0.5 
                ? `Strong positive correlation between ${metricOptions?.find(m => m?.value === xAxisMetric)?.label} and ${metricOptions?.find(m => m?.value === yAxisMetric)?.label}`
                : correlation < -0.5
                ? `Strong negative correlation between the selected metrics`
                : `Weak correlation suggests limited linear relationship between metrics`
              }
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">R² Value:</span>
            <p className="text-foreground mt-1 font-mono">
              {(correlation * correlation)?.toFixed(3)} ({((correlation * correlation) * 100)?.toFixed(1)}% variance explained)
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated:</span>
            <p className="text-foreground mt-1">
              {new Date()?.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
