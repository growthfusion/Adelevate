import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/Button';

const RevenueSpendChart = ({ data, className = '' }) => {
  const [chartType, setChartType] = useState('combined'); // 'combined', 'revenue', 'spend'
  const [timeframe, setTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const chartOptions = [
    { value: 'combined', label: 'Revenue & Spend' },
    { value: 'revenue', label: 'Revenue Only' },
    { value: 'spend', label: 'Spend Only' }
  ];

  const timeframeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatDate(label)}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry?.dataKey === 'revenue' ? 'Revenue' : 'Spend'}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(entry?.value)}
              </span>
            </div>
          ))}
          {payload?.length === 2 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="text-sm font-medium text-success">
                  {((payload?.[0]?.value / payload?.[1]?.value - 1) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Revenue & Spend Trends
          </h3>
          <p className="text-sm text-muted-foreground">
            Executive performance overview with ROI indicators
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {chartOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => setChartType(option?.value)}
                className={`
                  flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${chartType === option?.value 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <span>{option?.label}</span>
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            {timeframeOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => setTimeframe(option?.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${timeframe === option?.value 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {option?.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            title="Export chart"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {(chartType === 'combined' || chartType === 'revenue') && (
              <Area
                type="monotone"
                dataKey="revenue"
                fill="var(--color-success)"
                fillOpacity={0.1}
                stroke="var(--color-success)"
                strokeWidth={3}
                name="Revenue"
              />
            )}
            
            {(chartType === 'combined' || chartType === 'spend') && (
              <Line
                type="monotone"
                dataKey="spend"
                stroke="var(--color-primary)"
                strokeWidth={3}
                strokeDasharray={chartType === 'spend' ? '0' : '5 5'}
                name="Spend"
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {formatCurrency(data?.reduce((sum, item) => sum + item?.revenue, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(data?.reduce((sum, item) => sum + item?.spend, 0))}
          </div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(data?.reduce((sum, item) => sum + (item?.revenue - item?.spend), 0))}
          </div>
          <div className="text-xs text-muted-foreground">Net Profit</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {(((data?.reduce((sum, item) => sum + item?.revenue, 0) / data?.reduce((sum, item) => sum + item?.spend, 0)) - 1) * 100)?.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Overall ROI</div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSpendChart;
