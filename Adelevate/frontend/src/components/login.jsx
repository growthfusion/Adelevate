import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import '@/App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { search } = useLocation();

    React.useEffect(() => {
        const params = new URLSearchParams(search);
        const raw = params.get('msg');
        if (raw) setErr(decodeURIComponent(raw)); // show real provider error if present
    }, [search]);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setErr(error.message);
        else navigate('/dashboard');
    };

    const handleMicrosoftSSO = async () => {
        setErr('');
        setLoading(true);

        const redirect = `${window.location.origin}/auth/callback`;
        console.log('[Login] redirectTo =', redirect);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                redirectTo: redirect,
                scopes: 'openid profile email offline_access',
                queryParams: { prompt: 'select_account' },
            },
        });

        setLoading(false);
        if (error) {
            console.error('[signInWithOAuth] error:', error);
            setErr(error.message);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-heading">Login</h2>

            {/* Email/Password */}
            <form onSubmit={handlePasswordLogin} className="login-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                />
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Please wait…' : 'Login'}
                </button>
            </form>

            <div className="divider">or</div>

            {/* Microsoft SSO */}
            <button onClick={handleMicrosoftSSO} className="submit-button sso-button" disabled={loading}>
                {loading ? 'Redirecting…' : 'Continue with Microsoft'}
            </button>

            {err && <p className="error-message">{err}</p>}
        </div>
    );
};

export default Login;
