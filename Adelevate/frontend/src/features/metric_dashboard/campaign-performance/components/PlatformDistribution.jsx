import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/Button';

const PlatformDistribution = ({ className = '' }) => {
  const spendData = [
    { platform: 'Google Ads', spend: 45000, percentage: 42, color: '#4285F4' },
    { platform: 'Facebook', spend: 32000, percentage: 30, color: '#1877F2' },
    { platform: 'TikTok', spend: 18000, percentage: 17, color: '#000000' },
    { platform: 'Snapchat', spend: 12000, percentage: 11, color: '#FFFC00' }
  ];

  const roiTrendData = [
    { platform: 'Google Ads', roi: 3.2, trend: 'up', change: 8 },
    { platform: 'Facebook', roi: 4.1, trend: 'up', change: 15 },
    { platform: 'TikTok', roi: 2.8, trend: 'down', change: -5 },
    { platform: 'Snapchat', roi: 3.7, trend: 'up', change: 12 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data?.platform}</p>
          <p className="text-sm text-muted-foreground">
            Spend: <span className="font-semibold text-foreground">${data?.spend?.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Share: <span className="font-semibold text-foreground">{data?.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTrendSymbol = (trend) => {
    return trend === 'up' ? '↑' : '↓';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Platform Spend Distribution */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-primary">📊</span>
            <h3 className="text-lg font-semibold text-foreground">Platform Distribution</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
          >
            •••
          </Button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="spend"
                >
                  {spendData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          {spendData?.map((item) => (
            <div key={item?.platform} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm font-medium text-foreground">{item?.platform}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  ${item?.spend?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item?.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ROI Comparison */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-primary">📈</span>
            <h3 className="text-lg font-semibold text-foreground">ROI Comparison</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
          >
            •••
          </Button>
        </div>

        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="platform" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="roi" 
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {roiTrendData?.map((item) => (
            <div key={item?.platform} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item?.platform}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-foreground">
                  {item?.roi?.toFixed(1)}x
                </span>
                <div className={`flex items-center space-x-1 ${getTrendColor(item?.trend)}`}>
                  <span>{getTrendSymbol(item?.trend)}</span>
                  <span className="text-xs font-medium">
                    {Math.abs(item?.change)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformDistribution;
