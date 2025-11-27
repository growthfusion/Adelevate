import { useState, useMemo, useEffect } from "react";
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
  subYears
} from "date-fns";

// Premium Dark Theme
const theme = {
  bgMain: "#050505",
  bgSecondary: "#0A0A0A",
  bgCard: "#0C0C0C",
  bgCardHover: "#101010",
  bgChart: "#111111",
  bgMuted: "#0F0F0F",

  borderSubtle: "#1A1A1A",
  borderHover: "#252525",
  borderMuted: "#1E1E1E",
  dividerSubtle: "#161616",

  shadowSoft: "rgba(0, 0, 0, 0.55)",
  shadowDeep: "rgba(0, 0, 0, 0.7)",
  innerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",

  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textTertiary: "#6B6B6B",
  textMuted: "#525252",

  emerald: "#10B981",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  violet: "#8B5CF6",
  pink: "#EC4899",
  red: "#EF4444",

  gridLines: "#1E1E1E"
};

// CSS for animations
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.2s ease-out forwards;
  }
  
  .datepicker-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .datepicker-scrollbar::-webkit-scrollbar-track {
    background: ${theme.bgSecondary};
    border-radius: 10px;
  }
  .datepicker-scrollbar::-webkit-scrollbar-thumb {
    background: ${theme.borderSubtle};
    border-radius: 10px;
  }
  .datepicker-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${theme.borderHover};
  }
`;

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 3 days", value: "last3days" },
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" }
];

function formatDateRange(startDate, endDate) {
  if (!startDate) return "Select a date range";
  if (!endDate || isSameDay(startDate, endDate)) {
    return format(startDate, "MMM d, yyyy");
  }
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

function DatePickerToggle({ initialSelection, onChange }) {
  const [selection, setSelection] = useState(
    initialSelection || {
      startDate: subDays(new Date(), 2),
      endDate: new Date(),
      key: "last3days"
    }
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  useEffect(() => {
    if (initialSelection) {
      setSelection(initialSelection);
    }
  }, [initialSelection]);

  const handleApply = (newSelection) => {
    setSelection(newSelection);
    setShowDatePicker(false);
    if (onChange) {
      onChange(newSelection);
    }
  };

  const handleCancel = () => {
    setShowDatePicker(false);
  };

  const getButtonLabel = () => {
    if (selection.key) {
      const preset = PRESETS.find((p) => p.value === selection.key);
      if (preset) return preset.label;
    }
    return formatDateRange(selection.startDate, selection.endDate);
  };

  useEffect(() => {
    if (!showDatePicker) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".datepicker-content") && !e.target.closest(".datepicker-toggle")) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  return (
    <div className="relative p-4 font-sans">
      <button
        className="datepicker-toggle flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300"
        style={{
          backgroundColor: isButtonHovered ? theme.bgCardHover : theme.bgCard,
          border: `1px solid ${isButtonHovered ? theme.borderHover : theme.borderSubtle}`,
          color: theme.textPrimary,
          boxShadow: isButtonHovered
            ? `0 4px 20px ${theme.shadowSoft}, 0 0 20px ${theme.blue}10`
            : `0 2px 8px ${theme.shadowSoft}`,
          transform: isButtonHovered ? "translateY(-1px)" : "translateY(0)"
        }}
        onClick={() => setShowDatePicker(!showDatePicker)}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        <svg
          className="h-5 w-5"
          style={{ color: theme.blue }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-medium">{getButtonLabel()}</span>
        <svg
          className="h-4 w-4 transition-transform duration-300"
          style={{
            color: theme.textSecondary,
            transform: showDatePicker ? "rotate(180deg)" : "rotate(0)"
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:block md:absolute md:inset-auto md:top-full md:left-0 md:mt-2">
          {/* Overlay */}
          <div
            className="fixed inset-0 md:hidden"
            style={{ backgroundColor: `${theme.bgMain}80`, backdropFilter: "blur(4px)" }}
            onClick={handleCancel}
          />

          {/* Datepicker Content */}
          <div
            className="datepicker-content animate-scale-in max-w-[calc(100vw-32px)] md:max-w-none overflow-hidden max-h-[90vh] md:max-h-[600px] overflow-y-auto z-50 datepicker-scrollbar"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: "20px",
              boxShadow: `0 20px 60px ${theme.shadowDeep}, 0 0 40px ${theme.blue}10`
            }}
          >
            <DatePicker
              initialSelection={selection}
              onApply={handleApply}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DatePicker({ initialSelection, onApply, onCancel }) {
  const [viewDate, setViewDate] = useState(initialSelection.startDate || new Date());
  const [startDate, setStartDate] = useState(initialSelection.startDate);
  const [endDate, setEndDate] = useState(initialSelection.endDate);
  const [activePresetKey, setActivePresetKey] = useState(initialSelection.key);
  const [showSecondMonth, setShowSecondMonth] = useState(window.innerWidth > 768);

  useEffect(() => {
    function handleResize() {
      setShowSecondMonth(window.innerWidth > 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDayClick = (day) => {
    setActivePresetKey(null);
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (isBefore(day, startDate)) {
      setStartDate(day);
    } else {
      setEndDate(day);
    }
  };

  const handlePreset = (preset) => {
    const today = startOfDay(new Date());
    let newStart;
    let newEnd = today;

    switch (preset.value) {
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
        return;
    }
    setStartDate(newStart);
    setEndDate(newEnd);
    setViewDate(newStart);
    setActivePresetKey(preset.value);
  };

  // Preset Button Component
  const PresetButton = ({ preset }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isActive = activePresetKey === preset.value;

    return (
      <button
        onClick={() => handlePreset(preset)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="px-4 py-2.5 rounded-xl text-sm whitespace-nowrap w-full text-left transition-all duration-300 font-medium"
        style={{
          backgroundColor: isActive
            ? `${theme.blue}15`
            : isHovered
              ? theme.bgCardHover
              : "transparent",
          border: `1px solid ${
            isActive ? `${theme.blue}40` : isHovered ? theme.borderHover : "transparent"
          }`,
          color: isActive ? theme.blue : isHovered ? theme.textPrimary : theme.textSecondary,
          boxShadow: isActive ? `0 0 20px ${theme.blue}15` : "none",
          transform: isHovered && !isActive ? "translateX(4px)" : "translateX(0)"
        }}
      >
        {preset.label}
      </button>
    );
  };

  // Navigation Button Component
  const NavButton = ({ direction, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="p-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: isHovered ? theme.bgCardHover : "transparent",
          border: `1px solid ${isHovered ? theme.borderHover : "transparent"}`,
          color: isHovered ? theme.textPrimary : theme.textSecondary
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
          />
        </svg>
      </button>
    );
  };

  const renderMonth = (dateToRender) => {
    const monthStart = startOfMonth(dateToRender);
    const monthEnd = endOfMonth(dateToRender);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="w-full md:w-72">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <NavButton direction="prev" onClick={() => setViewDate(subMonths(viewDate, 1))} />
          <h2 className="text-base font-semibold" style={{ color: theme.textPrimary }}>
            {format(dateToRender, "MMMM yyyy")}
          </h2>
          <NavButton direction="next" onClick={() => setViewDate(addMonths(viewDate, 1))} />
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div
              key={day}
              className="py-2 text-xs font-medium"
              style={{ color: theme.textTertiary }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, dateToRender);
            const isStartDate = startDate && isSameDay(day, startDate);
            const isEndDate = endDate && isSameDay(day, endDate);
            const isInRange =
              startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
            const isToday = isSameDay(day, new Date());

            return (
              <DayButton
                key={day.toString()}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isStartDate={isStartDate}
                isEndDate={isEndDate}
                isInRange={isInRange}
                isToday={isToday}
                onClick={() => isCurrentMonth && handleDayClick(day)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Day Button Component
  const DayButton = ({
    day,
    isCurrentMonth,
    isStartDate,
    isEndDate,
    isInRange,
    isToday,
    onClick
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isSelected = isStartDate || isEndDate;

    let backgroundColor = "transparent";
    let color = theme.textPrimary;
    let borderColor = "transparent";

    if (!isCurrentMonth) {
      color = theme.textMuted;
    } else if (isSelected) {
      backgroundColor = theme.blue;
      color = theme.textPrimary;
    } else if (isInRange) {
      backgroundColor = `${theme.blue}20`;
      color = theme.blue;
    } else if (isHovered && isCurrentMonth) {
      backgroundColor = theme.bgCardHover;
      borderColor = theme.borderHover;
    }

    if (isToday && !isSelected) {
      borderColor = theme.blue;
    }

    return (
      <button
        type="button"
        className="py-2 rounded-lg transition-all duration-200 relative"
        style={{
          backgroundColor,
          color,
          border: `1px solid ${borderColor}`,
          boxShadow: isSelected ? `0 0 15px ${theme.blue}40` : "none",
          cursor: isCurrentMonth ? "pointer" : "default"
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {format(day, "d")}
        {isToday && !isSelected && (
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ backgroundColor: theme.blue }}
          />
        )}
      </button>
    );
  };

  const firstCalendar = useMemo(() => renderMonth(viewDate), [viewDate, startDate, endDate]);
  const secondCalendar = useMemo(
    () => renderMonth(addMonths(viewDate, 1)),
    [viewDate, startDate, endDate]
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Presets */}
        <div
          className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 w-full md:w-40 overflow-x-auto pb-2 md:pb-0 mb-2 md:mb-0 datepicker-scrollbar"
          style={{ borderRight: `1px solid ${theme.dividerSubtle}` }}
        >
          <div className="pr-4 md:pr-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 hidden md:block"
              style={{ color: theme.textTertiary }}
            >
              Quick Select
            </p>
            <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1">
              {PRESETS.map((preset) => (
                <PresetButton key={preset.value} preset={preset} />
              ))}
            </div>
          </div>
        </div>

        {/* Calendars */}
        <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-2 datepicker-scrollbar">
          {firstCalendar}
          {showSecondMonth && (
            <div
              className="hidden md:block"
              style={{
                borderLeft: `1px solid ${theme.dividerSubtle}`,
                paddingLeft: "2rem"
              }}
            >
              {secondCalendar}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 pt-4"
        style={{ borderTop: `1px solid ${theme.dividerSubtle}` }}
      >
        {/* Date Display */}
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${theme.blue}12`,
              border: `1px solid ${theme.blue}25`
            }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: theme.blue }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            {formatDateRange(startDate, endDate)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <CancelButton onClick={onCancel} />
          <ApplyButton
            onClick={() => onApply({ startDate, endDate, key: activePresetKey })}
            disabled={!startDate || !endDate}
          />
        </div>
      </div>
    </div>
  );
}

// Cancel Button Component
const CancelButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
      style={{
        backgroundColor: isHovered ? theme.bgCardHover : theme.bgSecondary,
        border: `1px solid ${isHovered ? theme.borderHover : theme.borderSubtle}`,
        color: theme.textSecondary,
        transform: isHovered ? "scale(0.98)" : "scale(1)"
      }}
    >
      Cancel
    </button>
  );
};

// Apply Button Component
const ApplyButton = ({ onClick, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
      style={{
        backgroundColor: disabled ? theme.textMuted : theme.blue,
        color: theme.textPrimary,
        boxShadow: !disabled && isHovered ? `0 0 30px ${theme.blue}40` : `0 0 20px ${theme.blue}20`,
        transform: !disabled && isHovered ? "scale(0.98)" : "scale(1)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer"
      }}
    >
      Apply
    </button>
  );
};

export default DatePickerToggle;
