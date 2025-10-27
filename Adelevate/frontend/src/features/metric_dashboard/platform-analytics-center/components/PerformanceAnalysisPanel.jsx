import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from "@/components/ui/select";

const PerformanceAnalysisPanel = () => {
  const [selectedMetric, setSelectedMetric] = useState('roi');
  const [sortBy, setSortBy] = useState('performance');
  const [sortOrder, setSortOrder] = useState('desc');

  const metricOptions = [
    { value: 'roi', label: 'Return on Investment (ROI)' },
    { value: 'roas', label: 'Return on Ad Spend (ROAS)' },
    { value: 'cpa', label: 'Cost Per Acquisition (CPA)' },
    { value: 'ctr', label: 'Click-Through Rate (CTR)' },
    { value: 'conversion-rate', label: 'Conversion Rate' },
    { value: 'cpm', label: 'Cost Per Mille (CPM)' }
  ];

  const sortOptions = [
    { value: 'performance', label: 'Performance Score' },
    { value: 'spend', label: 'Amount Spent' },
    { value: 'revenue', label: 'Revenue Generated' },
    { value: 'conversions', label: 'Total Conversions' },
    { value: 'clicks', label: 'Total Clicks' }
  ];

  const performanceData = [
    {
      id: 1,
      platform: 'Google Ads',
      platformIcon: 'Search',
      campaignName: 'Holiday Sale - Search Campaign',
      spend: 15420.50,
      revenue: 52340.20,
      conversions: 342,
      clicks: 8540,
      roi: 239.5,
      roas: 3.39,
      cpa: 45.09,
      ctr: 4.2,
      conversionRate: 4.0,
      cpm: 12.45,
      trend: [45, 52, 48, 61, 58, 67, 72, 69, 75, 78, 82, 85],
      status: 'high-performer',
      change: '+12.5%'
    },
    {
      id: 2,
      platform: 'Meta Ads',
      platformIcon: 'Facebook',
      campaignName: 'Brand Awareness - Video Campaign',
      spend: 8750.00,
      revenue: 28420.80,
      conversions: 189,
      clicks: 12340,
      roi: 224.8,
      roas: 3.25,
      cpa: 46.30,
      ctr: 3.8,
      conversionRate: 1.5,
      cpm: 8.90,
      trend: [32, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 71],
      status: 'high-performer',
      change: '+8.3%'
    },
    {
      id: 3,
      platform: 'TikTok Ads',
      platformIcon: 'Video',
      campaignName: 'Gen Z Targeting - Creative Campaign',
      spend: 5200.00,
      revenue: 14680.40,
      conversions: 156,
      clicks: 18920,
      roi: 182.3,
      roas: 2.82,
      cpa: 33.33,
      ctr: 6.2,
      conversionRate: 0.8,
      cpm: 4.20,
      trend: [28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 61, 64],
      status: 'average-performer',
      change: '+15.7%'
    },
    {
      id: 4,
      platform: 'Snapchat Ads',
      platformIcon: 'Camera',
      campaignName: 'Mobile App Install Campaign',
      spend: 3850.00,
      revenue: 8920.50,
      conversions: 98,
      clicks: 9840,
      roi: 131.7,
      roas: 2.32,
      cpa: 39.29,
      ctr: 4.8,
      conversionRate: 1.0,
      cpm: 6.80,
      trend: [18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 51, 54],
      status: 'needs-attention',
      change: '-2.1%'
    },
    {
      id: 5,
      platform: 'Microsoft Ads',
      platformIcon: 'Globe',
      campaignName: 'B2B Lead Generation Campaign',
      spend: 6420.00,
      revenue: 19850.60,
      conversions: 124,
      clicks: 4280,
      roi: 209.2,
      roas: 3.09,
      cpa: 51.77,
      ctr: 2.9,
      conversionRate: 2.9,
      cpm: 18.50,
      trend: [35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 71],
      status: 'high-performer',
      change: '+6.8%'
    },
    {
      id: 6,
      platform: 'LinkedIn Ads',
      platformIcon: 'Briefcase',
      campaignName: 'Professional Services Campaign',
      spend: 4680.00,
      revenue: 12340.20,
      conversions: 67,
      clicks: 2140,
      roi: 163.7,
      roas: 2.64,
      cpa: 69.85,
      ctr: 1.8,
      conversionRate: 3.1,
      cpm: 28.90,
      trend: [22, 25, 28, 32, 35, 38, 42, 45, 48, 51, 54, 57],
      status: 'average-performer',
      change: '+4.2%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'high-performer': return 'text-success bg-success/10';
      case 'average-performer': return 'text-warning bg-warning/10';
      case 'needs-attention': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'high-performer': return 'High Performer';
      case 'average-performer': return 'Average';
      case 'needs-attention': return 'Needs Attention';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US')?.format(value);
  };

  const getMetricValue = (item, metric) => {
    switch (metric) {
      case 'roi': return formatPercentage(item?.roi);
      case 'roas': return item?.roas?.toFixed(2) + 'x';
      case 'cpa': return formatCurrency(item?.cpa);
      case 'ctr': return formatPercentage(item?.ctr);
      case 'conversion-rate': return formatPercentage(item?.conversionRate);
      case 'cpm': return formatCurrency(item?.cpm);
      default: return formatPercentage(item?.roi);
    }
  };

  const renderSparkline = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data?.map((value, index) => {
      const x = (index / (data?.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 16;
      return `${x},${y}`;
    })?.join(' ');

    return (
      <svg width="60" height="20" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
        />
      </svg>
    );
  };

  const sortedData = [...performanceData]?.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'performance':
        aValue = a?.roi;
        bValue = b?.roi;
        break;
      case 'spend':
        aValue = a?.spend;
        bValue = b?.spend;
        break;
      case 'revenue':
        aValue = a?.revenue;
        bValue = b?.revenue;
        break;
      case 'conversions':
        aValue = a?.conversions;
        bValue = b?.conversions;
        break;
      case 'clicks':
        aValue = a?.clicks;
        bValue = b?.clicks;
        break;
      default:
        aValue = a?.roi;
        bValue = b?.roi;
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Platform icon mapping function
  const getPlatformSymbol = (platformIcon) => {
    switch(platformIcon) {
      case 'Search': return '🔍';
      case 'Facebook': return '📱';
      case 'Video': return '📹';
      case 'Camera': return '📸';
      case 'Globe': return '🌐';
      case 'Briefcase': return '💼';
      default: return '📊';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-primary text-xl">📊</span>
            <h3 className="text-lg font-semibold text-foreground">Performance Analysis</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Export
            </Button>
            <Button variant="ghost" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            label="Primary Metric"
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            className="flex-1"
          />
          
          <Select
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            className="flex-1"
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Spend</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Revenue</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Primary Metric</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Conversions</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Trend</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((item) => (
              <tr key={item?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">{getPlatformSymbol(item?.platformIcon)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{item?.campaignName}</div>
                      <div className="text-xs text-muted-foreground">{item?.platform}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right text-sm font-mono text-foreground">
                  {formatCurrency(item?.spend)}
                </td>
                <td className="p-4 text-right text-sm font-mono text-foreground">
                  {formatCurrency(item?.revenue)}
                </td>
                <td className="p-4 text-right text-sm font-mono text-foreground font-medium">
                  {getMetricValue(item, selectedMetric)}
                </td>
                <td className="p-4 text-right text-sm font-mono text-foreground">
                  {formatNumber(item?.conversions)}
                </td>
                <td className="p-4 text-center">
                  {renderSparkline(item?.trend)}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item?.status)}`}>
                    {getStatusLabel(item?.status)}
                  </span>
                </td>
                <td className="p-4 text-right text-sm font-medium">
                  <span className={item?.change?.startsWith('+') ? 'text-success' : 'text-error'}>
                    {item?.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedData?.length} campaigns across {new Set(sortedData.map(item => item.platform))?.size} platforms</span>
          <span>Last updated: 2 minutes ago</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalysisPanel;
