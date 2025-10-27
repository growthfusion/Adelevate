import React, { useState, useRef, useEffect } from 'react';

// Import platform icons
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

const PlatformFilter = ({
  selectedPlatforms,
  onPlatformChange,
  dateRange,
  onDateRangeChange,
  autoRefresh,
  onAutoRefreshChange,
  onRefresh,
  isRefreshing
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const platformOptions = [
    { id: 'google-ads', name: 'Google', icon: googleIcon },
    { id: 'facebook', name: 'Facebook', icon: fb },
    { id: 'tiktok', name: 'TikTok', icon: tiktokIcon },
    { id: 'snapchat', name: 'Snapchat', icon: snapchatIcon },
    { id: 'newsbreak', name: 'NewsBreak', icon: nb }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const refreshIntervalOptions = [
    { value: 'off', label: 'Off' },
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '60', label: '60 min' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePlatformSelection = (platformId) => {
    onPlatformChange(platformId);
    setIsDropdownOpen(false);
  };

  const getSelectedText = () => {
    if (selectedPlatforms === 'all') return 'All Platforms';
    const platform = platformOptions.find(p => p.id === selectedPlatforms);
    return platform ? platform.name : 'Select...';
  };

  return (
    <div className="bg-white p-4 shadow-sm border-b">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Platform Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full md:w-60 h-10 bg-white border border-gray-300 rounded-md px-4 py-2 text-left flex items-center justify-between"
              type="button"
            >
              <span className="text-gray-700">Platforms</span>
              <div className="flex items-center">
                <span className="text-gray-500">{getSelectedText()}</span>
                <svg className="ml-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    Select platform...
                  </div>
                  {/* All Platforms Option */}
                  <div
                    className="px-4 py-2 hover:bg-gray-50 flex items-center cursor-pointer"
                    onClick={() => handlePlatformSelection('all')}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 mr-3 text-blue-600"
                      checked={selectedPlatforms === 'all'}
                      readOnly
                    />
                    <span>All Platforms</span>
                  </div>
                  {/* Individual Platform options */}
                  {platformOptions.map((platform) => (
                    <div
                      key={platform.id}
                      className="px-4 py-2 hover:bg-gray-50 flex items-center cursor-pointer"
                      onClick={() => handlePlatformSelection(platform.id)}
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 mr-3 text-blue-600"
                        checked={selectedPlatforms === platform.id}
                        readOnly
                      />
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="w-6 h-6 mr-2"
                      />
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="w-full sm:w-40 h-10 border border-gray-300 rounded-md px-4"
            >
              {dateRangeOptions.map(option =>
                <option key={option.value} value={option.value}>{option.label}</option>
              )}
            </select>

            <select
              value={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.value)}
              className="w-full sm:w-36 h-10 border border-gray-300 rounded-md px-4"
            >
              {refreshIntervalOptions.map(option =>
                <option key={option.value} value={option.value}>{option.label}</option>
              )}
            </select>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto h-10 px-6 border rounded-md text-sm font-medium bg-white border-gray-300 hover:bg-gray-50"
              type="button"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformFilter;
