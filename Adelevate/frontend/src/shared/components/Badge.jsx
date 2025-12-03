import React from "react";

const variants = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  primary: "bg-indigo-100 text-indigo-800 border-indigo-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200"
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base"
};

const Badge = ({
  children,
  variant = "default",
  size = "md",
  icon,
  dot = false,
  className = ""
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${variant === "success" ? "bg-green-500" : variant === "danger" ? "bg-red-500" : "bg-gray-500"}`}
        />
      )}
      {icon}
      {children}
    </span>
  );
};

export default Badge;
