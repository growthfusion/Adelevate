import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Select } from './Select';

const Header = () => {
  const location = useLocation();
  const [dateRange, setDateRange] = useState('last-30-days');
  const [platform, setPlatform] = useState('all-platforms');
  const [isSystemHealthy, setIsSystemHealthy] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const navigationItems = [
    {
      label: 'Performance Hub',
      path: '/campaign-performance-hub',
      analyticalLevel: 'operational',
      description: 'Real-time campaign monitoring and optimization'
    },
    {
      label: 'Executive Overview',
      path: '/executive-roi-dashboard',
      analyticalLevel: 'strategic',
      description: 'Strategic ROI insights and budget allocation'
    },
    {
      label: 'Analytics Center',
      path: '/platform-analytics-center',
      analyticalLevel: 'detailed',
      description: 'Deep-dive cross-platform analysis workspace'
    }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const platformOptions = [
    { value: 'all-platforms', label: 'All Platforms' },
    { value: 'google-ads', label: 'Google Ads' },
    { value: 'facebook-ads', label: 'Facebook Ads' },
    { value: 'microsoft-ads', label: 'Microsoft Ads' },
    { value: 'linkedin-ads', label: 'LinkedIn Ads' },
    { value: 'twitter-ads', label: 'Twitter Ads' }
  ];

  const handleTabClick = (path) => {
    window.location.href = path;
  };

  const handleRefreshData = () => {
    setLastRefresh(new Date());
    // Simulate data refresh
    setTimeout(() => {
      setIsSystemHealthy(Math.random() > 0.1); // 90% chance of healthy status
    }, 1000);
  };

  const getActiveTab = () => {
    return navigationItems?.find(item => item?.path === location?.pathname);
  };

  const formatLastRefresh = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              {/* Icon will be added later */}
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground leading-none">
                AdSage Analytics
              </h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Performance Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1" role="tablist">
          {navigationItems?.map((item) => {
            const isActive = location?.pathname === item?.path;
            return (
              <button
                key={item?.path}
                onClick={() => handleTabClick(item?.path)}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-lg transition-smooth
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                role="tab"
                aria-selected={isActive}
                title={item?.description}
              >
                {item?.label}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Controls */}
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <div className="hidden md:block">
            <Select
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
              className="w-40"
            />
          </div>

          {/* Platform Filter */}
          <div className="hidden lg:block">
            <Select
              options={platformOptions}
              value={platform}
              onChange={setPlatform}
              placeholder="Select platform"
              className="w-36"
            />
          </div>

          {/* System Status & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isSystemHealthy ? 'bg-success' : 'bg-error'}`} />
              <span className="hidden sm:inline">
                {formatLastRefresh(lastRefresh)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshData}
              className="text-muted-foreground hover:text-foreground"
              title="Refresh data"
            >
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            />
          </div>
        </div>
      </div>
      {/* Mobile Navigation Dropdown - Hidden by default, would be shown via state */}
      <div className="hidden md:hidden border-t border-border bg-card">
        <div className="px-4 py-3 space-y-2">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={setDateRange}
            className="w-full"
          />
          <Select
            label="Platform"
            options={platformOptions}
            value={platform}
            onChange={setPlatform}
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
