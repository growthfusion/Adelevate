import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Select } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/Checkbox';

const TrendVisualizationPanel = () => {
  const [selectedMetrics, setSelectedMetrics] = useState(['roi', 'roas']);
  const [timeGranularity, setTimeGranularity] = useState('daily');
  const [showPrediction, setShowPrediction] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['google-ads', 'facebook-ads', 'tiktok-ads']);

  const metricOptions = [
    { value: 'roi', label: 'ROI (%)', color: '#2563EB' },
    { value: 'roas', label: 'ROAS', color: '#10B981' },
    { value: 'cpa', label: 'CPA ($)', color: '#F59E0B' },
    { value: 'ctr', label: 'CTR (%)', color: '#8B5CF6' },
    { value: 'conversion-rate', label: 'Conv. Rate (%)', color: '#EF4444' },
    { value: 'spend', label: 'Spend ($)', color: '#06B6D4' }
  ];

  const timeGranularityOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const platformOptions = [
    { value: 'google-ads', label: 'Google Ads' },
    { value: 'facebook-ads', label: 'Meta Ads' },
    { value: 'tiktok-ads', label: 'TikTok Ads' },
    { value: 'snapchat-ads', label: 'Snapchat Ads' },
    { value: 'microsoft-ads', label: 'Microsoft Ads' },
    { value: 'linkedin-ads', label: 'LinkedIn Ads' }
  ];

  // Generate mock trend data for the last 30 days
  const generateTrendData = () => {
    const data = [];
    const baseDate = new Date();
    baseDate?.setDate(baseDate?.getDate() - 29);

    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date?.setDate(date?.getDate() + i);
      
      const dayOfWeek = date?.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 0.7 : 1;

      data?.push({
        date: date?.toISOString()?.split('T')?.[0],
        displayDate: date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'google-ads-roi': (180 + Math.random() * 60) * weekendMultiplier,
        'google-ads-roas': (2.8 + Math.random() * 0.8) * weekendMultiplier,
        'google-ads-cpa': (40 + Math.random() * 20) / weekendMultiplier,
        'google-ads-ctr': (3.5 + Math.random() * 1.5) * weekendMultiplier,
        'google-ads-conversion-rate': (3.2 + Math.random() * 1.8) * weekendMultiplier,
        'google-ads-spend': (1200 + Math.random() * 800) * weekendMultiplier,
        
        'facebook-ads-roi': (160 + Math.random() * 80) * weekendMultiplier,
        'facebook-ads-roas': (2.6 + Math.random() * 0.9) * weekendMultiplier,
        'facebook-ads-cpa': (35 + Math.random() * 25) / weekendMultiplier,
        'facebook-ads-ctr': (2.8 + Math.random() * 1.2) * weekendMultiplier,
        'facebook-ads-conversion-rate': (2.1 + Math.random() * 1.4) * weekendMultiplier,
        'facebook-ads-spend': (800 + Math.random() * 600) * weekendMultiplier,
        
        'tiktok-ads-roi': (140 + Math.random() * 70) * weekendMultiplier,
        'tiktok-ads-roas': (2.4 + Math.random() * 0.7) * weekendMultiplier,
        'tiktok-ads-cpa': (30 + Math.random() * 15) / weekendMultiplier,
        'tiktok-ads-ctr': (4.5 + Math.random() * 2.0) * weekendMultiplier,
        'tiktok-ads-conversion-rate': (1.8 + Math.random() * 1.0) * weekendMultiplier,
        'tiktok-ads-spend': (600 + Math.random() * 400) * weekendMultiplier,
        
        'snapchat-ads-roi': (120 + Math.random() * 50) * weekendMultiplier,
        'snapchat-ads-roas': (2.2 + Math.random() * 0.6) * weekendMultiplier,
        'snapchat-ads-cpa': (38 + Math.random() * 18) / weekendMultiplier,
        'snapchat-ads-ctr': (3.8 + Math.random() * 1.8) * weekendMultiplier,
        'snapchat-ads-conversion-rate': (1.5 + Math.random() * 0.8) * weekendMultiplier,
        'snapchat-ads-spend': (400 + Math.random() * 300) * weekendMultiplier,
        
        'microsoft-ads-roi': (190 + Math.random() * 40) * weekendMultiplier,
        'microsoft-ads-roas': (2.9 + Math.random() * 0.5) * weekendMultiplier,
        'microsoft-ads-cpa': (45 + Math.random() * 22) / weekendMultiplier,
        'microsoft-ads-ctr': (2.2 + Math.random() * 1.0) * weekendMultiplier,
        'microsoft-ads-conversion-rate': (2.8 + Math.random() * 1.2) * weekendMultiplier,
        'microsoft-ads-spend': (700 + Math.random() * 500) * weekendMultiplier,
        
        'linkedin-ads-roi': (150 + Math.random() * 60) * weekendMultiplier,
        'linkedin-ads-roas': (2.5 + Math.random() * 0.7) * weekendMultiplier,
        'linkedin-ads-cpa': (65 + Math.random() * 30) / weekendMultiplier,
        'linkedin-ads-ctr': (1.5 + Math.random() * 0.8) * weekendMultiplier,
        'linkedin-ads-conversion-rate': (2.5 + Math.random() * 1.5) * weekendMultiplier,
        'linkedin-ads-spend': (500 + Math.random() * 350) * weekendMultiplier
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev?.includes(metric) 
        ? prev?.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const getMetricColor = (metric) => {
    const metricConfig = metricOptions?.find(m => m?.value === metric);
    return metricConfig?.color || '#64748B';
  };

  const getMetricLabel = (metric) => {
    const metricConfig = metricOptions?.find(m => m?.value === metric);
    return metricConfig?.label || metric;
  };

  const formatTooltipValue = (value, name) => {
    const [platform, metric] = name?.split('-');
    const metricConfig = metricOptions?.find(m => m?.value === metric);
    
    if (metric === 'spend' || metric === 'cpa') {
      return [`$${value?.toFixed(0)}`, metricConfig?.label || metric];
    } else if (metric === 'roas') {
      return [`${value?.toFixed(2)}x`, metricConfig?.label || metric];
    } else {
      return [`${value?.toFixed(1)}%`, metricConfig?.label || metric];
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-modal p-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => {
            const [platform, metric] = entry?.dataKey?.split('-');
            const platformLabel = platformOptions?.find(p => p?.value === platform)?.label || platform;
            const [formattedValue, metricLabel] = formatTooltipValue(entry?.value, entry?.dataKey);
            
            return (
              <div key={index} className="flex items-center justify-between space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry?.color }}
                  />
                  <span className="text-muted-foreground">{platformLabel}</span>
                </div>
                <span className="font-mono text-foreground">{formattedValue}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderLines = () => {
    const lines = [];
    
    selectedPlatforms?.forEach(platform => {
      selectedMetrics?.forEach(metric => {
        const dataKey = `${platform}-${metric}`;
        const color = getMetricColor(metric);
        const platformLabel = platformOptions?.find(p => p?.value === platform)?.label || platform;
        
        lines?.push(
          <Line
            key={dataKey}
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            name={`${platformLabel} - ${getMetricLabel(metric)}`}
            connectNulls={false}
          />
        );
      });
    });
    
    return lines;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-primary">📈</span>
            <h3 className="text-lg font-semibold text-foreground">Trend Visualization</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Zoom
            </Button>
            <Button variant="ghost" size="sm">
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Time Granularity"
            options={timeGranularityOptions}
            value={timeGranularity}
            onChange={setTimeGranularity}
          />
          
          <Select
            label="Platforms"
            options={platformOptions}
            value={selectedPlatforms}
            onChange={setSelectedPlatforms}
            multiple
            searchable
          />

          <div className="flex items-end">
            <Checkbox
              label="Show Predictions"
              checked={showPrediction}
              onChange={(e) => setShowPrediction(e?.target?.checked)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Metrics to Display
          </label>
          <div className="flex flex-wrap gap-2">
            {metricOptions?.map(metric => (
              <button
                key={metric?.value}
                onClick={() => handleMetricToggle(metric?.value)}
                className={`
                  inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${selectedMetrics?.includes(metric?.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: metric?.color }}
                />
                <span>{metric?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="displayDate" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {renderLines()}
              {showPrediction && (
                <ReferenceLine 
                  x="Oct 10" 
                  stroke="var(--color-warning)" 
                  strokeDasharray="5 5"
                  label="Prediction Start"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {selectedMetrics?.length} metrics across {selectedPlatforms?.length} platforms
          </span>
          <span>Data refreshed every 15 minutes</span>
        </div>
      </div>
    </div>
  );
};

export default TrendVisualizationPanel;
