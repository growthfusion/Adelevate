import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      icon,
      iconPosition = "left",
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      required = false,
      disabled = false,
      fullWidth = true,
      className = "",
      inputClassName = "",
      name,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={`space-y-1 ${fullWidth ? "w-full" : ""} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
            w-full px-4 py-2.5 border rounded-lg transition-all
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${icon && iconPosition === "right" ? "pr-10" : ""}
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            ${inputClassName}
          `}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          )}
        </div>

        {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
