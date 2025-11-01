import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Home , Menu, X } from "lucide-react";
import { BsLayoutSidebar } from "react-icons/bs";
import { TbAutomation } from "react-icons/tb";
import Search from "./search-bar";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { MdDataSaverOn } from "react-icons/md";
import  social from "@/assets/images/dashboard_img/social-media-marketing.png"
import { KeyRound } from 'lucide-react';

const SlideSidebar = () => {
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const toggleAutomation = () => {
    setIsAutomationOpen(!isAutomationOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Get device type based on screen width
  const getDeviceType = (width) => {
    if (width < 320) return "xs";
    if (width < 425) return "ss";
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    if (width < 1536) return "desktop";
    return "2xl";
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // Auto-close mobile sidebar on larger screens
      if (width >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const deviceType = getDeviceType(windowWidth);
  const isMobile = ["xs", "ss", "mobile"].includes(deviceType);
  const isTabletUp = ["tablet", "desktop", "2xl"].includes(deviceType);

  // Mobile sidebar content - keeping original design
  const mobileSidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">Adelevate</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <a
              href="/"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
          </li>

          {/* Automation */}
          <li>
            <div>
              <button
                onClick={toggleAutomation}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <TbAutomation className="w-5 h-5" />
                  <span>Automation</span>
                </div>
                {isAutomationOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Automation Submenu */}
              {isAutomationOpen && (
                <ul className="mt-2 ml-8 space-y-1">
                  <li>
                    <a
                      href="/edit"
                      className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Rules
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <a href="/log"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <MdOutlineDataSaverOff className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Logs</span>}
            </a>
          </li>

          <li>
            <a href="/actionLog"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <MdDataSaverOn className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Action Logs</span>}
            </a>
          </li>


          <li>
            <a href="/campaigns"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <img src={social} alt="" className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Campaigns</span>}
            </a>
          </li>

        </ul>
      </nav>
    </>
  );

  const desktopSidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">Adelevate</span>
          </div>
        )}
        <button 
          onClick={toggleSidebarCollapse} 
          className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${isSidebarCollapsed ? "mx-auto" : ""}`}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <BsLayoutSidebar className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Dashboard */}
          <li>
            <a
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              }`}
              title={isSidebarCollapsed ? "Dashboard" : ""}
            >
              <Home className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </a>
          </li>

          {/* Automation */}
          <li>
            <div>
              <button
                onClick={toggleAutomation}
                className={`flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                  isSidebarCollapsed ? "justify-center" : "justify-between space-x-3"
                }`}
                title={isSidebarCollapsed ? "Automation" : ""}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? "" : "space-x-3"}`}>
                  <TbAutomation className="w-5 h-5 min-w-[20px]" />
                  {!isSidebarCollapsed && <span>Automation</span>}
                </div>
                {!isSidebarCollapsed && (
                  isAutomationOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )
                )}
              </button>

              {/* Automation Submenu - only show when not collapsed */}
              {isAutomationOpen && !isSidebarCollapsed && (
                <ul className="mt-2 ml-8 space-y-1">
                  <li>
                    <a
                      href="/rules"
                      className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Rules
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li>
            <a href="/log"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <MdOutlineDataSaverOff className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Logs</span>}
            </a>
          </li>

          <li>
            <a href="/actionLog"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <MdDataSaverOn className="w-5 h-5 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Action Logs</span>}
            </a>
          </li>

          <li>
            <a href="/campaigns"
                className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                    isSidebarCollapsed ? "justify-center" : "space-x-3"
                }`}
                title={isSidebarCollapsed ? "Log" : ""}>
              <img src={social} alt="" className="w-6 h-6 min-w-[20px]" />
              {!isSidebarCollapsed && <span>Campaigns</span>}
            </a>
          </li>

          <li>
            <a href="/authorization"
               className={`flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                   isSidebarCollapsed ? "justify-center" : "space-x-3"
               }`}
               title={isSidebarCollapsed ? "Log" : ""}>
              <KeyRound className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Authorization</span>}
            </a>
          </li>
          
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && !isSidebarOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white p-2 flex items-center shadow-sm">
          <button 
            onClick={toggleSidebar}
            className="p-2 mr-2 hover:bg-gray-100 rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <Search />
          </div>
        </div>
      )}

      {/* Mobile Sidebar (Slide-in overlay) */}
      {isMobile ? (
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative h-full">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleSidebar}
            ></div>
            
            {/* Sidebar Content */}
            <div className={`relative h-full bg-white shadow-xl ${
              deviceType === "xs" ? "w-[260px]" : 
              deviceType === "ss" ? "w-[300px]" : "w-[320px]"
            }`}>
              {mobileSidebarContent}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop & Tablet Sidebar */
        <aside 
          className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {desktopSidebarContent}
        </aside>
      )}

      {/* Content padding for mobile view */}
      {isMobile && <div className="h-14"></div>}
    </>
  );
};

export default SlideSidebar;
