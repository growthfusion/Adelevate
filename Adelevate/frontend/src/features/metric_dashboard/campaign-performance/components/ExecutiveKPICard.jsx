import React from 'react';

const ExecutiveKPICard = ({
  title,
  value,
  change,
  changeType = "neutral",
  trend = [],
  className = ""
}) => {
  // Determine the color for the change indicator
  const changeColorClass = 
    changeType === "positive" ? "text-success" :
    changeType === "negative" ? "text-destructive" :
    "text-muted-foreground";
  
  // Generate trend path if data is provided
  const renderTrendline = () => {
    if (!trend || trend.length === 0) return null;
    
    // Normalize the trend data for display
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min;
    const height = 24; // height of our trend visualization
    
    // Map the data points to path coordinates
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    // Determine color based on metric type
    const getColor = () => {
      switch (title.toLowerCase()) {
        case 'amount spent':
          return 'rgba(200, 210, 255, 0.5)'; // light blue
        case 'revenue':
        case 'revenue generated':
          return 'rgba(200, 255, 210, 0.5)'; // light green
        case 'net':
        case 'net profit':
          return 'rgba(180, 240, 240, 0.5)'; // light teal
        case 'roi':
          return 'rgba(255, 245, 210, 0.5)'; // light yellow
        case 'clicks':
          return 'rgba(210, 210, 255, 0.5)'; // light blue
        case 'conversions':
          return 'rgba(255, 210, 230, 0.5)'; // light pink
        case 'cpa':
          return 'rgba(255, 210, 210, 0.5)'; // light red
        case 'epc':
          return 'rgba(255, 240, 180, 0.5)'; // light yellow
        default:
          return 'rgba(220, 220, 220, 0.5)'; // light gray
      }
    };
    
    return (
      <div className="h-6 mt-auto">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 24">
          <path
            d={`M0,${height} ${points} 100,${height}`}
            fill={getColor()}
            strokeWidth="0"
          />
          <polyline
            points={points}
            fill="none"
            stroke={getColor().replace('0.5', '0.8')}
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  };
  
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">{title}</div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <div className={`text-sm font-medium ${changeColorClass}`}>
              {change}
            </div>
          )}
        </div>
        
        {renderTrendline()}
      </div>
    </div>
  );
};

export default ExecutiveKPICard;
