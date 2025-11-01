// authorization.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/supabaseClient';

const ROLES = ['SuperAdmin', 'admin', 'editor', 'user'];
const PLATFORM_KEYS = ['meta', 'snap', 'newsbreak', 'google', 'tiktok'];
const PLATFORM_LABEL = {
    meta: 'Meta',
    snap: 'Snap',
    newsbreak: 'NewsBreak',
    google: 'Google',
    tiktok: 'TikTok',
};

function RoleBadge({ role }) {
    const cls = {
        SuperAdmin: 'bg-indigo-100 text-indigo-700',
        admin: 'bg-emerald-100 text-emerald-700',
        editor: 'bg-amber-100 text-amber-700',
        user: 'bg-slate-100 text-slate-700',
    }[role] || 'bg-slate-100 text-slate-700';
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
      {role}
    </span>
    );
}

function Pill({ children }) {
    return (
        <span className="inline-block text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50">
      {children}
    </span>
    );
}

/** Select-like dropdown for multi-selecting platforms (per-row component). */
function PlatformDropdown({ value = [], onToggle, disabled }) {
    const [open, setOpen] = useState(false);
    const selected = value.map(v => String(v).toLowerCase());
    const ref = useRef(null);

    // Close when clicking outside THIS instance
    useEffect(() => {
        function onDocClick(e) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    return (
        <div className="relative w-full" ref={ref}>
            {/* Trigger styled like your role <select> */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                className="w-full rounded-lg border border-slate-200 px-2 py-2 bg-white text-left disabled:opacity-50 flex items-center justify-between"
            >
        <span className="truncate text-sm">
          {selected.length
              ? selected.map(k => PLATFORM_LABEL[k] || k).join(', ')
              : 'Select platforms'}
        </span>
                <svg
                    className={`ml-2 h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="max-h-56 overflow-auto p-2">
                        {PLATFORM_KEYS.map(key => {
                            const checked = selected.includes(key);
                            return (
                                <label
                                    key={key}
                                    className="flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-50 cursor-pointer text-sm"
                                    onMouseDown={e => e.preventDefault()} // keep focus in dropdown
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300"
                                        checked={checked}
                                        onChange={() => onToggle(key)}
                                        disabled={disabled}
                                    />
                                    {PLATFORM_LABEL[key]}
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 p-2">
                        <button
                            type="button"
                            className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AuthorizationPage() {
    const [session, setSession] = useState(null);
    const [myRole, setMyRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // rows: { id, email, role, platforms: string[], created_at }
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 12;
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;
            setSession(session);

            if (!session?.user) {
                setLoading(false);
                return;
            }

            // My role
            const { data: meRow, error: meErr } = await supabase
                .from('user_roles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

            if (meErr) setError(meErr.message);
            else setMyRole(meRow?.role || 'user');

            // Load list
            await fetchUsers({ page: 1, search: '' });
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
        setError('');
        const { data: list, error: rpcErr } = await supabase.rpc('list_users_with_roles', {
            search: search?.trim() ? search : null,
            page_size: pageSize,
            page,
        });
        if (rpcErr) {
            setError(rpcErr.message);
            setRows([]);
            setTotal(0);
            return;
        }

        // === CHANGED: normalize platforms to lower-case & unique for consistent display ===
        const norm = (arr) => Array.from(new Set((arr || []).map(v => String(v).toLowerCase())));
        setRows((list || []).map(u => ({ ...u, platforms: norm(u.platforms) })));

        const { data: countVal, error: cntErr } = await supabase.rpc('count_users', {
            search: search?.trim() ? search : null,
        });
        if (cntErr) {
            setError(cntErr.message);
            setTotal(0);
            return;
        }
        setTotal(Number(countVal) || 0);
        setPage(page);
    }

    async function getSuperAdminCount() {
        const { count, error } = await supabase
            .from('user_roles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'SuperAdmin');
        if (error) {
            setError(error.message);
            return 0;
        }
        return count || 0;
    }

    async function handleChangeRole(userId, nextRole) {
        setError('');
        setUpdatingId(userId);

        // prevent removing last SuperAdmin
        if (nextRole !== 'SuperAdmin') {
            const count = await getSuperAdminCount();
            if (count <= 1) {
                const target = rows.find(r => r.id === userId);
                if (target?.role === 'SuperAdmin') {
                    setUpdatingId(null);
                    setError("You can't remove the last SuperAdmin.");
                    return;
                }
            }
        }

        // optimistic UI
        const prev = rows.slice();
        setRows(rs => rs.map(r => (r.id === userId ? { ...r, role: nextRole } : r)));

        const { error: rpcErr } = await supabase.rpc('set_user_role', {
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
                .from('user_roles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();
            setMyRole(meRow?.role || 'user');
        }
    }

    // Toggle one platform inside the multi-select dropdown
    async function handleTogglePlatform(userId, key) {
        setError('');
        setUpdatingId(userId);
        const prev = rows.slice();
        const row = rows.find(r => r.id === userId);
        const current = new Set((row?.platforms || []).map(v => String(v).toLowerCase()));

        if (current.has(key)) current.delete(key);
        else current.add(key);

        const nextArr = Array.from(current);

        // optimistic UI
        setRows(rs => rs.map(r => (r.id === userId ? { ...r, platforms: nextArr } : r)));

        // === CHANGED: persist lower-cased keys to keep server canonical ===
        const { error: rpcErr } = await supabase.rpc('set_user_platforms', {
            target_id: userId,
            new_platforms: nextArr,
        });

        setUpdatingId(null);
        if (rpcErr) {
            setRows(prev); // rollback
            setError(rpcErr.message);
        }
    }

    const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

    // --- Render guards ---
    if (loading) {
        return <div className="min-h-screen grid place-items-center text-slate-600">Loading...</div>;
    }
    if (!session?.user) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-xl font-semibold mb-2">Sign in required</h1>
                    <p className="text-slate-600">Please sign in to manage roles.</p>
                </div>
            </div>
        );
    }

    // === CHANGED: Only SuperAdmin sees this page; admins/editors/users are blocked here ===
    if (myRole !== 'SuperAdmin') {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                    <h1 className="text-xl font-semibold mb-2">Not authorized</h1>
                    <p>Only a <strong>SuperAdmin</strong> can view and change user roles.</p>
                </div>
            </div>
        );
    }

    // --- Main UI ---
    return (
        <div className="bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Authorization</h1>
                        <p className="text-slate-600">Assign roles & platforms. Changes are saved to Supabase.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <RoleBadge role={myRole || 'user'} />
                        <span className="text-sm text-slate-600">{session.user.email}</span>
                    </div>
                </header>

                <div className="mb-4 flex items-center gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by email…"
                        className="w-full sm:w-80 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                        onClick={() => fetchUsers({ page: 1, search })}
                        className="rounded-xl px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            onClick={() => { setSearch(''); fetchUsers({ page: 1, search: '' }); }}
                            className="rounded-xl px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                        <tr className="text-left text-slate-600">
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Platforms</th>
                            <th className="px-4 py-3 w-56">Change</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((u) => {
                            const selectedPlatforms = (u.platforms || []).map(v => String(v).toLowerCase());
                            const rowDisabled = updatingId === u.id; // disable only this row while saving
                            return (
                                <tr key={u.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{u.email || '—'}</div>
                                        <div className="text-xs text-slate-500">ID: {String(u.id).slice(0, 8)}…</div>
                                    </td>
                                    <td className="px-4 py-3">{u.email || '—'}</td>
                                    <td className="px-4 py-3">
                                        <RoleBadge role={u.role} />
                                    </td>

                                    {/* Platforms column: pills + select-like dropdown editor */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedPlatforms.length
                                                ? selectedPlatforms.map(p => (
                                                    <Pill key={p}>{PLATFORM_LABEL[p] || p}</Pill>
                                                ))
                                                : <span className="text-xs text-slate-400">None</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* === CHANGED: still editable here because only SuperAdmin can see this page === */}
                                            <PlatformDropdown
                                                value={u.platforms || []}
                                                disabled={rowDisabled}
                                                onToggle={(key) => handleTogglePlatform(u.id, key)}
                                            />
                                            {rowDisabled && (
                                                <span className="text-xs text-slate-500">Saving…</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Change column: role selector */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="w-full rounded-lg border border-slate-200 px-2 py-2 bg-white"
                                                value={u.role}
                                                onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                disabled={rowDisabled}
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            {rowDisabled && (
                                                <span className="text-xs text-slate-500">Saving…</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {rows.length === 0 && (
                            <tr>
                                <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Page {page} of {pageCount} • {total} users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchUsers({ page: Math.max(1, page - 1), search })}
                            disabled={page <= 1}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => fetchUsers({ page: Math.min(pageCount, page + 1), search })}
                            disabled={page >= pageCount}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50 hover:bg-slate-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
