import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/Button';

const AnalyticsChart = ({ data, className = '' }) => {
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [chartType, setChartType] = useState('area');

  const metrics = [
    { key: 'revenue', label: 'Revenue', color: '#10B981' },
    { key: 'spend', label: 'Spend', color: '#2563EB' },
    { key: 'profit', label: 'Profit', color: '#06B6D4' },
    { key: 'clicks', label: 'Clicks', color: '#8B5CF6' },
    { key: 'conversions', label: 'Conversions', color: '#EC4899' }
  ];

  const activeMetricConfig = metrics?.find(m => m?.key === activeMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: activeMetricConfig?.color }}
            />
            <span className="text-sm text-muted-foreground">{activeMetricConfig?.label}:</span>
            <span className="text-sm font-semibold text-foreground">
              {activeMetric === 'revenue' || activeMetric === 'spend' || activeMetric === 'profit' 
                ? `$${payload?.[0]?.value?.toLocaleString()}` 
                : payload?.[0]?.value?.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 ${className} lg:w-[150%] mx-5`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-foreground">Performance Analytics</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'area' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics?.map((metric) => (
          <Button
            key={metric?.key}
            variant={activeMetric === metric?.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveMetric(metric?.key)}
            className={activeMetric === metric?.key ? '' : 'text-muted-foreground'}
          >
            {metric?.label}
          </Button>
        ))}
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeMetricConfig?.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={activeMetricConfig?.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={activeMetricConfig?.color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {/* <div className="text-sm text-muted-foreground">
          Showing {activeMetricConfig?.label?.toLowerCase()} trends for selected period
        </div> */}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          Fullscreen
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsChart;
