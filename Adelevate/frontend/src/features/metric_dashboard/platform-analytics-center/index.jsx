import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/ui/Header';

import TabNavigationController from '@/components/ui/TabNavigationController';
import SystemStatusIndicator from '@/components/ui/SystemStatusIndicator';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';
import PerformanceAnalysisPanel from './components/PerformanceAnalysisPanel';
import TrendVisualizationPanel from './components/TrendVisualizationPanel';
import CorrelationMatrix from './components/CorrelationMatrix';
import CustomMetricCalculator from './components/CustomMetricCalculator';
import { Button } from "@/components/ui/button";

const PlatformAnalyticsCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('performance');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [isAIInsightsCollapsed, setIsAIInsightsCollapsed] = useState(false);
  const [isCustomMetricOpen, setIsCustomMetricOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const analyticalTabs = [
    {
      id: 'performance',
      label: 'Performance Analysis',
      description: 'Detailed metric breakdowns with sortable data tables'
    },
    {
      id: 'trends',
      label: 'Trend Visualization',
      description: 'Multi-line charts comparing key metrics across platforms'
    },
    {
      id: 'correlation',
      label: 'Correlation Matrix',
      description: 'Platform performance relationships with interactive scatter plots'
    }
  ];

  const quickActions = [
    {
      id: 'export-report',
      label: 'Export Report',
      action: () => handleExportReport()
    },
    {
      id: 'custom-metric',
      label: 'Custom Metric',
      action: () => setIsCustomMetricOpen(true)
    },
    {
      id: 'schedule-report',
      label: 'Schedule Report',
      action: () => handleScheduleReport()
    },
    {
      id: 'api-access',
      label: 'API Access',
      action: () => handleAPIAccess()
    }
  ];

  useEffect(() => {
    // Auto-refresh data every 15 minutes
    const refreshInterval = setInterval(() => {
      setLastRefresh(new Date());
    }, 900000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setLastRefresh(new Date());
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleExportReport = () => {
    // Simulate export functionality
    console.log('Exporting analytical report with current filters:', filters);
  };

  const handleScheduleReport = () => {
    // Simulate scheduling functionality
    console.log('Opening report scheduling modal');
  };

  const handleAPIAccess = () => {
    // Simulate API access functionality
    console.log('Opening API documentation and access keys');
  };

  const handleNavigateToHub = () => {
    navigate('/campaign-performance-hub');
  };

  const handleNavigateToExecutive = () => {
    navigate('/executive-roi-dashboard');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return <PerformanceAnalysisPanel />;
      case 'trends':
        return <TrendVisualizationPanel />;
      case 'correlation':
        return <CorrelationMatrix />;
      default:
        return <PerformanceAnalysisPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className={`pt-16 transition-all duration-300 ${isAIInsightsCollapsed ? 'pr-0' : 'pr-96'}`}>
        {/* Top Navigation and Controls */}
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Platform Analytics Center</h1>
                  <p className="text-sm text-muted-foreground">
                    Deep-dive cross-platform analysis workspace for detailed performance insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <TabNavigationController />
                <SystemStatusIndicator compact />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {analyticalTabs?.map(tab => (
                  <button
                    key={tab?.id}
                    onClick={() => handleTabChange(tab?.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                    title={tab?.description}
                  >
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                {quickActions?.map(action => (
                  <Button
                    key={action?.id}
                    variant="ghost"
                    size="sm"
                    onClick={action?.action}
                    title={action?.label}
                  >
                    <span className="hidden lg:inline ml-1">{action?.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 py-6">
          {/* Advanced Filters */}
          <AdvancedFilterPanel
            onFiltersChange={handleFiltersChange}
            isCollapsed={isFilterCollapsed}
            onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
          />

          {/* Main Analytics Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="xl:col-span-1">
              {renderActiveTabContent()}
            </div>
            
            <div className="xl:col-span-1">
              {activeTab === 'performance' && <TrendVisualizationPanel />}
              {activeTab === 'trends' && <PerformanceAnalysisPanel />}
              {activeTab === 'correlation' && <TrendVisualizationPanel />}
            </div>
          </div>

          {/* Full-width Correlation Matrix */}
          {activeTab !== 'correlation' && (
            <div className="mb-6">
              <CorrelationMatrix />
            </div>
          )}

          {/* Additional Analytics Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cohort Analysis Preview */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground">Cohort Analysis</h3>
                </div>
                <Button variant="ghost" size="sm">
                  View Full
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze user behavior patterns and retention across different acquisition channels
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Week 1 Retention:</span>
                  <span className="font-medium text-foreground">78.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Week 4 Retention:</span>
                  <span className="font-medium text-foreground">42.3%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Week 12 Retention:</span>
                  <span className="font-medium text-foreground">28.7%</span>
                </div>
              </div>
            </div>

            {/* Attribution Model Comparison */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground">Attribution Models</h3>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Compare conversion attribution across different models
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Click:</span>
                  <span className="font-medium text-foreground">1,247 conv.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">First Click:</span>
                  <span className="font-medium text-foreground">1,089 conv.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Linear:</span>
                  <span className="font-medium text-foreground">1,156 conv.</span>
                </div>
              </div>
            </div>

            {/* Data Quality Monitor */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground">Data Quality</h3>
                </div>
                <div className="w-2 h-2 bg-success rounded-full" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor data accuracy and completeness across all platforms
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Completeness:</span>
                  <span className="font-medium text-success">98.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sync Status:</span>
                  <span className="font-medium text-success">All Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Validation:</span>
                  <span className="font-medium text-foreground">2 min ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleNavigateToHub}
                className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <div className="font-medium text-foreground">Performance Hub</div>
                  <div className="text-sm text-muted-foreground">Real-time campaign monitoring</div>
                </div>
                <span className="text-muted-foreground ml-auto">→</span>
              </button>

              <button
                onClick={handleNavigateToExecutive}
                className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <div className="font-medium text-foreground">Executive Overview</div>
                  <div className="text-sm text-muted-foreground">Strategic ROI insights</div>
                </div>
                <span className="text-muted-foreground ml-auto">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    
      {/* Custom Metric Calculator Modal */}
      <CustomMetricCalculator
        isOpen={isCustomMetricOpen}
        onClose={() => setIsCustomMetricOpen(false)}
      />
    </div>
  );
};

export default PlatformAnalyticsCenter;
