import React from 'react';

const PlatformComparisonMatrix = ({ 
  platforms = [], 
  className = '',
  userRole = 'executive'
}) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Determine appropriate columns based on user role
  const getColumns = () => {
    const baseColumns = [
      { id: 'platform', label: 'Platform', renderCell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
            <img src={row.icon} alt={row.name} className="w-6 h-6 object-contain" />
          </div>
          <span className="font-medium">{row.name}</span>
        </div>
      )},
      { id: 'revenue', label: 'Revenue', renderCell: (row) => formatCurrency(row.revenue) },
      { id: 'spend', label: 'Spend', renderCell: (row) => formatCurrency(row.spend) },
      { id: 'roi', label: 'ROI', renderCell: (row) => formatPercentage(row.roi) },
    ];
    
    if (userRole === 'media-buyer') {
      return [
        ...baseColumns,
        { id: 'clicks', label: 'Clicks', renderCell: (row) => formatNumber(row.clicks) },
        { id: 'conversions', label: 'Conversions', renderCell: (row) => formatNumber(row.conversions) },
        { id: 'cpa', label: 'CPA', renderCell: (row) => formatCurrency(row.cpa) },
      ];
    }
    
    return [
      ...baseColumns,
      { id: 'performance', label: 'Performance', renderCell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-success" 
              style={{ width: `${row.performanceScore}%` }}
            ></div>
          </div>
          <span className="text-sm">{row.performanceScore}%</span>
        </div>
      )},
    ];
  };

  const columns = getColumns();

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Platform Performance Comparison</h2>
        <p className="text-sm text-muted-foreground mt-1">Compare metrics across advertising platforms</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40">
              {columns.map((column) => (
                <th key={column.id} className="text-left p-4 text-sm font-medium text-muted-foreground">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => (
              <tr key={platform.id} className="border-b border-border">
                {columns.map((column) => (
                  <td key={`${platform.id}-${column.id}`} className="p-4">
                    {column.renderCell(platform)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {platforms.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No platforms selected. Choose platforms to compare performance.
        </div>
      )}
      
      {platforms.length > 0 && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Showing {platforms.length} platforms</span>
            <button className="text-sm text-primary hover:underline">Export comparison</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformComparisonMatrix;
