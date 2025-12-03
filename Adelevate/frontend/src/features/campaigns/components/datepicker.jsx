import { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  subDays,
  startOfDay,
  startOfYear,
  endOfYear,
  subYears,
  isToday
} from "date-fns";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

// ============ PRESETS ============
const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 3 Days", value: "last3days" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" }
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ============ HELPER FUNCTIONS ============
function formatDateRange(startDate, endDate) {
  if (!startDate) return "Select a date range";
  if (!endDate || isSameDay(startDate, endDate)) {
    return format(startDate, "MMM d, yyyy");
  }
  return `${format(startDate, "MMM d, yyyy")} — ${format(endDate, "MMM d, yyyy")}`;
}

function getPresetDates(presetValue) {
  const today = startOfDay(new Date());
  let newStart;
  let newEnd = today;

  switch (presetValue) {
    case "today":
      newStart = today;
      break;
    case "yesterday":
      newStart = newEnd = subDays(today, 1);
      break;
    case "last3days":
      newStart = subDays(today, 2);
      break;
    case "last7days":
      newStart = subDays(today, 6);
      break;
    case "last30days":
      newStart = subDays(today, 29);
      break;
    case "thisMonth":
      newStart = startOfMonth(today);
      break;
    case "lastMonth":
      const lastMonth = subMonths(today, 1);
      newStart = startOfMonth(lastMonth);
      newEnd = endOfMonth(lastMonth);
      break;
    case "thisYear":
      newStart = startOfYear(today);
      break;
    case "lastYear":
      const lastYear = subYears(today, 1);
      newStart = startOfYear(lastYear);
      newEnd = endOfYear(lastYear);
      break;
    default:
      return null;
  }

  return { startDate: newStart, endDate: newEnd };
}

// ============ ICONS ============
const CalendarIcon = ({ color }) => (
  <svg
    className="w-5 h-5 flex-shrink-0"
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const ChevronDownIcon = ({ color, isOpen }) => (
  <svg
    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronLeftIcon = ({ color }) => (
  <svg
    className="w-5 h-5"
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ color }) => (
  <svg
    className="w-5 h-5"
    style={{ color }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ============ MAIN COMPONENT ============
function DatePickerToggle({ initialSelection, onChange }) {
  const theme = useSelector(selectThemeColors);
  const isDark = useSelector(selectIsDarkMode);

  const [selection, setSelection] = useState(
    initialSelection || {
      startDate: startOfDay(new Date()),
      endDate: startOfDay(new Date()),
      key: "today"
    }
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (initialSelection) {
      setSelection(initialSelection);
    }
  }, [initialSelection]);

  const handleApply = useCallback(
    (newSelection) => {
      setSelection(newSelection);
      setShowDatePicker(false);
      if (onChange) {
        onChange(newSelection);
      }
    },
    [onChange]
  );

  const handleCancel = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const getButtonLabel = () => {
    if (selection.key) {
      const preset = PRESETS.find((p) => p.value === selection.key);
      if (preset) return preset.label;
    }
    return formatDateRange(selection.startDate, selection.endDate);
  };

  // Close on outside click & escape
  useEffect(() => {
    if (!showDatePicker) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".datepicker-content") && !e.target.closest(".datepicker-toggle")) {
        setShowDatePicker(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDatePicker]);

  // Prevent body scroll when picker is open on mobile
  useEffect(() => {
    if (showDatePicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDatePicker]);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        className="datepicker-toggle flex h-11 w-full items-center gap-3 rounded-lg border px-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2"
        style={{
          backgroundColor: theme.inputBg,
          borderColor: showDatePicker ? theme.blue : theme.inputBorder,
          color: theme.textPrimary,
          boxShadow: showDatePicker ? `0 0 0 3px ${theme.blue}20` : `0 1px 2px ${theme.shadowSoft}`
        }}
        onClick={() => setShowDatePicker(!showDatePicker)}
        aria-haspopup="dialog"
        aria-expanded={showDatePicker}
      >
        <CalendarIcon color={theme.textSecondary} />
        <span className="flex-1 text-left font-medium truncate">{getButtonLabel()}</span>
        <ChevronDownIcon color={theme.textTertiary} isOpen={showDatePicker} />
      </button>

      {/* DatePicker Dropdown */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:absolute md:inset-auto md:top-full md:left-0 md:mt-2">
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 md:hidden"
            style={{ backgroundColor: theme.bgOverlay }}
            onClick={handleCancel}
          />

          {/* DatePicker Content */}
          <div
            className="datepicker-content relative w-[calc(100vw-32px)] md:w-auto max-h-[85vh] md:max-h-none overflow-hidden rounded-xl border shadow-2xl"
            style={{
              backgroundColor: theme.bgCard,
              borderColor: theme.borderSubtle,
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Date picker"
          >
            <DatePicker
              initialSelection={selection}
              onApply={handleApply}
              onCancel={handleCancel}
              theme={theme}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ DATEPICKER COMPONENT ============
function DatePicker({ initialSelection, onApply, onCancel, theme, isDark }) {
  const [viewDate, setViewDate] = useState(initialSelection.startDate || new Date());
  const [startDate, setStartDate] = useState(initialSelection.startDate);
  const [endDate, setEndDate] = useState(initialSelection.endDate);
  const [activePresetKey, setActivePresetKey] = useState(initialSelection.key);
  const [showSecondMonth, setShowSecondMonth] = useState(window.innerWidth >= 768);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    function handleResize() {
      setShowSecondMonth(window.innerWidth >= 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDayClick = useCallback(
    (day) => {
      setActivePresetKey(null);
      if (!startDate || (startDate && endDate)) {
        setStartDate(day);
        setEndDate(null);
      } else if (isBefore(day, startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    },
    [startDate, endDate]
  );

  const handlePreset = useCallback((preset) => {
    const dates = getPresetDates(preset.value);
    if (dates) {
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
      setViewDate(dates.startDate);
      setActivePresetKey(preset.value);
    }
  }, []);

  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, 1));
  }, []);

  const handleApplyClick = useCallback(() => {
    onApply({ startDate, endDate, key: activePresetKey });
  }, [onApply, startDate, endDate, activePresetKey]);

  // ============ RENDER MONTH ============
  const renderMonth = useCallback(
    (dateToRender, position = "left") => {
      const monthStart = startOfMonth(dateToRender);
      const monthEnd = endOfMonth(dateToRender);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

      const showLeftArrow = position === "left" || !showSecondMonth;
      const showRightArrow = position === "right" || !showSecondMonth;

      return (
        <div className="w-full md:w-[280px]">
          {/* Month Header */}
          <div className="flex items-center justify-between h-10 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                showLeftArrow ? "visible" : "invisible"
              }`}
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Previous month"
            >
              <ChevronLeftIcon color={theme.textSecondary} />
            </button>

            <h2
              className="text-sm font-semibold tracking-wide"
              style={{ color: theme.textPrimary }}
            >
              {format(dateToRender, "MMMM yyyy")}
            </h2>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                showRightArrow ? "visible" : "invisible"
              }`}
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bgCardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Next month"
            >
              <ChevronRightIcon color={theme.textSecondary} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-9 flex items-center justify-center text-xs font-semibold uppercase"
                style={{ color: theme.textTertiary }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, dateToRender);
              const isStartDateDay = startDate && isSameDay(day, startDate);
              const isEndDateDay = endDate && isSameDay(day, endDate);
              const isInRange =
                startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
              const isHoverRange =
                startDate &&
                !endDate &&
                hoverDate &&
                ((isAfter(day, startDate) &&
                  (isBefore(day, hoverDate) || isSameDay(day, hoverDate))) ||
                  (isBefore(day, startDate) &&
                    (isAfter(day, hoverDate) || isSameDay(day, hoverDate))));
              const isTodayDay = isToday(day);

              // Base styles
              let bgColor = "transparent";
              let textColor = theme.textPrimary;
              let fontWeight = "400";
              let borderRadius = "8px";
              let border = "none";
              let opacity = 1;

              if (!isCurrentMonth) {
                textColor = theme.textMuted;
                opacity = 0.3;
              } else if (isStartDateDay || isEndDateDay) {
                bgColor = theme.blue;
                textColor = "#FFFFFF";
                fontWeight = "600";
              } else if (isInRange) {
                bgColor = `${theme.blue}15`;
                textColor = theme.blue;
                borderRadius = "0";
                if (isSameDay(day, startDate)) {
                  borderRadius = "8px 0 0 8px";
                }
              } else if (isHoverRange && isCurrentMonth) {
                bgColor = `${theme.blue}08`;
                borderRadius = "0";
              }

              if (isTodayDay && !isStartDateDay && !isEndDateDay && isCurrentMonth) {
                border = `2px solid ${theme.blue}`;
                fontWeight = "600";
              }

              return (
                <button
                  key={`${day.toString()}-${index}`}
                  type="button"
                  className="h-9 w-full flex items-center justify-center text-sm transition-all duration-100"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    fontWeight,
                    borderRadius,
                    border,
                    opacity
                  }}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  onMouseEnter={() => {
                    if (isCurrentMonth && startDate && !endDate) {
                      setHoverDate(day);
                    }
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={!isCurrentMonth}
                  aria-label={format(day, "EEEE, MMMM d, yyyy")}
                  aria-selected={isStartDateDay || isEndDateDay}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      );
    },
    [
      startDate,
      endDate,
      hoverDate,
      theme,
      handleDayClick,
      handlePrevMonth,
      handleNextMonth,
      showSecondMonth
    ]
  );

  const firstCalendar = useMemo(() => renderMonth(viewDate, "left"), [renderMonth, viewDate]);
  const secondCalendar = useMemo(
    () => renderMonth(addMonths(viewDate, 1), "right"),
    [renderMonth, viewDate]
  );

  return (
    <div className="flex flex-col max-h-[85vh] md:max-h-none overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row p-4 md:p-5 gap-4 md:gap-0 overflow-y-auto md:overflow-visible">
        {/* Presets Panel */}
        <div
          className="flex md:flex-col gap-2 md:gap-1 md:w-36 md:pr-5 md:mr-5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 flex-shrink-0"
          style={{ borderRight: showSecondMonth ? `1px solid ${theme.borderSubtle}` : "none" }}
        >
          {PRESETS.map((preset) => {
            const isActive = activePresetKey === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePreset(preset)}
                className="px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-150 text-left flex-shrink-0"
                style={{
                  backgroundColor: isActive ? `${theme.blue}12` : "transparent",
                  color: isActive ? theme.blue : theme.textSecondary,
                  fontWeight: isActive ? "600" : "400"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    e.currentTarget.style.color = theme.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Calendars */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {firstCalendar}
          {showSecondMonth && secondCalendar}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 md:px-5 py-4 border-t flex-shrink-0"
        style={{
          backgroundColor: theme.bgSecondary,
          borderColor: theme.borderSubtle
        }}
      >
        {/* Selected Range Display */}
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon color={theme.blue} />
          <span className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>
            {formatDateRange(startDate, endDate)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: "transparent",
              color: theme.textSecondary,
              border: `1px solid ${theme.borderSubtle}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bgCardHover;
              e.currentTarget.style.borderColor = theme.borderHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = theme.borderSubtle;
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={!startDate || !endDate}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.buttonPrimaryBg,
              color: theme.buttonPrimaryText
            }}
            onMouseEnter={(e) => {
              if (startDate && endDate) {
                e.currentTarget.style.backgroundColor = theme.buttonPrimaryHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonPrimaryBg;
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatePickerToggle;
