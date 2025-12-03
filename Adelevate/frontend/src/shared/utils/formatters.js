/**
 * Utility functions for formatting numbers, currency, percentages, etc.
 */

/**
 * Format a number with thousand separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, currency = "USD", decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "$0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a number as percentage
 * @param {number} value - The number to format (0.5 = 50%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} alreadyPercentage - If true, treats value as already a percentage (default: false)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2, alreadyPercentage = false) => {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  
  const percentValue = alreadyPercentage ? value : value * 100;
  
  return `${Number(percentValue).toFixed(decimals)}%`;
};

/**
 * Format a large number with K, M, B suffixes
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted compact number
 */
export const formatCompactNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
};

/**
 * Format bytes to human readable size
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  if (!bytes) return "N/A";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a date
 * @param {Date|string|number} date - The date to format
 * @param {string} format - Format style: 'short', 'medium', 'long', 'full' (default: 'medium')
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = "medium") => {
  if (!date) return "N/A";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  const options = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    medium: { year: "numeric", month: "short", day: "numeric" },
    long: { year: "numeric", month: "long", day: "numeric" },
    full: { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  };
  
  return dateObj.toLocaleDateString("en-US", options[format] || options.medium);
};

/**
 * Format a date with time
 * @param {Date|string|number} date - The date to format
 * @param {boolean} includeSeconds - Include seconds in time (default: false)
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date, includeSeconds = false) => {
  if (!date) return "N/A";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  const dateStr = formatDate(dateObj, "short");
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" })
  };
  const timeStr = dateObj.toLocaleTimeString("en-US", timeOptions);
  
  return `${dateStr} ${timeStr}`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? "s" : ""} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) !== 1 ? "s" : ""} ago`;
  
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) !== 1 ? "s" : ""} ago`;
};

/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0s";
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  if (seconds > 0) return `${seconds}s`;
  
  return `${ms}ms`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = "...") => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Format credit card number with spaces
 * @param {string} cardNumber - Card number to format
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return "";
  
  const cleaned = ("" + cardNumber).replace(/\D/g, "");
  const match = cleaned.match(/.{1,4}/g);
  
  return match ? match.join(" ") : cardNumber;
};

