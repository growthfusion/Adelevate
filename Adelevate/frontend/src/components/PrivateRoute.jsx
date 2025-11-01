import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const location = useLocation();

    useEffect(() => {
        let active = true;

        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!active) return;
            setSession(session);
            setLoading(false);
        })();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess);
        });

        return () => {
            active = false;
            sub?.subscription?.unsubscribe?.();
        };
    }, []);

    if (loading) return null;

    if (!session) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    return children;
}
