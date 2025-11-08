// authorization.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/supabaseClient';

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const ROLES = ['SuperAdmin', 'admin', 'editor', 'user'];
const PLATFORM_KEYS = ['meta', 'snap', 'newsbreak', 'google', 'tiktok'];
const PLATFORM_LABEL = {
    meta: 'Meta',
    snap: 'Snap',
    newsbreak: 'NewsBreak',
    google: 'Google',
    tiktok: 'TikTok',
};

// Platform icon mapping
const PLATFORM_ICON = {
    meta: fb,
    snap: snapchatIcon,
    newsbreak: nb,
    google: googleIcon,
    tiktok: tiktokIcon,
};

// Platform color mapping for visual distinction
const PLATFORM_COLOR = {
    meta: 'bg-blue-100 text-blue-700 border-blue-200',
    snap: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    newsbreak: 'bg-red-100 text-red-700 border-red-200',
    google: 'bg-green-100 text-green-700 border-green-200',
    tiktok: 'bg-purple-100 text-purple-700 border-purple-200',
};

// Role icon components
function RoleIcon({ role }) {
    switch (role) {
        case 'SuperAdmin':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            );
        case 'admin':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
            );
        case 'editor':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            );
        case 'user':
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            );
    }
}

// Email icon
function EmailIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
    );
}

function RoleBadge({ role }) {
    const cls = {
        SuperAdmin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        editor: 'bg-amber-100 text-amber-700 border-amber-200',
        user: 'bg-slate-100 text-slate-700 border-slate-200',
    }[role] || 'bg-slate-100 text-slate-700 border-slate-200';
    
    return (
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center border ${cls}`}>
            <span className="mr-1.5"><RoleIcon role={role} /></span>
            {role}
        </span>
    );
}

function Pill({ platform }) {
    const colorCls = PLATFORM_COLOR[platform] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1.5 rounded-full border ${colorCls}`}>
            <img src={PLATFORM_ICON[platform]} alt="" className="w-4 h-4 mr-1.5" />
            {PLATFORM_LABEL[platform] || platform}
        </span>
    );
}

// Simplified dropdown that works in any position
function SimpleDropdown({ isOpen, onClose, trigger, content }) {
    const rootRef = useRef(null);
    const menuRef = useRef(null);
    
    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Position menu above if needed
            positionMenu();
        }
        
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);
    
    // Position dropdown based on viewport
    const positionMenu = () => {
        if (!menuRef.current || !rootRef.current) return;
        
        const menuRect = menuRef.current.getBoundingClientRect();
        const triggerRect = rootRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Reset styles first
        menuRef.current.style.top = 'calc(100% + 5px)';
        menuRef.current.style.bottom = 'auto';
        
        // Check if dropdown would go out of viewport
        if (triggerRect.bottom + menuRect.height + 10 > viewportHeight) {
            // Position above trigger
            menuRef.current.style.top = 'auto';
            menuRef.current.style.bottom = 'calc(100% + 5px)';
        }
    };
    
    return (
        <div ref={rootRef} className="relative inline-block text-left w-full">
            {trigger}
            
            {isOpen && (
                <div 
                    ref={menuRef}
                    className="absolute left-0 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    style={{maxHeight: '300px', overflowY: 'auto'}}
                >
                    {content}
                </div>
            )}
        </div>
    );
}

/** Select-like dropdown for multi-selecting platforms (per-row component). */
function PlatformDropdown({ value = [], onToggle, disabled }) {
    const [open, setOpen] = useState(false);
    const selected = value.map(v => String(v).toLowerCase());

    // Trigger component
    const trigger = (
        <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-white text-left disabled:opacity-50 flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm"
        >
            <span className="truncate text-sm font-medium">
                {selected.length
                    ? selected.map(k => PLATFORM_LABEL[k] || k).join(', ')
                    : 'Select platforms'}
            </span>
            <svg
                className={`ml-2 h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''} text-slate-500`}
                viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
            </svg>
        </button>
    );
    
    // Dropdown content
    const content = (
        <div className="py-1">
            <div className="max-h-60">
                {PLATFORM_KEYS.map(key => {
                    const checked = selected.includes(key);
                    const colorCls = checked ? PLATFORM_COLOR[key] || '' : '';
                    return (
                        <label
                            key={key}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm font-medium ${checked ? colorCls : 'hover:bg-slate-50'}`}
                            onMouseDown={e => e.preventDefault()} // keep focus in dropdown
                        >
                            <div className="flex items-center justify-center w-5 h-5">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300"
                                    checked={checked}
                                    onChange={() => onToggle(key)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <img src={PLATFORM_ICON[key]} alt="" className="w-5 h-5" />
                                {PLATFORM_LABEL[key]}
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-2 mt-1">
                <button
                    type="button"
                    className="text-sm rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 font-medium"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setOpen(false)}
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

// Custom role selector dropdown with better UI
function RoleSelector({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    
    // Role UI mappings
    const roleUI = {
        SuperAdmin: {
            color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
            icon: <RoleIcon role="SuperAdmin" />
        },
        admin: {
            color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
            icon: <RoleIcon role="admin" />
        },
        editor: {
            color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
            icon: <RoleIcon role="editor" />
        },
        user: {
            color: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
            icon: <RoleIcon role="user" />
        }
    };
    
    const currentRole = ROLES.includes(value) ? value : 'user';
    const { color, icon } = roleUI[currentRole];
    
    // Trigger component
    const trigger = (
        <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className={`w-full rounded-lg border px-3 py-2.5 text-left disabled:opacity-50 flex items-center justify-between shadow-sm ${color}`}
        >
            <div className="flex items-center">
                <span className="mr-2">{icon}</span>
                <span className="text-sm font-medium">{currentRole}</span>
            </div>
            <svg
                className={`ml-2 h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
            </svg>
        </button>
    );
    
    // Dropdown content
    const content = (
        <div className="py-1">
            {ROLES.map(role => {
                const { color, icon } = roleUI[role];
                return (
                    <button
                        key={role}
                        type="button"
                        onClick={() => {
                            onChange(role);
                            setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-center ${role === currentRole ? color : 'hover:bg-slate-50'}`}
                    >
                        <span className="mr-2">{icon}</span>
                        <span className="text-sm font-medium">{role}</span>
                    </button>
                );
            })}
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

export default function AuthorizationPage() {
  const [session, setSession] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // rows: { id, email, role, platforms: string[], created_at }
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

      // My role
      const { data: meRow, error: meErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (meErr) setError(meErr.message);
      else setMyRole(meRow?.role || "user");

      // Load list
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

      // === CHANGED: normalize platforms to lower-case & unique for consistent display ===
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

  // Handle search form submission
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

    // prevent removing last SuperAdmin
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

    // optimistic UI
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

    // refresh my role if self-changed
    if (session?.user?.id === userId) {
      const { data: meRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      setMyRole(meRow?.role || "user");
    }
  }

  // Toggle one platform inside the multi-select dropdown
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

    // optimistic UI
    setRows((rs) =>
      rs.map((r) => (r.id === userId ? { ...r, platforms: nextArr } : r))
    );

    // === CHANGED: persist lower-cased keys to keep server canonical ===
    const { error: rpcErr } = await supabase.rpc("set_user_platforms", {
      target_id: userId,
      new_platforms: nextArr,
    });

    setUpdatingId(null);
    if (rpcErr) {
      setRows(prev); // rollback
      setError(rpcErr.message);
    }
  }

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  // --- Render guards ---
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-600">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500 mb-3"
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
          <span className="font-medium">Loading user data...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100">
        <div className="p-8 rounded-2xl border border-slate-200 shadow-lg bg-white max-w-md">
          <svg
            className="w-12 h-12 text-indigo-500 mx-auto mb-4"
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
          <h1 className="text-2xl font-bold mb-3 text-center">
            Sign in required
          </h1>
          <p className="text-slate-600 text-center mb-4">
            Please sign in to manage user roles and platform access.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/login")}
              className="rounded-xl px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === CHANGED: Only SuperAdmin sees this page; admins/editors/users are blocked here ===
  if (myRole !== "SuperAdmin") {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100">
        <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 max-w-md shadow-lg">
          <svg
            className="w-12 h-12 mx-auto mb-4"
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
          <h1 className="text-2xl font-bold mb-3 text-center">
            Not authorized
          </h1>
          <p className="text-center mb-2">
            Only a <strong>SuperAdmin</strong> can view and change user roles.
          </p>
          <p className="text-center text-sm">
            Your current role: <strong>{myRole}</strong>
          </p>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-auto mx-auto py-6">
        <header className="mb-5 px-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Authorization
            </h1>
           
          </div>
          <div className="flex gap-2 items-center p-3 px-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <RoleBadge role={myRole || "user"} />
            <span className="text-sm font-medium text-slate-600">
              {session.user.email}
            </span>
          </div>
        </header>

        <div className="mb-4 px-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
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
                className="w-full pl-10 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-xl px-5 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition-colors flex items-center"
              >
                {searchLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  "Search"
                )}
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchUsers({ page: 1, search: "" });
                  }}
                  className="rounded-xl px-4 py-3 border border-slate-300 bg-white hover:bg-slate-50 shadow-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div className="mx-4 mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-rose-400"
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
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow mx-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-sm font-semibold text-slate-700"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-sm font-semibold text-slate-700"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-sm font-semibold text-slate-700"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-sm font-semibold text-slate-700"
                  >
                    Platforms
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-sm font-semibold text-slate-700 w-56"
                  >
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((u, index) => {
                  const selectedPlatforms = (u.platforms || []).map((v) =>
                    String(v).toLowerCase()
                  );
                  const rowDisabled = updatingId === u.id; // disable only this row while saving

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                            <RoleIcon role={u.role} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {u.email?.split("@")[0] || "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {String(u.id).slice(0, 8)}…
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-700">
                          <EmailIcon />
                          <span className="ml-2">{u.email || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Platforms column: pills + select-like dropdown editor */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {selectedPlatforms.length ? (
                            selectedPlatforms.map((p) => (
                              <Pill key={p} platform={p} />
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <PlatformDropdown
                            value={u.platforms || []}
                            disabled={rowDisabled}
                            onToggle={(key) => handleTogglePlatform(u.id, key)}
                          />
                          {rowDisabled && (
                            <span className="text-xs text-slate-500 flex items-center whitespace-nowrap">
                              <svg
                                className="animate-spin h-3 w-3 mr-1 text-indigo-500"
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

                      {/* Change column: role selector */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <RoleSelector
                            value={u.role}
                            onChange={(role) => handleChangeRole(u.id, role)}
                            disabled={rowDisabled}
                          />
                          {rowDisabled && (
                            <span className="text-xs text-slate-500 flex items-center whitespace-nowrap">
                              <svg
                                className="animate-spin h-3 w-3 mr-1 text-indigo-500"
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
                    <td
                      className="px-5 py-16 text-center text-slate-500"
                      colSpan={5}
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-slate-300 mb-3"
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
                        <p className="font-medium mb-1">No users found</p>
                        <p className="text-sm">
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

        {/* Pagination */}
        <div className="mt-5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-700 flex items-center">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg mr-2">
              {total}
            </span>
            users found • Page {page} of {pageCount}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                fetchUsers({ page: Math.max(1, page - 1), search })
              }
              disabled={page <= 1}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-colors font-medium flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
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
              Prev
            </button>
            <button
              onClick={() =>
                fetchUsers({ page: Math.min(pageCount, page + 1), search })
              }
              disabled={page >= pageCount}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-colors font-medium flex items-center"
            >
              Next
              <svg
                className="w-5 h-5 ml-1"
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
  );
}
