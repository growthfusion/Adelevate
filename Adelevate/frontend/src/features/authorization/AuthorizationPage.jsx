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
// THEME CONFIGURATION - Premium Minimal Design
// ============================================
const createTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // Backgrounds - Deep, clean blacks
      bgMain: "#0A0A0A",
      bgCard: "#141414",
      bgCardHover: "#1A1A1A",
      bgElevated: "#181818",
      bgMuted: "#161616",
      bgInput: "#141414",
      bgInputFocus: "#1A1A1A",
      bgButton: "#1E1E1E",
      bgButtonHover: "#252525",
      bgDropdown: "#181818",
      bgTable: "#0F0F0F",
      bgTableHeader: "#141414",
      bgTableRow: "#141414",
      bgTableRowAlt: "#181818",
      bgTableRowHover: "#1E1E1E",
      bgOverlay: "rgba(0, 0, 0, 0.9)",

      // Borders - Subtle and refined
      border: "#262626",
      borderLight: "#202020",
      borderMedium: "#2A2A2A",
      borderFocus: "#00D1B2",

      // Text - Clear hierarchy
      textPrimary: "#FFFFFF",
      textSecondary: "#B0B0B0",
      textTertiary: "#808080",
      textMuted: "#606060",

      // Accent - Premium cyan
      accent: "#00D1B2",
      accentHover: "#00E5C8",
      accentMuted: "#00B89E",
      accentBg: "rgba(0, 209, 178, 0.1)",
      accentBorder: "rgba(0, 209, 178, 0.25)",

      // Status
      success: "#00D991",
      successBg: "rgba(0, 217, 145, 0.1)",
      successBorder: "rgba(0, 217, 145, 0.25)",
      successText: "#00F5A0",

      warning: "#FFB020",
      warningBg: "rgba(255, 176, 32, 0.1)",
      warningBorder: "rgba(255, 176, 32, 0.25)",
      warningText: "#FFC850",

      error: "#FF4757",
      errorBg: "rgba(255, 71, 87, 0.1)",
      errorBorder: "rgba(255, 71, 87, 0.25)",
      errorText: "#FF6B7A",

      // Roles - Professional badges
      roles: {
        SuperAdmin: {
          bg: "rgba(99, 102, 241, 0.15)",
          border: "rgba(99, 102, 241, 0.3)",
          text: "#A5B4FC"
        },
        admin: {
          bg: "rgba(0, 217, 145, 0.15)",
          border: "rgba(0, 217, 145, 0.3)",
          text: "#00F5A0"
        },
        editor: {
          bg: "rgba(255, 176, 32, 0.15)",
          border: "rgba(255, 176, 32, 0.3)",
          text: "#FFC850"
        },
        user: {
          bg: "rgba(160, 160, 160, 0.15)",
          border: "rgba(160, 160, 160, 0.3)",
          text: "#B0B0B0"
        }
      },

      // Platforms
      platforms: {
        meta: {
          bg: "rgba(24, 119, 242, 0.15)",
          border: "rgba(24, 119, 242, 0.3)",
          text: "#60A5FA"
        },
        snap: {
          bg: "rgba(255, 252, 0, 0.15)",
          border: "rgba(255, 252, 0, 0.3)",
          text: "#FDE047"
        },
        tiktok: {
          bg: "rgba(254, 44, 85, 0.15)",
          border: "rgba(254, 44, 85, 0.3)",
          text: "#FB7185"
        },
        google: {
          bg: "rgba(0, 217, 145, 0.15)",
          border: "rgba(0, 217, 145, 0.3)",
          text: "#4ADE80"
        },
        newsbreak: {
          bg: "rgba(255, 71, 87, 0.15)",
          border: "rgba(255, 71, 87, 0.3)",
          text: "#FDA4AF"
        }
      },

      // Shadows - Deeper for contrast
      shadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
      shadowMd: "0 4px 16px rgba(0, 0, 0, 0.4)",
      shadowLg: "0 8px 32px rgba(0, 0, 0, 0.5)",
      shadowXl: "0 16px 64px rgba(0, 0, 0, 0.6)"
    };
  } else {
    return {
      // Light Theme - Clean whites
      bgMain: "#FAFAFA",
      bgCard: "#FFFFFF",
      bgCardHover: "#F5F5F5",
      bgElevated: "#FFFFFF",
      bgMuted: "#F5F5F5",
      bgInput: "#FFFFFF",
      bgInputFocus: "#FFFFFF",
      bgButton: "#F5F5F5",
      bgButtonHover: "#EBEBEB",
      bgDropdown: "#FFFFFF",
      bgTable: "#FFFFFF",
      bgTableHeader: "#FAFAFA",
      bgTableRow: "#FFFFFF",
      bgTableRowAlt: "#FAFAFA",
      bgTableRowHover: "#F5F5F5",
      bgOverlay: "rgba(0, 0, 0, 0.4)",

      // Borders - Minimal and clean
      border: "#E0E0E0",
      borderLight: "#EBEBEB",
      borderMedium: "#D4D4D4",
      borderFocus: "#00B89E",

      // Text - Clear hierarchy
      textPrimary: "#1A1A1A",
      textSecondary: "#525252",
      textTertiary: "#737373",
      textMuted: "#A3A3A3",

      // Accent - Premium cyan
      accent: "#00B89E",
      accentHover: "#009B85",
      accentMuted: "#00A896",
      accentBg: "rgba(0, 184, 158, 0.08)",
      accentBorder: "rgba(0, 184, 158, 0.2)",

      // Status
      success: "#00B874",
      successBg: "rgba(0, 184, 116, 0.08)",
      successBorder: "rgba(0, 184, 116, 0.2)",
      successText: "#00B874",

      warning: "#E89B0C",
      warningBg: "rgba(232, 155, 12, 0.08)",
      warningBorder: "rgba(232, 155, 12, 0.2)",
      warningText: "#E89B0C",

      error: "#DC2626",
      errorBg: "rgba(220, 38, 38, 0.08)",
      errorBorder: "rgba(220, 38, 38, 0.2)",
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
          bg: "#FFF7ED",
          border: "#FED7AA",
          text: "#C2410C"
        },
        user: {
          bg: "#F5F5F5",
          border: "#D4D4D4",
          text: "#525252"
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
          bg: "#FFF1F2",
          border: "#FECDD3",
          text: "#BE123C"
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

      // Shadows - Subtle
      shadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
      shadowMd: "0 4px 12px rgba(0, 0, 0, 0.08)",
      shadowLg: "0 8px 32px rgba(0, 0, 0, 0.1)",
      shadowXl: "0 16px 64px rgba(0, 0, 0, 0.12)"
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

// Avatar - Premium circular design
function Avatar({ email, size = "md" }) {
  const color = getAvatarColor(email);
  const initials = getInitials(email);

  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base"
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none ring-2 ring-opacity-20 transition-transform hover:scale-105`}
      style={{ 
        backgroundColor: color,
        ringColor: color,
        boxShadow: `0 0 0 2px ${color}20`
      }}
    >
      {initials}
    </div>
  );
}

// Role Badge - Premium minimal badge
function RoleBadge({ role, theme }) {
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all hover:scale-105"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1.5px solid ${config.border}`
      }}
    >
      {icons[role] || icons.user}
      <span className="uppercase">{role || "user"}</span>
    </span>
  );
}

// Platform Pill - Premium minimal pill
function PlatformPill({ platform, theme }) {
  const defaultConfig = {
    bg: theme.bgMuted,
    border: theme.border,
    text: theme.textSecondary
  };

  const config = theme.platforms?.[platform] || defaultConfig;

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1.5px solid ${config.border}`
      }}
    >
      <img src={PLATFORM_ICON[platform]} alt="" className="w-4 h-4" />
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
      className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold flex items-center justify-between transition-all disabled:opacity-50 hover:shadow-md"
      style={{
        backgroundColor: theme.bgInput,
        border: `1.5px solid ${open ? theme.borderFocus : theme.border}`,
        color: theme.textPrimary,
        boxShadow: open ? theme.shadowMd : 'none',
        outline: 'none'
      }}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
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
        <span className="truncate" style={{ color: selected.length ? theme.textPrimary : theme.textMuted }}>
          {selected.length
            ? `${selected.length} platform${selected.length > 1 ? "s" : ""} selected`
            : "Select platforms"}
        </span>
      </div>
      <svg
        className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
      <div className="py-2">
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            Select Platforms
          </span>
        </div>

        <div className="py-2 max-h-[240px] overflow-y-auto">
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
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 text-left hover:bg-opacity-50"
                style={{
                  backgroundColor: checked ? theme.accentBg : "transparent",
                  color: checked ? theme.accent : theme.textSecondary
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(key);
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: checked ? theme.accent : "transparent",
                    border: `2px solid ${checked ? theme.accent : theme.borderMedium}`
                  }}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderTop: `1px solid ${theme.borderLight}`,
            backgroundColor: theme.bgMuted
          }}
        >
          <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>
            {selected.length} selected
          </span>
          <button
            type="button"
            className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
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
      className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold flex items-center justify-between transition-all disabled:opacity-50 hover:shadow-md"
      style={{
        backgroundColor: config.bg,
        border: `1.5px solid ${open ? theme.accent : config.border}`,
        color: config.text,
        boxShadow: open ? theme.shadowMd : 'none',
        outline: 'none'
      }}
    >
      <div className="flex items-center gap-2.5">
        {icons[currentRole]}
        <span className="uppercase tracking-wide">{currentRole}</span>
      </div>
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
      <div className="py-2">
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: theme.textMuted }}
          >
            Change Role
          </span>
        </div>

        <div className="py-2">
          {ROLES.map((role) => {
            const rConfig = theme.roles?.[role] || defaultConfig;
            const isActive = role === currentRole;

            return (
              <button
                key={role}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left hover:bg-opacity-50"
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
                <span className="flex-1 uppercase tracking-wide">{role}</span>
                {isActive && (
                  <svg className="h-4 w-4" style={{ color: theme.accent }} viewBox="0 0 20 20" fill="currentColor">
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

// Mobile User Card - Premium design
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
      className="rounded-2xl overflow-hidden mb-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: theme.bgCard,
        border: `1.5px solid ${theme.border}`,
        boxShadow: theme.shadow
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-5 flex items-center gap-4"
        style={{ borderBottom: `1.5px solid ${theme.borderLight}` }}
      >
        <Avatar email={email} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate mb-1" style={{ color: theme.textPrimary }}>
            {email?.split("@")[0] || "—"}
          </div>
          <div className="text-xs font-medium truncate" style={{ color: theme.textMuted }}>
            {email}
          </div>
        </div>
        <RoleBadge role={role} theme={theme} />
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Platforms */}
        <div>
          <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: theme.textMuted }}
          >
            <svg className="h-4 w-4" style={{ color: theme.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: theme.accent }}>
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
                Saving...
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedPlatforms.length ? (
              selectedPlatforms.map((p) => <PlatformPill key={p} platform={p} theme={theme} />)
            ) : (
              <span className="text-sm font-medium italic" style={{ color: theme.textMuted }}>
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
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-4"
            style={{ color: theme.textMuted }}
          >
            <svg className="h-4 w-4" style={{ color: theme.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div className="flex flex-col items-center gap-6">
          <div
            className="h-20 w-20 rounded-3xl flex items-center justify-center animate-pulse"
            style={{ 
              backgroundColor: theme.accentBg,
              border: `2px solid ${theme.accentBorder}`,
              boxShadow: theme.shadowLg
            }}
          >
            <svg
              className="animate-spin h-10 w-10"
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
          <span className="text-base font-bold" style={{ color: theme.textSecondary }}>
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
        className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div
          className="p-10 rounded-3xl max-w-md w-full text-center"
          style={{
            backgroundColor: theme.bgCard,
            border: `1.5px solid ${theme.border}`,
            boxShadow: theme.shadowXl
          }}
        >
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ 
              backgroundColor: theme.accentBg,
              border: `2px solid ${theme.accentBorder}`
            }}
          >
            <svg
              className="w-10 h-10"
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
          <h2 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: theme.textPrimary }}>
            Sign in required
          </h2>
          <p className="text-sm font-medium mb-8" style={{ color: theme.textTertiary }}>
            Please sign in to access authorization settings.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.accent,
              boxShadow: theme.shadowMd
            }}
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
        className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
        style={{ backgroundColor: theme.bgMain }}
      >
        <div
          className="p-10 rounded-3xl max-w-md w-full text-center"
          style={{
            backgroundColor: theme.errorBg,
            border: `2px solid ${theme.errorBorder}`,
            boxShadow: theme.shadowXl
          }}
        >
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ 
              backgroundColor: theme.error,
              boxShadow: theme.shadowMd
            }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: theme.errorText }}>
            Access Denied
          </h2>
          <p className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>
            Only <strong className="font-bold">SuperAdmin</strong> can access this page.
          </p>
          <div
            className="px-4 py-3 rounded-xl inline-block"
            style={{ 
              backgroundColor: theme.bgCard,
              border: `1.5px solid ${theme.border}`
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>
              Your Role
            </p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              {myRole || "user"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bgMain }}>
      <div className="w-full">
        <div className="p-6 sm:p-8 lg:p-12 mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: theme.accentBg,
                    border: `1.5px solid ${theme.accentBorder}`,
                    boxShadow: theme.shadowMd
                  }}
                >
                  <svg
                    className="h-8 w-8"
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
                  <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: theme.textPrimary }}>
                    Authorization
                  </h1>
                  <p className="text-sm font-medium" style={{ color: theme.textTertiary }}>
                    Manage user roles and platform access
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:shadow-lg"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: theme.shadow
                }}
              >
                <Avatar email={session.user.email} size="sm" />
                <div className="flex flex-col gap-2">
                  <RoleBadge role={myRole} theme={theme} />
                  <span
                    className="text-xs font-semibold truncate max-w-[180px]"
                    style={{ color: theme.textMuted }}
                  >
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200"
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
                className="w-full pl-14 pr-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 focus:shadow-lg"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1.5px solid ${theme.border}`,
                  color: theme.textPrimary,
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderFocus;
                  e.target.previousElementSibling.style.color = theme.accent;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.previousElementSibling.style.color = theme.textMuted;
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-4 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 transition-all disabled:opacity-60 hover:scale-105"
              style={{ 
                backgroundColor: theme.accent,
                boxShadow: theme.shadowMd
              }}
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="px-5 py-4 rounded-2xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.bgButton,
                  border: `1.5px solid ${theme.border}`,
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
              className="mb-8 px-5 py-4 rounded-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: theme.errorBg,
                border: `1.5px solid ${theme.errorBorder}`,
                boxShadow: theme.shadowMd
              }}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.error }}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold flex-1" style={{ color: theme.errorText }}>
                {error}
              </span>
              <button
                onClick={() => dispatch(clearError())}
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-opacity-10"
                style={{ color: theme.errorText }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
                className="rounded-2xl p-16 text-center"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: theme.shadowMd
                }}
              >
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ 
                    backgroundColor: theme.bgMuted,
                    border: `1.5px solid ${theme.border}`
                  }}
                >
                  <svg
                    className="w-8 h-8"
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
                <p className="font-bold text-lg mb-2" style={{ color: theme.textPrimary }}>
                  No users found
                </p>
                <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
                  {search ? "Try a different search" : "No data available"}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div
            className="hidden md:block rounded-2xl overflow-hidden"
            style={{
              backgroundColor: theme.bgCard,
              border: `1.5px solid ${theme.border}`,
              boxShadow: theme.shadowMd
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
                        className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: theme.textMuted,
                          borderBottom: `1.5px solid ${theme.border}`
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <svg
                            className="h-4 w-4"
                            style={{ color: theme.textMuted }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
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
                          className="transition-all duration-200"
                          style={{
                            backgroundColor: idx % 2 === 0 ? theme.bgTableRow : theme.bgTableRowAlt,
                            borderBottom: `1px solid ${theme.borderLight}`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.bgTableRowHover;
                            e.currentTarget.style.boxShadow = theme.shadowMd;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              idx % 2 === 0 ? theme.bgTableRow : theme.bgTableRowAlt;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <Avatar email={u.email} size="md" />
                              <div>
                                <div
                                  className="font-bold text-sm mb-1"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {u.email?.split("@")[0] || "—"}
                                </div>
                                <div className="text-xs font-medium" style={{ color: theme.textMuted }}>
                                  ID: {u.id?.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
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
                                className="text-sm font-medium truncate max-w-[220px]"
                                style={{ color: theme.textSecondary }}
                              >
                                {u.email || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <RoleBadge role={u.role} theme={theme} />
                          </td>

                          <td className="px-6 py-5">
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {selectedPlatforms.length ? (
                                  selectedPlatforms.map((p) => (
                                    <PlatformPill key={p} platform={p} theme={theme} />
                                  ))
                                ) : (
                                  <span
                                    className="text-sm font-medium italic"
                                    style={{ color: theme.textMuted }}
                                  >
                                    No platforms assigned
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
                                    className="text-xs font-semibold flex items-center gap-1.5"
                                    style={{ color: theme.accent }}
                                  >
                                    <svg
                                      className="animate-spin h-4 w-4"
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
                                    Saving...
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
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
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div
                            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ 
                              backgroundColor: theme.bgMuted,
                              border: `1.5px solid ${theme.border}`
                            }}
                          >
                            <svg
                              className="w-8 h-8"
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
                          <p className="font-bold text-lg mb-1" style={{ color: theme.textPrimary }}>
                            No users found
                          </p>
                          <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
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
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span
                  className="px-4 py-2 rounded-full text-xs font-bold tracking-wide"
                  style={{
                    backgroundColor: theme.accentBg,
                    color: theme.accent,
                    border: `1.5px solid ${theme.accentBorder}`
                  }}
                >
                  {total} USERS
                </span>
                <span className="text-sm font-semibold" style={{ color: theme.textTertiary }}>
                  Page <strong style={{ color: theme.textPrimary }}>{page}</strong> of{" "}
                  <strong style={{ color: theme.textPrimary }}>{pageCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: theme.bgButton,
                    border: `1.5px solid ${theme.border}`,
                    color: theme.textSecondary
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="hidden sm:flex items-center gap-2">
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
                        className="w-11 h-11 rounded-xl text-sm font-bold transition-all hover:scale-110"
                        style={{
                          backgroundColor: isActive ? theme.accent : theme.bgButton,
                          color: isActive ? "#FFFFFF" : theme.textSecondary,
                          border: `1.5px solid ${isActive ? theme.accent : theme.border}`,
                          boxShadow: isActive ? theme.shadowMd : 'none'
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
                  className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: theme.bgButton,
                    border: `1.5px solid ${theme.border}`,
                    color: theme.textSecondary
                  }}
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
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
