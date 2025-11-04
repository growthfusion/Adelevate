import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";

const Page = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        console.log("User data:", data.session.user);
      } else {
        navigate("/login");
      }
    });

    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        !event.target.closest(".profile-dropdown-container")
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Get user display name from Microsoft account if available
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  // Get profile image from Microsoft account
  const profileImage =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=random`;

  return (
    <div className="flex justify-end items-center border-b p-1.5 border-gray-200 bg-white relative">
      <div className="relative profile-dropdown-container">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors duration-200"
          aria-expanded={showDropdown}
          aria-haspopup="true"
        >
          <img
            src={profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="font-medium text-gray-700">{displayName}</span>
        </button>

        {showDropdown && (
          <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg w-64 py-2 border border-gray-200 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
