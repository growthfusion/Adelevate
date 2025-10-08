import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE = "";

export default function ActionLogsDashboard({ onBack }) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState("All time");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedStartDate, setSelectedStartDate] = useState(new Date(0));
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());

    const [allLogs, setAllLogs] = useState([]);   // ← entire dataset
    const [logs, setLogs] = useState([]);         // ← filtered by date locally

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const dateRangeOptions = [
        "All time","Today","Yesterday","Last 3 days","Last 7 days","Last 14 days","Last 30 days",
        "This month","Last month","Last 90 days","Last 6 months",
    ];

    // explicit column widths + wrapping so data shows fully
    const gridTemplate =
        "80px 120px 100px 160px 240px 180px 260px 120px 120px 120px 360px";

    const columns = [
        "Time","Date","Platform","Account id","Account Name","Campaign id",
        "Campaign Name","Spend","Revenue","Profit","Reason",
    ];

    const presetRange = useMemo(() => {
        const now = new Date();
        const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        switch (selectedDateRange) {
            case "All time":  return { start: new Date(0), end: now };                           // CHANGED
            case "Today":     return { start: startOfDay(now), end: now };
            case "Yesterday": {
                const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                return { start: startOfDay(y), end: new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999) };
            }
            case "Last 3 days":  return { start: new Date(now.getTime() - 3  * 24 * 3600 * 1000), end: now };
            case "Last 7 days":  return { start: new Date(now.getTime() - 7  * 24 * 3600 * 1000), end: now };
            case "Last 14 days": return { start: new Date(now.getTime() - 14 * 24 * 3600 * 1000), end: now };
            case "Last 30 days": return { start: new Date(now.getTime() - 30 * 24 * 3600 * 1000), end: now };
            case "This month":   return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
            case "Last month": {
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                return { start, end };
            }
            case "Last 90 days": return { start: new Date(now.getTime() - 90 * 24 * 3600 * 1000), end: now };
            case "Last 6 months":return { start: new Date(now.getTime() - 182 * 24 * 3600 * 1000), end: now };
            default:             return { start: new Date(0), end: now };                         // CHANGED: fallback = all time
        }
    }, [selectedDateRange]);

    const generateCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));
        const days = [];
        const current = new Date(startDate);
        for (let i = 0; i < 42; i++) { days.push(new Date(current)); current.setDate(current.getDate() + 1); }
        return days;
    };

    const formatDate = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isDateInRange = (date) => date >= selectedStartDate && date <= selectedEndDate;
    const isDateSelected = (date) => date.getTime() === selectedStartDate.getTime() || date.getTime() === selectedEndDate.getTime();

    // Normalize any row shape to the columns your UI expects
    function normalizeRow(r) {
        const num = (v) => (v == null || v === "" ? 0 : Number(v));

        // CHANGED: prefer server-provided ts_ms; fallback to parsing event_ts
        let tsMs = typeof r.ts_ms === "number" ? r.ts_ms : null;          // CHANGED
        if (tsMs == null) {                                               // CHANGED
            const rawTs = r.event_ts ?? r.ts ?? r._raw?.event_ts ?? null;
            if (rawTs) {
                const isoGuess = typeof rawTs === "string" && rawTs.includes(" UTC")
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
            _raw: r,
            _ts: tsMs,
        };
    }

    // Fetch ALL pages once (all time)
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
                    offset: String(offset),
                });
                const res  = await fetch(`${API_BASE}/api/bigquery?${params.toString()}`, { cache: "no-store" });
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error || `API ${res.status}`);

                const rows = Array.isArray(json.rows) ? json.rows : [];
                all.push(...rows.map(normalizeRow));
                if (rows.length < PAGE_SIZE) break;
                offset += PAGE_SIZE;
            }

            setAllLogs(all);
            setLogs(filterByRange(all, presetRange.start, presetRange.end));  // CHANGED: initial filter from preset
        } catch (e) {
            setErr(e.message || String(e));
            setAllLogs([]);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    // CHANGED: filter—now requires a valid _ts; rows without _ts are excluded
    function filterByRange(rows, start, end) {
        const startMs = start.getTime();
        const endMs = end.getTime();
        return rows.filter((r) => typeof r._ts === "number" && r._ts >= startMs && r._ts <= endMs);
    }

    // CHANGED: keep dates in sync with preset selection
    useEffect(() => {
        setSelectedStartDate(presetRange.start);
        setSelectedEndDate(presetRange.end);
    }, [presetRange.start, presetRange.end]);

    // Load all rows once
    useEffect(() => {
        fetchAllLogsAllTime();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // CHANGED: re-filter locally when dates change
    useEffect(() => {
        if (allLogs.length) {
            setLogs(filterByRange(allLogs, selectedStartDate, selectedEndDate));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStartDate.getTime(), selectedEndDate.getTime(), allLogs.length]);

    const handleApplyDateFilter = () => {
        setShowDatePicker(false);
        setLogs(filterByRange(allLogs, selectedStartDate, selectedEndDate)); // CHANGED
    };

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-blue-500">Logs</h1>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
                        >
                            <Calendar className="w-4 h-4" />
                            {selectedDateRange}
                        </button>

                        {showDatePicker && (
                            <div
                                className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                                style={{ width: "680px" }}
                            >
                                <div className="flex">
                                    {/* Calendar Section */}
                                    <div className="flex-1">
                                        <div className="flex gap-8">
                                            {/* Current month */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <h3 className="font-medium">
                                                        {currentMonth.toLocaleString("en-US", { month: "short", year: "numeric" })}
                                                    </h3>
                                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
                                                        <div key={day} className="text-xs text-blue-600 font-medium text-center p-1">{day}</div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {generateCalendar(currentMonth).map((date, index) => {
                                                        const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
                                                        const classes = isOtherMonth
                                                            ? "text-gray-300"
                                                            : isDateSelected(date)
                                                                ? "bg-blue-600 text-white"
                                                                : isDateInRange(date)
                                                                    ? "bg-blue-100 text-blue-600"
                                                                    : "text-gray-700";
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    if (!selectedStartDate || (selectedStartDate && selectedEndDate && selectedStartDate <= selectedEndDate)) {
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
                                                                className={`text-sm p-1 text-center hover:bg-blue-50 rounded ${classes}`}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Next month preview */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div />
                                                    <h3 className="font-medium">
                                                        {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).toLocaleString("en-US", { month: "short", year: "numeric" })}
                                                    </h3>
                                                    <div />
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
                                                        <div key={day} className="text-xs text-blue-600 font-medium text-center p-1">{day}</div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {generateCalendar(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)).map((date, index) => {
                                                        const month = (currentMonth.getMonth() + 1) % 12;
                                                        const isOtherMonth = date.getMonth() !== month;
                                                        const classes = isOtherMonth
                                                            ? "text-gray-300"
                                                            : isDateSelected(date)
                                                                ? "bg-blue-600 text-white"
                                                                : isDateInRange(date)
                                                                    ? "bg-blue-100 text-blue-600"
                                                                    : "text-gray-700";
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => {
                                                                    if (!selectedStartDate || selectedEndDate < selectedStartDate) {
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
                                                                className={`text-sm p-1 text-center hover:bg-blue-50 rounded ${classes}`}
                                                            >
                                                                {date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <span className="text-sm text-gray-600">{formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowDatePicker(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Cancel</button>
                                                <button onClick={handleApplyDateFilter} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Presets */}
                                    <div className="w-40 ml-4 pl-4 border-l">
                                        <div className="space-y-1">
                                            {dateRangeOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setSelectedDateRange(option)}
                                                    className={`block w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-50 ${
                                                        selectedDateRange === option ? "bg-blue-50 text-blue-600" : "text-gray-700"
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
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="bg-gray-50 border-b border-gray-200 min-w-max">
                        <div className="grid gap-4 px-6 py-3" style={{ gridTemplateColumns: gridTemplate }}>
                            {columns.map((column) => (
                                <div key={column} className="text-sm font-medium text-gray-700">{column}</div>
                            ))}
                        </div>
                    </div>

                    <div className="min-w-max">
                        {loading && <div className="px-6 py-8 text-sm text-gray-500">Loading logs…</div>}
                        {!loading && err && <div className="px-6 py-8 text-sm text-red-600">Error: {err}</div>}
                        {!loading && !err && logs.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500 text-sm">No Results</p>
                            </div>
                        )}

                        {(!loading && !err) && logs.map((row, i) => (
                            <div
                                key={`${row.date}-${row.time}-${row.campaign_id || row._raw?.campaign_id || row._raw?.ad_campaign_id || i}`}
                                className="grid gap-4 px-6 py-3 border-b border-gray-100 text-sm"
                                style={{ gridTemplateColumns: gridTemplate }}
                            >
                                <div className="whitespace-normal break-words" title={row.time}>{row.time}</div>
                                <div className="whitespace-normal break-words" title={row.date}>{row.date}</div>
                                <div className="whitespace-normal break-words" title={row.platform}>{row.platform}</div>
                                <div className="whitespace-normal break-words" title={row.account_id}>{row.account_id}</div>
                                <div className="whitespace-normal break-words" title={row.account_name}>{row.account_name}</div>
                                <div className="whitespace-normal break-words" title={row.campaign_id}>{row.campaign_id}</div>
                                <div className="whitespace-normal break-words" title={row.campaign_name}>{row.campaign_name}</div>
                                <div className="whitespace-normal break-words" title={String(row.spend)}>{row.spend.toFixed(2)}</div>
                                <div className="whitespace-normal break-words" title={String(row.revenue)}>{row.revenue.toFixed(2)}</div>
                                <div className="whitespace-normal break-words" title={String(row.profit)}>{row.profit.toFixed(2)}</div>
                                <div className="whitespace-normal break-words" title={row.reason}>{row.reason || "-"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
