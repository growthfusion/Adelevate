import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CalendarDays,
  Hash,
  User,
  Megaphone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  RefreshCw,
  BarChart3
} from "lucide-react";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const API_BASE = "";

// Platform icon mapping
const platformIcons = {
  newsbreak: nb,
  facebook: fb,
  fb: fb,
  snapchat: snapchatIcon,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  googleads: googleIcon
};

// Platform Cell Component - PREMIUM STYLE
const PlatformCell = ({ platform }) => {
  const platformLower = (platform || "").toLowerCase();
  const icon = platformIcons[platformLower];

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-shrink-0 h-7 w-7 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
        {icon ? (
          <img
            src={icon}
            alt={platform}
            className="h-5 w-5 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
        {platform || "-"}
      </span>
    </div>
  );
};

// Metric Card Component - PREMIUM STYLE
const MetricCard = ({ icon: Icon, label, value, color = "#6366f1" }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
};

export default function ActionLogsDashboard({ onBack }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("Last 7 days");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 3600 * 1000)
  );
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  const [allLogs, setAllLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [err, setErr] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [profitFilter, setProfitFilter] = useState("all");

  // Table states
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewDensity, setViewDensity] = useState("compact");
  const [visibleColumns, setVisibleColumns] = useState({
    time: true,
    date: true,
    platform: true,
    account_id: true,
    account_name: true,
    campaign_id: true,
    campaign_name: true,
    spend: true,
    revenue: true,
    profit: true,
    reason: true
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const dateRangeOptions = [
    "All time",
    "Today",
    "Yesterday",
    "Last 3 days",
    "Last 7 days",
    "Last 14 days",
    "Last 30 days",
    "This month",
    "Last month",
    "Last 90 days",
    "Last 6 months"
  ];

  const rowsPerPageOptions = [25, 50, 100, 200];

  const columns = [
    { key: "time", label: "Time", icon: Clock, align: "left", sortable: true },
    { key: "date", label: "Date", icon: CalendarDays, align: "left", sortable: true },
    { key: "platform", label: "Platform", icon: null, align: "left", sortable: true },
    { key: "account_id", label: "Account ID", icon: Hash, align: "left", sortable: true },
    { key: "account_name", label: "Account Name", icon: User, align: "left", sortable: true },
    { key: "campaign_id", label: "Campaign ID", icon: Hash, align: "left", sortable: true },
    { key: "campaign_name", label: "Campaign", icon: Megaphone, align: "left", sortable: true },
    { key: "spend", label: "Spend", icon: DollarSign, align: "right", sortable: true },
    { key: "revenue", label: "Revenue", icon: TrendingUp, align: "right", sortable: true },
    { key: "profit", label: "Profit", icon: TrendingUp, align: "right", sortable: true },
    { key: "reason", label: "Reason", icon: FileText, align: "left", sortable: false }
  ];

  const densityConfig = {
    compact: { rowHeight: "h-10", padding: "px-3 py-2", fontSize: "text-xs" },
    comfortable: { rowHeight: "h-12", padding: "px-4 py-3", fontSize: "text-sm" },
    spacious: { rowHeight: "h-16", padding: "px-6 py-4", fontSize: "text-sm" }
  };

  const presetRange = useMemo(() => {
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    switch (selectedDateRange) {
      case "All time":
        return { start: new Date(0), end: now };
      case "Today":
        return { start: startOfDay(now), end: now };
      case "Yesterday": {
        const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        return {
          start: startOfDay(y),
          end: new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999)
        };
      }
      case "Last 3 days":
        return { start: new Date(now.getTime() - 3 * 24 * 3600 * 1000), end: now };
      case "Last 7 days":
        return { start: new Date(now.getTime() - 7 * 24 * 3600 * 1000), end: now };
      case "Last 14 days":
        return { start: new Date(now.getTime() - 14 * 24 * 3600 * 1000), end: now };
      case "Last 30 days":
        return { start: new Date(now.getTime() - 30 * 24 * 3600 * 1000), end: now };
      case "This month":
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case "Last month": {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { start, end };
      }
      case "Last 90 days":
        return { start: new Date(now.getTime() - 90 * 24 * 3600 * 1000), end: now };
      case "Last 6 months":
        return { start: new Date(now.getTime() - 182 * 24 * 3600 * 1000), end: now };
      default:
        return { start: new Date(0), end: now };
    }
  }, [selectedDateRange]);

  // Get unique platforms and accounts for filters
  const platforms = useMemo(() => {
    const unique = [...new Set(logs.map((log) => log.platform).filter(Boolean))];
    return unique.sort();
  }, [logs]);

  const accounts = useMemo(() => {
    const unique = [...new Set(logs.map((log) => log.account_name).filter(Boolean))];
    return unique.sort();
  }, [logs]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...logs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.campaign_name?.toLowerCase().includes(query) ||
          log.account_name?.toLowerCase().includes(query) ||
          log.campaign_id?.toLowerCase().includes(query) ||
          log.account_id?.toLowerCase().includes(query) ||
          log.reason?.toLowerCase().includes(query)
      );
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((log) => log.platform === selectedPlatform);
    }

    if (selectedAccount !== "all") {
      filtered = filtered.filter((log) => log.account_name === selectedAccount);
    }

    if (profitFilter === "profit") {
      filtered = filtered.filter((log) => log.profit > 0);
    } else if (profitFilter === "loss") {
      filtered = filtered.filter((log) => log.profit < 0);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchQuery, selectedPlatform, selectedAccount, profitFilter]);

  // Apply sorting
  const sortedLogs = useMemo(() => {
    if (!sortColumn) return filteredLogs;

    return [...filteredLogs].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (["spend", "revenue", "profit"].includes(sortColumn)) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortColumn, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedLogs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLogs = sortedLogs.slice(startIndex, endIndex);

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalSpend: filteredLogs.reduce((sum, log) => sum + log.spend, 0),
      totalRevenue: filteredLogs.reduce((sum, log) => sum + log.revenue, 0),
      totalProfit: filteredLogs.reduce((sum, log) => sum + log.profit, 0),
      profitableCount: filteredLogs.filter((log) => log.profit > 0).length,
      lossCount: filteredLogs.filter((log) => log.profit < 0).length
    };
  }, [filteredLogs]);

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const isDateInRange = (date) => date >= selectedStartDate && date <= selectedEndDate;
  const isDateSelected = (date) =>
    date.getTime() === selectedStartDate.getTime() || date.getTime() === selectedEndDate.getTime();

  function normalizeRow(r) {
    const num = (v) => (v == null || v === "" ? 0 : Number(v));

    let tsMs = typeof r.ts_ms === "number" ? r.ts_ms : null;
    if (tsMs == null) {
      const rawTs = r.event_ts ?? r.ts ?? r._raw?.event_ts ?? null;
      if (rawTs) {
        const isoGuess =
          typeof rawTs === "string" && rawTs.includes(" UTC")
            ? rawTs.replace(" ", "T").replace(" UTC", "Z")
            : rawTs;
        const parsed = Date.parse(isoGuess);
        tsMs = Number.isNaN(parsed) ? null : parsed;
      }
    }

    return {
      time: r.time ?? "",
      date: r.date ?? "",
      platform: r.platform ?? "",
      account_id: r.account_id ?? r.ad_account_id ?? r.account ?? "",
      account_name: r.account_name ?? r.ad_account_name ?? r.accountname ?? "",
      campaign_id: r.campaign_id ?? r.ad_campaign_id ?? r.campaign ?? "",
      campaign_name: r.campaign_name ?? r.ad_campaign_name ?? r.campaignname ?? "",
      spend: num(r.spend),
      revenue: num(r.revenue),
      profit: num(r.profit),
      reason: r.reason ?? r.pause_reason ?? r.message ?? "",
      status: r.status ?? "active",
      _raw: r,
      _ts: tsMs
    };
  }

  async function fetchAllLogsAllTime() {
    setErr("");
    setLoading(true);
    try {
      const PAGE_SIZE = 1000;
      let offset = 0;
      const all = [];
      const startAll = new Date(0);
      const endAll = new Date();

      while (true) {
        const params = new URLSearchParams({
          start: startAll.toISOString(),
          end: endAll.toISOString(),
          limit: String(PAGE_SIZE),
          offset: String(offset)
        });
        const res = await fetch(`${API_BASE}/api/bigquery?${params.toString()}`, {
          cache: "no-store"
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `API ${res.status}`);

        const rows = Array.isArray(json.rows) ? json.rows : [];
        all.push(...rows.map(normalizeRow));
        if (rows.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      setAllLogs(all);
      setLogs(filterByRange(all, presetRange.start, presetRange.end));
      setInitialLoad(false);
    } catch (e) {
      setErr(e.message || String(e));
      setAllLogs([]);
      setLogs([]);
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  }

  function filterByRange(rows, start, end) {
    const startMs = start.getTime();
    const endMs = end.getTime();
    return rows.filter((r) => typeof r._ts === "number" && r._ts >= startMs && r._ts <= endMs);
  }

  useEffect(() => {
    setSelectedStartDate(presetRange.start);
    setSelectedEndDate(presetRange.end);
  }, [presetRange.start, presetRange.end]);

  useEffect(() => {
    fetchAllLogsAllTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allLogs.length) {
      setLogs(filterByRange(allLogs, selectedStartDate, selectedEndDate));
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartDate.getTime(), selectedEndDate.getTime(), allLogs.length]);

  const handleApplyDateFilter = () => {
    setShowDatePicker(false);
    setLogs(filterByRange(allLogs, selectedStartDate, selectedEndDate));
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleExport = (format) => {
    showToastMessage(`Exporting as ${format}...`);
    console.log(`Exporting as ${format}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSelectedAccount("all");
    setProfitFilter("all");
    setSelectedDateRange("Last 7 days");
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const density = densityConfig[viewDensity];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Toast Notification - PREMIUM STYLE */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-lg">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Main Container - PREMIUM STYLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden m-4 sm:m-6 lg:m-8">
        {/* Header Section - PREMIUM STYLE */}
        <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Activity Icon */}
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Logs
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Track and monitor all system activities
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Total Badge */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
                <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {filteredLogs.length}
                </span>
              </div>

              {/* View Density Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 border border-gray-200 dark:border-gray-600">
                {["compact", "comfortable", "spacious"].map((density) => (
                  <button
                    key={density}
                    onClick={() => setViewDensity(density)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                      viewDensity === density
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </button>
                ))}
              </div>

              {/* Column Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                  title="Column Settings"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {showColumnSettings && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Show Columns
                      </h3>
                      <button onClick={() => setShowColumnSettings(false)}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {columns.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={(e) =>
                              setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })
                            }
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {col.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAllLogsAllTime}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Export Button */}
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Summary Metrics - PREMIUM STYLE */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
            <MetricCard
              icon={FileText}
              label="Total Actions"
              value={filteredLogs.length.toLocaleString()}
              color="#6366f1"
            />
            <MetricCard
              icon={DollarSign}
              label="Total Spend"
              value={`$${summary.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#f59e0b"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`$${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#22c55e"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Profit"
              value={`$${summary.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color={summary.totalProfit >= 0 ? "#22c55e" : "#ef4444"}
            />
          </div>
        </div>

        {/* Filters Section - PREMIUM STYLE */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
              {(searchQuery ||
                selectedPlatform !== "all" ||
                selectedAccount !== "all" ||
                profitFilter !== "all") && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {showFilters ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaigns, accounts..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{selectedDateRange}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showDatePicker && (
                  <div
                    className="absolute left-0 top-full mt-2 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 p-4 bg-white dark:bg-gray-800"
                    style={{ width: "680px" }}
                  >
                    <div className="flex gap-6">
                      {/* Calendar Section */}
                      <div className="flex-1">
                        <div className="flex gap-8">
                          {/* Current Month */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <button
                                onClick={() =>
                                  setCurrentMonth(
                                    new Date(
                                      currentMonth.getFullYear(),
                                      currentMonth.getMonth() - 1
                                    )
                                  )
                                }
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                {currentMonth.toLocaleString("en-US", {
                                  month: "long",
                                  year: "numeric"
                                })}
                              </h3>
                              <button
                                onClick={() =>
                                  setCurrentMonth(
                                    new Date(
                                      currentMonth.getFullYear(),
                                      currentMonth.getMonth() + 1
                                    )
                                  )
                                }
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div
                                  key={day}
                                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center p-1"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendar(currentMonth).map((date, index) => {
                                const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
                                const classes = isOtherMonth
                                  ? "text-gray-300 dark:text-gray-600"
                                  : isDateSelected(date)
                                    ? "bg-indigo-600 text-white font-semibold"
                                    : isDateInRange(date)
                                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (
                                        !selectedStartDate ||
                                        (selectedStartDate &&
                                          selectedEndDate &&
                                          selectedStartDate <= selectedEndDate)
                                      ) {
                                        setSelectedStartDate(new Date(date));
                                        setSelectedEndDate(new Date(date));
                                      } else {
                                        if (date < selectedStartDate) {
                                          setSelectedEndDate(selectedStartDate);
                                          setSelectedStartDate(new Date(date));
                                        } else {
                                          setSelectedEndDate(new Date(date));
                                        }
                                      }
                                    }}
                                    className={`text-sm p-2 text-center rounded-lg transition-all ${classes}`}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Next Month */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div />
                              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                                {new Date(
                                  currentMonth.getFullYear(),
                                  currentMonth.getMonth() + 1
                                ).toLocaleString("en-US", { month: "long", year: "numeric" })}
                              </h3>
                              <div />
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div
                                  key={day}
                                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center p-1"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendar(
                                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                              ).map((date, index) => {
                                const month = (currentMonth.getMonth() + 1) % 12;
                                const isOtherMonth = date.getMonth() !== month;
                                const classes = isOtherMonth
                                  ? "text-gray-300 dark:text-gray-600"
                                  : isDateSelected(date)
                                    ? "bg-indigo-600 text-white font-semibold"
                                    : isDateInRange(date)
                                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (
                                        !selectedStartDate ||
                                        selectedEndDate < selectedStartDate
                                      ) {
                                        setSelectedStartDate(new Date(date));
                                        setSelectedEndDate(new Date(date));
                                      } else {
                                        if (date < selectedStartDate) {
                                          setSelectedEndDate(selectedStartDate);
                                          setSelectedStartDate(new Date(date));
                                        } else {
                                          setSelectedEndDate(new Date(date));
                                        }
                                      }
                                    }}
                                    className={`text-sm p-2 text-center rounded-lg transition-all ${classes}`}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDatePicker(false)}
                              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleApplyDateFilter}
                              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="w-40 border-l border-gray-200 dark:border-gray-700 pl-4">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Quick Select
                        </h4>
                        <div className="space-y-1">
                          {dateRangeOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => setSelectedDateRange(option)}
                              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                                selectedDateRange === option
                                  ? "bg-indigo-600 text-white font-medium shadow-sm"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Filter */}
              <div className="relative">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none"
                >
                  <option value="all">All Platforms</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Account Filter */}
              <div className="relative">
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Profit Filter */}
              <div className="relative">
                <select
                  value={profitFilter}
                  onChange={(e) => setProfitFilter(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium appearance-none"
                >
                  <option value="all">All</option>
                  <option value="profit">Profit Only</option>
                  <option value="loss">Loss Only</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Table Section with Loading Overlay */}
        <div className="relative min-h-[400px]">
          {/* Initial Loading State - Full Page */}
          {loading && initialLoad && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-white/95 dark:bg-gray-800/95">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Loading  logs...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please wait while we fetch your data
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Loading State - Centered in Table */}
          {loading && !initialLoad && sortedLogs.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 dark:border-gray-700 border-t-indigo-600"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Refreshing data...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!err && sortedLogs.length > 0 && (
            <>
              {/* Table Actions Bar - PREMIUM STYLE */}
              <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Show</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {rowsPerPageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Showing{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(endIndex, sortedLogs.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sortedLogs.length}
                    </span>{" "}
                    results
                  </div>
                </div>
              </div>

              {/* Table - PREMIUM STYLE WITH ZEBRA STRIPES */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <tr>
                      {columns.map((column) => {
                        if (!visibleColumns[column.key]) return null;
                        const Icon = column.icon;
                        return (
                          <th
                            key={column.key}
                            className={`${density.padding} text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${column.align === "right" ? "text-right" : "text-left"} ${column.sortable ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" : ""}`}
                            onClick={() => column.sortable && handleSort(column.key)}
                          >
                            <div
                              className={`flex items-center gap-2 ${column.align === "right" ? "justify-end" : ""}`}
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                              <span>{column.label}</span>
                              {column.sortable && (
                                <div className="flex flex-col">
                                  {sortColumn === column.key ? (
                                    sortDirection === "asc" ? (
                                      <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    )
                                  ) : (
                                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                    {paginatedLogs.map((row, i) => (
                      <tr
                        key={`${row.date}-${row.time}-${row.campaign_id || i}`}
                        className={`${density.rowHeight} transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                          i % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50/30 dark:bg-gray-800/50"
                        }`}
                      >
                        {visibleColumns.time && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {row.time}
                            </div>
                          </td>
                        )}
                        {visibleColumns.date && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}
                          >
                            {row.date}
                          </td>
                        )}
                        {visibleColumns.platform && (
                          <td className={`${density.padding} ${density.fontSize}`}>
                            <PlatformCell platform={row.platform} />
                          </td>
                        )}
                        {visibleColumns.account_id && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-600 dark:text-gray-400 font-mono text-xs`}
                          >
                            {row.account_id}
                          </td>
                        )}
                        {visibleColumns.account_name && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-900 dark:text-gray-100 font-medium`}
                          >
                            {row.account_name}
                          </td>
                        )}
                        {visibleColumns.campaign_id && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-600 dark:text-gray-400 font-mono text-xs`}
                          >
                            {row.campaign_id}
                          </td>
                        )}
                        {visibleColumns.campaign_name && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate`}
                            title={row.campaign_name}
                          >
                            {row.campaign_name}
                          </td>
                        )}
                        {visibleColumns.spend && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-right text-amber-600 dark:text-amber-500 font-semibold tabular-nums`}
                          >
                            ${row.spend.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.revenue && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-right text-emerald-600 dark:text-emerald-500 font-semibold tabular-nums`}
                          >
                            ${row.revenue.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.profit && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-right font-semibold tabular-nums ${row.profit >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {row.profit >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              ${Math.abs(row.profit).toFixed(2)}
                            </div>
                          </td>
                        )}
                        {visibleColumns.reason && (
                          <td
                            className={`${density.padding} ${density.fontSize} text-gray-600 dark:text-gray-400 max-w-md`}
                          >
                            {row.reason ? (
                              <div className="text-xs bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 line-clamp-2">
                                {row.reason}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {/* Summary Row with Right-Aligned Totals */}
                  <tfoot className="bg-gray-100 dark:bg-gray-700/50 border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
                    <tr>
                      <td
                        colSpan={
                          columns.filter(
                            (col) =>
                              visibleColumns[col.key] &&
                              !["spend", "revenue", "profit"].includes(col.key)
                          ).length
                        }
                        className={`${density.padding} ${density.fontSize} text-gray-900 dark:text-white`}
                      >
                        Totals ({filteredLogs.length} entries)
                      </td>
                      {visibleColumns.spend && (
                        <td
                          className={`${density.padding} ${density.fontSize} text-right text-amber-600 dark:text-amber-500 tabular-nums`}
                        >
                          $
                          {summary.totalSpend.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      )}
                      {visibleColumns.revenue && (
                        <td
                          className={`${density.padding} ${density.fontSize} text-right text-emerald-600 dark:text-emerald-500 tabular-nums`}
                        >
                          $
                          {summary.totalRevenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      )}
                      {visibleColumns.profit && (
                        <td
                          className={`${density.padding} ${density.fontSize} text-right tabular-nums ${summary.totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}
                        >
                          $
                          {summary.totalProfit.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      )}
                      {visibleColumns.reason && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination - PREMIUM STYLE */}
              <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                  </div>

                  <nav className="flex items-center gap-1" aria-label="Pagination">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      title="First page"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      title="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              currentPage === pageNum
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Mobile Page Indicator */}
                    <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {currentPage} / {totalPages}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      title="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      title="Last page"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </>
          )}

          {/* Error State - PREMIUM STYLE */}
          {!loading && err && (
            <div className="p-16 flex justify-center items-center">
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Data
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{err}</p>
                <button
                  onClick={fetchAllLogsAllTime}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State - PREMIUM STYLE */}
          {!loading && !err && sortedLogs.length === 0 && (
            <div className="p-16 flex justify-center items-center">
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No logs found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery ||
                  selectedPlatform !== "all" ||
                  selectedAccount !== "all" ||
                  profitFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "There are no action logs to display yet."}
                </p>
                {(searchQuery ||
                  selectedPlatform !== "all" ||
                  selectedAccount !== "all" ||
                  profitFilter !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
