import { useEffect, useMemo, useRef, useState } from "react"
import nb from "@/assets/images/automation_img/NewsBreak.svg"
import fb from "@/assets/images/automation_img/Facebook.svg"
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg"
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg"
import googleIcon from "@/assets/images/automation_img/google.svg"

// Platform Icon Component
function PlatformIcon({ platform }) {
  const platformIconsMap = {
    google: googleIcon,
    facebook: fb,
    tiktok: tiktokIcon,
    snap: snapchatIcon,
    newsbreak: nb,
  }

  const iconSrc = platformIconsMap[platform]

  if (!iconSrc) {
    return <span className="w-5 h-5 inline-block">?</span>
  }

  return <img src={iconSrc} alt={`${platform} icon`} className="w-5 h-5" />
}

function CampaignsTable({ filters = {} }) {
  function makeRows(count = 100) {
    const baseId = 7000
    const titles = [
      "f1 | atmt | nvn | s29 | atnk | oct14",
      "HomeService | Google | Homefixpro | 23OCT | arbu",
      "AUTO | SNAP | SV1F | RT | NK",
      "Auto | R3 | Meta | SV1F",
      "SW Mx | Meta | Everydaydeals | 25 OCT | eubla",
      "Auto | Meta | Autoinsurancesaver | 27 OCT | multicar",
      "Homeinsurance | Newsbreak | HomeShieldplus | 27 OCT | lphome",
    ]

    const platforms = ["google", "facebook", "tiktok", "snap", "newsbreak"]

    const rows = []
    for (let i = 0; i < count; i++) {
      const clicks = Math.floor(Math.random() * 140)
      const lpViews = clicks + Math.floor(Math.random() * 40)
      const lpClicks = Math.max(0, Math.floor(clicks * 0.2) - Math.floor(Math.random() * 4))
      const purchases = Math.floor(Math.random() * 8)

      rows.push({
        id: baseId - i,
        title: titles[i % titles.length],
        platform: platforms[i % platforms.length],
        tag: ["Mythili" , "Naga" , "Shanker" , "Ramanan" , "Jai" , "ArunS" , "naveen" , "Ashwin" , "Raju" , "Sudhanshu" ,"Hari" , "Gokulraj" ][i % 12],
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
      })
    }
    return rows
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
  ]

  const [rawData] = useState(() => makeRows(100))
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [page, setPage] = useState(1)
  const scrollRef = useRef(null)
  const [openMenu, setOpenMenu] = useState(null)
  const [hiddenCols, setHiddenCols] = useState(new Set())
  const [density, setDensity] = useState("standard")
  const [columnSelectionOrder, setColumnSelectionOrder] = useState([])

  // Column order and width management
  const [columnOrder, setColumnOrder] = useState(() => columns.map((_, i) => i))
  const [columnWidths, setColumnWidths] = useState(() => {
    const widths = {}
    columns.forEach((col, i) => {
      if (i === 0) widths[col.id] = 60 // ID column
      else if (i === 1) widths[col.id] = 300 // Title column
      else widths[col.id] = 120 // Other columns
    })
    return widths
  })

  // Column resize and drag state
  const [resizing, setResizing] = useState(null)
  const [draggedColumn, setDraggedColumn] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // Enhanced row background coloring based on profit value - with more gradient levels
  const getRowBackgroundColor = (profit) => {
    // Green shades for positive profit (5 levels)
    if (profit > 40) return "bg-green-400 hover:bg-green-500"; // Extremely high profit
    if (profit > 30) return "bg-green-300 hover:bg-green-400"; // Very high profit
    if (profit > 20) return "bg-green-200 hover:bg-green-300"; // High profit
    if (profit > 10) return "bg-green-100 hover:bg-green-200"; // Medium profit
    if (profit > 0) return "bg-green-50 hover:bg-green-100";   // Low positive profit

    // Red shades for negative profit (5 levels)
    if (profit < -40) return "bg-red-400 hover:bg-red-500";    // Extremely high loss
    if (profit < -30) return "bg-red-300 hover:bg-red-400";    // Very high loss
    if (profit < -20) return "bg-red-200 hover:bg-red-300";    // High loss
    if (profit < -10) return "bg-red-100 hover:bg-red-200";    // Medium loss
    if (profit < 0) return "bg-red-50 hover:bg-red-100";       // Low negative profit

    // Neutral
    return "bg-white hover:bg-gray-50";                        // Zero/neutral profit
  };

  // Sort columns based on selection order
  const sortedColumnOrder = useMemo(() => {
    if (columnSelectionOrder.length === 0) return columnOrder;

    // Get all visible columns
    const visibleColumns = columnOrder.filter(idx => !hiddenCols.has(idx));

    // Sort visible columns based on selection order (most recently selected first)
    return [...visibleColumns].sort((a, b) => {
      const indexA = columnSelectionOrder.indexOf(a);
      const indexB = columnSelectionOrder.indexOf(b);

      // If both columns are in selection order, prioritize most recent
      if (indexA !== -1 && indexB !== -1) return indexB - indexA;

      // If only one is in selection order, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Otherwise maintain original order
      return columnOrder.indexOf(a) - columnOrder.indexOf(b);
    });
  }, [columnOrder, columnSelectionOrder, hiddenCols]);

  // Handle column resize with mouse movements
  useEffect(() => {
    if (resizing === null) return

    const handleMouseMove = (e) => {
      e.preventDefault()
      setColumnWidths(prev => ({
        ...prev,
        [resizing.id]: Math.max(60, resizing.startWidth + (e.clientX - resizing.startX))
      }))
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing])

  // Load saved column configuration from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('campaignTableConfig')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        setColumnOrder(config.order)
        setColumnWidths(config.widths)
        setHiddenCols(new Set(config.hidden))
      }
    } catch (error) {
      console.error('Error loading saved table configuration', error)
    }
  }, [])

  // Save column configuration to localStorage
  const saveColumnConfiguration = () => {
    const config = {
      order: columnOrder,
      widths: columnWidths,
      hidden: Array.from(hiddenCols)
    }
    localStorage.setItem('campaignTableConfig', JSON.stringify(config))
  }

  const cellPadding = {
    compact: "px-2 py-1",
    standard: "px-3 py-2",
    comfortable: "px-4 py-3",
  }

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
    clickedColumn: null,
  })

  // Enhanced toggle column function with selection tracking
  const toggleColumn = (idx) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        // Column is being shown again
        next.delete(idx);
        // Add to selection order
        setColumnSelectionOrder(prevOrder => [...prevOrder, idx]);
      } else {
        // Column is being hidden
        next.add(idx);
        // Remove from selection order
        setColumnSelectionOrder(prevOrder => prevOrder.filter(i => i !== idx));
      }
      return next;
    });
  };

  const isHidden = (i) => hiddenCols.has(i)

  const filteredData = useMemo(() => {
    let result = [...rawData]

    // Filter by platforms
    if (filters.platforms && filters.platforms.length > 0) {
      result = result.filter((row) => filters.platforms.includes(row.platform))
    }

    // Filter by title (case-insensitive search)
    if (filters.title && filters.title.trim()) {
      const searchTerm = filters.title.toLowerCase()
      result = result.filter((row) => row.title.toLowerCase().includes(searchTerm))
    }

    if (filters.tags && filters.tags.trim()) {
      const searchTerm = filters.tags.toLowerCase()
      result = result.filter((row) => row.tag.toLowerCase().includes(searchTerm))
    }

    return result
  }, [rawData, filters])

  // Handle column sort
  const handleSort = (columnId, columnIndex) => {
    let direction = "ascending"

    if (sortConfig.key === columnId) {
      if (sortConfig.direction === "ascending") {
        direction = "descending"
      } else if (sortConfig.direction === "descending") {
        direction = null
      }
    }

    setSortConfig({
      key: direction ? columnId : null,
      direction: direction,
      clickedColumn: direction ? columnIndex : null,
    })
  }

  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData]

    if (!sortConfig.key || !sortConfig.direction) {
      return dataToSort
    }

    return dataToSort.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Calculate totals from filtered data
  const totals = useMemo(() => {
    return sortedData.reduce(
        (acc, row) => {
          acc.cost += row.cost
          acc.revenue += row.revenue
          acc.profit += row.profit
          acc.purchases += row.purchases
          acc.clicks += row.clicks
          acc.lpViews += row.lpViews
          acc.lpClicks += row.lpClicks
          return acc
        },
        {
          cost: 0,
          revenue: 0,
          profit: 0,
          purchases: 0,
          clicks: 0,
          lpViews: 0,
          lpClicks: 0,
        },
    )
  }, [sortedData])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage))

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages))
  }, [rowsPerPage, totalPages, page])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return sortedData.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, sortedData])

  const showAllColumns = () => {
    setHiddenCols(new Set());
    // Clear selection order when showing all
    setColumnSelectionOrder([]);
  }

  const hideAllColumns = () => setHiddenCols(new Set(Array.from({ length: columns.length }, (_, i) => i)))

  // Enhanced reset function
  const resetTable = () => {
    setHiddenCols(new Set())
    setDensity("standard")
    setRowsPerPage(100)
    setPage(1)
    setOpenMenu(null)
    setSortConfig({ key: null, direction: null, clickedColumn: null })
    setColumnSelectionOrder([]) // Reset column selection order

    // Reset column order and widths
    setColumnOrder(columns.map((_, i) => i))
    const defaultWidths = {}
    columns.forEach((col, i) => {
      if (i === 0) defaultWidths[col.id] = 60 // ID column
      else if (i === 1) defaultWidths[col.id] = 300 // Title column
      else defaultWidths[col.id] = 120 // Other columns
    })
    setColumnWidths(defaultWidths)
  }

  const getSortIndicator = (columnId, columnIndex) => {
    if (sortConfig.key !== columnId) {
      return { icon: "⇅", active: false }
    }

    return {
      icon: sortConfig.direction === "ascending" ? "↑" : "↓",
      active: true,
      ascending: sortConfig.direction === "ascending",
    }
  }

  // Enhanced profit formatting with better color gradient
  const formatProfitValue = (value) => {
    const isPositive = value >= 0;
    let colorClass;

    // More granular color classes for profit values
    if (isPositive) {
      if (value > 40) colorClass = "text-green-800";
      else if (value > 30) colorClass = "text-green-700";
      else if (value > 20) colorClass = "text-green-600";
      else if (value > 10) colorClass = "text-green-500";
      else colorClass = "text-green-400";
    } else {
      if (value < -40) colorClass = "text-red-800";
      else if (value < -30) colorClass = "text-red-700";
      else if (value < -20) colorClass = "text-red-600";
      else if (value < -10) colorClass = "text-red-500";
      else colorClass = "text-red-400";
    }

    return (
        <span className={`font-medium ${colorClass}`}>
        ${Math.abs(value).toFixed(2)}
      </span>
    );
  };

  // Enhanced ROI formatting with better color gradient
  const formatROIValue = (value) => {
    const isPositive = value >= 0;
    let colorClass;

    // More granular color classes for ROI values
    if (isPositive) {
      if (value > 150) colorClass = "text-green-800";
      else if (value > 100) colorClass = "text-green-700";
      else if (value > 50) colorClass = "text-green-600";
      else if (value > 25) colorClass = "text-green-500";
      else colorClass = "text-green-400";
    } else {
      if (value < -100) colorClass = "text-red-800";
      else if (value < -75) colorClass = "text-red-700";
      else if (value < -50) colorClass = "text-red-600";
      else if (value < -25) colorClass = "text-red-500";
      else colorClass = "text-red-400";
    }

    return <span className={`font-medium ${colorClass}`}>{value.toFixed(1)}%</span>;
  };

  // Get cell value from a row based on column ID
  const getCellValue = (row, columnId) => {
    const value = row[columnId];
    const column = columns.find(col => col.id === columnId);

    if (columnId === "profit") {
      return formatProfitValue(value);
    } else if (columnId === "roi") {
      return formatROIValue(value);
    } else if (column && column.format) {
      return column.format(value);
    }

    return value;
  }

  return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Campaign Analytics</h2>

              {/* Filter status */}
              {(filters.platforms?.length > 0 || filters.title || filters.tags) && (
                  <div className="mt-2 text-sm text-gray-500">
                    {filters.platforms?.length > 0 && `Platforms: ${filters.platforms.join(", ")} • `}
                    {filters.title && `Title: "${filters.title}" • `}
                    {filters.tags && `Tags: "${filters.tags}"`}
                  </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Columns Menu */}
              <div className="relative">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                    onClick={() => setOpenMenu((m) => (m === "columns" ? null : "columns"))}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"
                    />
                  </svg>
                  Columns
                </button>
                {openMenu === "columns" && (
                    <div className="absolute right-0 z-30 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex justify-between gap-2">
                          <button
                              type="button"
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                              onClick={showAllColumns}
                          >
                            Show All
                          </button>
                          <button
                              type="button"
                              className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded"
                              onClick={hideAllColumns}
                          >
                            Hide All
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-auto px-2">
                        {columns.map((column, idx) => (
                            <label
                                key={column.id}
                                className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
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
                    type="button"
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
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                  onClick={resetTable}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Table
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div ref={scrollRef} className="overflow-auto max-h-[70vh]">
          <div className="min-w-[1200px] lg:w-full">
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-100">
              <tr className="border-t border-gray-200">
                {sortedColumnOrder.map((colIdx) => {
                  if (isHidden(colIdx)) return null;
                  const column = columns[colIdx];
                  const sortIndicator = getSortIndicator(column.id, colIdx);

                  return (
                      <th
                          key={column.id}
                          className={`
                        ${cellPadding[density]} 
                        text-sm font-semibold text-gray-900 
                        select-none 
                        hover:bg-gray-200 
                        transition-colors duration-150
                        relative
                        border-r border-gray-300
                        ${column.numeric ? "text-right" : "text-left"}
                        ${colIdx === dragOverColumn ? 'border-l-2 border-blue-500' : ''}
                        ${draggedColumn === colIdx ? 'opacity-50 bg-blue-100' : ''}
                        ${sortConfig.clickedColumn === colIdx ? "bg-blue-50" : ""}
                      `}
                          style={{
                            width: `${columnWidths[column.id]}px`,
                            cursor: resizing ? 'col-resize' : 'grab'
                          }}
                          onClick={(e) => {
                            // Only sort when not resizing
                            if (!resizing) handleSort(column.id, colIdx);
                          }}
                          draggable="true"
                          onDragStart={(e) => {
                            setDraggedColumn(colIdx);
                            // Set data for drag operation
                            e.dataTransfer.setData('text/plain', column.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggedColumn !== null && draggedColumn !== colIdx) {
                              setDragOverColumn(colIdx);
                            }
                          }}
                          onDragLeave={() => setDragOverColumn(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedColumn !== null && draggedColumn !== colIdx) {
                              // Reorder columns
                              setColumnOrder(prev => {
                                const newOrder = [...prev];
                                const draggedIdx = newOrder.indexOf(draggedColumn);
                                const targetIdx = newOrder.indexOf(colIdx);
                                newOrder.splice(draggedIdx, 1);
                                newOrder.splice(targetIdx, 0, draggedColumn);
                                return newOrder;
                              });
                            }
                            setDraggedColumn(null);
                            setDragOverColumn(null);
                          }}
                          onDragEnd={() => {
                            setDraggedColumn(null);
                            setDragOverColumn(null);
                          }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{column.label}</span>
                          <span className={`
                          ml-2 text-xs transition-colors
                          ${sortIndicator.active
                              ? sortIndicator.ascending
                                  ? "text-green-600"
                                  : "text-red-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          }
                        `}>
                          {sortIndicator.icon}
                        </span>
                        </div>

                        {/* Resizing handle */}
                        <div
                            className="absolute top-0 right-0 w-4 h-full cursor-col-resize group"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const startX = e.clientX;
                              const startWidth = columnWidths[column.id];
                              setResizing({ id: column.id, startX, startWidth });
                            }}
                        >
                          <div className="absolute right-0 w-1 h-full opacity-0 group-hover:opacity-100 bg-blue-400"></div>
                        </div>
                      </th>
                  );
                })}
              </tr>
              </thead>
              <tbody className="bg-white">
              {/* Totals Row */}
              <tr className="bg-gray-100 border-b-2 border-gray-300 font-medium">
                {sortedColumnOrder.map((colIdx) => {
                  if (isHidden(colIdx)) return null;
                  const column = columns[colIdx];

                  // Render the appropriate total content for each column
                  let content;
                  if (column.id === "id") {
                    content = ""; // Empty for ID column
                  } else if (column.id === "title") {
                    content = <div className="flex items-center gap-2">
                      <span>Total:</span>
                    </div>;
                  } else if (column.id === "cost") {
                    content = `$ ${totals.cost.toFixed(2)}`;
                  } else if (column.id === "revenue") {
                    content = `$ ${totals.revenue.toFixed(2)}`;
                  } else if (column.id === "profit") {
                    const profitClass = totals.profit > 0 ? "text-green-700" : "text-red-700";
                    content = <span className={`${profitClass} font-bold`}>$ {Math.abs(totals.profit).toFixed(2)}</span>;
                  } else if (column.id === "lpCtr") {
                    content = `${totals.lpClicks && totals.lpViews
                        ? ((totals.lpClicks / totals.lpViews) * 100).toFixed(1)
                        : "0.0"}%`;
                  } else if (column.id === "roi") {
                    const roiValue = totals.cost ? ((totals.profit / totals.cost) * 100) : 0;
                    const roiClass = roiValue > 0 ? "text-green-700" : "text-red-700";
                    content = <span className={`${roiClass} font-bold`}>{roiValue.toFixed(1)}%</span>;
                  } else if (column.id === "purchases") {
                    content = totals.purchases;
                  } else if (column.id === "cpa") {
                    content = `$${totals.purchases ? (totals.cost / totals.purchases).toFixed(2) : "0.00"}`;
                  } else if (column.id === "aov") {
                    content = `$${totals.purchases ? (totals.revenue / totals.purchases).toFixed(2) : "0.00"}`;
                  } else if (column.id === "cr") {
                    content = `${totals.clicks && totals.purchases
                        ? ((totals.purchases / totals.clicks) * 100).toFixed(1)
                        : "0.0"}%`;
                  } else if (column.id === "lpcpc") {
                    content = totals.lpClicks ? (totals.cost / totals.lpClicks).toFixed(2) : "0.00";
                  } else if (column.id === "lpepc") {
                    content = totals.lpClicks ? (totals.revenue / totals.lpClicks).toFixed(2) : "0.00";
                  } else if (column.id === "clicks") {
                    content = totals.clicks;
                  } else if (column.id === "lpViews") {
                    content = totals.lpViews;
                  } else if (column.id === "lpClicks") {
                    content = totals.lpClicks;
                  } else {
                    content = "";
                  }

                  return (
                      <td
                          key={column.id}
                          className={`${cellPadding[density]} ${column.numeric ? "text-right" : ""} text-sm font-semibold text-gray-900 border-r border-gray-300`}
                          style={{ width: `${columnWidths[column.id]}px` }}
                      >
                        {content}
                      </td>
                  );
                })}
              </tr>

              {/* Data Rows */}
              {pageRows.length > 0 ? (
                  pageRows.map((row, rowIdx) => (
                      <tr
                          key={row.id}
                          className={getRowBackgroundColor(row.profit)}
                      >
                        {sortedColumnOrder.map((colIdx) => {
                          if (isHidden(colIdx)) return null;
                          const column = columns[colIdx];

                          // Render the appropriate content for each cell
                          let content;
                          if (column.id === "id") {
                            content = row.id;
                          } else if (column.id === "title") {
                            content = (
                                <div className="flex items-center gap-3">
                                  <div className="text-gray-600 flex-shrink-0">
                                    <PlatformIcon platform={row.platform} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium" title={row.title}>
                                      {row.title}
                                    </div>
                                  </div>
                                </div>
                            );
                          } else {
                            content = getCellValue(row, column.id);
                          }

                          return (
                              <td
                                  key={`${row.id}-${column.id}`}
                                  className={`${cellPadding[density]} ${column.numeric ? "text-right" : ""} text-sm text-gray-900 border-r border-gray-300`}
                                  style={{ width: `${columnWidths[column.id]}px` }}
                              >
                                {content}
                              </td>
                          );
                        })}
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan={sortedColumnOrder.length} className="px-6 py-10 text-center text-gray-500 border-r border-gray-300">
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
                      setRowsPerPage(Number(e.target.value))
                      setPage(1)
                    }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <div className="text-sm text-gray-700">
                Showing {sortedData.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} to{" "}
                {Math.min(page * rowsPerPage, sortedData.length)} of {sortedData.length} campaigns
                {(filters.platforms?.length > 0 || filters.title || filters.tags) && ` (filtered from ${rawData.length})`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
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
                      const v = Number(e.target.value)
                      if (!Number.isNaN(v)) setPage(Math.min(totalPages, Math.max(1, v)))
                    }}
                    className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none"
                />
                <span className="text-sm text-gray-700">of {totalPages}</span>
              </div>

              <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>


      </div>
  )
}

export default CampaignsTable
