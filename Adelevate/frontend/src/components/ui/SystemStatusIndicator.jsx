import React, { useState, useEffect } from 'react';
//import Icon from '../AppIcon';
import {Button} from './Button';

const SystemStatusIndicator = ({ className = '', compact = false }) => {
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy', // 'healthy', 'warning', 'error', 'maintenance'
    lastRefresh: new Date(),
    nextRefresh: 30, // seconds
    apiLatency: 145, // milliseconds
    dataFreshness: 'real-time',
    connectedPlatforms: 6,
    totalPlatforms: 6
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        nextRefresh: prev?.nextRefresh > 0 ? prev?.nextRefresh - 1 : 30,
        apiLatency: Math.floor(Math.random() * 100) + 100,
        connectedPlatforms: Math.random() > 0.1 ? 6 : Math.floor(Math.random() * 6) + 1
      }));

      // Auto-refresh when countdown reaches 0
      if (systemHealth?.nextRefresh === 0) {
        handleRefresh();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [systemHealth?.nextRefresh]);

  // Simulate system health changes
  useEffect(() => {
    const healthCheck = setInterval(() => {
      const random = Math.random();
      let newStatus = 'healthy';
      
      if (random < 0.05) newStatus = 'error';
      else if (random < 0.15) newStatus = 'warning';
      else if (random < 0.02) newStatus = 'maintenance';
      
      setSystemHealth(prev => ({
        ...prev,
        status: newStatus
      }));
    }, 10000);

    return () => clearInterval(healthCheck);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSystemHealth(prev => ({
      ...prev,
      lastRefresh: new Date(),
      nextRefresh: 30,
      status: Math.random() > 0.1 ? 'healthy' : 'warning'
    }));
    
    setIsRefreshing(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      healthy: {
        color: 'text-success',
        bgColor: 'bg-success',
        icon: 'CheckCircle',
        label: 'All Systems Operational',
        description: 'Data is up-to-date and all platforms are connected'
      },
      warning: {
        color: 'text-warning',
        bgColor: 'bg-warning',
        icon: 'AlertTriangle',
        label: 'Minor Issues Detected',
        description: 'Some platforms may have delayed data updates'
      },
      error: {
        color: 'text-error',
        bgColor: 'bg-error',
        icon: 'XCircle',
        label: 'System Issues',
        description: 'Data refresh is currently unavailable'
      },
      maintenance: {
        color: 'text-muted-foreground',
        bgColor: 'bg-muted-foreground',
        icon: 'Settings',
        label: 'Maintenance Mode',
        description: 'Scheduled maintenance in progress'
      }
    };
    return configs?.[status] || configs?.healthy;
  };

  const formatLastRefresh = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const statusConfig = getStatusConfig(systemHealth?.status);

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${statusConfig?.bgColor}`} />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {formatLastRefresh(systemHealth?.lastRefresh)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          loading={isRefreshing}
          iconName="RefreshCw"
          iconSize={14}
          className="text-muted-foreground hover:text-foreground"
          title={`${statusConfig?.label} - Click to refresh`}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusConfig?.bgColor}`} />
          <span className={`text-sm font-medium ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
        </div>
        
       
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e?.stopPropagation();
            handleRefresh();
          }}
          loading={isRefreshing}
          iconName="RefreshCw"
          iconSize={14}
          className="text-muted-foreground hover:text-foreground"
        />
      </div>
      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-modal z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
              <h3 className="text-sm font-medium text-foreground">System Status</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
              iconName="X"
              iconSize={14}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Overall Health</span>
              <span className={`text-xs font-medium ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">API Latency</span>
              <span className="text-xs font-mono text-foreground">
                {systemHealth?.apiLatency}ms
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Connected Platforms</span>
              <span className="text-xs font-mono text-foreground">
                {systemHealth?.connectedPlatforms}/{systemHealth?.totalPlatforms}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Data Freshness</span>
              <span className="text-xs text-foreground">
                {systemHealth?.dataFreshness}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Next Refresh</span>
              <span className="text-xs font-mono text-foreground">
                {systemHealth?.nextRefresh}s
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {statusConfig?.description}
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Refresh Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatusIndicator;