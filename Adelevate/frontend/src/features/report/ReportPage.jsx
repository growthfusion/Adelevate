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

// API Configuration - Helper function to get correct API URL
const getApiUrl = () => {
  // Check for environment variable first (for production)
  const apiUrl = import.meta.env.VITE_REPORTS_API_URL;
  
  if (apiUrl) {
    // Use environment variable if set
    return apiUrl.endsWith('/daily') ? apiUrl : `${apiUrl}/daily`;
  }
  
  if (import.meta.env.PROD) {
    // In production, use relative path that goes through proxy/backend
    // Your web server (nginx/Apache/Cloudflare) must proxy /api/reports/* to http://65.109.65.93:8080/v1/reports/*
    return "/api/reports/daily";
  }
  
  // In development, use the proxy we set up in vite.config.js
  return "/reports-api/daily";
};

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
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("meta");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Sorting states
  const [sortColumn, setSortColumn] = useState("report_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // UI states
  const [showFilters, setShowFilters] = useState(true);

  // Period options
  const periodOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "yesterday", label: "Yesterday" },
    { value: "today", label: "Today" }
  ];

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const apiUrl = getApiUrl();
      console.log("Fetching from API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          period: selectedPeriod
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Extract array from response - handle different response formats
      let results = [];
      if (Array.isArray(responseData)) {
        results = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        results = responseData.data;
      } else if (responseData && Array.isArray(responseData.results)) {
        results = responseData.results;
      } else if (responseData && Array.isArray(responseData.campaigns)) {
        results = responseData.campaigns;
      } else if (responseData && typeof responseData === 'object') {
        // If response is an object, try to find an array property
        const values = Object.values(responseData);
        const arrayValue = values.find(val => Array.isArray(val));
        if (arrayValue) {
          results = arrayValue;
        }
      }

      console.log("Extracted data:", results.length, "rows");

      // Apply search filter on client side if needed
      let filteredResults = [...results];
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim().toLowerCase();
        filteredResults = results.filter((row) =>
          (row.campaign_name || "").toLowerCase().includes(searchTerm)
        );
      }

      // Apply campaign filter on client side if needed
      if (selectedCampaign !== "all") {
        filteredResults = filteredResults.filter(
          (row) => row.campaign_name === selectedCampaign
        );
      }

      // Apply sorting on client side
      filteredResults.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Handle numeric values
        if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) {
          aVal = parseFloat(aVal);
        }
        if (typeof bVal === "string" && !isNaN(parseFloat(bVal))) {
          bVal = parseFloat(bVal);
        }

        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });

      setData(results);
      setFilteredData(filteredResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data from API");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [selectedPlatform, selectedPeriod]);

  // Apply client-side filtering and sorting when these change
  useEffect(() => {
    let filteredResults = [...data];

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.trim().toLowerCase();
      filteredResults = filteredResults.filter((row) =>
        (row.campaign_name || "").toLowerCase().includes(searchTerm)
      );
    }

    // Apply campaign filter
    if (selectedCampaign !== "all") {
      filteredResults = filteredResults.filter(
        (row) => row.campaign_name === selectedCampaign
      );
    }

    // Apply sorting
    filteredResults.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle numeric values
      if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
      }
      if (typeof bVal === "string" && !isNaN(parseFloat(bVal))) {
        bVal = parseFloat(bVal);
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFilteredData(filteredResults);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCampaign, sortColumn, sortDirection, data]);

  // Get unique campaigns for filter
  const uniqueCampaigns = useMemo(() => {
     const campaigns = [...new Set(data.map((row) => row.campaign_name).filter(Boolean))];
     return campaigns.sort();
   }, [data]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        total: 0,
        totalSpend: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgROI: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalImpressions: 0,
        totalUniqueClicks: 0,
        totalLpViews: 0,
        totalLpClicks: 0,
        avgCPC: 0,
        avgCPA: 0,
        avgEPC: 0
      };
    }

    const total = filteredData.length;
    const totalSpend = filteredData.reduce((sum, row) => sum + (parseFloat(row.spend || row.cost) || 0), 0);
    const totalRevenue = filteredData.reduce((sum, row) => sum + (parseFloat(row.revenue) || 0), 0);
    const totalProfit = totalRevenue - totalSpend;
    const avgROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;
    const totalClicks = filteredData.reduce((sum, row) => sum + (parseFloat(row.clicks) || 0), 0);
    const totalConversions = filteredData.reduce((sum, row) => sum + (parseFloat(row.conversions) || 0), 0);
    const totalImpressions = filteredData.reduce((sum, row) => sum + (parseFloat(row.impressions) || 0), 0);
    const totalUniqueClicks = filteredData.reduce((sum, row) => sum + (parseFloat(row.unique_clicks) || 0), 0);
    const totalLpViews = filteredData.reduce((sum, row) => sum + (parseFloat(row.lp_views) || 0), 0);
    const totalLpClicks = filteredData.reduce((sum, row) => sum + (parseFloat(row.lp_clicks) || 0), 0);
    
    // Calculate averages
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgEPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;

    return {
      total,
      totalSpend,
      totalRevenue,
      totalProfit,
      avgROI,
      totalClicks,
      totalConversions,
      totalImpressions,
      totalUniqueClicks,
      totalLpViews,
      totalLpClicks,
      avgCPC,
      avgCPA,
      avgEPC
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
    a.download = `campaign_report_${selectedPlatform}_${selectedPeriod}.csv`;
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
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
             <MetricCard
               icon={FileText}
               label="Total Records"
               value={metrics.total.toLocaleString()}
               color="#6366f1"
             />
             <MetricCard
               icon={DollarSign}
               label="Total Spend"
               value={`$${formatNumber(metrics.totalSpend)}`}
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
               label="Total Impressions"
               value={metrics.totalImpressions.toLocaleString()}
               color="#a855f7"
             />
             <MetricCard
               icon={Eye}
               label="Total Clicks"
               value={metrics.totalClicks.toLocaleString()}
               color="#3b82f6"
             />
             <MetricCard
               icon={Eye}
               label="Unique Clicks"
               value={metrics.totalUniqueClicks.toLocaleString()}
               color="#06b6d4"
             />
             <MetricCard
               icon={TrendingUp}
               label="Total Conversions"
               value={metrics.totalConversions.toLocaleString()}
               color="#8b5cf6"
             />
             <MetricCard
               icon={Eye}
               label="LP Views"
               value={metrics.totalLpViews.toLocaleString()}
               color="#ec4899"
             />
             <MetricCard
               icon={Eye}
               label="LP Clicks"
               value={metrics.totalLpClicks.toLocaleString()}
               color="#f97316"
             />
             <MetricCard
               icon={DollarSign}
               label="Avg CPC"
               value={`$${formatNumber(metrics.avgCPC)}`}
               color="#14b8a6"
             />
             <MetricCard
               icon={DollarSign}
               label="Avg CPA"
               value={`$${formatNumber(metrics.avgCPA)}`}
               color="#f59e0b"
             />
             <MetricCard
               icon={DollarSign}
               label="Avg EPC"
               value={`$${formatNumber(metrics.avgEPC)}`}
               color="#10b981"
             />
           </div>
        </div>

         {/* Filters Section */}
         {showFilters && (
           <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                   <option value="meta">Meta</option>
                   <option value="snap">Snap</option>
                 </select>
               </div>

               {/* Period Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Period
                 </label>
                 <select
                   value={selectedPeriod}
                   onChange={(e) => setSelectedPeriod(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 >
                   {periodOptions.map((option) => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
               </div>

               {/* Search */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Search Campaign
                 </label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input
                     type="text"
                     placeholder="Search campaigns..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
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
                      {/* <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("report_date")}
                       >
                         <div className="flex items-center gap-2">
                           Date
                           {sortColumn === "report_date" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th> */}
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
                         onClick={() => handleSort("spend")}
                       >
                         <div className="flex items-center gap-2">
                           Spend
                           {sortColumn === "spend" && (
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
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("cpm")}
                       >
                         <div className="flex items-center gap-2">
                           CPM
                           {sortColumn === "cpm" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("cpc")}
                       >
                         <div className="flex items-center gap-2">
                           CPC
                           {sortColumn === "cpc" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("ctr")}
                       >
                         <div className="flex items-center gap-2">
                           CTR
                           {sortColumn === "ctr" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("cpa")}
                       >
                         <div className="flex items-center gap-2">
                           CPA
                           {sortColumn === "cpa" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("lpctr")}
                       >
                         <div className="flex items-center gap-2">
                           LP CTR
                           {sortColumn === "lpctr" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("epc")}
                       >
                         <div className="flex items-center gap-2">
                           EPC
                           {sortColumn === "epc" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                       <th
                         className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                         onClick={() => handleSort("lpcpc")}
                       >
                         <div className="flex items-center gap-2">
                           LP CPC
                           {sortColumn === "lpcpc" && (
                             <ArrowUpDown className="w-4 h-4" />
                           )}
                         </div>
                       </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                     {paginatedData.map((row, index) => {
                       const spend = parseFloat(row.spend || row.cost) || 0;
                       const revenue = parseFloat(row.revenue) || 0;
                       const profit = revenue - spend;
                       const roi = row.roi !== null && row.roi !== undefined ? parseFloat(row.roi) * 100 : (spend > 0 ? ((profit / spend) * 100) : 0);
                       const clicks = parseFloat(row.clicks) || 0;
                       const uniqueClicks = parseFloat(row.unique_clicks) || 0;
                       const conversions = parseFloat(row.conversions) || 0;
                       const lpViews = parseFloat(row.lp_views) || 0;
                       const lpClicks = parseFloat(row.lp_clicks) || 0;
                       const impressions = parseFloat(row.impressions) || 0;
                       
                       // Additional metrics from API
                       const cpm = row.cpm !== null && row.cpm !== undefined ? parseFloat(row.cpm) : null;
                       const cpc = row.cpc !== null && row.cpc !== undefined ? parseFloat(row.cpc) : null;
                       const ctr = row.ctr !== null && row.ctr !== undefined ? parseFloat(row.ctr) * 100 : null;
                       const cpa = row.cpa !== null && row.cpa !== undefined ? parseFloat(row.cpa) : null;
                       const lpctr = row.lpctr !== null && row.lpctr !== undefined ? parseFloat(row.lpctr) * 100 : null;
                       const epc = row.epc !== null && row.epc !== undefined ? parseFloat(row.epc) : null;
                       const lpcpc = row.lpcpc !== null && row.lpcpc !== undefined ? parseFloat(row.lpcpc) : null;

                       return (
                         <tr
                           key={index}
                           className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                         >
                           {/* <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                             {formatDate(row.report_date || row.date)}
                           </td> */}
                           <td className="px-4 py-3">
                             <PlatformCell platform={row.platform} />
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {row.campaign_name || "-"}
                           </td>
                           <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                             ${formatNumber(spend)}
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
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {cpm !== null ? `$${formatNumber(cpm)}` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {cpc !== null ? `$${formatNumber(cpc)}` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {ctr !== null ? `${formatNumber(ctr)}%` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {cpa !== null ? `$${formatNumber(cpa)}` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {lpctr !== null ? `${formatNumber(lpctr)}%` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {epc !== null ? `$${formatNumber(epc)}` : "-"}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                             {lpcpc !== null ? `$${formatNumber(lpcpc)}` : "-"}
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

