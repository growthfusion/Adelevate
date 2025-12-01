import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  FileText,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart3
} from "lucide-react";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ClickHouse Configuration
const CH_HOST = "65.109.65.93";
const CH_PORT = 8123;
const CH_USER = "adelevate_user";
const CH_PASS = "Growthfusion@9012";
const CH_DB = "default";
const CH_SECURE = false;

// ClickHouse Query Helper
async function queryClickHouse(sqlQuery) {
  const protocol = CH_SECURE ? "https" : "http";
  const url = `${protocol}://${CH_HOST}:${CH_PORT}/?database=${CH_DB}&default_format=JSONEachRow`;
  
  const auth = btoa(`${CH_USER}:${CH_PASS}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "text/plain",
    },
    body: sqlQuery,
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ClickHouse error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  if (!text.trim()) {
    return [];
  }

  // Parse JSONEachRow format (one JSON object per line)
  return text
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

// Platform icon mapping
const platformIcons = {
  newsbreak: nb,
  facebook: fb,
  fb: fb,
  meta: fb,
  snapchat: snapchatIcon,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  googleads: googleIcon
};

// Platform Cell Component
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
          <div className="h-4 w-4 rounded bg-gray-300"></div>
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
        {platform || "-"}
      </span>
    </div>
  );
};

// Metric Card Component
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

export default function ReportPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectingSchema, setDetectingSchema] = useState(true);
  const [error, setError] = useState("");

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Sorting states
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // UI states
  const [showFilters, setShowFilters] = useState(true);

  // Initialize date range (default to yesterday)
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    setEndDate(yesterday.toISOString().split("T")[0]);
    setStartDate(yesterday.toISOString().split("T")[0]);
  }, []);

  // Fetch table structure to find date column
  const [dateColumnName, setDateColumnName] = useState(null);

  useEffect(() => {
    const detectDateColumn = async () => {
      setDetectingSchema(true);
      try {
        // Query one row to see the structure
        const sampleQuery = "SELECT * FROM campaign_daily_aggregate LIMIT 1";
        const sample = await queryClickHouse(sampleQuery);
        
        if (sample.length > 0) {
          const row = sample[0];
          const keys = Object.keys(row);
          
          // Look for date-related column names
          const dateCol = keys.find(key => {
            const lowerKey = key.toLowerCase();
            return (
              lowerKey.includes("date") || 
              lowerKey.includes("day") || 
              lowerKey === "timestamp" ||
              lowerKey === "created_at"
            );
          });

          if (dateCol) {
            console.log("Detected date column:", dateCol);
            setDateColumnName(dateCol);
          } else {
            console.warn("No date column found. Available columns:", keys);
            // Try common alternatives
            const commonNames = ["date", "report_date", "day", "timestamp"];
            let found = false;
            for (const name of commonNames) {
              if (keys.includes(name)) {
                setDateColumnName(name);
                found = true;
                break;
              }
            }
            // If still not found, use first column that looks like a date value
            if (!found) {
              // Check if any column value looks like a date
              for (const key of keys) {
                const value = row[key];
                if (value && typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                  setDateColumnName(key);
                  found = true;
                  break;
                }
              }
            }
            if (!found) {
              console.error("Could not detect date column. Please check table structure.");
              setError("Could not detect date column in table. Available columns: " + keys.join(", "));
            }
          }
        }
      } catch (err) {
        console.error("Error detecting date column:", err);
        setError(`Failed to detect table structure: ${err.message}`);
      } finally {
        setDetectingSchema(false);
      }
    };

    detectDateColumn();
  }, []);

  // Fetch data from ClickHouse
  const fetchData = async () => {
    if (!dateColumnName && startDate && endDate) {
      // Wait for date column to be detected
      return;
    }

    setLoading(true);
    setError("");

    try {
      let query = "SELECT * FROM campaign_daily_aggregate WHERE 1=1";

       // Add date filters (use detected column name, default to report_date)
       const dateCol = dateColumnName || "report_date";
       if (startDate) {
         query += ` AND ${dateCol} >= '${startDate}'`;
       }
       if (endDate) {
         query += ` AND ${dateCol} <= '${endDate}'`;
       }

      // Add platform filter
      if (selectedPlatform !== "all") {
        query += ` AND platform = '${selectedPlatform}'`;
      }

       // Add campaign filter
       if (selectedCampaign !== "all") {
         query += ` AND campaign_name = '${selectedCampaign}'`;
       }

       // Add search query (search in campaign_name)
       if (searchQuery && searchQuery.trim()) {
         const searchTerm = searchQuery.trim().replace(/'/g, "''"); // Escape single quotes
         query += ` AND campaign_name LIKE '%${searchTerm}%'`;
       }

       // Add sorting (handle date column name and cost/spend)
       let sortCol = sortColumn === "date" ? (dateColumnName || "report_date") : sortColumn;
       if (sortCol === "spend" || sortCol === "cost") {
         sortCol = "cost";
       }
       query += ` ORDER BY ${sortCol} ${sortDirection.toUpperCase()}`;

      // Add limit for performance
      query += ` LIMIT 10000`;

      console.log("Executing ClickHouse query:", query);
      const results = await queryClickHouse(query);
      console.log("Fetched data:", results.length, "rows");

      setData(results);
      setFilteredData(results);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data from database");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    if (!startDate || !endDate || !dateColumnName) return;
    
    const timeoutId = setTimeout(() => {
      fetchData();
    }, searchQuery ? 500 : 0); // Debounce search by 500ms, no debounce for other filters

     return () => clearTimeout(timeoutId);
   }, [startDate, endDate, selectedPlatform, selectedCampaign, sortColumn, sortDirection, searchQuery, dateColumnName]);

  // Get unique values for filters
  const uniquePlatforms = useMemo(() => {
    const platforms = [...new Set(data.map((row) => row.platform).filter(Boolean))];
    return platforms.sort();
  }, [data]);

   const uniqueCampaigns = useMemo(() => {
     const campaigns = [...new Set(data.map((row) => row.campaign_name).filter(Boolean))];
     return campaigns.sort();
   }, [data]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredData.length;
    const totalCost = filteredData.reduce((sum, row) => sum + (parseFloat(row.cost) || 0), 0);
    const totalRevenue = filteredData.reduce((sum, row) => sum + (parseFloat(row.revenue) || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100) : 0;
    const totalClicks = filteredData.reduce((sum, row) => sum + (parseFloat(row.clicks) || 0), 0);
    const totalConversions = filteredData.reduce((sum, row) => sum + (parseFloat(row.conversions) || 0), 0);

    return {
      total,
      totalCost,
      totalRevenue,
      totalProfit,
      avgROI,
      totalClicks,
      totalConversions
    };
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, rowsPerPage]);

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0] || {});
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value || "";
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign_report_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    const n = parseFloat(num);
    if (isNaN(n)) return "-";
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Campaign Daily Report
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                View and analyze campaign performance data
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {filteredData.length > 0 && (
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>

           {/* Metrics Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             <MetricCard
               icon={FileText}
               label="Total Records"
               value={metrics.total.toLocaleString()}
               color="#6366f1"
             />
             <MetricCard
               icon={DollarSign}
               label="Total Cost"
               value={`$${formatNumber(metrics.totalCost)}`}
               color="#ef4444"
             />
             <MetricCard
               icon={TrendingUp}
               label="Total Revenue"
               value={`$${formatNumber(metrics.totalRevenue)}`}
               color="#22c55e"
             />
             <MetricCard
               icon={DollarSign}
               label="Total Profit"
               value={`$${formatNumber(metrics.totalProfit)}`}
               color={metrics.totalProfit >= 0 ? "#22c55e" : "#ef4444"}
             />
             <MetricCard
               icon={BarChart3}
               label="Avg ROI"
               value={`${formatNumber(metrics.avgROI)}%`}
               color={metrics.avgROI >= 0 ? "#22c55e" : "#ef4444"}
             />
             <MetricCard
               icon={Eye}
               label="Total Clicks"
               value={metrics.totalClicks.toLocaleString()}
               color="#3b82f6"
             />
             <MetricCard
               icon={TrendingUp}
               label="Total Conversions"
               value={metrics.totalConversions.toLocaleString()}
               color="#8b5cf6"
             />
           </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search (Name/ID)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        fetchData();
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Platforms</option>
                  {uniquePlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

               {/* Campaign Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Campaigns</option>
                  {uniqueCampaigns.map((campaign) => (
                    <option key={campaign} value={campaign}>
                      {campaign}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Schema Detection Message */}
        {detectingSchema && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <p className="text-blue-800 dark:text-blue-200">Detecting table structure...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading data...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No data found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {sortColumn === "date" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleSort("platform")}
                      >
                        <div className="flex items-center gap-2">
                          Platform
                          {sortColumn === "platform" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         Campaign Name
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("cost")}
                       >
                         <div className="flex items-center gap-2">
                           Cost
                           {sortColumn === "cost" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("revenue")}
                       >
                         <div className="flex items-center gap-2">
                           Revenue
                           {sortColumn === "revenue" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         Profit
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         ROI
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("clicks")}
                       >
                         <div className="flex items-center gap-2">
                           Clicks
                           {sortColumn === "clicks" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         Unique Clicks
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("conversions")}
                       >
                         <div className="flex items-center gap-2">
                           Conversions
                           {sortColumn === "conversions" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         LP Views
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         LP Clicks
                       </th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                         Impressions
                       </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                     {paginatedData.map((row, index) => {
                       const cost = parseFloat(row.cost) || 0;
                       const revenue = parseFloat(row.revenue) || 0;
                       const profit = revenue - cost;
                       const roi = cost > 0 ? ((profit / cost) * 100) : 0;
                       const clicks = parseFloat(row.clicks) || 0;
                       const uniqueClicks = parseFloat(row.unique_clicks) || 0;
                       const conversions = parseFloat(row.conversions) || 0;
                       const lpViews = parseFloat(row.lp_views) || 0;
                       const lpClicks = parseFloat(row.lp_clicks) || 0;
                       const impressions = parseFloat(row.impressions) || 0;

                       return (
                         <tr
                           key={index}
                           className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                         >
                           <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                             {formatDate(row[dateColumnName || "report_date"] || row.report_date || row.date)}
                           </td>
                           <td className="px-4 py-3">
                             <PlatformCell platform={row.platform} />
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {row.campaign_name || "-"}
                           </td>
                           <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                             ${formatNumber(cost)}
                           </td>
                           <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                             ${formatNumber(revenue)}
                           </td>
                           <td
                             className={`px-4 py-3 text-sm font-medium ${
                               profit >= 0
                                 ? "text-green-600 dark:text-green-400"
                                 : "text-red-600 dark:text-red-400"
                             }`}
                           >
                             ${formatNumber(profit)}
                           </td>
                           <td
                             className={`px-4 py-3 text-sm font-medium ${
                               roi >= 0
                                 ? "text-green-600 dark:text-green-400"
                                 : "text-red-600 dark:text-red-400"
                             }`}
                           >
                             {formatNumber(roi)}%
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {clicks.toLocaleString()}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {uniqueClicks.toLocaleString()}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {conversions.toLocaleString()}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {lpViews.toLocaleString()}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {lpClicks.toLocaleString()}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {impressions.toLocaleString()}
                           </td>
                         </tr>
                       );
                     })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rows per page:
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages} ({filteredData.length} total)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

