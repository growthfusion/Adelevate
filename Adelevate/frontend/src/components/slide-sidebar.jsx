import { useState, useEffect } from "react";
import {
  ChevronDown,
  Home,
  Menu,
  X,
  LogOut,
  KeyRound,
  FileText,
  Activity,
} from "lucide-react";
import { BsLayoutSidebar } from "react-icons/bs";
import { TbAutomation } from "react-icons/tb";
import { MdOutlineDataSaverOff, MdDataSaverOn } from "react-icons/md";
import { IoPersonAddOutline } from "react-icons/io5";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabaseClient";

// Tooltip Component
const Tooltip = ({ children, text, show = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!show) return children;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-[100] px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap pointer-events-none shadow-xl animate-in fade-in duration-200">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
        </div>
      )}
    </div>
  );
};

const SlideSidebar = () => {
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user profile data
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
      }
    });
  }, []);

  // Get display name and profile image
  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const profileImage =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=0b57d0&color=fff`;

  const toggleAutomation = () => {
    setIsAutomationOpen(!isAutomationOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Check if route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if automation section has active route
  const isAutomationActive = () => {
    return location.pathname === "/rules";
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

      if (width >= 768) {
        setIsSidebarOpen(false);
      }
    };

    // Auto-open automation if rules is active
    if (isAutomationActive()) {
      setIsAutomationOpen(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const deviceType = getDeviceType(windowWidth);
  const isMobile = ["xs", "ss", "mobile"].includes(deviceType);

  // Navigation items
  const navItems = [
    {
      type: "single",
      path: "/",
      icon: Home,
      label: "Dashboard",
      badge: null,
    },
    {
      type: "parent",
      icon: TbAutomation,
      label: "Automation",
      isOpen: isAutomationOpen,
      toggle: toggleAutomation,
      children: [
        {
          path: "/rules",
          label: "Rules",
          badge: null,
        },
      ],
    },
    {
      type: "single",
      path: "/log",
      icon: MdOutlineDataSaverOff,
      label: "Logs",
      badge: null,
    },
    {
      type: "single",
      path: "/actionLog",
      icon: MdDataSaverOn,
      label: "Action Logs",
      badge: null,
    },
    {
      type: "single",
      path: "/campaigns",
      icon: HiOutlineSpeakerphone,
      label: "Campaigns",
      badge: null,
    },
    {
      type: "single",
      path: "/authorization",
      icon: KeyRound,
      label: "Authorization",
      badge: null,
    },
    {
      type: "single",
      path: "/addAccount",
      icon: IoPersonAddOutline,
      label: "Integration ",
      badge: null,
    },
  ];

  // Render single navigation item
  const renderNavItem = (item, collapsed = false) => {
    const active = isActive(item.path);

    return (
      <li key={item.path}>
        <Tooltip text={item.label} show={collapsed}>
          <a
            href={item.path}
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } px-3.5 py-3 rounded-xl transition-all duration-200 group ${
              active
                ? "bg-[#d3e3fd] shadow-sm"
                : "hover:bg-gray-50 active:scale-[0.98]"
            }`}
          >
            <div className={`flex items-center ${collapsed ? "" : "gap-3.5"}`}>
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  active
                    ? "text-[#0b57d0]"
                    : "text-gray-600 group-hover:text-[#0b57d0]"
                }`}
              />
              {!collapsed && (
                <span
                  className={`font-semibold text-[15px] transition-colors ${
                    active
                      ? "text-[#0b57d0]"
                      : "text-gray-700 group-hover:text-[#0b57d0]"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>
            {item.badge && !collapsed && (
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full min-w-[24px] text-center ${
                  active
                    ? "bg-[#0b57d0] text-white"
                    : "bg-[#d3e3fd] text-[#0b57d0]"
                }`}
              >
                {item.badge}
              </span>
            )}
            {item.badge && collapsed && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#0b57d0] rounded-full border-2 border-white"></span>
            )}
          </a>
        </Tooltip>
      </li>
    );
  };

  // Render parent navigation item with children
  const renderParentItem = (item, collapsed = false) => {
    const hasActiveChild = item.children?.some((child) => isActive(child.path));
    const isOpen = item.isOpen;

    return (
      <li key={item.label}>
        <Tooltip text={item.label} show={collapsed}>
          <button
            onClick={item.toggle}
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } w-full px-3.5 py-3 rounded-xl transition-all duration-200 group ${
              isOpen || hasActiveChild
                ? "bg-[#d3e3fd]"
                : "hover:bg-gray-50 active:scale-[0.98]"
            }`}
          >
            <div className={`flex items-center ${collapsed ? "" : "gap-3.5"}`}>
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isOpen || hasActiveChild
                    ? "text-[#0b57d0]"
                    : "text-gray-600 group-hover:text-[#0b57d0]"
                }`}
              />
              {!collapsed && (
                <span
                  className={`font-semibold text-[15px] transition-colors ${
                    isOpen || hasActiveChild
                      ? "text-[#0b57d0]"
                      : "text-gray-700 group-hover:text-[#0b57d0]"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-4 h-4 transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 text-[#0b57d0]"
                    : "text-gray-600 group-hover:text-[#0b57d0]"
                }`}
              />
            )}
          </button>
        </Tooltip>

        {/* Submenu */}
        {!collapsed && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? "max-h-40 opacity-100 mt-1.5" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="ml-5 space-y-1 pl-4 border-l-2 border-[#d3e3fd]">
              {item.children?.map((child) => {
                const childActive = isActive(child.path);
                return (
                  <li key={child.path}>
                    <a
                      href={child.path}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group ${
                        childActive
                          ? "bg-[#d3e3fd]"
                          : "hover:bg-gray-50 active:scale-[0.98]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full transition-colors ${
                            childActive
                              ? "bg-[#0b57d0]"
                              : "bg-gray-400 group-hover:bg-[#0b57d0]"
                          }`}
                        ></div>
                        <span
                          className={`font-medium text-sm transition-colors ${
                            childActive
                              ? "text-[#0b57d0]"
                              : "text-gray-700 group-hover:text-[#0b57d0]"
                          }`}
                        >
                          {child.label}
                        </span>
                      </div>
                      {child.badge && (
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
                            childActive
                              ? "bg-[#0b57d0] text-white"
                              : "bg-[#d3e3fd] text-[#0b57d0]"
                          }`}
                        >
                          {child.badge}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>
    );
  };

  // Mobile sidebar content
  const mobileSidebarContent = (
    <>
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#0b57d0] to-[#0947b3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-[#0b57d0]/30">
                <span className="text-[#0b57d0] font-bold text-xl">A</span>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">
                Adelevate
              </h1>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white custom-scrollbar">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (item.type === "single") {
              return renderNavItem(item, false);
            } else if (item.type === "parent") {
              return renderParentItem(item, false);
            }
            return null;
          })}
        </ul>
      </nav>

      {/* User Profile section */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={profileImage}
                alt="Profile"
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#d3e3fd]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate mb-0.5">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 active:scale-[0.98] font-semibold text-[15px]"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  // Desktop sidebar content
  const desktopSidebarContent = (
    <>
      {/* Header */}
      <div className="px-4 py-5 bg-gradient-to-r from-[#0b57d0] to-[#0947b3]">
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-[#0b57d0]/30">
                  <span className="text-[#0b57d0] font-bold text-lg">A</span>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight">
                  Adelevate
                </h1>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-[#0b57d0]/30">
                <span className="text-[#0b57d0] font-bold text-lg">A</span>
              </div>
            </div>
          )}
          {!isSidebarCollapsed && (
            <Tooltip text="Collapse" show={false}>
              <button
                onClick={toggleSidebarCollapse}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <BsLayoutSidebar className="w-4.5 h-4.5 text-white" />
              </button>
            </Tooltip>
          )}
        </div>
        {isSidebarCollapsed && (
          <div className="mt-3 flex justify-center">
            <Tooltip text="Expand" show={true}>
              <button
                onClick={toggleSidebarCollapse}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
              >
                <BsLayoutSidebar className="w-4.5 h-4.5 text-white" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto bg-white custom-scrollbar">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            if (item.type === "single") {
              return renderNavItem(item, isSidebarCollapsed);
            } else if (item.type === "parent") {
              return renderParentItem(item, isSidebarCollapsed);
            }
            return null;
          })}
        </ul>
      </nav>

      {/* User Profile section */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        {!isSidebarCollapsed ? (
          <>
            <div className="bg-white rounded-2xl p-3 mb-2.5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#d3e3fd]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate mb-0.5">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 active:scale-[0.98] font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="space-y-2.5">
            <Tooltip text={displayName} show={isSidebarCollapsed}>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#d3e3fd]"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </Tooltip>
            <Tooltip text="Logout" show={isSidebarCollapsed}>
              <button
                onClick={handleLogout}
                className="flex justify-center items-center w-full p-2.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 active:scale-[0.98]"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && !isSidebarOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3.5">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#d3e3fd] rounded-xl transition-all duration-200 active:scale-95"
            >
              <Menu className="w-5.5 h-5.5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0b57d0] to-[#0947b3] rounded-xl flex items-center justify-center shadow-lg shadow-[#0b57d0]/30">
                <span className="text-white font-bold text-base">A</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-base tracking-tight">
                  Adelevate
                </h1>
              </div>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile ? (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${
              isSidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar Content */}
          <div
            className={`fixed top-0 left-0 bottom-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } ${
              deviceType === "xs"
                ? "w-[300px]"
                : deviceType === "ss"
                ? "w-[320px]"
                : "w-[340px]"
            }`}
          >
            <div className="h-full flex flex-col">{mobileSidebarContent}</div>
          </div>
        </>
      ) : (
        /* Desktop & Tablet Sidebar */
        <aside
          className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-[75px]" : "w-[280px]"
          }`}
        >
          {desktopSidebarContent}
        </aside>
      )}

      {/* Content padding for mobile view */}
      {isMobile && <div className="h-[61px]"></div>}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </>
  );
};

export default SlideSidebar;
