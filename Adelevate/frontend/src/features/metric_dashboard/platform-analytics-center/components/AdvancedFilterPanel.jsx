import React, { useState } from 'react';
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/Button';

const AdvancedFilterPanel = ({ onFiltersChange, isCollapsed, onToggleCollapse }) => {
  const [filters, setFilters] = useState({
    platforms: ['google-ads', 'facebook-ads'],
    dateRange: 'last-30-days',
    comparisonPeriod: 'previous-period',
    campaignSearch: '',
    audienceSegments: [],
    budgetRange: { min: '', max: '' },
    performanceThreshold: 'all'
  });

  const platformOptions = [
    { value: 'google-ads', label: 'Google Ads' },
    { value: 'facebook-ads', label: 'Meta Ads' },
    { value: 'tiktok-ads', label: 'TikTok Ads' },
    { value: 'snapchat-ads', label: 'Snapchat Ads' },
    { value: 'microsoft-ads', label: 'Microsoft Ads' },
    { value: 'linkedin-ads', label: 'LinkedIn Ads' }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'this-month', label: 'This month' },
    { value: 'last-month', label: 'Last month' },
    { value: 'this-quarter', label: 'This quarter' },
    { value: 'custom', label: 'Custom range' }
  ];

  const comparisonOptions = [
    { value: 'previous-period', label: 'Previous Period' },
    { value: 'year-over-year', label: 'Year over Year' },
    { value: 'month-over-month', label: 'Month over Month' },
    { value: 'quarter-over-quarter', label: 'Quarter over Quarter' },
    { value: 'no-comparison', label: 'No Comparison' }
  ];

  const audienceSegmentOptions = [
    { value: 'lookalike', label: 'Lookalike Audiences' },
    { value: 'custom', label: 'Custom Audiences' },
    { value: 'interest', label: 'Interest-based' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'demographic', label: 'Demographic' },
    { value: 'retargeting', label: 'Retargeting' }
  ];

  const performanceThresholdOptions = [
    { value: 'all', label: 'All Campaigns' },
    { value: 'high-performers', label: 'High Performers (ROI > 300%)' },
    { value: 'average-performers', label: 'Average Performers (ROI 100-300%)' },
    { value: 'underperformers', label: 'Underperformers (ROI < 100%)' },
    { value: 'needs-attention', label: 'Needs Attention' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      platforms: ['google-ads', 'facebook-ads'],
      dateRange: 'last-30-days',
      comparisonPeriod: 'previous-period',
      campaignSearch: '',
      audienceSegments: [],
      budgetRange: { min: '', max: '' },
      performanceThreshold: 'all'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  if (isCollapsed) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">🔍</span>
            <span className="text-sm font-medium text-foreground">Advanced Filters</span>
            <div className="flex items-center space-x-1">
              {filters?.platforms?.map(platform => (
                <div key={platform} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  {platformOptions?.find(p => p?.value === platform)?.label}
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
          >
            Expand ▼
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">🔍</span>
          <h3 className="text-lg font-semibold text-foreground">Advanced Analytics Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
          >
            Collapse ▲
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="Advertising Platforms"
          options={platformOptions}
          value={filters?.platforms}
          onChange={(value) => handleFilterChange('platforms', value)}
          multiple
          searchable
          className="col-span-1"
        />

        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          className="col-span-1"
        />

        <Select
          label="Comparison Period"
          options={comparisonOptions}
          value={filters?.comparisonPeriod}
          onChange={(value) => handleFilterChange('comparisonPeriod', value)}
          className="col-span-1"
        />

        <Select
          label="Performance Threshold"
          options={performanceThresholdOptions}
          value={filters?.performanceThreshold}
          onChange={(value) => handleFilterChange('performanceThreshold', value)}
          className="col-span-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Input
          label="Campaign Search"
          type="search"
          placeholder="Search campaigns, ad sets, or keywords..."
          value={filters?.campaignSearch}
          onChange={(e) => handleFilterChange('campaignSearch', e?.target?.value)}
          className="col-span-1"
        />

        <div className="col-span-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Budget Range (USD)
          </label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters?.budgetRange?.min}
              onChange={(e) => handleFilterChange('budgetRange', { ...filters?.budgetRange, min: e?.target?.value })}
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters?.budgetRange?.max}
              onChange={(e) => handleFilterChange('budgetRange', { ...filters?.budgetRange, max: e?.target?.value })}
            />
          </div>
        </div>

        <Select
          label="Audience Segments"
          options={audienceSegmentOptions}
          value={filters?.audienceSegments}
          onChange={(value) => handleFilterChange('audienceSegments', value)}
          multiple
          searchable
          className="col-span-1"
        />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Filters will be applied to all analytical views and data exports
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;
