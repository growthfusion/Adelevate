import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import '@/App.css';

const Page = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate('/login'); 
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login'); 
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(''); 
    navigate('/login'); 
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
