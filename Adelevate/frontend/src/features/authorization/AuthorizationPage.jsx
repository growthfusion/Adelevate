// AuthorizationPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { supabase } from "@/supabaseClient";

// Redux - only import isDarkMode selector
import { selectIsDarkMode } from "@/features/theme/themeSlice";
import {
  fetchSession,
  fetchUsers,
  changeUserRole,
  toggleUserPlatform,
  clearError,
  selectUsers,
  selectTotal,
  selectPage,
  selectPageSize,
  selectSearch,
  selectMyRole,
  selectSession,
  selectUpdatingUserId,
  selectIsLoading,
  selectIsSearching,
  selectError,
  selectPageCount
} from "@/features/authorization/authorizationSlice";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

// ============================================
// THEME CONFIGURATION
// ============================================
const createTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // Backgrounds
      bgMain: "#09090B",
      bgCard: "#111113",
      bgCardHover: "#16161A",
      bgElevated: "#1A1A1E",
      bgMuted: "#18181B",
      bgInput: "#111113",
      bgInputFocus: "#16161A",
      bgButton: "#1F1F23",
      bgButtonHover: "#27272A",
      bgDropdown: "#111113",
      bgTable: "#0D0D0F",
      bgTableHeader: "#111113",
      bgTableRow: "#0F0F11",
      bgTableRowAlt: "#111113",
      bgTableRowHover: "#18181B",
      bgOverlay: "rgba(0, 0, 0, 0.85)",

      // Borders
      border: "#27272A",
      borderLight: "#202024",
      borderMedium: "#2E2E33",
      borderFocus: "#3F3F46",

      // Text
      textPrimary: "#FAFAFA",
      textSecondary: "#A1A1AA",
      textTertiary: "#71717A",
      textMuted: "#52525B",

      // Accent
      accent: "#6366F1",
      accentHover: "#7C7FF2",
      accentMuted: "#4F46E5",
      accentBg: "rgba(99, 102, 241, 0.12)",
      accentBorder: "rgba(99, 102, 241, 0.2)",

      // Status
      success: "#22C55E",
      successBg: "rgba(34, 197, 94, 0.12)",
      successBorder: "rgba(34, 197, 94, 0.2)",
      successText: "#4ADE80",

      warning: "#F59E0B",
      warningBg: "rgba(245, 158, 11, 0.12)",
      warningBorder: "rgba(245, 158, 11, 0.2)",
      warningText: "#FBBF24",

      error: "#EF4444",
      errorBg: "rgba(239, 68, 68, 0.12)",
      errorBorder: "rgba(239, 68, 68, 0.2)",
      errorText: "#F87171",

      // Roles
      roles: {
        SuperAdmin: {
          bg: "rgba(99, 102, 241, 0.12)",
          border: "rgba(99, 102, 241, 0.2)",
          text: "#A5B4FC"
        },
        admin: {
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.2)",
          text: "#86EFAC"
        },
        editor: {
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.2)",
          text: "#FCD34D"
        },
        user: {
          bg: "rgba(113, 113, 122, 0.12)",
          border: "rgba(113, 113, 122, 0.2)",
          text: "#A1A1AA"
        }
      },

      // Platforms
      platforms: {
        meta: {
          bg: "rgba(59, 130, 246, 0.12)",
          border: "rgba(59, 130, 246, 0.2)",
          text: "#93C5FD"
        },
        snap: {
          bg: "rgba(250, 204, 21, 0.12)",
          border: "rgba(250, 204, 21, 0.2)",
          text: "#FDE047"
        },
        tiktok: {
          bg: "rgba(168, 85, 247, 0.12)",
          border: "rgba(168, 85, 247, 0.2)",
          text: "#D8B4FE"
        },
        google: {
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.2)",
          text: "#86EFAC"
        },
        newsbreak: {
          bg: "rgba(251, 113, 133, 0.12)",
          border: "rgba(251, 113, 133, 0.2)",
          text: "#FDA4AF"
        }
      },

      // Shadows
      shadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
      shadowMd: "0 4px 12px rgba(0, 0, 0, 0.35)",
      shadowLg: "0 10px 30px rgba(0, 0, 0, 0.45)",
      shadowXl: "0 20px 50px rgba(0, 0, 0, 0.5)"
    };
  } else {
    return {
      // Light Theme
      bgMain: "#F9FAFB",
      bgCard: "#FFFFFF",
      bgCardHover: "#F3F4F6",
      bgElevated: "#FFFFFF",
      bgMuted: "#F3F4F6",
      bgInput: "#FFFFFF",
      bgInputFocus: "#FFFFFF",
      bgButton: "#F3F4F6",
      bgButtonHover: "#E5E7EB",
      bgDropdown: "#FFFFFF",
      bgTable: "#FFFFFF",
      bgTableHeader: "#F9FAFB",
      bgTableRow: "#FFFFFF",
      bgTableRowAlt: "#F9FAFB",
      bgTableRowHover: "#F3F4F6",
      bgOverlay: "rgba(0, 0, 0, 0.5)",

      // Borders
      border: "#E5E7EB",
      borderLight: "#F3F4F6",
      borderMedium: "#D1D5DB",
      borderFocus: "#9CA3AF",

      // Text
      textPrimary: "#111827",
      textSecondary: "#4B5563",
      textTertiary: "#6B7280",
      textMuted: "#9CA3AF",

      // Accent
      accent: "#6366F1",
      accentHover: "#4F46E5",
      accentMuted: "#4F46E5",
      accentBg: "rgba(99, 102, 241, 0.08)",
      accentBorder: "rgba(99, 102, 241, 0.2)",

      // Status
      success: "#059669",
      successBg: "#ECFDF5",
      successBorder: "#A7F3D0",
      successText: "#059669",

      warning: "#D97706",
      warningBg: "#FFFBEB",
      warningBorder: "#FDE68A",
      warningText: "#D97706",

      error: "#DC2626",
      errorBg: "#FEF2F2",
      errorBorder: "#FECACA",
      errorText: "#DC2626",

      // Roles
      roles: {
        SuperAdmin: {
          bg: "#EEF2FF",
          border: "#C7D2FE",
          text: "#4338CA"
        },
        admin: {
          bg: "#ECFDF5",
          border: "#A7F3D0",
          text: "#047857"
        },
        editor: {
          bg: "#FFFBEB",
          border: "#FDE68A",
          text: "#B45309"
        },
        user: {
          bg: "#F3F4F6",
          border: "#D1D5DB",
          text: "#4B5563"
        }
      },

      // Platforms
      platforms: {
        meta: {
          bg: "#EFF6FF",
          border: "#BFDBFE",
          text: "#1D4ED8"
        },
        snap: {
          bg: "#FEFCE8",
          border: "#FDE68A",
          text: "#A16207"
        },
        tiktok: {
          bg: "#FAF5FF",
          border: "#E9D5FF",
          text: "#7C3AED"
        },
        google: {
          bg: "#ECFDF5",
          border: "#A7F3D0",
          text: "#047857"
        },
        newsbreak: {
          bg: "#FFF1F2",
          border: "#FECDD3",
          text: "#BE123C"
        }
      },

      // Shadows
      shadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      shadowMd: "0 4px 12px rgba(0, 0, 0, 0.1)",
      shadowLg: "0 10px 30px rgba(0, 0, 0, 0.12)",
      shadowXl: "0 20px 50px rgba(0, 0, 0, 0.15)"
    };
  }
};

// Constants
const ROLES = ["SuperAdmin", "admin", "editor", "user"];
const PLATFORM_KEYS = ["meta", "snap", "newsbreak", "google", "tiktok"];
const PLATFORM_LABEL = {
  meta: "Meta",
  snap: "Snap",
  newsbreak: "NewsBreak",
  google: "Google",
  tiktok: "TikTok"
};
const PLATFORM_ICON = {
  meta: fb,
  snap: snapchatIcon,
  newsbreak: nb,
  google: googleIcon,
  tiktok: tiktokIcon
};

// Avatar Colors
const AVATAR_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#A855F7",
  "#D946EF"
];

function getAvatarColor(email) {
  if (!email) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(email) {
  if (!email) return "?";
  const username = email.split("@")[0];
  const parts = username.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

// ============================================
// COMPONENTS
// ============================================

// Avatar
function Avatar({ email, size = "md" }) {
  const color = getAvatarColor(email);
  const initials = getInitials(email);

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };

  return (
    <div
      className={`${sizes[size]} rounded-lg flex items-center justify-center font-semibold text-white flex-shrink-0 select-none`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// Role Badge - Fixed with null check
function RoleBadge({ role, theme }) {
  // Safe fallback for roles
  const defaultRoleConfig = {
    bg: theme.bgMuted,
    border: theme.border,
    text: theme.textSecondary
  };

  const config = theme.roles?.[role] || theme.roles?.user || defaultRoleConfig;

  const icons = {
    SuperAdmin: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    admin: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    ),
    editor: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    user: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    )
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`
      }}
    >
      {icons[role] || icons.user}
      <span>{role || "user"}</span>
    </span>
  );
}

// Platform Pill - Fixed with null check
function PlatformPill({ platform, theme }) {
  const defaultConfig = {
    bg: theme.bgMuted,
    border: theme.border,
    text: theme.textSecondary
  };

  const config = theme.platforms?.[platform] || defaultConfig;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`
      }}
    >
      <img src={PLATFORM_ICON[platform]} alt="" className="w-3.5 h-3.5" />
      <span>{PLATFORM_LABEL[platform] || platform}</span>
    </span>
  );
}

// Dropdown Portal
function Dropdown({ isOpen, onClose, trigger, children, theme }) {
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 640;

      let newStyle = { position: "fixed", zIndex: 9999 };

      if (isMobile) {
        newStyle.left = "16px";
        newStyle.right = "16px";
        newStyle.maxHeight = "300px";
        if (vh - rect.bottom > 220) {
          newStyle.top = `${rect.bottom + 8}px`;
        } else {
          newStyle.bottom = `${vh - rect.top + 8}px`;
        }
      } else {
        newStyle.left = `${rect.left}px`;
        newStyle.width = `${Math.max(rect.width, 240)}px`;
        newStyle.maxHeight = "340px";
        if (vh - rect.bottom > 280) {
          newStyle.top = `${rect.bottom + 8}px`;
        } else {
          newStyle.bottom = `${vh - rect.top + 8}px`;
        }
      }

      setStyle(newStyle);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} className="w-full">
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              ...style,
              backgroundColor: theme.bgDropdown,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadowLg
            }}
            className="rounded-xl overflow-hidden"
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

// Platform Dropdown
function PlatformDropdown({ value = [], onToggle, disabled, theme, isDarkMode }) {
  const [open, setOpen] = useState(false);
  const selected = value.map((v) => String(v).toLowerCase());

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-all disabled:opacity-50"
      style={{
        backgroundColor: theme.bgInput,
        border: `1px solid ${theme.border}`,
        color: theme.textSecondary
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <svg
          className="h-4 w-4 flex-shrink-0"
          style={{ color: theme.textMuted }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span className="truncate">
          {selected.length
            ? `${selected.length} platform${selected.length > 1 ? "s" : ""} selected`
            : "Select platforms"}
        </span>
      </div>
      <svg
        className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        style={{ color: theme.textMuted }}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  return (
    <Dropdown isOpen={open} onClose={() => setOpen(false)} trigger={trigger} theme={theme}>
      <div className="py-1">
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            Select Platforms
          </span>
        </div>

        <div className="py-1 max-h-[220px] overflow-y-auto">
          {PLATFORM_KEYS.map((key) => {
            const checked = selected.includes(key);
            const config = theme.platforms?.[key] || {
              bg: theme.bgMuted,
              border: theme.border,
              text: theme.textSecondary
            };

            return (
              <button
                key={key}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: checked ? config.bg : "transparent",
                  color: checked ? config.text : theme.textSecondary
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(key);
                }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: checked ? theme.accent : "transparent",
                    border: `2px solid ${checked ? theme.accent : theme.borderMedium}`
                  }}
                >
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <img src={PLATFORM_ICON[key]} alt="" className="w-5 h-5" />
                <span>{PLATFORM_LABEL[key]}</span>
              </button>
            );
          })}
        </div>

        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{
            borderTop: `1px solid ${theme.borderLight}`,
            backgroundColor: isDarkMode ? theme.bgElevated : theme.bgMuted
          }}
        >
          <span className="text-xs" style={{ color: theme.textMuted }}>
            {selected.length} selected
          </span>
          <button
            type="button"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: theme.accent }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Dropdown>
  );
}

// Role Dropdown
function RoleDropdown({ value, onChange, disabled, theme, isDarkMode }) {
  const [open, setOpen] = useState(false);
  const currentRole = ROLES.includes(value) ? value : "user";

  const defaultConfig = {
    bg: theme.bgMuted,
    border: theme.border,
    text: theme.textSecondary
  };

  const config = theme.roles?.[currentRole] || defaultConfig;

  const icons = {
    SuperAdmin: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    admin: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    ),
    editor: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
    user: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    )
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold flex items-center justify-between transition-all disabled:opacity-50"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text
      }}
    >
      <div className="flex items-center gap-2">
        {icons[currentRole]}
        <span>{currentRole}</span>
      </div>
      <svg
        className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  return (
    <Dropdown isOpen={open} onClose={() => setOpen(false)} trigger={trigger} theme={theme}>
      <div className="py-1">
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            Change Role
          </span>
        </div>

        <div className="py-1">
          {ROLES.map((role) => {
            const rConfig = theme.roles?.[role] || defaultConfig;
            const isActive = role === currentRole;

            return (
              <button
                key={role}
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: isActive ? rConfig.bg : "transparent",
                  color: isActive ? rConfig.text : theme.textSecondary
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(role);
                  setOpen(false);
                }}
              >
                {icons[role]}
                <span className="flex-1">{role}</span>
                {isActive && (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

// Mobile User Card
function UserCard({ user, theme, isDarkMode }) {
  const dispatch = useDispatch();
  const updatingUserId = useSelector(selectUpdatingUserId);

  const { id, email, role, platforms = [] } = user;
  const selectedPlatforms = platforms.map((v) => String(v).toLowerCase());
  const isUpdating = updatingUserId === id;

  const handleTogglePlatform = (platform) => {
    dispatch(toggleUserPlatform({ userId: id, platform }));
  };

  const handleChangeRole = (newRole) => {
    dispatch(changeUserRole({ userId: id, newRole }));
  };

  return (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${theme.borderLight}` }}
      >
        <Avatar email={email} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ color: theme.textPrimary }}>
            {email?.split("@")[0] || "—"}
          </div>
          <div className="text-sm truncate" style={{ color: theme.textMuted }}>
            {email}
          </div>
        </div>
        <RoleBadge role={role} theme={theme} />
      </div>

      {/* Body */}
      <div className="p-4 space-y-5">
        {/* Platforms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: theme.textMuted }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Platforms
            </span>
            {isUpdating && (
              <span className="text-xs flex items-center gap-1" style={{ color: theme.accent }}>
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {selectedPlatforms.length ? (
              selectedPlatforms.map((p) => <PlatformPill key={p} platform={p} theme={theme} />)
            ) : (
              <span className="text-sm italic" style={{ color: theme.textMuted }}>
                No platforms assigned
              </span>
            )}
          </div>

          <PlatformDropdown
            value={platforms}
            disabled={isUpdating}
            onToggle={handleTogglePlatform}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Role */}
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-3"
            style={{ color: theme.textMuted }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Role
          </span>

          <RoleDropdown
            value={role}
            onChange={handleChangeRole}
            disabled={isUpdating}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AuthorizationPage() {
  const dispatch = useDispatch();

  // Get isDarkMode from Redux
  const isDarkMode = useSelector(selectIsDarkMode);

  // Create theme inside component
  const theme = createTheme(isDarkMode);

  // Redux State
  const users = useSelector(selectUsers);
  const total = useSelector(selectTotal);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const search = useSelector(selectSearch);
  const myRole = useSelector(selectMyRole);
  const session = useSelector(selectSession);
  const updatingUserId = useSelector(selectUpdatingUserId);
  const isLoading = useSelector(selectIsLoading);
  const isSearching = useSelector(selectIsSearching);
  const error = useSelector(selectError);
  const pageCount = useSelector(selectPageCount);

  // Local search input state
  const [searchInput, setSearchInput] = useState("");

  // Initialize
  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  // Fetch users when session is ready
  useEffect(() => {
    if (session && myRole === "SuperAdmin") {
      dispatch(fetchUsers({ page: 1, search: "", pageSize }));
    }
  }, [session, myRole, dispatch, pageSize]);

  // Auth state listener
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (sess) {
        dispatch(fetchSession());
      }
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [dispatch]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchUsers({ page: 1, search: searchInput, pageSize }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    dispatch(fetchUsers({ page: 1, search: "", pageSize }));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchUsers({ page: newPage, search, pageSize }));
  };

  const handleTogglePlatform = (userId, platform) => {
    dispatch(toggleUserPlatform({ userId, platform }));
  };

  const handleChangeRole = (userId, newRole) => {
    dispatch(changeUserRole({ userId, newRole }));
  };

  // Loading
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.accentBg }}
          >
            <svg
              className="animate-spin h-6 w-6"
              style={{ color: theme.accent }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!session?.user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div
          className="p-8 rounded-2xl max-w-sm w-full text-center"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadowLg
          }}
        >
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: theme.accentBg }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: theme.accent }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            Sign in required
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
            Please sign in to access authorization settings.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: theme.accent }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Not authorized
  if (myRole !== "SuperAdmin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div
          className="p-8 rounded-2xl max-w-sm w-full text-center"
          style={{
            backgroundColor: theme.errorBg,
            border: `1px solid ${theme.errorBorder}`,
            boxShadow: theme.shadowLg
          }}
        >
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: theme.error }}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.errorText }}>
            Access Denied
          </h2>
          <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
            Only <strong>SuperAdmin</strong> can access this page.
          </p>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Your role: <strong style={{ color: theme.textPrimary }}>{myRole || "user"}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.bgMain }}>
      <div className="w-full">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.accentBg }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: theme.accent }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
                    Authorization
                  </h1>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Manage user roles and platform access
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.border}`
                }}
              >
                <Avatar email={session.user.email} size="sm" />
                <div className="flex flex-col gap-1">
                  <RoleBadge role={myRole} theme={theme} />
                  <span
                    className="text-xs truncate max-w-[180px]"
                    style={{ color: theme.textMuted }}
                  >
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: theme.textMuted }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search users by email..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-colors disabled:opacity-60"
              style={{ backgroundColor: theme.accent }}
            >
              {isSearching ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: theme.bgButton,
                  border: `1px solid ${theme.border}`,
                  color: theme.textSecondary
                }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Error */}
          {error && (
            <div
              className="mb-6 px-4 py-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: theme.errorBg,
                border: `1px solid ${theme.errorBorder}`
              }}
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                style={{ color: theme.error }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium" style={{ color: theme.errorText }}>
                {error}
              </span>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="md:hidden">
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard key={user.id} user={user} theme={theme} isDarkMode={isDarkMode} />
              ))
            ) : (
              <div
                className="rounded-xl p-12 text-center"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: theme.bgMuted }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: theme.textMuted }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="font-semibold" style={{ color: theme.textPrimary }}>
                  No users found
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {search ? "Try a different search" : "No data available"}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div
            className="hidden md:block rounded-xl overflow-hidden"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: theme.bgTableHeader }}>
                  <tr>
                    {[
                      {
                        label: "User",
                        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      },
                      {
                        label: "Email",
                        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      },
                      {
                        label: "Role",
                        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      },
                      {
                        label: "Platforms",
                        icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      },
                      {
                        label: "Actions",
                        icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      }
                    ].map((col) => (
                      <th
                        key={col.label}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: theme.textMuted,
                          borderBottom: `1px solid ${theme.border}`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={col.icon}
                            />
                          </svg>
                          {col.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((u, idx) => {
                      const selectedPlatforms = (u.platforms || []).map((v) =>
                        String(v).toLowerCase()
                      );
                      const isUpdating = updatingUserId === u.id;

                      return (
                        <tr
                          key={u.id}
                          className="transition-colors"
                          style={{
                            backgroundColor: idx % 2 === 0 ? theme.bgTableRow : theme.bgTableRowAlt,
                            borderBottom: `1px solid ${theme.borderLight}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.bgTableRowHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              idx % 2 === 0 ? theme.bgTableRow : theme.bgTableRowAlt;
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar email={u.email} size="md" />
                              <div>
                                <div
                                  className="font-semibold text-sm"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {u.email?.split("@")[0] || "—"}
                                </div>
                                <div className="text-xs" style={{ color: theme.textMuted }}>
                                  {u.id?.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 flex-shrink-0"
                                style={{ color: theme.textMuted }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span
                                className="text-sm truncate max-w-[220px]"
                                style={{ color: theme.textSecondary }}
                              >
                                {u.email || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <RoleBadge role={u.role} theme={theme} />
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-1.5">
                                {selectedPlatforms.length ? (
                                  selectedPlatforms.map((p) => (
                                    <PlatformPill key={p} platform={p} theme={theme} />
                                  ))
                                ) : (
                                  <span
                                    className="text-sm italic"
                                    style={{ color: theme.textMuted }}
                                  >
                                    No platforms
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <PlatformDropdown
                                  value={u.platforms || []}
                                  disabled={isUpdating}
                                  onToggle={(key) => handleTogglePlatform(u.id, key)}
                                  theme={theme}
                                  isDarkMode={isDarkMode}
                                />
                                {isUpdating && (
                                  <span
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: theme.accent }}
                                  >
                                    <svg
                                      className="animate-spin h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                    Saving
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <RoleDropdown
                                value={u.role}
                                onChange={(role) => handleChangeRole(u.id, role)}
                                disabled={isUpdating}
                                theme={theme}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div
                            className="h-14 w-14 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: theme.bgMuted }}
                          >
                            <svg
                              className="w-7 h-7"
                              style={{ color: theme.textMuted }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <p className="font-semibold" style={{ color: theme.textPrimary }}>
                            No users found
                          </p>
                          <p className="text-sm" style={{ color: theme.textMuted }}>
                            {search ? "Try a different search" : "No data available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: theme.accentBg,
                    color: theme.accent,
                    border: `1px solid ${theme.accentBorder}`
                  }}
                >
                  {total} users
                </span>
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  Page <strong style={{ color: theme.textPrimary }}>{page}</strong> of{" "}
                  <strong style={{ color: theme.textPrimary }}>{pageCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.bgButton,
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                    let num = page;
                    if (pageCount <= 5) num = i + 1;
                    else if (page <= 3) num = i + 1;
                    else if (page >= pageCount - 2) num = pageCount - 4 + i;
                    else num = page - 2 + i;

                    const isActive = page === num;

                    return (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: isActive ? theme.accent : "transparent",
                          color: isActive ? "#FFFFFF" : theme.textSecondary
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
                  disabled={page >= pageCount}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme.bgButton,
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary
                  }}
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
