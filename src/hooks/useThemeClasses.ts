import { useTheme } from "../context/ThemeContext";

/**
 * Hook that returns theme-aware CSS class strings for common UI patterns.
 * Use this in any page/component to get dark mode + accent color support.
 */
export function useThemeClasses() {
  const { mode, colors } = useTheme();
  const isDark = mode === "dark";

  return {
    isDark,
    colors,

    // Page backgrounds
    pageBg: isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100",
    pageBgFlat: isDark ? "bg-gray-900" : "bg-gray-50",

    // Card styles
    card: isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
    cardHover: isDark
      ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-black/20"
      : "bg-white border-gray-100 hover:shadow-lg hover:border-gray-200",
    cardClean: isDark ? "bg-gray-800" : "bg-white",

    // Text
    textPrimary: isDark ? "text-gray-100" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-700",
    textTertiary: isDark ? "text-gray-400" : "text-gray-600",
    textMuted: isDark ? "text-gray-500" : "text-gray-500",

    // Headings
    heading: isDark ? "text-white" : "text-gray-900",
    subheading: isDark ? "text-gray-400" : "text-gray-600",

    // Borders
    border: isDark ? "border-gray-700" : "border-gray-200",
    borderLight: isDark ? "border-gray-700/60" : "border-gray-100",

    // Inputs
    input: isDark
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[var(--color-primary-400)] focus:ring-[var(--color-primary-500)]/10"
      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[var(--color-primary-400)] focus:ring-[var(--color-primary-500)]/10",

    // Select
    select: isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-200 text-gray-800",

    // Tables
    tableHeader: isDark ? "bg-gray-800/50" : "bg-gray-50",
    tableHeaderText: isDark ? "text-gray-400" : "text-gray-500",
    tableRow: isDark ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50",
    tableCell: isDark ? "text-gray-300" : "text-gray-600",

    // Buttons - Primary (uses theme color via CSS class)
    btnPrimary: "btn-primary",

    // Buttons - Secondary
    btnSecondary: isDark
      ? "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",

    // Buttons - Ghost
    btnGhost: isDark
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",

    // Badges
    badgePrimary: "badge-primary",
    badgeSuccess: isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700",
    badgeDanger: isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700",
    badgeWarning: isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700",
    badgeInfo: isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700",

    // Status colors
    statusActive: isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800",
    statusInactive: isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-800",

    // Subtle backgrounds (for info sections)
    subtleBg: isDark ? "bg-gray-700/50" : "bg-gray-50",
    subtleBgAlt: isDark ? "bg-gray-700/30" : "bg-gray-100/50",

    // Tabs
    tabActive: "tab-active",
    tabInactive: isDark
      ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
      : "text-gray-600 hover:bg-gray-50 hover:shadow-md",

    // Modal
    modalOverlay: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50",
    modalContent: isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
    modalHeader: isDark ? "border-gray-700" : "border-gray-200",

    // Empty states
    emptyState: isDark ? "text-gray-500" : "text-gray-400",

    // Loading spinner border color
    spinnerColor: `border-[var(--color-primary-500)]`,

    // Divider
    divider: isDark ? "border-gray-700" : "border-gray-200",

    // Shadow
    shadow: isDark ? "shadow-lg shadow-black/20" : "shadow-sm",

    // Search bar
    searchBg: isDark
      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
      : "bg-white border-gray-200 text-gray-700 placeholder-gray-400",

    // Gradients for accent areas
    gradientPrimary: `bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]`,

    // Hover for list items
    listItemHover: isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50",
  };
}
