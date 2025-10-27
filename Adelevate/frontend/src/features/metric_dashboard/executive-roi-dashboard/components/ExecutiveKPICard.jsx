import React from 'react';

const ExecutiveKPICard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color = 'primary',
  subtitle,
  trend = []
}) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: 'from-blue-500 to-blue-600 text-white',
      success: 'from-green-500 to-green-600 text-white',
      warning: 'from-yellow-500 to-yellow-600 text-white',
      error: 'from-red-500 to-red-600 text-white',
      info: 'from-cyan-500 to-cyan-600 text-white'
    };
    return colors?.[color] || colors?.primary;
  };

  const getChangeColor = (type) => {
    if (type === 'positive') return 'text-green-100';
    if (type === 'negative') return 'text-red-100';
    return 'text-gray-100';
  };

  // Helper function to get change symbol as text
  const getChangeSymbol = (type) => {
    if (type === 'positive') return '↑';
    if (type === 'negative') return '↓';
    return '−';
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getColorClasses(color)} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
        <div className="absolute -left-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />
      </div>
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center">
            {/* Placeholder for icon */}
            <div className="w-6 h-6"></div>
          </div>
          {change && (
            <div className={`flex items-center space-x-1 ${getChangeColor(changeType)}`}>
              <span className="font-bold">{getChangeSymbol(changeType)}</span>
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-white/80 text-sm font-medium uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-3xl font-bold text-white">
            {value}
          </div>
          {subtitle && (
            <p className="text-white/70 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Mini Trend Line */}
        {trend?.length > 0 && (
          <div className="mt-4 flex items-end space-x-1 h-8">
            {trend?.map((point, index) => (
              <div
                key={index}
                className="bg-white/30 rounded-sm flex-1"
                style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveKPICard;
