import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md border-transparent",
  secondary:
    "bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md border-transparent",
  outline: "border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50",
  ghost: "hover:bg-gray-100 text-gray-700 border-transparent",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md border-transparent",
  success:
    "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md border-transparent",
  warning:
    "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md border-transparent",
  info: "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md border-transparent"
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg"
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 border
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
};

export default Button;
