import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from "@/components/ui/select";

const ExecutiveControlPanel = ({ 
  onDateRangeChange, 
  onPlatformToggle, 
  onComparisonToggle,
  onExport,
  className = '' 
}) => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [platformView, setPlatformView] = useState('consolidated');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'this-month', label: 'This month' },
    { value: 'last-month', label: 'Last month' },
    { value: 'this-quarter', label: 'This quarter' },
    { value: 'last-quarter', label: 'Last quarter' },
    { value: 'this-year', label: 'This year' },
    { value: 'last-year', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const exportOptions = [
    { value: 'pdf', label: 'PDF Report' },
    { value: 'powerpoint', label: 'PowerPoint' },
    { value: 'excel', label: 'Excel Workbook' },
    { value: 'png', label: 'PNG Image' }
  ];

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    onDateRangeChange?.(value);
  };

  const handlePlatformToggle = () => {
    const newView = platformView === 'consolidated' ? 'individual' : 'consolidated';
    setPlatformView(newView);
    onPlatformToggle?.(newView);
  };

  const handleComparisonToggle = () => {
    const newMode = !comparisonMode;
    setComparisonMode(newMode);
    onComparisonToggle?.(newMode);
  };

  const handleExport = () => {
    onExport?.(exportFormat);
  };

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        
        {/* Left Section - Primary Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          
          {/* Date Range Selector */}
          <div className="min-w-0 flex-1 sm:flex-none sm:w-48">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={handleDateRangeChange}
              searchable
              className="w-full"
            />
          </div>

          {/* Platform View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Platform View:</span>
            <Button
              variant={platformView === 'consolidated' ? 'default' : 'outline'}
              size="sm"
              onClick={handlePlatformToggle}
              className="whitespace-nowrap"
            >
              {platformView === 'consolidated' ? 'Consolidated' : 'Individual'}
            </Button>
          </div>
        </div>

        {/* Right Section - Secondary Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          
          {/* Comparison Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Compare:</span>
            <Button
              variant={comparisonMode ? 'default' : 'outline'}
              size="sm"
              onClick={handleComparisonToggle}
              className="whitespace-nowrap"
            >
              {comparisonMode ? 'Period vs Period' : 'Single Period'}
            </Button>
          </div>

          {/* Export Controls */}
          <div className="flex items-center space-x-2">
            <Select
              options={exportOptions}
              value={exportFormat}
              onChange={setExportFormat}
              className="w-32"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="whitespace-nowrap"
            >
              Export
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            title="Refresh data"
          />
        </div>
      </div>
      {/* Quick Presets */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Quick Presets:</span>
            <div className="flex items-center space-x-1">
              {[
                { label: 'MTD', value: 'this-month' },
                { label: 'QTD', value: 'this-quarter' },
                { label: 'YTD', value: 'this-year' }
              ]?.map((preset) => (
                <button
                  key={preset?.value}
                  onClick={() => handleDateRangeChange(preset?.value)}
                  className={`
                    px-2 py-1 text-xs font-medium rounded transition-colors
                    ${dateRange === preset?.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {preset?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>Data refreshed 2m ago</span>
            </div>
            <div className="flex items-center space-x-1">
              {/* Removed Icon component and left a placeholder for timing display */}
              <span>Next update in 28m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveControlPanel;
