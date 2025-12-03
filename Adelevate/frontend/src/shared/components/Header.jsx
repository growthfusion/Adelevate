import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, Download, Settings, User, LogOut } from "lucide-react";
import Button from "../Button";

const Header = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2 w-96">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search landers, tests, analytics..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Auto-refresh indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Updated 2 min ago
        </div>

        {/* Export Button */}
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
          <span className="hidden sm:inline">Export</span>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">New A/B Test Result</p>
                  <p className="text-xs text-gray-500 mt-1">Crypto-US-v3 variant won by 17%</p>
                  <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Performance Alert</p>
                  <p className="text-xs text-gray-500 mt-1">Health-US-v1 loading slowly</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">JD</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">John Doe</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                Your Profile
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
