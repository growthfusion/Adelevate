import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './Button';

const TabNavigationController = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationTabs = [
    {
      id: 'performance-hub',
      label: 'Performance Hub',
      shortLabel: 'Performance',
      path: '/campaign-performance-hub',
      analyticalLevel: 'operational',
      description: 'Real-time campaign monitoring and optimization',
      symbol: '📊',
      color: 'spend'
    },
    {
      id: 'executive-overview',
      label: 'Executive Overview',
      shortLabel: 'Executive',
      path: '/executive-roi-dashboard',
      analyticalLevel: 'strategic',
      description: 'Strategic ROI insights and budget allocation',
      symbol: '📈',
      color: 'revenue'
    },
    {
      id: 'analytics-center',
      label: 'Analytics Center',
      shortLabel: 'Analytics',
      path: '/platform-analytics-center',
      analyticalLevel: 'detailed',
      description: 'Deep-dive cross-platform analysis workspace',
      symbol: '📉',
      color: 'profit'
    }
  ];

  const activeTab = navigationTabs?.find(tab => tab?.path === location?.pathname);

  const handleTabChange = async (tab) => {
    if (tab?.path === location?.pathname || isTransitioning) return;

    setIsTransitioning(true);
    setIsMobileMenuOpen(false);

    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    navigate(tab?.path);
    
    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handleKeyNavigation = (event) => {
    if (event?.key === 'ArrowLeft' || event?.key === 'ArrowRight') {
      event?.preventDefault();
      const currentIndex = navigationTabs?.findIndex(tab => tab?.path === location?.pathname);
      let nextIndex;

      if (event?.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : navigationTabs?.length - 1;
      } else {
        nextIndex = currentIndex < navigationTabs?.length - 1 ? currentIndex + 1 : 0;
      }

      handleTabChange(navigationTabs?.[nextIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event?.ctrlKey || event?.metaKey) {
        handleKeyNavigation(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location?.pathname]);

  // Desktop Tab Navigation
  const DesktopTabs = () => (
    <nav 
      className="hidden md:flex items-center space-x-1 bg-muted rounded-lg p-1"
      role="tablist"
      aria-label="Analytics navigation"
    >
      {navigationTabs?.map((tab) => {
        const isActive = tab?.path === location?.pathname;
        return (
          <button
            key={tab?.id}
            onClick={() => handleTabChange(tab)}
            className={`
              relative flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-md
              transition-all duration-200 ease-smooth min-w-0
              ${isActive 
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border' 
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }
              ${isTransitioning ? 'pointer-events-none' : ''}
            `}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab?.id}-panel`}
            title={tab?.description}
            disabled={isTransitioning}
          >
            <span className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
              {tab?.symbol}
            </span>
            <span className="truncate lg:block xl:block">
              {tab?.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );

  // Mobile Dropdown Navigation
  const MobileNavigation = () => (
    <div className="md:hidden relative">
      <Button
        variant="outline"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <span>{activeTab?.symbol || '📊'}</span>
          <span>{activeTab?.shortLabel || 'Select View'}</span>
        </div>
        <span>▼</span>
      </Button>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-modal z-50">
          <div className="p-1">
            {navigationTabs?.map((tab) => {
              const isActive = tab?.path === location?.pathname;
              return (
                <button
                  key={tab?.id}
                  onClick={() => handleTabChange(tab)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-md text-left
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <span>{tab?.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tab?.label}</div>
                    <div className="text-xs opacity-75 truncate">{tab?.description}</div>
                  </div>
                  {isActive && (
                    <span>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex items-center ${className}`}>
      <DesktopTabs />
      <MobileNavigation />
      
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin">⏳</div>
              <span className="text-sm">Loading view...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabNavigationController;
