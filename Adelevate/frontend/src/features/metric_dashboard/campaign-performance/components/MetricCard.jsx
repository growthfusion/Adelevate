import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts';

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Platform icons mapping
const platformIcons = {
  'google-ads': googleIcon,
  'facebook': fb,
  'tiktok': tiktokIcon,
  'snapchat': snapchatIcon,
  'newsbreak': nb
};

// Platform display names
const platformNames = {
  'google-ads': 'Google',
  'facebook': 'Facebook',
  'tiktok': 'TikTok',
  'snapchat': 'Snapchat',
  'newsbreak': 'NewsBreak'
};

const MediaBuyerDashboard = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [showCompare, setShowCompare] = useState(false);
  const [compareWith, setCompareWith] = useState('previous');
  
  // Sample data - replace with your actual data
  const metricsData = {
    'amount_spent': {
      title: 'Amount Spent',
      value: 312587,
      change: 8.2,
      changeType: 'positive',
      format: 'currency',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 128500,
        'facebook': 98750,
        'tiktok': 45200,
        'snapchat': 26137,
        'newsbreak': 14000
      }
    },
    'revenue': {
      title: 'Revenue',
      value: 346839,
      change: 12.5,
      changeType: 'positive',
      format: 'currency',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 142500,
        'facebook': 110250,
        'tiktok': 54300,
        'snapchat': 25789,
        'newsbreak': 14000
      }
    },
    'net': {
      title: 'Net',
      value: 34251,
      change: 15.8,
      changeType: 'positive',
      format: 'currency',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 14000,
        'facebook': 11500,
        'tiktok': 9100,
        'snapchat': -348,
        'newsbreak': 0
      }
    },
    'roi': {
      title: 'ROI',
      value: 10.96,
      change: 4.2,
      changeType: 'positive',
      format: 'percentage',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 12.5,
        'facebook': 11.65,
        'tiktok': 9.87,
        'snapchat': 8.23,
        'newsbreak': 7.5
      }
    },
    'clicks': {
      title: 'Clicks',
      value: 210113,
      change: 5.7,
      changeType: 'positive',
      format: 'number',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 84050,
        'facebook': 63033,
        'tiktok': 35720,
        'snapchat': 18310,
        'newsbreak': 9000
      }
    },
    'conversions': {
      title: 'Conversions',
      value: 27136,
      change: 7.3,
      changeType: 'positive',
      format: 'number',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 12500,
        'facebook': 8450,
        'tiktok': 3600,
        'snapchat': 1856,
        'newsbreak': 730
      }
    },
    'cpa': {
      title: 'CPA',
      value: 11.51,
      change: 2.1,
      changeType: 'negative', // lower CPA is better
      format: 'currency',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 10.28,
        'facebook': 11.68,
        'tiktok': 12.56,
        'snapchat': 14.08,
        'newsbreak': 19.18
      }
    },
    'epc': {
      title: 'EPC',
      value: 1.65,
      change: 3.2,
      changeType: 'positive',
      format: 'currency',
      sparklineData: generateSparklineData(30),
      platformBreakdown: {
        'google-ads': 1.85,
        'facebook': 1.75,
        'tiktok': 1.52,
        'snapchat': 1.41,
        'newsbreak': 1.12
      }
    }
  };
  
  // Platform options
  const platformOptions = [
    { id: 'all', name: 'All Platforms' },
    { id: 'google-ads', name: 'Google' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'snapchat', name: 'Snapchat' },
    { id: 'newsbreak', name: 'NewsBreak' }
  ];

  const dateRangeOptions = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="p-6 max-w-7xl">
     
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        {/* Platform selection tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {platformOptions.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedPlatform === platform.id 
                  ? 'bg-primary/10 text-primary border-primary border' 
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
            >
              {platform.id !== 'all' && platformIcons[platform.id] && (
                <img 
                  src={platformIcons[platform.id]} 
                  alt={platform.name} 
                  className="w-4 h-4 inline mr-2" 
                />
              )}
              {platform.name}
            </button>
          ))}
        </div>
        
        {/* Date range and filters */}
      
      </div>
      
      {/* Comparison options */}
    
      
      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-[150%] 2xl:w-[300%] ">
        {Object.entries(metricsData).map(([key, metric]) => (
          <MetricCard
            key={key}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            sparklineData={metric.sparklineData}
            format={metric.format}
            platformBreakdown={metric.platformBreakdown}
            selectedPlatform={selectedPlatform}
            metricKey={key}
          />
        ))}
      </div>
      
      {/* Additional actions */}
      {/* <div className="mt-6 flex justify-end space-x-3">
        <button className="px-3 py-2 border rounded text-sm flex items-center text-gray-700 hover:bg-gray-50">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
        
      </div> */}
    </div>
  );
};

// Enhanced MetricCard component with graph variations
const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  sparklineData, 
  format = 'number',
  platformBreakdown = {},
  selectedPlatform = 'all',
  metricKey
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatValue = (val) => {
    if (format === 'currency') {
      if (val >= 1000) {
        return `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      return `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (format === 'percentage') {
      return `${val}%`;
    } else if (format === 'decimal') {
      return parseFloat(val).toFixed(2);
    }
    return val?.toLocaleString();
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-500';
    if (changeType === 'negative') return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeSymbol = () => {
    if (changeType === 'positive') return '↑';
    if (changeType === 'negative') return '↓';
    return '−';
  };

  // Get platform-specific value if a specific platform is selected
  const displayValue = selectedPlatform !== 'all' && platformBreakdown[selectedPlatform] 
    ? platformBreakdown[selectedPlatform] 
    : value;

  // Get card color based on metric type
  const getCardColor = () => {
    switch(metricKey) {
      case 'amount_spent': return 'bg-blue-50 hover:bg-blue-100';
      case 'revenue': return 'bg-green-50 hover:bg-green-100';
      case 'net': return 'bg-teal-50 hover:bg-teal-100';
      case 'roi': return 'bg-yellow-50 hover:bg-yellow-100';
      case 'clicks': return 'bg-indigo-50 hover:bg-indigo-100';
      case 'conversions': return 'bg-pink-50 hover:bg-pink-100';
      case 'cpa': return 'bg-red-50 hover:bg-red-100';
      case 'epc': return 'bg-orange-50 hover:bg-orange-100';
      default: return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  // Get graph color based on metric type
  const getGraphColor = () => {
    switch(metricKey) {
      case 'amount_spent': return '#3B82F6';
      case 'revenue': return '#10B981';
      case 'net': return '#14B8A6';
      case 'roi': return '#FBBF24';
      case 'clicks': return '#6366F1';
      case 'conversions': return '#EC4899';
      case 'cpa': return '#EF4444';
      case 'epc': return '#F97316';
      default: return '#6B7280';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 shadow-sm ${getCardColor()} transition-all cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start mb-1 ">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {selectedPlatform !== 'all' && (
          <div className="flex items-center">
            <img 
              src={platformIcons[selectedPlatform]} 
              alt={platformNames[selectedPlatform]} 
              className="w-4 h-4 mr-1" 
            />
            <span className="text-xs text-gray-500">{platformNames[selectedPlatform]}</span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold mb-2">
        {formatValue(displayValue)}
      </div>
      
      <div className="flex items-center text-xs mb-3">
        <span className={`${getChangeColor()} font-medium flex items-center`}>
          {getChangeSymbol()} {Math.abs(change)}%
        </span>
        
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`colorGraph-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getGraphColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getGraphColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={getGraphColor()}
              fillOpacity={1}
              fill={`url(#colorGraph-${metricKey})`}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Show platform breakdown if viewing "All Platforms" and card is expanded */}
      {expanded && selectedPlatform === 'all' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Platform Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(platformBreakdown).map(([platform, platformValue]) => (
              <div key={platform} className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  {platformIcons[platform] && (
                    <img 
                      src={platformIcons[platform]} 
                      alt={platformNames[platform]} 
                      className="w-4 h-4 mr-1" 
                    />
                  )}
                  <span>{platformNames[platform]}</span>
                </div>
                <span className="font-medium">{formatValue(platformValue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate dummy sparkline data
function generateSparklineData(days) {
  return Array.from({ length: days }, (_, i) => ({
    day: i + 3,
    value: Math.floor(Math.random() * 100) + 50
  }));
}

export default MediaBuyerDashboard;
