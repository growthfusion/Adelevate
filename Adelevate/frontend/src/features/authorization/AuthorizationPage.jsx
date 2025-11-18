// authorization.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/supabaseClient";

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const ROLES = ["SuperAdmin", "admin", "editor", "user"];
const PLATFORM_KEYS = ["meta", "snap", "newsbreak", "google", "tiktok"];
const PLATFORM_LABEL = {
  meta: "Meta",
  snap: "Snap",
  newsbreak: "NewsBreak",
  google: "Google",
  tiktok: "TikTok",
};

// Platform icon mapping
const PLATFORM_ICON = {
  meta: fb,
  snap: snapchatIcon,
  newsbreak: nb,
  google: googleIcon,
  tiktok: tiktokIcon,
};

// Modern platform color mapping - softer, more premium
const PLATFORM_COLOR = {
  meta: "bg-blue-50 text-blue-700 border-blue-100/50",
  snap: "bg-amber-50 text-amber-700 border-amber-100/50",
  newsbreak: "bg-rose-50 text-rose-700 border-rose-100/50",
  google: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
  tiktok: "bg-purple-50 text-purple-700 border-purple-100/50",
};

// Microsoft Outlook Color Palette (Authentic Colors)
const MICROSOFT_AVATAR_COLORS = [
  { bg: "#0078D4", text: "#FFFFFF" }, // Microsoft Blue
  { bg: "#8764B8", text: "#FFFFFF" }, // Purple
  { bg: "#00B7C3", text: "#FFFFFF" }, // Teal
  { bg: "#008272", text: "#FFFFFF" }, // Dark Teal
  { bg: "#498205", text: "#FFFFFF" }, // Green
  { bg: "#C239B3", text: "#FFFFFF" }, // Magenta
  { bg: "#E3008C", text: "#FFFFFF" }, // Pink
  { bg: "#E81123", text: "#FFFFFF" }, // Red
  { bg: "#FF8C00", text: "#FFFFFF" }, // Orange
  { bg: "#107C10", text: "#FFFFFF" }, // Dark Green
  { bg: "#004E8C", text: "#FFFFFF" }, // Dark Blue
  { bg: "#744DA9", text: "#FFFFFF" }, // Deep Purple
  { bg: "#018574", text: "#FFFFFF" }, // Sea Green
  { bg: "#E74856", text: "#FFFFFF" }, // Coral
  { bg: "#0099BC", text: "#FFFFFF" }, // Cyan
  { bg: "#7719AA", text: "#FFFFFF" }, // Violet
];

// Function to get consistent color based on email
function getAvatarColorFromEmail(email) {
  if (!email) return MICROSOFT_AVATAR_COLORS[0];

  // Generate hash from email
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % MICROSOFT_AVATAR_COLORS.length;
  return MICROSOFT_AVATAR_COLORS[index];
}

// Function to get initials from email
function getInitialsFromEmail(email) {
  if (!email) return "?";

  const username = email.split("@")[0];

  // Split by common separators
  const parts = username.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (username.length >= 2) {
    return (username[0] + username[1]).toUpperCase();
  }

  return username[0].toUpperCase();
}

// Microsoft Outlook-Style Avatar Component
function MicrosoftAvatar({ email, size = "md", showIcon = false }) {
  const color = getAvatarColorFromEmail(email);
  const initials = getInitialsFromEmail(email);

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  return (
    <div
      className={`${sizes[size]} flex-shrink-0 rounded-full flex items-center justify-center font-semibold shadow-md relative`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {showIcon ? (
        // Email icon (Outlook style)
        <svg
          className="w-1/2 h-1/2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M22 6l-10 7L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // Initials
        <span className="select-none">{initials}</span>
      )}

      {/* Online/Active indicator (optional) */}
    </div>
  );
}

// Modern role color mapping
const ROLE_CONFIG = {
  SuperAdmin: {
    color: "bg-indigo-50 text-indigo-700 border-indigo-200/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  admin: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  editor: {
    color: "bg-amber-50 text-amber-700 border-amber-200/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    ),
  },
  user: {
    color: "bg-slate-50 text-slate-600 border-slate-200/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

// Modern Role Badge Component
function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}
    >
      {config.icon}
      <span>{role}</span>
    </span>
  );
}

// Modern Platform Pill Component
function Pill({ platform }) {
  const colorCls =
    PLATFORM_COLOR[platform] ||
    "bg-slate-50 text-slate-600 border-slate-200/50";
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border ${colorCls} shadow-sm`}
    >
      <img
        src={PLATFORM_ICON[platform]}
        alt=""
        className="w-3.5 h-3.5 mr-1.5"
      />
      <span className="truncate">{PLATFORM_LABEL[platform] || platform}</span>
    </span>
  );
}

// FIXED: Portal-based dropdown with proper mobile positioning
function SimpleDropdown({ isOpen, onClose, trigger, content }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  // Handle click outside
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

  // Position dropdown
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const isMobile = viewportWidth < 768;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let style = {
        position: "fixed",
        zIndex: 9999,
      };

      if (isMobile) {
        const padding = 16;
        style.left = `${padding}px`;
        style.right = `${padding}px`;
        style.width = `calc(100vw - ${padding * 2}px)`;
        style.maxHeight = `${Math.min(300, viewportHeight * 0.5)}px`;

        if (spaceBelow > 250 || spaceBelow > spaceAbove) {
          style.top = `${triggerRect.bottom + 8}px`;
        } else {
          style.bottom = `${viewportHeight - triggerRect.top + 8}px`;
        }
      } else {
        style.left = `${triggerRect.left}px`;
        style.width = `${Math.max(triggerRect.width, 240)}px`;
        style.maxHeight = "400px";

        if (spaceBelow > 300 || spaceBelow > spaceAbove) {
          style.top = `${triggerRect.bottom + 8}px`;
        } else {
          style.bottom = `${viewportHeight - triggerRect.top + 8}px`;
        }
      }

      setMenuStyle(style);
    };

    updatePosition();

    const handleScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
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
            style={menuStyle}
            className="bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

/** Modern Platform Selector Dropdown */
function PlatformDropdown({ value = [], onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = value.map((v) => String(v).toLowerCase());

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2.5 bg-white dark:bg-gray-800 text-left disabled:opacity-50 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 flex-shrink-0"
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
            ? `${selected.length} platform${
                selected.length > 1 ? "s" : ""
              } selected`
            : "Select platforms"}
        </span>
      </div>
      <svg
        className={`ml-2 h-5 w-5 shrink-0 transition-transform text-gray-400 ${
          open ? "rotate-180" : ""
        }`}
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

  const content = (
    <div className="py-2">
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Select Platforms
        </p>
      </div>
      <div className="max-h-60 overflow-y-auto py-1">
        {PLATFORM_KEYS.map((key) => {
          const checked = selected.includes(key);
          const colorCls = checked ? PLATFORM_COLOR[key] || "" : "";
          return (
            <label
              key={key}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm font-medium transition-all ${
                checked
                  ? colorCls
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(key);
              }}
            >
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={checked}
                  onChange={() => {}}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center gap-2.5 flex-1">
                <img src={PLATFORM_ICON[key]} alt="" className="w-5 h-5" />
                <span>{PLATFORM_LABEL[key]}</span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex justify-between items-center border-t border-gray-100 px-3 py-2 mt-1 bg-gray-50">
        <span className="text-xs text-gray-500">
          {selected.length} selected
        </span>
        <button
          type="button"
          className="text-xs font-medium rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition-colors shadow-sm"
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
  );

  return (
    <SimpleDropdown
      isOpen={open}
      onClose={() => setOpen(false)}
      trigger={trigger}
      content={content}
    />
  );
}

// Modern Role Selector with icons
function RoleSelector({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  const currentRole = ROLES.includes(value) ? value : "user";
  const config = ROLE_CONFIG[currentRole];

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={`w-full rounded-xl border px-3 py-2.5 text-left disabled:opacity-50 flex items-center justify-between shadow-sm transition-all text-sm font-semibold ${config.color}`}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span>{currentRole}</span>
      </div>
      <svg
        className={`ml-2 h-5 w-5 shrink-0 transition-transform ${
          open ? "rotate-180" : ""
        }`}
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

  const content = (
    <div className="py-2">
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Change Role
        </p>
      </div>
      <div className="py-1">
        {ROLES.map((role) => {
          const roleConfig = ROLE_CONFIG[role];
          return (
            <button
              key={role}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(role);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-2.5 transition-all text-sm font-medium ${
                role === currentRole
                  ? roleConfig.color
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-300"
              }`}
            >
              {roleConfig.icon}
              <span>{role}</span>
              {role === currentRole && (
                <svg
                  className="ml-auto h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
  );

  return (
    <SimpleDropdown
      isOpen={open}
      onClose={() => setOpen(false)}
      trigger={trigger}
      content={content}
    />
  );
}

// Mobile User Card Component - Premium Style with Microsoft Avatars
function UserCard({
  user,
  updatingId,
  handleTogglePlatform,
  handleChangeRole,
}) {
  const { id, email, role, platforms = [] } = user;
  const selectedPlatforms = platforms.map((v) => String(v).toLowerCase());
  const rowDisabled = updatingId === id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 mb-4 ">
      {/* Card header - user info with Microsoft Avatar */}
      <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <MicrosoftAvatar email={email} size="lg" />
          <div className="flex-1 min-w-0 ml-3">
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {email?.split("@")[0] || "—"}
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
              <span className="truncate">{email || "—"}</span>
            </div>
          </div>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 ">
        {/* Platform section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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
              Platforms
            </h4>
            {rowDisabled && (
              <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                <svg
                  className="animate-spin h-3.5 w-3.5 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedPlatforms.length ? (
              selectedPlatforms.map((p) => <Pill key={p} platform={p} />)
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                No platforms assigned
              </span>
            )}
          </div>
          <PlatformDropdown
            value={platforms}
            disabled={rowDisabled}
            onToggle={(key) => handleTogglePlatform(id, key)}
          />
        </div>

        {/* Role section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Role
            </h4>
          </div>
          <RoleSelector
            value={role}
            onChange={(newRole) => handleChangeRole(id, newRole)}
            disabled={rowDisabled}
          />
        </div>
      </div>
    </div>
  );
}

export default function AuthorizationPage() {
  const [session, setSession] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data: meRow, error: meErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (meErr) setError(meErr.message);
      else setMyRole(meRow?.role || "user");

      await fetchUsers({ page: 1, search: "" });
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function fetchUsers({ page, search }) {
    setError("");
    setSearchLoading(true);

    try {
      const { data: list, error: rpcErr } = await supabase.rpc(
        "list_users_with_roles",
        {
          search: search?.trim() ? search : null,
          page_size: pageSize,
          page,
        }
      );

      if (rpcErr) {
        setError(rpcErr.message);
        setRows([]);
        setTotal(0);
        return;
      }

      const norm = (arr) =>
        Array.from(new Set((arr || []).map((v) => String(v).toLowerCase())));
      setRows(
        (list || []).map((u) => ({ ...u, platforms: norm(u.platforms) }))
      );

      const { data: countVal, error: cntErr } = await supabase.rpc(
        "count_users",
        {
          search: search?.trim() ? search : null,
        }
      );

      if (cntErr) {
        setError(cntErr.message);
        setTotal(0);
        return;
      }

      setTotal(Number(countVal) || 0);
      setPage(page);
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchUsers({ page: 1, search });
  }

  async function getSuperAdminCount() {
    const { count, error } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "SuperAdmin");
    if (error) {
      setError(error.message);
      return 0;
    }
    return count || 0;
  }

  async function handleChangeRole(userId, nextRole) {
    setError("");
    setUpdatingId(userId);

    if (nextRole !== "SuperAdmin") {
      const count = await getSuperAdminCount();
      if (count <= 1) {
        const target = rows.find((r) => r.id === userId);
        if (target?.role === "SuperAdmin") {
          setUpdatingId(null);
          setError("You can't remove the last SuperAdmin.");
          return;
        }
      }
    }

    const prev = rows.slice();
    setRows((rs) =>
      rs.map((r) => (r.id === userId ? { ...r, role: nextRole } : r))
    );

    const { error: rpcErr } = await supabase.rpc("set_user_role", {
      target_id: userId,
      new_role: nextRole,
    });

    setUpdatingId(null);
    if (rpcErr) {
      setRows(prev);
      setError(rpcErr.message);
      return;
    }

    if (session?.user?.id === userId) {
      const { data: meRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      setMyRole(meRow?.role || "user");
    }
  }

  async function handleTogglePlatform(userId, key) {
    setError("");
    setUpdatingId(userId);
    const prev = rows.slice();
    const row = rows.find((r) => r.id === userId);
    const current = new Set(
      (row?.platforms || []).map((v) => String(v).toLowerCase())
    );

    if (current.has(key)) current.delete(key);
    else current.add(key);

    const nextArr = Array.from(current);

    setRows((rs) =>
      rs.map((r) => (r.id === userId ? { ...r, platforms: nextArr } : r))
    );

    const { error: rpcErr } = await supabase.rpc("set_user_platforms", {
      target_id: userId,
      new_platforms: nextArr,
    });

    setUpdatingId(null);
    if (rpcErr) {
      setRows(prev);
      setError(rpcErr.message);
    }
  }

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 grid place-items-center ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading user data...
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 grid place-items-center p-4">
        <div className="p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800 max-w-md mx-auto">
          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-center text-gray-900 dark:text-white">
            Sign in required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Please sign in to manage user roles and platform access.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/login")}
              className="rounded-xl px-6 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (myRole !== "SuperAdmin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 grid place-items-center p-4">
        <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 max-w-md mx-auto shadow-xl">
          <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-rose-600 dark:text-rose-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-center text-rose-900 dark:text-rose-100">
            Not authorized
          </h1>
          <p className="text-center text-rose-700 dark:text-rose-300 mb-2">
            Only a <strong>SuperAdmin</strong> can view and change user roles.
          </p>
          <p className="text-center text-sm text-rose-600 dark:text-rose-400">
            Your current role: <strong>{myRole}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* FULL WIDTH CONTAINER */}
      <div className="w-full h-full">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Modern Header */}
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Authorization Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage user roles and platform access
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <MicrosoftAvatar email={session.user.email} size="sm" />
                <div className="flex flex-col gap-1">
                  <RoleBadge role={myRole || "user"} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Search Section */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by email..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-xl px-6 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-all hover:shadow-md active:scale-95 flex items-center gap-2 text-sm"
              >
                {searchLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    Search
                  </>
                )}
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchUsers({ page: 1, search: "" });
                  }}
                  className="rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-5 w-5 text-rose-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-rose-800 dark:text-rose-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile view - Card layout */}
          <div className="md:hidden">
            {rows.length > 0 ? (
              rows.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  updatingId={updatingId}
                  handleTogglePlatform={handleTogglePlatform}
                  handleChangeRole={handleChangeRole}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    No users found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {search
                      ? "Try adjusting your search criteria"
                      : "No user data available"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop view - Premium Table with Microsoft Avatars */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {/* Premium Sticky Header */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        User
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                        Platforms
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                {/* Premium Table Body with Zebra Stripes and Microsoft Avatars */}
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {rows.map((u, idx) => {
                    const selectedPlatforms = (u.platforms || []).map((v) =>
                      String(v).toLowerCase()
                    );
                    const rowDisabled = updatingId === u.id;

                    return (
                      <tr
                        key={u.id}
                        className={`transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50/30 dark:bg-gray-800/50"
                        }`}
                      >
                        {/* User Column with Microsoft Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <MicrosoftAvatar email={u.email} size="md" />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {u.email?.split("@")[0] || "—"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {String(u.id).slice(0, 8)}…
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-400 flex-shrink-0"
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
                            <span className="truncate max-w-[250px]">
                              {u.email || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RoleBadge role={u.role} />
                        </td>

                        {/* Platforms Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {selectedPlatforms.length ? (
                                selectedPlatforms.map((p) => (
                                  <Pill key={p} platform={p} />
                                ))
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                  No platforms
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <PlatformDropdown
                                value={u.platforms || []}
                                disabled={rowDisabled}
                                onToggle={(key) =>
                                  handleTogglePlatform(u.id, key)
                                }
                              />
                              {rowDisabled && (
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center whitespace-nowrap">
                                  <svg
                                    className="animate-spin h-3.5 w-3.5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
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
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Saving
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <RoleSelector
                              value={u.role}
                              onChange={(role) => handleChangeRole(u.id, role)}
                              disabled={rowDisabled}
                            />
                            {rowDisabled && (
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center whitespace-nowrap">
                                <svg
                                  className="animate-spin h-3.5 w-3.5 mr-1"
                                  xmlns="http://www.w3.org/2000/svg"
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
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && (
                    <tr>
                      <td className="px-6 py-20 text-center" colSpan={5}>
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400 dark:text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                              />
                            </svg>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">
                            No users found
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {search
                              ? "Try adjusting your search criteria"
                              : "No user data available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modern Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-semibold">{total}</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                users • Page{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {pageCount}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  fetchUsers({ page: Math.max(1, page - 1), search })
                }
                disabled={page <= 1}
                className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow-md flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                Previous
              </button>

              <button
                onClick={() =>
                  fetchUsers({ page: Math.min(pageCount, page + 1), search })
                }
                disabled={page >= pageCount}
                className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow-md flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Next
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
