// Styled utility functions for themed components
export const getThemedStyles = (theme) => ({
  // Container styles
  container: {
    backgroundColor: theme.bgCard,
    borderColor: theme.borderSubtle,
    color: theme.textPrimary
  },

  // Header styles
  header: {
    backgroundColor: theme.bgSecondary,
    borderColor: theme.borderSubtle
  },

  // Table styles
  table: {
    headerBg: theme.tableHeaderBg,
    rowBg: theme.tableRowBg,
    rowHover: theme.tableRowHover,
    border: theme.tableBorder
  },

  // Button styles
  primaryButton: {
    backgroundColor: theme.buttonPrimaryBg,
    color: theme.buttonPrimaryText,
    hoverBg: theme.buttonPrimaryHover
  },

  secondaryButton: {
    backgroundColor: theme.buttonSecondaryBg,
    color: theme.buttonSecondaryText,
    borderColor: theme.borderSubtle,
    hoverBg: theme.buttonSecondaryHover
  },

  // Input styles
  input: {
    backgroundColor: theme.inputBg,
    borderColor: theme.inputBorder,
    color: theme.inputText,
    placeholderColor: theme.inputPlaceholder,
    focusBorder: theme.inputBorderFocus
  },

  // Dropdown styles
  dropdown: {
    backgroundColor: theme.bgDropdown,
    borderColor: theme.borderSubtle,
    shadow: theme.shadowDropdown
  },

  // Status colors
  status: {
    active: {
      bg: `${theme.positive}20`,
      text: theme.positive,
      dot: theme.positive
    },
    paused: {
      bg: `${theme.warning}20`,
      text: theme.warning,
      dot: theme.warning
    }
  },

  // Profit colors
  profit: {
    positive: theme.positive,
    negative: theme.negative
  },

  // Text styles
  text: {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    muted: theme.textMuted
  },

  // Skeleton loading
  skeleton: {
    base: theme.skeletonBase,
    highlight: theme.skeletonHighlight,
    shimmer: theme.skeletonShimmer
  },

  // Tags/Badges
  tag: {
    backgroundColor: theme.tagBg,
    color: theme.tagText,
    borderColor: theme.tagBorder
  },

  // Scrollbar
  scrollbar: {
    track: theme.scrollbarTrack,
    thumb: theme.scrollbarThumb,
    thumbHover: theme.scrollbarThumbHover
  }
});

// CSS class generator for Tailwind-like approach
export const getThemeClasses = (isDark) => ({
  // Backgrounds
  bgMain: isDark ? "bg-[#050505]" : "bg-white",
  bgCard: isDark ? "bg-[#0C0C0C]" : "bg-white",
  bgSecondary: isDark ? "bg-[#0A0A0A]" : "bg-gray-50",
  bgHover: isDark ? "hover:bg-[#101010]" : "hover:bg-gray-100",

  // Borders
  border: isDark ? "border-[#1A1A1A]" : "border-gray-200",
  borderHover: isDark ? "hover:border-[#252525]" : "hover:border-gray-300",

  // Text
  textPrimary: isDark ? "text-white" : "text-gray-900",
  textSecondary: isDark ? "text-[#A3A3A3]" : "text-gray-600",
  textTertiary: isDark ? "text-[#6B6B6B]" : "text-gray-400",

  // Shadows
  shadow: isDark ? "shadow-[0_8px_32px_rgba(0,0,0,0.55)]" : "shadow-md",

  // Focus rings
  focusRing: isDark ? "focus:ring-blue-500/40" : "focus:ring-blue-500/20"
});
