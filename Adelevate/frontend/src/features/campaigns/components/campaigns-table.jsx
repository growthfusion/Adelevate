import { useEffect, useMemo, useRef, useState } from "react";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// Platform Icon Component
function PlatformIcon({ platform }) {
  const platformIconsMap = {
    google: googleIcon,
    facebook: fb,
    tiktok: tiktokIcon,
    snap: snapchatIcon,
    newsbreak: nb,
  };

  const iconSrc = platformIconsMap[platform];

  if (!iconSrc) {
    return <span className="w-5 h-5 inline-block">?</span>;
  }

  return <img src={iconSrc} alt={`${platform} icon`} className="w-5 h-5" />;
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    active: {
      label: "Active",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      dotColor: "bg-emerald-500",
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    paused: {
      label: "Paused",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      dotColor: "bg-amber-500",
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = statusConfig[status] || statusConfig.paused;

  return (
    <div className="inline-flex items-center justify-center w-full">
      <span
        className={`
          inline-flex items-center gap-1.5
          px-2.5 py-1
          rounded-full text-xs font-medium
          ${config.bgColor} ${config.textColor}
          transition-all duration-200 hover:shadow-sm
        `}
      >
        <span className="flex-shrink-0">{config.icon}</span>
        <span className="truncate">{config.label}</span>
      </span>
    </div>
  );
}

// Skeleton loader component
function TableSkeleton({ columnCount, rowCount }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="animate-pulse">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <td
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className="px-4 py-3 border-b border-gray-100"
            >
              <div
                className={`h-5 bg-gray-200 rounded ${
                  colIndex === 0
                    ? "w-12"
                    : colIndex === 1
                    ? "w-full"
                    : "w-16 ml-auto"
                }`}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function CampaignsTable({ filters = {} }) {
  function makeRows(count = 100) {
    const baseId = 7000;
    const titles = [
      "f1 | atmt | nvn | s29 | atnk | oct14",
      "HomeService | Google | Homefixpro | 23OCT | arbu",
      "AUTO | SNAP | SV1F | RT | NK",
      "Auto | R3 | Meta | SV1F",
      "SW Mx | Meta | Everydaydeals | 25 OCT | eubla",
      "Auto | Meta | Autoinsurancesaver | 27 OCT | multicar",
      "Homeinsurance | Newsbreak | HomeShieldplus | 27 OCT | lphome",
    ];

    const platforms = ["google", "facebook", "tiktok", "snap", "newsbreak"];
    const statuses = ["active", "paused"];

    const rows = [];
    for (let i = 0; i < count; i++) {
      const clicks = Math.floor(Math.random() * 140);
      const lpViews = clicks + Math.floor(Math.random() * 40);
      const lpClicks = Math.max(
        0,
        Math.floor(clicks * 0.2) - Math.floor(Math.random() * 4)
      );
      const purchases = Math.floor(Math.random() * 8);
      const cost = Math.random() * 100;
      const revenue = Math.random() * 150;
      const profit = revenue - cost;

      rows.push({
        id: baseId - i,
        title: titles[i % titles.length],
        platform: platforms[i % platforms.length],
        status: statuses[i % statuses.length],
        tag: [
          "Mythili",
          "Naga",
          "Shanker",
          "Ramanan",
          "Jai",
          "ArunS",
          "naveen",
          "Ashwin",
          "Raju",
          "Sudhanshu",
          "Hari",
          "Gokulraj",
        ][i % 12],
        cost,
        revenue,
        profit,
        lpCtr: lpViews > 0 ? (lpClicks / lpViews) * 100 : 0,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        purchases,
        cpa: purchases > 0 ? cost / purchases : 0,
        aov: purchases > 0 ? revenue / purchases : 0,
        cr: clicks > 0 ? (purchases / clicks) * 100 : 0,
        lpcpc: lpClicks > 0 ? cost / lpClicks : 0,
        lpepc: lpClicks > 0 ? revenue / lpClicks : 0,
        clicks,
        lpViews,
        lpClicks,
      });
    }
    return rows;
  }

  const columns = [
    { id: "id", label: "#", numeric: true, sticky: true },
    { id: "title", label: "Campaign Title", numeric: false, sticky: true },
    { id: "status", label: "Status", numeric: false },
    {
      id: "cost",
      label: "Cost",
      numeric: true,
      format: (val) => `$${val.toFixed(2)}`,
    },
    {
      id: "revenue",
      label: "Revenue",
      numeric: true,
      format: (val) => `$${val.toFixed(2)}`,
    },
    {
      id: "profit",
      label: "Profit",
      numeric: true,
    },
    {
      id: "lpCtr",
      label: "LP CTR",
      numeric: true,
      format: (val) => `${val.toFixed(1)}%`,
      tooltip: "Landing Page CTR: (LP Clicks / LP Views) * 100",
    },
    {
      id: "roi",
      label: "ROI",
      numeric: true,
      tooltip: "Return On Investment: (Profit / Cost) * 100",
    },
    { id: "purchases", label: "Purchases", numeric: true },
    {
      id: "cpa",
      label: "CPA",
      numeric: true,
      format: (val) => `$${val.toFixed(2)}`,
      tooltip: "Cost Per Acquisition: Cost / Purchases",
    },
    {
      id: "aov",
      label: "AOV",
      numeric: true,
      format: (val) => `$${val.toFixed(2)}`,
      tooltip: "Average Order Value: Revenue / Purchases",
    },
    {
      id: "cr",
      label: "Conv. Rate",
      numeric: true,
      format: (val) => `${val.toFixed(1)}%`,
      tooltip: "Conversion Rate: (Purchases / Clicks) * 100",
    },
    {
      id: "lpcpc",
      label: "LP CPC",
      numeric: true,
      format: (val) => val.toFixed(2),
      tooltip: "Landing Page Cost Per Click: Cost / LP Clicks",
    },
    {
      id: "lpepc",
      label: "LP EPC",
      numeric: true,
      format: (val) => val.toFixed(2),
      tooltip: "Landing Page Earnings Per Click: Revenue / LP Clicks",
    },
    { id: "clicks", label: "Clicks", numeric: true },
    { id: "lpViews", label: "LP Views", numeric: true },
    { id: "lpClicks", label: "LP Clicks", numeric: true },
  ];

  const [rawData, setRawData] = useState(() => makeRows(100));
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [page, setPage] = useState(1);
  const scrollRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [density, setDensity] = useState("comfortable");
  const [columnSelectionOrder, setColumnSelectionOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [drillDownState, setDrillDownState] = useState({
    expandedCampaigns: new Set(),
    expandedDates: new Map(),
    expandedHours: new Map(),
    expandedOffers: new Map(),
  });

  const [drillDownCache, setDrillDownCache] = useState({
    dates: new Map(),
    hours: new Map(),
    offers: new Map(),
    landings: new Map(),
  });

  const [columnOrder, setColumnOrder] = useState(() =>
    columns.map((_, i) => i)
  );
  const [columnWidths, setColumnWidths] = useState(() => {
    const widths = {};
    columns.forEach((col, i) => {
      if (i === 0) widths[col.id] = 60;
      else if (i === 1) widths[col.id] = 300;
      else if (i === 2) widths[col.id] = 130;
      else widths[col.id] = 120;
    });
    return widths;
  });

  const [resizing, setResizing] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getRowBackgroundColor = (profit, level) => {
    const opacity =
      level === 0
        ? ""
        : level === 1
        ? "bg-opacity-80"
        : level === 2
        ? "bg-opacity-60"
        : level === 3
        ? "bg-opacity-40"
        : "bg-opacity-20";

    if (profit >= 0) {
      return `bg-green-50 ${opacity} hover:bg-yellow-100`;
    } else {
      return `bg-red-50 ${opacity} hover:bg-yellow-100`;
    }
  };

  const refreshData = () => {
    setIsLoading(true);

    setDrillDownCache({
      dates: new Map(),
      hours: new Map(),
      offers: new Map(),
      landings: new Map(),
    });

    setDrillDownState({
      expandedCampaigns: new Set(),
      expandedDates: new Map(),
      expandedHours: new Map(),
      expandedOffers: new Map(),
    });

    setTimeout(() => {
      setRawData(makeRows(100));
      setIsLoading(false);
    }, 1500);
  };

  const sortedColumnOrder = useMemo(() => {
    if (columnSelectionOrder.length === 0) return columnOrder;

    const result = [];

    for (const colId of columnSelectionOrder) {
      const colIndex = columns.findIndex((c) => c.id === colId);
      if (
        colIndex !== -1 &&
        !hiddenCols.has(colIndex) &&
        columnOrder.includes(colIndex)
      ) {
        result.push(colIndex);
      }
    }

    for (const colIdx of columnOrder) {
      if (!hiddenCols.has(colIdx) && !result.includes(colIdx)) {
        result.push(colIdx);
      }
    }

    return result;
  }, [columnOrder, columnSelectionOrder, hiddenCols, columns]);

  useEffect(() => {
    if (resizing === null) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      setColumnWidths((prev) => ({
        ...prev,
        [resizing.id]: Math.max(
          60,
          resizing.startWidth + (e.clientX - resizing.startX)
        ),
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  const cellPadding = {
    compact: "px-2 py-1",
    standard: "px-3 py-2",
    comfortable: "px-4 py-3",
    veryComfortable: "px-6 py-4",
  };

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const toggleColumn = (idx) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      const colId = columns[idx].id;
      if (next.has(idx)) {
        next.delete(idx);
        setColumnSelectionOrder((prevOrder) => [...prevOrder, colId]);
      } else {
        next.add(idx);
        setColumnSelectionOrder((prevOrder) =>
          prevOrder.filter((id) => id !== colId)
        );
      }
      return next;
    });
  };

  const isHidden = (i) => hiddenCols.has(i);

  const toggleCampaignExpansion = (campaignId) => {
    setDrillDownState((prev) => {
      const newState = { ...prev };
      const newExpandedCampaigns = new Set(prev.expandedCampaigns);

      if (newExpandedCampaigns.has(campaignId)) {
        newExpandedCampaigns.delete(campaignId);

        const newExpandedDates = new Map(prev.expandedDates);
        const newExpandedHours = new Map(prev.expandedHours);
        const newExpandedOffers = new Map(prev.expandedOffers);

        for (const key of Array.from(newExpandedDates.keys())) {
          if (key.startsWith(`${campaignId}-`)) {
            newExpandedDates.delete(key);
          }
        }

        for (const key of Array.from(newExpandedHours.keys())) {
          if (key.startsWith(`${campaignId}-`)) {
            newExpandedHours.delete(key);
          }
        }

        for (const key of Array.from(newExpandedOffers.keys())) {
          if (key.startsWith(`${campaignId}-`)) {
            newExpandedOffers.delete(key);
          }
        }

        newState.expandedDates = newExpandedDates;
        newState.expandedHours = newExpandedHours;
        newState.expandedOffers = newExpandedOffers;
      } else {
        newExpandedCampaigns.add(campaignId);

        if (!drillDownCache.dates.has(campaignId)) {
          const dateData = getDateBreakdown(campaignId);
          setDrillDownCache((prev) => {
            const newCache = { ...prev };
            newCache.dates.set(campaignId, dateData);
            return newCache;
          });
        }
      }

      newState.expandedCampaigns = newExpandedCampaigns;
      return newState;
    });
  };

  const toggleDateExpansion = (campaignId, dateId) => {
    const mapKey = `${campaignId}-${dateId}`;

    setDrillDownState((prev) => {
      const newExpandedDates = new Map(prev.expandedDates);
      const newExpandedHours = new Map(prev.expandedHours);
      const newExpandedOffers = new Map(prev.expandedOffers);

      if (newExpandedDates.has(mapKey)) {
        newExpandedDates.delete(mapKey);

        for (const key of Array.from(newExpandedHours.keys())) {
          if (key.startsWith(`${mapKey}-`)) {
            newExpandedHours.delete(key);
          }
        }

        for (const key of Array.from(newExpandedOffers.keys())) {
          if (key.startsWith(`${mapKey}-`)) {
            newExpandedOffers.delete(key);
          }
        }
      } else {
        newExpandedDates.set(mapKey, true);

        if (!drillDownCache.hours.has(mapKey)) {
          const hourData = getHourBreakdown(campaignId, dateId);
          setDrillDownCache((prev) => {
            const newCache = { ...prev };
            newCache.hours.set(mapKey, hourData);
            return newCache;
          });
        }
      }

      return {
        ...prev,
        expandedDates: newExpandedDates,
        expandedHours: newExpandedHours,
        expandedOffers: newExpandedOffers,
      };
    });
  };

  const toggleHourExpansion = (campaignId, dateId, hourId) => {
    const mapKey = `${campaignId}-${dateId}-${hourId}`;

    setDrillDownState((prev) => {
      const newExpandedHours = new Map(prev.expandedHours);
      const newExpandedOffers = new Map(prev.expandedOffers);

      if (newExpandedHours.has(mapKey)) {
        newExpandedHours.delete(mapKey);

        for (const key of Array.from(newExpandedOffers.keys())) {
          if (key.startsWith(`${mapKey}-`)) {
            newExpandedOffers.delete(key);
          }
        }
      } else {
        newExpandedHours.set(mapKey, true);

        if (!drillDownCache.offers.has(mapKey)) {
          const offerData = getOfferBreakdown(campaignId, dateId, hourId);
          setDrillDownCache((prev) => {
            const newCache = { ...prev };
            newCache.offers.set(mapKey, offerData);
            return newCache;
          });
        }
      }

      return {
        ...prev,
        expandedHours: newExpandedHours,
        expandedOffers: newExpandedOffers,
      };
    });
  };

  const toggleOfferExpansion = (campaignId, dateId, hourId, offerId) => {
    const mapKey = `${campaignId}-${dateId}-${hourId}-${offerId}`;

    setDrillDownState((prev) => {
      const newExpandedOffers = new Map(prev.expandedOffers);

      if (newExpandedOffers.has(mapKey)) {
        newExpandedOffers.delete(mapKey);
      } else {
        newExpandedOffers.set(mapKey, true);

        if (!drillDownCache.landings.has(mapKey)) {
          const landingData = getLandingBreakdown(
            campaignId,
            dateId,
            hourId,
            offerId
          );
          setDrillDownCache((prev) => {
            const newCache = { ...prev };
            newCache.landings.set(mapKey, landingData);
            return newCache;
          });
        }
      }

      return {
        ...prev,
        expandedOffers: newExpandedOffers,
      };
    });
  };

  const filteredData = useMemo(() => {
    let result = [...rawData];

    if (filters.platforms && filters.platforms.length > 0) {
      result = result.filter((row) => filters.platforms.includes(row.platform));
    }

    if (filters.title && filters.title.trim()) {
      const searchTerm = filters.title.toLowerCase();
      result = result.filter((row) =>
        row.title.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.tags && filters.tags.trim()) {
      const searchTerm = filters.tags.toLowerCase();
      result = result.filter((row) =>
        row.tag.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((row) => filters.status.includes(row.status));
    }

    return result;
  }, [rawData, filters]);

  const handleSort = (columnId) => {
    let direction = "ascending";
    if (sortConfig.key === columnId && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.key === columnId &&
      sortConfig.direction === "descending"
    ) {
      direction = null;
    }

    setSortConfig({
      key: direction ? columnId : null,
      direction: direction,
    });
  };

  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];

    if (!sortConfig.key || !sortConfig.direction) {
      return dataToSort;
    }

    return dataToSort.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

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

  const getDateBreakdown = (campaignId) => {
    const campaign = sortedData.find((row) => row.id === campaignId);
    if (!campaign) return [];

    const dates = [
      "2025-01-20",
      "2025-01-21",
      "2025-01-22",
      "2025-01-23",
      "2025-01-24",
      "2025-01-25",
      "2025-01-26",
    ];

    const statuses = ["active", "paused"];
    const divider = dates.length;

    return dates.map((date, i) => {
      const variation = 0.5 + Math.random() * 1.5;

      const clicks = Math.floor((campaign.clicks / divider) * variation);
      const lpViews = Math.floor((campaign.lpViews / divider) * variation);
      const lpClicks = Math.floor((campaign.lpClicks / divider) * variation);
      const purchases = Math.max(
        0,
        Math.floor((campaign.purchases / divider) * variation)
      );
      const cost = (campaign.cost / divider) * variation;
      const revenue = (campaign.revenue / divider) * variation;
      const profit = revenue - cost;

      return {
        id: `date-${i}`,
        campaignId,
        title: date,
        type: "date",
        level: 1,
        status: statuses[i % statuses.length],
        cost,
        revenue,
        profit,
        clicks,
        purchases,
        lpViews,
        lpClicks,
        lpCtr: lpViews > 0 ? (lpClicks / lpViews) * 100 : 0,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        cpa: purchases > 0 ? cost / purchases : 0,
        aov: purchases > 0 ? revenue / purchases : 0,
        cr: clicks > 0 ? (purchases / clicks) * 100 : 0,
        lpcpc: lpClicks > 0 ? cost / lpClicks : 0,
        lpepc: lpClicks > 0 ? revenue / lpClicks : 0,
        platform: campaign.platform,
      };
    });
  };

  const getHourBreakdown = (campaignId, dateId) => {
    const dateKey = `${campaignId}-${dateId}`;
    const dateData = drillDownCache.dates.get(campaignId);
    if (!dateData) return [];

    const date = dateData.find((d) => d.id === dateId);
    if (!date) return [];

    const statuses = ["active", "paused"];
    const divider = 24;

    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, "0") + ":00";
      const variation = 0.5 + Math.random() * 1.5;

      const clicks = Math.floor((date.clicks / divider) * variation);
      const lpViews = Math.floor((date.lpViews / divider) * variation);
      const lpClicks = Math.floor((date.lpClicks / divider) * variation);
      const purchases = Math.max(
        0,
        Math.floor((date.purchases / divider) * variation)
      );
      const cost = (date.cost / divider) * variation;
      const revenue = (date.revenue / divider) * variation;
      const profit = revenue - cost;

      return {
        id: `hour-${i}`,
        campaignId,
        dateId,
        title: hour,
        type: "hour",
        level: 2,
        status: statuses[i % statuses.length],
        cost,
        revenue,
        profit,
        clicks,
        purchases,
        lpViews,
        lpClicks,
        lpCtr: lpViews > 0 ? (lpClicks / lpViews) * 100 : 0,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        cpa: purchases > 0 ? cost / purchases : 0,
        aov: purchases > 0 ? revenue / purchases : 0,
        cr: clicks > 0 ? (purchases / clicks) * 100 : 0,
        lpcpc: lpClicks > 0 ? cost / lpClicks : 0,
        lpepc: lpClicks > 0 ? revenue / lpClicks : 0,
        platform: date.platform,
      };
    });
  };

  const getOfferBreakdown = (campaignId, dateId, hourId) => {
    const hourKey = `${campaignId}-${dateId}-${hourId}`;
    const hourData = drillDownCache.hours.get(`${campaignId}-${dateId}`);
    if (!hourData) return [];

    const hour = hourData.find((h) => h.id === hourId);
    if (!hour) return [];

    const offers = [
      "AutoQuoteZone | CPL $15 | Monthly",
      "Auto | 7828 | Rev Share | mid",
      "HomeService | Quote | 30USD",
      "Finance | Loans | CPS $75",
    ];

    const statuses = ["active", "paused"];
    const offerCount = 3 + Math.floor(Math.random() * 2);
    const divider = offerCount;

    return offers.slice(0, offerCount).map((offerName, i) => {
      const variation = 0.5 + Math.random() * 1.5;

      const clicks = Math.floor((hour.clicks / divider) * variation);
      const lpViews = Math.floor((hour.lpViews / divider) * variation);
      const lpClicks = Math.floor((hour.lpClicks / divider) * variation);
      const purchases = Math.max(
        0,
        Math.floor((hour.purchases / divider) * variation)
      );
      const cost = (hour.cost / divider) * variation;
      const revenue = (hour.revenue / divider) * variation;
      const profit = revenue - cost;

      return {
        id: `offer-${i}`,
        campaignId,
        dateId,
        hourId,
        title: offerName,
        type: "offer",
        level: 3,
        status: statuses[i % statuses.length],
        cost,
        revenue,
        profit,
        clicks,
        purchases,
        lpViews,
        lpClicks,
        lpCtr: lpViews > 0 ? (lpClicks / lpViews) * 100 : 0,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        cpa: purchases > 0 ? cost / purchases : 0,
        aov: purchases > 0 ? revenue / purchases : 0,
        cr: clicks > 0 ? (purchases / clicks) * 100 : 0,
        lpcpc: lpClicks > 0 ? cost / lpClicks : 0,
        lpepc: lpClicks > 0 ? revenue / lpClicks : 0,
        platform: hour.platform,
      };
    });
  };

  const getLandingBreakdown = (campaignId, dateId, hourId, offerId) => {
    const offerKey = `${campaignId}-${dateId}-${hourId}`;
    const offerData = drillDownCache.offers.get(offerKey);
    if (!offerData) return [];

    const offer = offerData.find((o) => o.id === offerId);
    if (!offer) return [];

    const landings = [
      "Auto | Newsbreak | Autoinsurancesaver | 29AUG | ccggv12",
      "Auto | Newsbreak | Autoinsurancesaver | 1SEP | drivesecurepro",
      "Home | Snapchat | HomeRepairPro | 15OCT | quotev8",
      "Loans | Meta | FastCashNow | 20OCT | apply-online",
    ];

    const statuses = ["active", "paused"];
    const landingCount = 2 + Math.floor(Math.random() * 3);
    const divider = landingCount;

    return landings.slice(0, landingCount).map((landingName, i) => {
      const variation = 0.5 + Math.random() * 1.5;

      const clicks = Math.floor((offer.clicks / divider) * variation);
      const lpViews = Math.floor((offer.lpViews / divider) * variation);
      const lpClicks = Math.floor((offer.lpClicks / divider) * variation);
      const purchases = Math.max(
        0,
        Math.floor((offer.purchases / divider) * variation)
      );
      const cost = (offer.cost / divider) * variation;
      const revenue = (offer.revenue / divider) * variation;
      const profit = revenue - cost;

      return {
        id: `landing-${i}`,
        campaignId,
        dateId,
        hourId,
        offerId,
        title: landingName,
        type: "landing",
        level: 4,
        status: statuses[i % statuses.length],
        cost,
        revenue,
        profit,
        clicks,
        purchases,
        lpViews,
        lpClicks,
        lpCtr: lpViews > 0 ? (lpClicks / lpViews) * 100 : 0,
        roi: cost > 0 ? (profit / cost) * 100 : 0,
        cpa: purchases > 0 ? cost / purchases : 0,
        aov: purchases > 0 ? revenue / purchases : 0,
        cr: clicks > 0 ? (purchases / clicks) * 100 : 0,
        lpcpc: lpClicks > 0 ? cost / lpClicks : 0,
        lpepc: lpClicks > 0 ? revenue / lpClicks : 0,
        platform: offer.platform,
      };
    });
  };

  const pageRows = useMemo(() => {
    const baseRows = sortedData.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );

    const result = [];

    baseRows.forEach((campaign) => {
      result.push(campaign);

      if (drillDownState.expandedCampaigns.has(campaign.id)) {
        let dateData = drillDownCache.dates.get(campaign.id);
        if (!dateData) {
          dateData = getDateBreakdown(campaign.id);
          setDrillDownCache((prev) => {
            const newCache = { ...prev };
            newCache.dates.set(campaign.id, dateData);
            return newCache;
          });
        }

        dateData.forEach((date) => {
          result.push(date);

          const dateMapKey = `${campaign.id}-${date.id}`;
          if (drillDownState.expandedDates.has(dateMapKey)) {
            let hourData = drillDownCache.hours.get(dateMapKey);
            if (!hourData) {
              hourData = getHourBreakdown(campaign.id, date.id);
              setDrillDownCache((prev) => {
                const newCache = { ...prev };
                newCache.hours.set(dateMapKey, hourData);
                return newCache;
              });
            }

            hourData.forEach((hour) => {
              result.push(hour);

              const hourMapKey = `${campaign.id}-${date.id}-${hour.id}`;
              if (drillDownState.expandedHours.has(hourMapKey)) {
                let offerData = drillDownCache.offers.get(hourMapKey);
                if (!offerData) {
                  offerData = getOfferBreakdown(campaign.id, date.id, hour.id);
                  setDrillDownCache((prev) => {
                    const newCache = { ...prev };
                    newCache.offers.set(hourMapKey, offerData);
                    return newCache;
                  });
                }

                offerData.forEach((offer) => {
                  result.push(offer);

                  const offerMapKey = `${campaign.id}-${date.id}-${hour.id}-${offer.id}`;
                  if (drillDownState.expandedOffers.has(offerMapKey)) {
                    let landingData = drillDownCache.landings.get(offerMapKey);
                    if (!landingData) {
                      landingData = getLandingBreakdown(
                        campaign.id,
                        date.id,
                        hour.id,
                        offer.id
                      );
                      setDrillDownCache((prev) => {
                        const newCache = { ...prev };
                        newCache.landings.set(offerMapKey, landingData);
                        return newCache;
                      });
                    }

                    landingData.forEach((landing) => {
                      result.push(landing);
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return result;
  }, [page, rowsPerPage, sortedData, drillDownState, drillDownCache]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [rowsPerPage, totalPages, page]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const showAllColumns = () => {
    setHiddenCols(new Set());
    setColumnSelectionOrder([]);
  };

  const hideAllColumns = () =>
    setHiddenCols(new Set(columns.map((_, idx) => idx)));

  const resetTable = () => {
    setHiddenCols(new Set());
    setDensity("comfortable");
    setRowsPerPage(100);
    setPage(1);
    setOpenMenu(null);
    setSortConfig({ key: null, direction: null, clickedColumn: null });
    setColumnSelectionOrder([]);

    setDrillDownState({
      expandedCampaigns: new Set(),
      expandedDates: new Map(),
      expandedHours: new Map(),
      expandedOffers: new Map(),
    });

    setDrillDownCache({
      dates: new Map(),
      hours: new Map(),
      offers: new Map(),
      landings: new Map(),
    });

    setColumnOrder(columns.map((_, i) => i));
    const defaultWidths = {};
    columns.forEach((col, i) => {
      if (i === 0) defaultWidths[col.id] = 60;
      else if (i === 1) defaultWidths[col.id] = 300;
      else if (i === 2) defaultWidths[col.id] = 130;
      else defaultWidths[col.id] = 120;
    });
    setColumnWidths(defaultWidths);
  };

  const getSortIndicator = (columnId) => {
    if (sortConfig.key !== columnId) {
      return "⇅";
    }
    if (sortConfig.direction === "ascending") {
      return "↑";
    }
    return "↓";
  };

  const formatProfitValue = (value) => {
    const colorClass = value >= 0 ? "text-green-600" : "text-red-600";
    const displayValue =
      value >= 0 ? value.toFixed(2) : `-${Math.abs(value).toFixed(2)}`;

    return (
      <span className={`font-semibold ${colorClass}`}>${displayValue}</span>
    );
  };

  const formatRevenueValue = (value, profit) => {
    const colorClass = profit >= 0 ? "text-green-600" : "text-red-600";

    return (
      <span className={`font-semibold ${colorClass}`}>${value.toFixed(2)}</span>
    );
  };

  const formatROIValue = (value) => {
    const colorClass = value >= 0 ? "text-green-600" : "text-red-600";

    return (
      <span className={`font-semibold ${colorClass}`}>{value.toFixed(1)}%</span>
    );
  };

  const getCellValue = (row, columnId) => {
    const value = row[columnId];
    if (value === undefined || value === null) return "";

    const column = columns.find((col) => col.id === columnId);

    if (columnId === "status") {
      return <StatusBadge status={value} />;
    } else if (columnId === "profit") {
      return formatProfitValue(value);
    } else if (columnId === "revenue") {
      return formatRevenueValue(value, row.profit);
    } else if (columnId === "roi") {
      return formatROIValue(value);
    } else if (column && column.format) {
      return column.format(value);
    }

    return value;
  };

  const getLevelIcon = (type) => {
    switch (type) {
      case "date":
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "hour":
        return (
          <svg
            className="w-4 h-4 text-purple-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "offer":
        return (
          <svg
            className="w-4 h-4 text-orange-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "landing":
        return (
          <svg
            className="w-4 h-4 text-teal-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTotalContent = (columnId) => {
    if (columnId === "title") {
      return "Total:";
    } else if (columnId === "cost") {
      return `$${totals.cost.toFixed(2)}`;
    } else if (columnId === "revenue") {
      const profitClass =
        totals.profit >= 0 ? "text-green-700" : "text-red-700";
      return (
        <span className={`${profitClass} font-bold`}>
          ${totals.revenue.toFixed(2)}
        </span>
      );
    } else if (columnId === "profit") {
      const profitClass =
        totals.profit >= 0 ? "text-green-700" : "text-red-700";
      const displayValue =
        totals.profit >= 0
          ? totals.profit.toFixed(2)
          : `-${Math.abs(totals.profit).toFixed(2)}`;
      return (
        <span className={`${profitClass} font-bold`}>${displayValue}</span>
      );
    } else if (columnId === "lpCtr") {
      return `${
        totals.lpClicks && totals.lpViews
          ? ((totals.lpClicks / totals.lpViews) * 100).toFixed(1)
          : "0.0"
      }%`;
    } else if (columnId === "roi") {
      const roiValue = totals.cost ? (totals.profit / totals.cost) * 100 : 0;
      const roiClass = roiValue >= 0 ? "text-green-700" : "text-red-700";
      return (
        <span className={`${roiClass} font-bold`}>{roiValue.toFixed(1)}%</span>
      );
    } else if (columnId === "purchases") {
      return totals.purchases.toLocaleString();
    } else if (columnId === "cpa") {
      return `$${
        totals.purchases ? (totals.cost / totals.purchases).toFixed(2) : "0.00"
      }`;
    } else if (columnId === "aov") {
      return `$${
        totals.purchases
          ? (totals.revenue / totals.purchases).toFixed(2)
          : "0.00"
      }`;
    } else if (columnId === "cr") {
      return `${
        totals.clicks && totals.purchases
          ? ((totals.purchases / totals.clicks) * 100).toFixed(1)
          : "0.0"
      }%`;
    } else if (columnId === "lpcpc") {
      return totals.lpClicks
        ? (totals.cost / totals.lpClicks).toFixed(2)
        : "0.00";
    } else if (columnId === "lpepc") {
      return totals.lpClicks
        ? (totals.revenue / totals.lpClicks).toFixed(2)
        : "0.00";
    } else if (columnId === "clicks") {
      return totals.clicks.toLocaleString();
    } else if (columnId === "lpViews") {
      return totals.lpViews.toLocaleString();
    } else if (columnId === "lpClicks") {
      return totals.lpClicks.toLocaleString();
    } else {
      return "";
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-screen">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/75 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Campaign Analytics
            </h2>

            {(filters.platforms?.length > 0 ||
              filters.title ||
              filters.tags ||
              filters.status?.length > 0) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {filters.platforms?.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Platforms: {filters.platforms.join(", ")}
                  </span>
                )}
                {filters.status?.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Status: {filters.status.join(", ")}
                  </span>
                )}
                {filters.title && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Title: "{filters.title}"
                  </span>
                )}
                {filters.tags && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Tags: "{filters.tags}"
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={refreshData}
              disabled={isLoading}
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>

            {/* Columns Menu */}
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                onClick={() =>
                  setOpenMenu((m) => (m === "columns" ? null : "columns"))
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                Columns
              </button>
              {openMenu === "columns" && (
                <div className="absolute right-0 z-30 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="flex justify-between gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        onClick={showAllColumns}
                      >
                        Show All
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={hideAllColumns}
                      >
                        Hide All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto px-2 py-1">
                    {columns.map((column, idx) => (
                      <label
                        key={column.id}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(idx)}
                          onChange={() => toggleColumn(idx)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                          {column.label}
                        </span>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                onClick={() =>
                  setOpenMenu((m) => (m === "density" ? null : "density"))
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Density
              </button>
              {openMenu === "density" && (
                <div className="absolute right-0 z-30 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {[
                    "compact",
                    "standard",
                    "comfortable",
                    "veryComfortable",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="density"
                        checked={density === opt}
                        onChange={() => setDensity(opt)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {opt === "veryComfortable"
                          ? "Very Comfortable"
                          : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              onClick={resetTable}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - SCROLLABLE */}
      <div ref={scrollRef} className="overflow-auto flex-grow">
        <div className="relative">
          <table className="w-full border-collapse min-w-max">
            {/* ✅ FIXED HEADER with RedTrack Style */}
            <thead className="sticky top-0 z-20 bg-white">
              <tr style={{ backgroundColor: "#ebeff3" }}>
                {sortedColumnOrder.map((colIdx) => {
                  if (isHidden(colIdx)) return null;
                  const column = columns[colIdx];
                  const sortIcon = getSortIndicator(column.id);
                  const isSorted = sortIcon !== "⇅";
                  const totalContent = getTotalContent(column.id);
                  const isSticky = column.sticky;

                  return (
                    <th
                      key={column.id}
                      className={`
                        relative
                        ${cellPadding[density]}
                        ${column.numeric ? "text-right" : "text-left"}
                        hover:bg-gray-200 transition-colors cursor-pointer
                        border-b-2 border-gray-300 border-r border-gray-200
                        ${
                          draggedColumn === colIdx
                            ? "opacity-50 bg-blue-100"
                            : ""
                        }
                        ${
                          dragOverColumn === colIdx
                            ? "border-l-4 border-blue-500"
                            : ""
                        }
                        ${
                          isSticky
                            ? column.id === "id"
                              ? "sticky left-0 z-30 bg-gray-100 shadow-[2px_0_4px_rgba(0,0,0,0.1)]"
                              : "sticky left-[60px] z-30 bg-gray-100 shadow-[2px_0_4px_rgba(0,0,0,0.1)]"
                            : ""
                        }
                      `}
                      style={{
                        width: `${columnWidths[column.id]}px`,
                        backgroundColor: isSticky ? "#ebeff3" : "#ebeff3",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        cursor: resizing ? "col-resize" : "pointer",
                      }}
                      onClick={() => {
                        if (!resizing) handleSort(column.id);
                      }}
                      draggable="true"
                      onDragStart={(e) => {
                        setDraggedColumn(colIdx);
                        e.dataTransfer.setData("text/plain", String(colIdx));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (
                          draggedColumn !== null &&
                          draggedColumn !== colIdx
                        ) {
                          setDragOverColumn(colIdx);
                        }
                      }}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromColIdx = Number(
                          e.dataTransfer.getData("text/plain")
                        );
                        const toColIdx = colIdx;

                        if (fromColIdx !== toColIdx) {
                          setColumnOrder((prev) => {
                            const newOrder = [...prev];
                            const fromIndex = newOrder.indexOf(fromColIdx);
                            const toIndex = newOrder.indexOf(toColIdx);
                            const [moved] = newOrder.splice(fromIndex, 1);
                            newOrder.splice(toIndex, 0, moved);
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
                      <div className="flex flex-col gap-2">
                        {/* Column Label Row with Icons */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-700 font-semibold text-xs truncate">
                            {column.label}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span
                              className={`text-sm leading-none ${
                                isSorted ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {sortIcon}
                            </span>
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700 p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(
                                  `Filter options for '${column.label}' would appear here.`
                                );
                              }}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <circle cx="2" cy="8" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="14" cy="8" r="1.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* Total Value Row */}
                        <div className="font-bold text-sm text-gray-900 leading-tight">
                          {totalContent}
                        </div>
                      </div>

                      {/* Resizing Handle */}
                      <div
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizing({
                            id: column.id,
                            startX: e.clientX,
                            startWidth: columnWidths[column.id],
                          });
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <TableSkeleton
                  columnCount={
                    sortedColumnOrder.filter((idx) => !isHidden(idx)).length
                  }
                  rowCount={15}
                />
              ) : pageRows.length > 0 ? (
                pageRows.map((row) => {
                  const indentation = row.level ? row.level * 16 : 0;
                  const canExpand =
                    !row.type ||
                    row.type === "date" ||
                    row.type === "hour" ||
                    row.type === "offer";
                  let isExpanded = false;
                  if (!row.type) {
                    isExpanded = drillDownState.expandedCampaigns.has(row.id);
                  } else if (row.type === "date") {
                    isExpanded = drillDownState.expandedDates.has(
                      `${row.campaignId}-${row.id}`
                    );
                  } else if (row.type === "hour") {
                    isExpanded = drillDownState.expandedHours.has(
                      `${row.campaignId}-${row.dateId}-${row.id}`
                    );
                  } else if (row.type === "offer") {
                    isExpanded = drillDownState.expandedOffers.has(
                      `${row.campaignId}-${row.dateId}-${row.hourId}-${row.id}`
                    );
                  }
                  const rowBackground = getRowBackgroundColor(
                    row.profit,
                    row.level || 0
                  );
                  return (
                    <tr
                      key={`${row.type || "campaign"}-${row.id}`}
                      className={`${rowBackground} transition-colors duration-150 border-b border-gray-100`}
                    >
                      {sortedColumnOrder.map((colIdx, cellIndex) => {
                        if (isHidden(colIdx)) return null;
                        const column = columns[colIdx];
                        const isSticky = column.sticky;

                        if (column.id === "id") {
                          return (
                            <td
                              key={`${row.id}-${column.id}`}
                              className={`${cellPadding[density]} text-sm text-gray-900 border-r border-gray-200 sticky left-0 z-10 ${rowBackground}`}
                            >
                              {row.id}
                            </td>
                          );
                        }

                        if (column.id === "title") {
                          return (
                            <td
                              key={`${row.id}-${column.id}`}
                              className={`${cellPadding[density]} text-sm text-gray-900 border-r border-gray-200 sticky left-[60px] z-10 ${rowBackground}`}
                            >
                              <div
                                className="flex items-center gap-2"
                                style={{ paddingLeft: `${indentation}px` }}
                              >
                                {canExpand ? (
                                  <button
                                    onClick={() => {
                                      if (!row.type)
                                        toggleCampaignExpansion(row.id);
                                      else if (row.type === "date")
                                        toggleDateExpansion(
                                          row.campaignId,
                                          row.id
                                        );
                                      else if (row.type === "hour")
                                        toggleHourExpansion(
                                          row.campaignId,
                                          row.dateId,
                                          row.id
                                        );
                                      else if (row.type === "offer")
                                        toggleOfferExpansion(
                                          row.campaignId,
                                          row.dateId,
                                          row.hourId,
                                          row.id
                                        );
                                    }}
                                    className="text-gray-500 hover:text-blue-600 focus:outline-none flex-shrink-0"
                                  >
                                    <svg
                                      className={`w-5 h-5 transition-transform duration-200 ${
                                        isExpanded ? "rotate-90" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </button>
                                ) : (
                                  <span className="w-5 h-5 flex-shrink-0"></span>
                                )}
                                {row.type && (
                                  <span className="flex-shrink-0">
                                    {getLevelIcon(row.type)}
                                  </span>
                                )}
                                {!row.type && (
                                  <div className="text-gray-600 flex-shrink-0">
                                    <PlatformIcon platform={row.platform} />
                                  </div>
                                )}
                                <span
                                  className={`truncate ${
                                    row.type
                                      ? "font-medium text-gray-800"
                                      : "font-semibold"
                                  }`}
                                  title={row.title}
                                >
                                  {row.title}
                                </span>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td
                            key={`${row.id}-${column.id}`}
                            className={`${cellPadding[density]} ${
                              column.numeric ? "text-right" : ""
                            } text-sm text-gray-800 border-r border-gray-200`}
                          >
                            {getCellValue(row, column.id)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      sortedColumnOrder.filter((i) => !isHidden(i)).length
                    }
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-base font-medium text-gray-600">
                        No campaigns found
                      </p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER - Pagination */}
      <div className="px-6 py-3 bg-gray-50/75 border-t border-gray-200 rounded-b-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Rows:</label>
              <select
                className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                disabled={isLoading}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <div className="text-sm font-medium text-gray-600">
              <span className="font-bold text-gray-800">
                {sortedData.length.toLocaleString()}
              </span>{" "}
              results
              {(filters.platforms?.length > 0 ||
                filters.title ||
                filters.tags ||
                filters.status?.length > 0) && (
                <span className="text-gray-500">
                  {" "}
                  (filtered from {rawData.length.toLocaleString()})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v))
                    setPage(Math.min(totalPages, Math.max(1, v)));
                }}
                disabled={isLoading}
                className="w-16 px-2 py-1 text-sm text-center font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100 transition-all"
              />
              <span className="text-sm font-medium text-gray-700">
                of {totalPages}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignsTable;
