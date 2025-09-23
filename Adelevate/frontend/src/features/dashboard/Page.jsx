import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import '@/App.css';

const Page = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a session exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate('/login'); // Redirect if not logged in
      }
    });

    // Listen to auth changes (optional: to handle logout from other tabs)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login'); // Redirect on logout
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    localStorage.removeItem('supabase-session'); // Clear session
    navigate('/login'); // Redirect to login page
  };

  return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          {user && (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
          )}
        </div>

        {user ? <p>Welcome, {user.email}</p> : <p>Loading...</p>}
      </div>
  );
};

export default Page;
