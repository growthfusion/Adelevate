import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectThemeColors } from "@/features/theme/themeSlice";

const dateRangeOptions = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "custom", label: "Custom" }
];

const DatePickerToggle = ({ selectedRange, onRangeChange, customRange }) => {
  const theme = useSelector(selectThemeColors); // Get theme from Redux
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(customRange?.start || "");
  const [customEnd, setCustomEnd] = useState(customRange?.end || "");

  const selectedOption =
    dateRangeOptions.find((opt) => opt.id === selectedRange) || dateRangeOptions[2];

  const handleSelect = (rangeId) => {
    if (rangeId === "custom") {
      return;
    }
    onRangeChange(rangeId);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onRangeChange("custom", { start: customStart, end: customEnd });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2.5 rounded-[14px] transition-all duration-200"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderSubtle}`,
          color: theme.textSecondary
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
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
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <svg
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-64 rounded-[14px] overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}
        >
          <ul className="py-2">
            {dateRangeOptions.map((option) => (
              <li key={option.id}>
                <button
                  onClick={() => handleSelect(option.id)}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors duration-150"
                  style={{
                    backgroundColor:
                      selectedRange === option.id ? `${theme.blue}12` : "transparent",
                    color: selectedRange === option.id ? theme.blue : theme.textSecondary
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Custom Date Inputs */}
          <div className="px-4 py-3 border-t" style={{ borderColor: theme.borderSubtle }}>
            <div className="space-y-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary
                }}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.borderSubtle}`,
                  color: theme.textPrimary
                }}
                placeholder="End Date"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className="w-full py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: customStart && customEnd ? theme.blue : theme.bgSecondary,
                  color: customStart && customEnd ? "#FFFFFF" : theme.textSecondary
                }}
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerToggle;
