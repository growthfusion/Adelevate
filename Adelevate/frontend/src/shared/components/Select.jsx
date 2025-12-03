import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  error,
  helper,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  fullWidth = true,
  className = "",
  name,
  id
}) => {
  const selectId = id || name;

  return (
    <div className={`space-y-1 ${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 pr-10 border rounded-lg transition-all appearance-none
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            cursor-pointer
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={option.value || index} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
