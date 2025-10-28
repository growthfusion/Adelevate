
import React, { useEffect, useMemo, useRef, useState } from "react";
// Import platform icons
import metaIcon from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import nbIcon from "@/assets/images/automation_img/NewsBreak.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

function CampaignsTable({ platformFilter = [] }) {
  // Data generation functions
  function makeRows(count = 100) {
    const baseId = 7000;
    const titles = [
      "f1 | atmt | nvn | s29 | atnk | oct14",
      "sam | atmt | s29 | atnk | sep08",
      "AUTO | SNAP | SV1F | RT | NK",
      "Auto | R3 | Meta | SV1F |",
      "ATSPNK | SV1F | MAY10 | LV",
    ];
    
    // Sample platforms for demo - distribute more evenly for better filtering demo
    const platforms = ["google", "facebook", "tiktok", "snap", "newsbreak"];
    
    const rows = [];
    for (let i = 0; i < count; i++) {
      const clicks = Math.floor(Math.random() * 140);
      const lpViews = clicks + Math.floor(Math.random() * 40);
      const lpClicks = Math.max(0, Math.floor(clicks * 0.2) - Math.floor(Math.random() * 4));
      const purchases = Math.floor(Math.random() * 8);
      
      // Set platform in a way that gives even distribution
      const platform = platforms[i % platforms.length];
      
      rows.push({
        id: baseId - i,
        title: titles[i % titles.length],
        platform,
        cost: Math.random() * 100,
        revenue: Math.random() * 150,
        profit: Math.random() * 50 - 10,
        lpCtr: lpClicks && lpViews ? (lpClicks / lpViews) * 100 : Math.random() * 80,
        roi: Math.random() * 200 - 50,
        purchases,
        cpa: purchases ? Math.random() * 50 : 0,
        aov: purchases ? Math.random() * 100 : 0,
        cr: purchases && clicks ? (purchases / clicks) * 100 : Math.random() * 20,
        lpcpc: Math.random() * 2,
        lpepc: Math.random() * 3,
        clicks,
        lpViews,
        lpClicks,
      });
    }
    return rows;
  }

  const columns = [
    { id: "id", label: "#", numeric: true },
    { id: "title", label: "Campaign Title", numeric: false },
    { id: "cost", label: "Cost", numeric: true, format: (val) => `$${val.toFixed(2)}` },
    { id: "revenue", label: "Revenue", numeric: true, format: (val) => `$${val.toFixed(2)}` },
    { id: "profit", label: "Profit", numeric: true, format: (val) => `$${val.toFixed(2)}` },
    { id: "lpCtr", label: "LP CTR", numeric: true, format: (val) => `${val.toFixed(1)}%` },
    { id: "roi", label: "ROI", numeric: true, format: (val) => `${val.toFixed(1)}%` },
    { id: "purchases", label: "Purchases", numeric: true },
    { id: "cpa", label: "CPA", numeric: true, format: (val) => `$${val.toFixed(2)}` },
    { id: "aov", label: "AOV", numeric: true, format: (val) => `$${val.toFixed(2)}` },
    { id: "cr", label: "Conv. Rate", numeric: true, format: (val) => `${val.toFixed(1)}%` },
    { id: "lpcpc", label: "LPCPC", numeric: true, format: (val) => val.toFixed(2) },
    { id: "lpepc", label: "LP EPC", numeric: true, format: (val) => val.toFixed(2) },
    { id: "clicks", label: "Clicks", numeric: true },
    { id: "lpViews", label: "LP Views", numeric: true },
    { id: "lpClicks", label: "LP Clicks", numeric: true },
  ];

  // State management
  const [data] = useState(() => makeRows(100)); // Reduced count for clearer demo
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [page, setPage] = useState(1);
  const scrollRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [density, setDensity] = useState("standard");
  
  const cellPadding = {
    compact: "px-2 py-1",
    standard: "px-3 py-2",
    comfortable: "px-4 py-3"
  };

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
    clickedColumn: null,
  });

  const isHidden = (i) => hiddenCols.has(i);

  // Handle column sort
  const handleSort = (columnId, columnIndex) => {
    let direction = 'ascending';
    
    if (sortConfig.key === columnId) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({
      key: direction ? columnId : null,
      direction: direction,
      clickedColumn: direction ? columnIndex : null,
    });
  };

  // Platform selection
  const handlePlatformChange = (rowId, platform) => {
    console.log(`Changing row ${rowId} to platform: ${platform}`);
    // This would normally update the data state, but we're using dummy data
    // In a real app, this would call an API to update the campaign platform
  };

  // IMPORTANT: This is where the platform filtering happens
  const filteredData = useMemo(() => {
    console.log("Platform filter:", platformFilter);
    
    // If no platform filter is applied, return all data
    if (!platformFilter || platformFilter.length === 0) {
      return data;
    }
    
    // Otherwise, filter data to only include rows with the selected platform
    return data.filter(row => {
      const matchesPlatform = platformFilter.includes(row.platform);
      return matchesPlatform;
    });
  }, [data, platformFilter]);

  // Apply sorting to the filtered data
  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    
    if (!sortConfig.key || !sortConfig.direction) {
      return dataToSort;
    }
    
    return dataToSort.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Calculate totals
  const totals = useMemo(() => {
    return sortedData.reduce(
      (acc, row) => {
        acc.cost += row.cost;
        acc.revenue += row.revenue;
        acc.profit += row.profit;
        acc.purchases += row.purchases;
        acc.clicks += row.clicks;
        acc.lpViews += row.lpViews;
        acc.lpClicks += row.lpClicks;
        return acc;
      },
      {
        cost: 0,
        revenue: 0,
        profit: 0,
        purchases: 0,
        clicks: 0,
        lpViews: 0,
        lpClicks: 0,
      }
    );
  }, [sortedData]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

  // Effects
  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [rowsPerPage, totalPages, page]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [platformFilter]);

  // Current page slice
  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sortedData]);

  // Menu handlers
  const toggleColumn = (idx) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const showAllColumns = () => setHiddenCols(new Set());
  const hideAllColumns = () => setHiddenCols(
    new Set(Array.from({ length: columns.length }, (_, i) => i))
  );

  const resetTable = () => {
    setHiddenCols(new Set());
    setDensity("standard");
    setRowsPerPage(100);
    setPage(1);
    setOpenMenu(null);
    setSortConfig({ key: null, direction: null, clickedColumn: null });
  };

  // Get sort indicator
  const getSortIndicator = (columnId, columnIndex) => {
    if (sortConfig.key !== columnId) {
      return { icon: '⇅', active: false };
    }
    
    return {
      icon: sortConfig.direction === 'ascending' ? '↑' : '↓',
      active: true,
      ascending: sortConfig.direction === 'ascending'
    };
  };

  // Format profit value with color
  const formatProfitValue = (value) => {
    const isPositive = value >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        ${Math.abs(value).toFixed(2)}
        {isPositive ? '' : '-'}
      </span>
    );
  };

  // Format ROI value with color
  const formatROIValue = (value) => {
    const isPositive = value >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {value.toFixed(1)}%
      </span>
    );
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'google': return googleIcon;
      case 'facebook': return metaIcon;
      case 'tiktok': return tiktokIcon;
      case 'snap': return snapchatIcon;
      case 'newsbreak': return nbIcon;
      default: return null;
    }
  };

  // Platform selection dropdown for individual rows
  const PlatformSelector = ({ row }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    
    const platforms = [
      { id: "google", name: "Google", icon: googleIcon },
      { id: "facebook", name: "Facebook", icon: metaIcon },
      { id: "tiktok", name: "TikTok", icon: tiktokIcon },
      { id: "snap", name: "Snapchat", icon: snapchatIcon },
      { id: "newsbreak", name: "NewsBreak", icon: nbIcon }
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-gray-700"
        >
          <img src={getPlatformIcon(row.platform)} alt={row.platform} className="h-5 w-5" />
          <span className="sr-only">Change platform</span>
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded bg-white shadow-lg border border-gray-200">
              <div className="p-1">
                <div className="p-2 text-sm text-gray-500 border-b border-gray-100">
                  Select platform
                </div>
                {platforms.map(platform => (
                  <label 
                    key={platform.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={row.platform === platform.id}
                      onChange={() => {
                        handlePlatformChange(row.id, platform.id);
                        setShowDropdown(false);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <img src={platform.icon} alt={platform.name} className="h-6 w-6" />
                    <span className="text-sm">{platform.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Count campaigns by platform for display
  const platformCounts = useMemo(() => {
    const counts = {};
    data.forEach(row => {
      counts[row.platform] = (counts[row.platform] || 0) + 1;
    });
    return counts;
  }, [data]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>
           
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Columns Menu */}
            <div className="relative">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => setOpenMenu((m) => (m === "columns" ? null : "columns"))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Columns
              </button>
              {openMenu === "columns" && (
                <div className="absolute right-0 z-30 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex justify-between gap-2">
                      <button 
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                        onClick={showAllColumns}
                      >
                        Show All
                      </button>
                      <button 
                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded"
                        onClick={hideAllColumns}
                      >
                        Hide All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto px-2">
                    {columns.map((column, idx) => (
                      <label key={column.id} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(idx)}
                          onChange={() => toggleColumn(idx)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Density Menu */}
            <div className="relative">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                onClick={() => setOpenMenu((m) => (m === "density" ? null : "density"))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Density
              </button>
              {openMenu === "density" && (
                <div className="absolute right-0 z-30 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-2">
                  {["compact", "standard", "comfortable"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="density"
                        checked={density === opt}
                        onChange={() => setDensity(opt)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              onClick={resetTable}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div ref={scrollRef} className="overflow-auto max-h-[70vh]">
        <div className="min-w-[1800px] lg:w-full">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr className="border-b border-gray-200">
                {columns.map((column, idx) => {
                  const sortIndicator = getSortIndicator(column.id, idx);
                  
                  return (
                    <th
                      key={column.id}
                      onClick={() => handleSort(column.id, idx)}
                      className={`
                        ${cellPadding[density]} 
                        text-sm font-semibold text-gray-900 
                        cursor-pointer select-none 
                        hover:bg-gray-200 
                        transition-colors duration-150
                        ${idx === 0 ? "w-16 text-center" : ""}
                        ${idx === 1 ? "w-80 text-left" : ""}
                        ${column.numeric ? "text-right" : "text-left"}
                        ${isHidden(idx) ? "hidden" : ""}
                        ${sortConfig.clickedColumn === idx ? "bg-blue-50" : ""}
                      `}
                    >
                      <div className="flex items-center justify-between group">
                        <span className="truncate">{column.label}</span>
                        <span className={`
                          ml-2 text-xs transition-colors
                          ${sortIndicator.active 
                            ? sortIndicator.ascending 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            : 'text-gray-400 group-hover:text-gray-600'
                          }
                        `}>
                          {sortIndicator.icon}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Totals Row */}
              <tr className="bg-blue-50 font-medium">
                <td className={`${cellPadding[density]} text-center text-sm text-gray-600 ${isHidden(0) ? "hidden" : ""}`}>

No                </td>
                <td className={`${cellPadding[density]} font-bold text-sm text-gray-900 ${isHidden(1) ? "hidden" : ""}`}>
                  Total Summary
                </td>
                <td className={`${cellPadding[density]} text-right text-sm font-semibold text-gray-900 ${isHidden(2) ? "hidden" : ""}`}>
                  ${totals.cost.toFixed(2)}
                </td>
                <td className={`${cellPadding[density]} text-right text-sm font-semibold text-gray-900 ${isHidden(3) ? "hidden" : ""}`}>
                  ${totals.revenue.toFixed(2)}
                </td>
                <td className={`${cellPadding[density]} text-right text-sm ${isHidden(4) ? "hidden" : ""}`}>
                  {formatProfitValue(totals.profit)}
                </td>
                <td className={`${cellPadding[density]} text-right text-sm font-semibold text-gray-900 ${isHidden(5) ? "hidden" : ""}`}>
                  {totals.lpClicks && totals.lpViews ? ((totals.lpClicks / totals.lpViews) * 100).toFixed(1) : "0.0"}%
                </td>
                <td className={`${cellPadding[density]} text-right text-sm ${isHidden(6) ? "hidden" : ""}`}>
                  {totals.cost ? formatROIValue((totals.profit / totals.cost) * 100) : <span className="text-gray-500">0.0%</span>}
                </td>
                {columns.slice(7).map((column, idx) => {
                  const realIdx = idx + 7;
                  let value;
                  
                  switch(column.id) {
                    case 'purchases': value = totals.purchases; break;
                    case 'cpa': value = totals.purchases ? (totals.cost / totals.purchases) : 0; break;
                    case 'aov': value = totals.purchases ? (totals.revenue / totals.purchases) : 0; break;
                    case 'cr': value = totals.clicks && totals.purchases ? ((totals.purchases / totals.clicks) * 100) : 0; break;
                    case 'lpcpc': value = totals.lpClicks ? (totals.cost / totals.lpClicks) : 0; break;
                    case 'lpepc': value = totals.lpClicks ? (totals.revenue / totals.lpClicks) : 0; break;
                    case 'clicks': value = totals.clicks; break;
                    case 'lpViews': value = totals.lpViews; break;
                    case 'lpClicks': value = totals.lpClicks; break;
                    default: value = 0;
                  }
                  
                  const formattedValue = column.format ? column.format(value) : value;
                  
                  return (
                    <td key={column.id} className={`${cellPadding[density]} text-right text-sm font-semibold text-gray-900 ${isHidden(realIdx) ? "hidden" : ""}`}>
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>

              {/* Data Rows */}
              {pageRows.length > 0 ? (
                pageRows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={`
                      transition-colors duration-150 hover:bg-gray-50
                      ${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    `}
                  >
                    <td className={`${cellPadding[density]} text-center text-sm text-gray-600 font-mono ${isHidden(0) ? "hidden" : ""}`}>
                      {row.id}
                    </td>
                    <td className={`${cellPadding[density]} text-sm text-gray-900 ${isHidden(1) ? "hidden" : ""}`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 mr-3">
                          <PlatformSelector row={row} />
                        </div>
                        <div className="truncate font-medium" title={row.title}>
                          {row.title}
                        </div>
                      </div>
                    </td>
                    {columns.slice(2).map((column, idx) => {
                      const realIdx = idx + 2;
                      const value = row[column.id];
                      let formattedValue;
                      
                      // Special formatting for profit and ROI
                      if (column.id === 'profit') {
                        formattedValue = formatProfitValue(value);
                      } else if (column.id === 'roi') {
                        formattedValue = formatROIValue(value);
                      } else {
                        formattedValue = column.format ? column.format(value) : value;
                      }
                      
                      return (
                        <td 
                          key={column.id}
                          className={`${cellPadding[density]} text-right text-sm text-gray-900 ${isHidden(realIdx) ? "hidden" : ""}`}
                        >
                          {formattedValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                    No campaigns found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Rows per page:</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v)) setPage(Math.min(totalPages, Math.max(1, v)));
                }}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-700">of {totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {openMenu && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
}

export default CampaignsTable;
