import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setPage,
  setRowsPerPage,
  setDensity,
  toggleColumn,
  showAllColumns,
  hideAllColumns,
  setSortConfig,
  resetTableSettings,
  toggleCampaignExpansion,
  fetchAllCampaigns
} from "@/features/campaigns/campaignsSlice";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

// Platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// ============ CONSTANTS ============
const platformIconsMap = {
  google: googleIcon,
  meta: fb,
  facebook: fb,
  tiktok: tiktokIcon,
  snap: snapchatIcon,
  snapchat: snapchatIcon,
  newsbreak: nb
};

const COLUMNS = [
  { id: "id", label: "#", numeric: true, width: 50 },
  { id: "title", label: "Campaign Title", numeric: false, width: 320 },
  { id: "status", label: "Status", numeric: false, width: 100 },
  { id: "cost", label: "Cost", numeric: true, width: 100, format: (val) => `$${val.toFixed(2)}` },
  {
    id: "revenue",
    label: "Revenue",
    numeric: true,
    width: 100,
    format: (val) => `$${val.toFixed(2)}`
  },
  { id: "profit", label: "Profit", numeric: true, width: 100 },
  { id: "roi", label: "ROI", numeric: true, width: 80 },
  { id: "purchases", label: "Purch.", numeric: true, width: 70 },
  { id: "cpa", label: "CPA", numeric: true, width: 80, format: (val) => `$${val.toFixed(2)}` },
  { id: "aov", label: "AOV", numeric: true, width: 80, format: (val) => `$${val.toFixed(2)}` },
  { id: "cr", label: "CR", numeric: true, width: 70, format: (val) => `${val.toFixed(1)}%` },
  { id: "lpCtr", label: "LP CTR", numeric: true, width: 80, format: (val) => `${val.toFixed(1)}%` },
  { id: "clicks", label: "Clicks", numeric: true, width: 80 },
  { id: "lpViews", label: "LP Views", numeric: true, width: 90 },
  { id: "lpClicks", label: "LP Clicks", numeric: true, width: 90 },
  { id: "lpcpc", label: "LP CPC", numeric: true, width: 80, format: (val) => val.toFixed(2) },
  { id: "lpepc", label: "LP EPC", numeric: true, width: 80, format: (val) => val.toFixed(2) }
];

const DENSITY_CONFIG = {
  compact: { cell: "px-2 py-1.5", header: "px-2 py-2", fontSize: "text-xs" },
  standard: { cell: "px-3 py-2", header: "px-3 py-2.5", fontSize: "text-sm" },
  comfortable: { cell: "px-3 py-3", header: "px-3 py-3", fontSize: "text-sm" },
  veryComfortable: { cell: "px-4 py-4", header: "px-4 py-4", fontSize: "text-sm" }
};

// ============ ICONS ============
const RefreshIcon = ({ className, isSpinning }) => (
  <svg
    className={`${className} ${isSpinning ? "animate-spin" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const ColumnsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
    />
  </svg>
);

const DensityIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronIcon = ({ className, direction = "right" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
    />
  </svg>
);

const EmptyIcon = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ErrorIcon = ({ className, style }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

// ============ SUB-COMPONENTS ============
const PlatformIcon = ({ platform }) => {
  const iconSrc = platformIconsMap[platform];
  if (!iconSrc) {
    return (
      <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
        ?
      </div>
    );
  }
  return <img src={iconSrc} alt={platform} className="w-5 h-5 object-contain" />;
};

const StatusBadge = ({ status, theme }) => {
  const isActive = status === "active";
  const bgColor = isActive ? `${theme.positive}18` : `${theme.warning}18`;
  const textColor = isActive ? theme.positive : theme.warning;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: textColor }}
      />
      {isActive ? "Active" : "Paused"}
    </span>
  );
};

const TableSkeleton = ({ columnCount, rowCount, theme, densityConfig }) => (
  <>
    {Array.from({ length: rowCount }).map((_, rowIndex) => (
      <tr
        key={`skeleton-row-${rowIndex}`}
        className="border-b"
        style={{ borderColor: theme.borderSubtle }}
      >
        {Array.from({ length: columnCount }).map((_, colIndex) => (
          <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className={densityConfig.cell}>
            <div
              className="h-4 rounded animate-pulse"
              style={{
                background: `linear-gradient(90deg, ${theme.skeletonBase} 25%, ${theme.skeletonHighlight} 50%, ${theme.skeletonBase} 75%)`,
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                width: colIndex === 1 ? "80%" : colIndex === 0 ? "40%" : "60%"
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const DropdownMenu = ({ isOpen, onClose, children, theme, align = "right" }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute ${align === "right" ? "right-0" : "left-0"} z-50 mt-2 rounded-lg shadow-xl border overflow-hidden`}
        style={{
          backgroundColor: theme.bgDropdown,
          borderColor: theme.borderSubtle,
          boxShadow: theme.shadowDropdown
        }}
      >
        {children}
      </div>
    </>
  );
};

// ============ MAIN COMPONENT ============
function CampaignsTable() {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Redux selectors
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);
  const { campaigns, isLoading, error, warning, filters, tableSettings, drillDown } = useSelector(
    (state) => state.campaigns
  );
  const { rowsPerPage, page, density, hiddenColumns, sortConfig } = tableSettings;

  // Local state
  const [openMenu, setOpenMenu] = useState(null);
  const [columnWidths, setColumnWidths] = useState(() => {
    const widths = {};
    COLUMNS.forEach((col) => {
      widths[col.id] = col.width;
    });
    return widths;
  });
  const [resizing, setResizing] = useState(null);
  const [columnOrder, setColumnOrder] = useState(() => COLUMNS.map((_, i) => i));
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.comfortable;

  // ============ MEMOIZED DATA (MUST BE DEFINED BEFORE useEffects that use them) ============

  const filteredData = useMemo(() => {
    let result = [...(campaigns || [])];

    if (filters.title?.trim()) {
      const searchTerm = filters.title.toLowerCase();
      result = result.filter((row) => row.title?.toLowerCase().includes(searchTerm));
    }

    if (filters.tags?.trim()) {
      const searchTerm = filters.tags.toLowerCase();
      result = result.filter((row) => row.tag?.toLowerCase().includes(searchTerm));
    }

    return result;
  }, [campaigns, filters.title, filters.tags]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;

      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totals = useMemo(() => {
    return sortedData.reduce(
      (acc, row) => ({
        cost: acc.cost + (row.cost || 0),
        revenue: acc.revenue + (row.revenue || 0),
        profit: acc.profit + (row.profit || 0),
        purchases: acc.purchases + (row.purchases || 0),
        clicks: acc.clicks + (row.clicks || 0),
        lpViews: acc.lpViews + (row.lpViews || 0),
        lpClicks: acc.lpClicks + (row.lpClicks || 0)
      }),
      { cost: 0, revenue: 0, profit: 0, purchases: 0, clicks: 0, lpViews: 0, lpClicks: 0 }
    );
  }, [sortedData]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  }, [sortedData.length, rowsPerPage]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sortedData]);

  const visibleColumnOrder = useMemo(() => {
    return columnOrder.filter((idx) => !hiddenColumns.includes(COLUMNS[idx]?.id));
  }, [columnOrder, hiddenColumns]);

  // ============ EFFECTS (AFTER memoized data) ============

  // Column resizing
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newWidth = Math.max(50, resizing.startWidth + (e.clientX - resizing.startX));
      setColumnWidths((prev) => ({ ...prev, [resizing.id]: newWidth }));
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing]);

  // Page bounds check
  useEffect(() => {
    if (page > totalPages) {
      dispatch(setPage(Math.max(1, totalPages)));
    }
  }, [totalPages, page, dispatch]);

  // Scroll to top on page change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ============ HANDLERS ============

  const handleSort = useCallback(
    (columnId) => {
      if (resizing) return;

      let direction = "ascending";
      if (sortConfig.key === columnId) {
        if (sortConfig.direction === "ascending") {
          direction = "descending";
        } else if (sortConfig.direction === "descending") {
          direction = null;
        }
      }
      dispatch(setSortConfig({ key: direction ? columnId : null, direction }));
    },
    [dispatch, sortConfig, resizing]
  );

  const handleRefresh = useCallback(() => {
    dispatch(fetchAllCampaigns({ platforms: filters.platforms, status: filters.status }));
  }, [dispatch, filters.platforms, filters.status]);

  const handleReset = useCallback(() => {
    dispatch(resetTableSettings());
    setColumnOrder(COLUMNS.map((_, i) => i));
    const defaultWidths = {};
    COLUMNS.forEach((col) => {
      defaultWidths[col.id] = col.width;
    });
    setColumnWidths(defaultWidths);
    setOpenMenu(null);
  }, [dispatch]);

  const handleDragStart = useCallback((e, colIdx) => {
    setDraggedColumn(colIdx);
    e.dataTransfer.setData("text/plain", String(colIdx));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e, colIdx) => {
      e.preventDefault();
      if (draggedColumn !== null && draggedColumn !== colIdx) {
        setDragOverColumn(colIdx);
      }
    },
    [draggedColumn]
  );

  const handleDrop = useCallback((e, toColIdx) => {
    e.preventDefault();
    const fromColIdx = Number(e.dataTransfer.getData("text/plain"));

    if (fromColIdx !== toColIdx && !isNaN(fromColIdx)) {
      setColumnOrder((prev) => {
        const newOrder = [...prev];
        const fromIndex = newOrder.indexOf(fromColIdx);
        const toIndex = newOrder.indexOf(toColIdx);
        if (fromIndex !== -1 && toIndex !== -1) {
          const [moved] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, moved);
        }
        return newOrder;
      });
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // ============ HELPERS ============

  const getRowBgColor = useCallback(
    (profit) => {
      if (profit >= 0) {
        return isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.04)";
      }
      return isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.04)";
    },
    [isDark]
  );

  const getSortIndicator = useCallback(
    (columnId) => {
      if (sortConfig.key !== columnId) return "↕";
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    },
    [sortConfig]
  );

  const formatCellValue = useCallback(
    (row, columnId) => {
      const value = row[columnId];
      if (value === undefined || value === null) return "—";

      const column = COLUMNS.find((col) => col.id === columnId);

      if (columnId === "status") {
        return <StatusBadge status={value} theme={theme} />;
      }

      if (columnId === "profit") {
        return (
          <span
            className="font-semibold"
            style={{ color: value >= 0 ? theme.positive : theme.negative }}
          >
            {value >= 0 ? "$" : "-$"}
            {Math.abs(value).toFixed(2)}
          </span>
        );
      }

      if (columnId === "revenue") {
        return (
          <span
            className="font-medium"
            style={{ color: row.profit >= 0 ? theme.positive : theme.negative }}
          >
            ${value.toFixed(2)}
          </span>
        );
      }

      if (columnId === "roi") {
        return (
          <span
            className="font-semibold"
            style={{ color: value >= 0 ? theme.positive : theme.negative }}
          >
            {value.toFixed(1)}%
          </span>
        );
      }

      if (column?.format) {
        return column.format(value);
      }

      if (typeof value === "number") {
        return value.toLocaleString();
      }

      return value;
    },
    [theme]
  );

  const getTotalContent = useCallback(
    (columnId) => {
      const profitColor = totals.profit >= 0 ? theme.positive : theme.negative;

      switch (columnId) {
        case "title":
          return <span className="font-semibold">Total</span>;
        case "cost":
          return `$${totals.cost.toFixed(2)}`;
        case "revenue":
          return (
            <span style={{ color: profitColor, fontWeight: 600 }}>
              ${totals.revenue.toFixed(2)}
            </span>
          );
        case "profit":
          return (
            <span style={{ color: profitColor, fontWeight: 700 }}>
              {totals.profit >= 0 ? "$" : "-$"}
              {Math.abs(totals.profit).toFixed(2)}
            </span>
          );
        case "roi":
          const roiValue = totals.cost ? (totals.profit / totals.cost) * 100 : 0;
          return (
            <span
              style={{ color: roiValue >= 0 ? theme.positive : theme.negative, fontWeight: 600 }}
            >
              {roiValue.toFixed(1)}%
            </span>
          );
        case "purchases":
          return totals.purchases.toLocaleString();
        case "clicks":
          return totals.clicks.toLocaleString();
        case "lpViews":
          return totals.lpViews.toLocaleString();
        case "lpClicks":
          return totals.lpClicks.toLocaleString();
        case "lpCtr":
          return `${totals.lpViews ? ((totals.lpClicks / totals.lpViews) * 100).toFixed(1) : "0.0"}%`;
        case "cpa":
          return `$${totals.purchases ? (totals.cost / totals.purchases).toFixed(2) : "0.00"}`;
        case "aov":
          return `$${totals.purchases ? (totals.revenue / totals.purchases).toFixed(2) : "0.00"}`;
        case "cr":
          return `${totals.clicks ? ((totals.purchases / totals.clicks) * 100).toFixed(1) : "0.0"}%`;
        case "lpcpc":
          return totals.lpClicks ? (totals.cost / totals.lpClicks).toFixed(2) : "0.00";
        case "lpepc":
          return totals.lpClicks ? (totals.revenue / totals.lpClicks).toFixed(2) : "0.00";
        default:
          return "";
      }
    },
    [totals, theme]
  );

  // ============ RENDER ============
  return (
    <div
      ref={tableContainerRef}
      className="flex flex-col w-full rounded-xl border overflow-hidden"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderSubtle,
        height: "calc(100vh - 220px)",
        minHeight: "600px"
      }}
    >
      {/* Error Banner */}
      {error && (
        <div
          className="px-4 py-3 flex items-start gap-3 flex-shrink-0"
          style={{
            backgroundColor: `${theme.negative}12`,
            borderBottom: `1px solid ${theme.negative}30`
          }}
        >
          <ErrorIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.negative }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: theme.negative }}>
              Failed to load campaigns
            </p>
            <p className="text-xs mt-0.5 opacity-80" style={{ color: theme.negative }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {warning && !error && (
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{
            backgroundColor: `${theme.warning}12`,
            borderBottom: `1px solid ${theme.warning}30`,
            color: theme.warning
          }}
        >
          <p className="text-sm">{warning}</p>
        </div>
      )}

      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 border-b"
        style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold truncate" style={{ color: theme.textPrimary }}>
            Campaigns
          </h2>
          {!isLoading && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${theme.blue}15`, color: theme.blue }}
            >
              {sortedData.length.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{
              backgroundColor: theme.buttonPrimaryBg,
              color: theme.buttonPrimaryText
            }}
          >
            <RefreshIcon className="w-4 h-4" isSpinning={isLoading} />
            <span className="hidden sm:inline">{isLoading ? "Loading" : "Refresh"}</span>
          </button>

          {/* Columns Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "columns" ? null : "columns"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all"
              style={{
                backgroundColor: theme.buttonSecondaryBg,
                color: theme.buttonSecondaryText,
                borderColor: theme.borderSubtle
              }}
            >
              <ColumnsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            <DropdownMenu
              isOpen={openMenu === "columns"}
              onClose={() => setOpenMenu(null)}
              theme={theme}
            >
              <div className="w-64">
                <div
                  className="px-3 py-2 border-b flex items-center justify-between"
                  style={{ borderColor: theme.borderSubtle }}
                >
                  <span
                    className="text-xs font-semibold uppercase"
                    style={{ color: theme.textTertiary }}
                  >
                    Toggle Columns
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-xs font-medium"
                      style={{ color: theme.blue }}
                      onClick={() => dispatch(showAllColumns())}
                    >
                      All
                    </button>
                    <button
                      className="text-xs font-medium"
                      style={{ color: theme.textSecondary }}
                      onClick={() => dispatch(hideAllColumns(COLUMNS.map((c) => c.id)))}
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {COLUMNS.map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors hover:opacity-80"
                      style={{ color: theme.textPrimary }}
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(column.id)}
                        onChange={() => dispatch(toggleColumn(column.id))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </DropdownMenu>
          </div>

          {/* Density Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "density" ? null : "density"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all"
              style={{
                backgroundColor: theme.buttonSecondaryBg,
                color: theme.buttonSecondaryText,
                borderColor: theme.borderSubtle
              }}
            >
              <DensityIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Density</span>
            </button>

            <DropdownMenu
              isOpen={openMenu === "density"}
              onClose={() => setOpenMenu(null)}
              theme={theme}
            >
              <div className="w-44 py-1">
                {Object.keys(DENSITY_CONFIG).map((opt) => {
                  const isActive = density === opt;
                  return (
                    <button
                      key={opt}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                      style={{
                        backgroundColor: isActive ? `${theme.blue}12` : "transparent",
                        color: isActive ? theme.blue : theme.textPrimary
                      }}
                      onClick={() => {
                        dispatch(setDensity(opt));
                        setOpenMenu(null);
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: isActive ? theme.blue : theme.borderSubtle }}
                      >
                        {isActive && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme.blue }}
                          />
                        )}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {opt === "veryComfortable" ? "Very Comfortable" : opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </DropdownMenu>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border transition-all"
            style={{
              backgroundColor: "transparent",
              color: theme.textSecondary,
              borderColor: theme.borderSubtle
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: "1200px" }}>
          {/* Table Header */}
          <thead className="sticky top-0 z-10" style={{ backgroundColor: theme.tableHeaderBg }}>
            <tr>
              {visibleColumnOrder.map((colIdx) => {
                const column = COLUMNS[colIdx];
                if (!column) return null;

                const isSorted = sortConfig.key === column.id;
                const sortIndicator = getSortIndicator(column.id);
                const totalContent = getTotalContent(column.id);
                const isDragging = draggedColumn === colIdx;
                const isDragOver = dragOverColumn === colIdx;

                return (
                  <th
                    key={column.id}
                    className={`${densityConfig.header} ${column.numeric ? "text-right" : "text-left"} relative select-none border-b`}
                    style={{
                      width: columnWidths[column.id],
                      minWidth: columnWidths[column.id],
                      backgroundColor: isDragOver ? `${theme.blue}15` : theme.tableHeaderBg,
                      borderColor: theme.borderSubtle,
                      opacity: isDragging ? 0.5 : 1,
                      cursor: resizing ? "col-resize" : "pointer"
                    }}
                    onClick={() => handleSort(column.id)}
                    draggable={!resizing}
                    onDragStart={(e) => handleDragStart(e, colIdx)}
                    onDragOver={(e) => handleDragOver(e, colIdx)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDrop(e, colIdx)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex flex-col gap-1">
                      {/* Column Label & Sort */}
                      <div
                        className={`flex items-center gap-1 ${column.numeric ? "justify-end" : "justify-start"}`}
                      >
                        <span
                          className="text-xs font-semibold uppercase tracking-wide truncate"
                          style={{ color: theme.textSecondary }}
                        >
                          {column.label}
                        </span>
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: isSorted ? theme.blue : theme.textMuted }}
                        >
                          {sortIndicator}
                        </span>
                      </div>

                      {/* Total Row */}
                      <div
                        className={`${densityConfig.fontSize} ${column.numeric ? "text-right" : "text-left"}`}
                        style={{ color: theme.textPrimary }}
                      >
                        {totalContent}
                      </div>
                    </div>

                    {/* Resize Handle */}
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize z-20 hover:bg-blue-500 transition-colors"
                      style={{ backgroundColor: "transparent" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizing({
                          id: column.id,
                          startX: e.clientX,
                          startWidth: columnWidths[column.id]
                        });
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {isLoading ? (
              <TableSkeleton
                columnCount={visibleColumnOrder.length}
                rowCount={12}
                theme={theme}
                densityConfig={densityConfig}
              />
            ) : pageRows.length > 0 ? (
              pageRows.map((row, rowIndex) => {
                const isExpanded = drillDown?.expandedCampaigns?.includes(row.id);
                const rowBg = getRowBgColor(row.profit);

                return (
                  <tr
                    key={row.id || rowIndex}
                    className="border-b transition-colors"
                    style={{
                      backgroundColor: rowBg,
                      borderColor: theme.borderSubtle
                    }}
                  >
                    {visibleColumnOrder.map((colIdx) => {
                      const column = COLUMNS[colIdx];
                      if (!column) return null;

                      // ID Column
                      if (column.id === "id") {
                        return (
                          <td
                            key={`${row.id}-${column.id}`}
                            className={`${densityConfig.cell} ${densityConfig.fontSize} text-center`}
                            style={{ color: theme.textTertiary }}
                          >
                            {row.id}
                          </td>
                        );
                      }

                      // Title Column with expand button
                      if (column.id === "title") {
                        return (
                          <td
                            key={`${row.id}-${column.id}`}
                            className={`${densityConfig.cell} ${densityConfig.fontSize}`}
                            style={{ color: theme.textPrimary }}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(toggleCampaignExpansion(row.id));
                                }}
                                className="p-0.5 rounded transition-colors flex-shrink-0"
                                style={{ color: theme.textSecondary }}
                              >
                                <ChevronIcon
                                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                />
                              </button>
                              <PlatformIcon platform={row.platform} />
                              <span className="truncate font-medium" title={row.title}>
                                {row.title || "Untitled Campaign"}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      // Other columns
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          className={`${densityConfig.cell} ${densityConfig.fontSize} ${column.numeric ? "text-right" : "text-left"}`}
                          style={{ color: theme.textPrimary }}
                        >
                          {formatCellValue(row, column.id)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleColumnOrder.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <EmptyIcon className="w-12 h-12" style={{ color: theme.textMuted }} />
                    <p className="text-base font-medium" style={{ color: theme.textPrimary }}>
                      No campaigns found
                    </p>
                    <p className="text-sm" style={{ color: theme.textSecondary }}>
                      Try adjusting your filters or refresh the data
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0 border-t"
        style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle }}
      >
        {/* Left: Rows per page */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: theme.textSecondary }}>
              Rows:
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => dispatch(setRowsPerPage(Number(e.target.value)))}
              disabled={isLoading}
              className="h-8 px-2 text-sm rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText
              }}
            >
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm" style={{ color: theme.textSecondary }}>
            <span className="font-semibold" style={{ color: theme.textPrimary }}>
              {sortedData.length.toLocaleString()}
            </span>{" "}
            total
          </span>
        </div>

        {/* Right: Pagination */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
            disabled={page <= 1 || isLoading}
            className="p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: theme.buttonSecondaryBg,
              borderColor: theme.borderSubtle,
              color: theme.textSecondary
            }}
          >
            <ChevronIcon className="w-4 h-4" direction="left" />
          </button>

          <div className="flex items-center gap-1.5 text-sm">
            <span style={{ color: theme.textSecondary }}>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  dispatch(setPage(val));
                }
              }}
              disabled={isLoading}
              className="w-12 h-8 px-2 text-center text-sm rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText
              }}
            />
            <span style={{ color: theme.textSecondary }}>of {totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
            disabled={page >= totalPages || isLoading}
            className="p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: theme.buttonSecondaryBg,
              borderColor: theme.borderSubtle,
              color: theme.textSecondary
            }}
          >
            <ChevronIcon className="w-4 h-4" direction="right" />
          </button>
        </div>
      </div>

      {/* Shimmer Animation Styles */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
}

export default CampaignsTable;
