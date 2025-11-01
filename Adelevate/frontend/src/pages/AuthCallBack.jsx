// src/pages/AuthCallback.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [msg, setMsg] = useState('Signing you in…');
    const exchanged = useRef(false);

    useEffect(() => {
        const log = (...a) => console.log('[AuthCallback]', ...a);

        // 1) If we already have a session, just go.
        const goIfSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const params = new URLSearchParams(location.search);
                const redirectTo = params.get('redirect') || '/dashboard';
                window.history.replaceState({}, '', '/auth/callback');
                navigate(redirectTo, { replace: true });
                return true;
            }
            return false;
        };

        // 2) watch auth events (handles late arrival)
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            log('onAuthStateChange:', event, !!session);
            if (event === 'SIGNED_IN' && session) {
                const params = new URLSearchParams(location.search);
                const redirectTo = params.get('redirect') || '/dashboard';
                window.history.replaceState({}, '', '/auth/callback');
                navigate(redirectTo, { replace: true });
            }
        });

        const run = async () => {
            log('search:', location.search);
            log('hash  :', location.hash);

            // If session is already there (auto-exchanged by SDK), bail early.
            if (await goIfSession()) return;

            const searchParams = new URLSearchParams(location.search);
            const hashParams = new URLSearchParams((location.hash || '').replace(/^#/, ''));
            const getParam = (k) => searchParams.get(k) || hashParams.get(k);

            const error = getParam('error') || getParam('error_description');
            if (error) {
                console.error('[OAuth Error]', error);
                navigate('/login?msg=' + encodeURIComponent(error), { replace: true });
                return;
            }

            const code = getParam('code');
            if (code && !exchanged.current) {
                exchanged.current = true;
                setMsg('Finishing sign-in…');
                const { error: exErr } = await supabase.auth.exchangeCodeForSession({ code });
                if (exErr) {
                    console.error('[exchangeCodeForSession] error:', exErr);
                    navigate('/login?msg=' + encodeURIComponent(exErr.message || 'auth_failed'), { replace: true });
                    return;
                }
            }

            // After exchange (or if no code), check once more for session then redirect.
            setMsg('Preparing your session…');
            for (let i = 0; i < 20; i++) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const params = new URLSearchParams(location.search);
                    const redirectTo = params.get('redirect') || '/dashboard';
                    window.history.replaceState({}, '', '/auth/callback');
                    navigate(redirectTo, { replace: true });
                    return;
                }
                await new Promise(r => setTimeout(r, 100));
            }

            // No session? send back with a generic message.
            navigate('/login?msg=auth_failed', { replace: true });
        };

        run();
        return () => sub?.subscription?.unsubscribe?.();
    }, [navigate, location.search, location.hash]);

    return <p style={{ padding: 16 }}>{msg}</p>;
}
