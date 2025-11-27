import { useState, useEffect } from "react";
import {
  ChevronDown,
  Home,
  Menu,
  X,
  LogOut,
  KeyRound,
  Sun,
  Moon
} from "lucide-react";
import { BsLayoutSidebar } from "react-icons/bs";
import { TbAutomation } from "react-icons/tb";
import { MdDataSaverOn } from "react-icons/md";
import { IoPersonAddOutline } from "react-icons/io5";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { PiRocketLight } from "react-icons/pi";
import { useTheme } from "@/context/ThemeContext";

// Create dynamic global styles
const createGlobalStyles = (theme) => `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  @keyframes rotate-sun {
    from { transform: rotate(0deg); }
    to { transform: rotate(180deg); }
  }

  @keyframes rotate-moon {
    from { transform: rotate(180deg); }
    to { transform: rotate(0deg); }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }

  .theme-icon-rotate {
    animation: rotate-sun 0.3s ease-out forwards;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${theme.bgSecondary};
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${theme.borderSubtle};
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${theme.borderHover};
  }
  
  .noise-texture {
    position: relative;
  }
  
  .noise-texture::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.03;
    z-index: 1;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
`;

// Premium Tooltip Component
const Tooltip = ({ children, text, show = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  if (!show) return children;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-[100] px-3 py-2 rounded-xl whitespace-nowrap pointer-events-none shadow-xl animate-fade-in"
          style={{
            backgroundColor: `${theme.bgActiveMenu}F8`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.borderSubtle}`,
            boxShadow: `0 10px 40px ${theme.shadowDeep}`,
            pointerEvents: "none"
          }}
        >
          <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
            {text}
          </span>
          <div
            className="absolute w-2 h-2 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"
            style={{
              backgroundColor: theme.bgActiveMenu,
              borderLeft: `1px solid ${theme.borderSubtle}`,
              borderBottom: `1px solid ${theme.borderSubtle}`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Theme Toggle Button Component
const ThemeToggle = ({ collapsed }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tooltip text={isDarkMode ? "Light Mode" : "Dark Mode"} show={collapsed}>
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } w-full px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden`}
        style={{
          backgroundColor: isHovered ? theme.bgCardHover : "transparent",
          border: `1px solid ${isHovered ? theme.borderSubtle : "transparent"}`,
          transform: isHovered ? "translateX(2px)" : "translateX(0)"
        }}
      >
        <div className={`flex items-center ${collapsed ? "" : "gap-3.5"} relative z-10`}>
          <div
            className="relative w-5 h-5 transition-transform duration-300"
            style={{ transform: isDarkMode ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            {isDarkMode ? (
              <Moon
                className="w-5 h-5 absolute inset-0 transition-all duration-300"
                style={{
                  color: isHovered ? theme.accent : theme.textIcon,
                  opacity: 1
                }}
              />
            ) : (
              <Sun
                className="w-5 h-5 absolute inset-0 transition-all duration-300"
                style={{
                  color: isHovered ? theme.themeToggleIcon : theme.textIcon,
                  opacity: 1
                }}
              />
            )}
          </div>
          {!collapsed && (
            <span
              className="font-semibold text-[15px] transition-colors"
              style={{
                color: isHovered ? theme.textSecondary : theme.textTertiary
              }}
            >
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </div>
        {!collapsed && (
          <div
            className="relative w-11 h-6 rounded-full transition-all duration-300"
            style={{
              backgroundColor: isDarkMode ? theme.accent : theme.borderSubtle
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm"
              style={{
                backgroundColor: isDarkMode ? "#FFFFFF" : theme.bgMain,
                left: isDarkMode ? "calc(100% - 20px)" : "4px"
              }}
            />
          </div>
        )}
      </button>
    </Tooltip>
  );
};

// Single Navigation Item Component
const NavItem = ({ item, collapsed, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const active = isActive(item.path);

  return (
    <li>
      <Tooltip text={item.label} show={collapsed}>
        <a
          href={item.path}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden`}
          style={{
            backgroundColor: active
              ? theme.bgActiveMenu
              : isHovered
                ? theme.bgCardHover
                : "transparent",
            border: `1px solid ${
              active ? theme.borderSubtle : isHovered ? theme.borderSubtle : "transparent"
            }`,
            transform: isHovered && !active ? "translateX(2px)" : "translateX(0)"
          }}
        >
          {active && !collapsed && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full"
              style={{
                background: `linear-gradient(180deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`
              }}
            />
          )}

          <div className={`flex items-center ${collapsed ? "" : "gap-3.5"} relative z-10`}>
            <item.icon
              className="w-5 h-5 transition-colors"
              style={{
                color: active ? theme.accent : isHovered ? theme.accent : theme.textIcon
              }}
            />
            {!collapsed && (
              <span
                className="font-semibold text-[15px] transition-colors"
                style={{
                  color: active
                    ? theme.textPrimary
                    : isHovered
                      ? theme.textSecondary
                      : theme.textTertiary
                }}
              >
                {item.label}
              </span>
            )}
          </div>
          {item.badge && !collapsed && (
            <span
              className="px-2.5 py-1 text-xs font-bold rounded-full min-w-[24px] text-center"
              style={{
                backgroundColor: active ? theme.accent : theme.accentLight,
                color: active ? "#FFFFFF" : theme.accent
              }}
            >
              {item.badge}
            </span>
          )}
          {item.badge && collapsed && (
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
              style={{
                backgroundColor: theme.accent,
                borderColor: theme.bgCard
              }}
            />
          )}
        </a>
      </Tooltip>
    </li>
  );
};

// Parent Navigation Item Component
const ParentNavItem = ({ item, collapsed, isActive, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredChild, setHoveredChild] = useState(null);
  const { theme } = useTheme();
  const hasActiveChild = item.children?.some((child) => isActive(child.path));
  const isOpen = item.isOpen;

  const handleClick = () => {
    if (collapsed && item.children && item.children.length > 0) {
      navigate(item.children[0].path);
    } else {
      item.toggle();
    }
  };

  return (
    <li>
      <Tooltip text={item.label} show={collapsed}>
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } w-full px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden`}
          style={{
            backgroundColor:
              isOpen || hasActiveChild
                ? theme.bgActiveMenu
                : isHovered
                  ? theme.bgCardHover
                  : "transparent",
            border: `1px solid ${
              isOpen || hasActiveChild
                ? theme.borderSubtle
                : isHovered
                  ? theme.borderSubtle
                  : "transparent"
            }`,
            transform: isHovered && !isOpen && !hasActiveChild ? "translateX(2px)" : "translateX(0)"
          }}
        >
          {(isOpen || hasActiveChild) && !collapsed && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full"
              style={{
                background: `linear-gradient(180deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`
              }}
            />
          )}

          <div className={`flex items-center ${collapsed ? "" : "gap-3.5"} relative z-10`}>
            <item.icon
              className="w-5 h-5 transition-colors"
              style={{
                color:
                  isOpen || hasActiveChild
                    ? theme.accent
                    : isHovered
                      ? theme.accent
                      : theme.textIcon
              }}
            />
            {!collapsed && (
              <span
                className="font-semibold text-[15px] transition-colors"
                style={{
                  color:
                    isOpen || hasActiveChild
                      ? theme.textPrimary
                      : isHovered
                        ? theme.textSecondary
                        : theme.textTertiary
                }}
              >
                {item.label}
              </span>
            )}
          </div>
          {!collapsed && (
            <ChevronDown
              className="w-4 h-4 transition-all duration-300"
              style={{
                color:
                  isOpen || hasActiveChild
                    ? theme.accent
                    : isHovered
                      ? theme.textSecondary
                      : theme.textTertiary,
                transform: isOpen ? "rotate(180deg)" : "rotate(0)"
              }}
            />
          )}
        </button>
      </Tooltip>

      {!collapsed && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isOpen ? "200px" : "0",
            opacity: isOpen ? 1 : 0,
            marginTop: isOpen ? "6px" : "0"
          }}
        >
          <ul
            className="ml-5 space-y-1 pl-4"
            style={{ borderLeft: `2px solid ${theme.borderSubtle}` }}
          >
            {item.children?.map((child) => {
              const childActive = isActive(child.path);
              const childHovered = hoveredChild === child.path;

              return (
                <li key={child.path}>
                  <a
                    href={child.path}
                    onMouseEnter={() => setHoveredChild(child.path)}
                    onMouseLeave={() => setHoveredChild(null)}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group"
                    style={{
                      backgroundColor: childActive
                        ? theme.bgActiveMenu
                        : childHovered
                          ? theme.bgCardHover
                          : "transparent",
                      border: `1px solid ${
                        childActive
                          ? theme.borderSubtle
                          : childHovered
                            ? theme.borderSubtle
                            : "transparent"
                      }`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: childActive
                            ? theme.accent
                            : childHovered
                              ? theme.textTertiary
                              : theme.textMuted,
                          boxShadow: childActive ? `0 0 8px ${theme.accentGlow}` : "none"
                        }}
                      />
                      <span
                        className="font-medium text-sm transition-colors"
                        style={{
                          color: childActive
                            ? theme.textPrimary
                            : childHovered
                              ? theme.textSecondary
                              : theme.textTertiary
                        }}
                      >
                        {child.label}
                      </span>
                    </div>
                    {child.badge && (
                      <span
                        className="px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center"
                        style={{
                          backgroundColor: childActive ? theme.accent : theme.accentLight,
                          color: childActive ? "#FFFFFF" : theme.accent
                        }}
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
  
  // Use theme from context
  const { theme, isDarkMode, toggleTheme } = useTheme();

  // Inject global styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "sidebar-global-styles";
    styleElement.textContent = createGlobalStyles(theme);

    // Remove old styles if exist
    const oldStyles = document.getElementById("sidebar-global-styles");
    if (oldStyles) {
      oldStyles.remove();
    }

    document.head.appendChild(styleElement);
    return () => {
      const el = document.getElementById("sidebar-global-styles");
      if (el) el.remove();
    };
  }, [theme]);

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
    )}&background=00D1B2&color=fff`;

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
      badge: null
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
          badge: null
        }
      ]
    },
    {
      type: "single",
      path: "/campaigns",
      icon: HiOutlineSpeakerphone,
      label: "Campaigns",
      badge: null
    },
    {
      type: "single",
      path: "/addAccount",
      icon: IoPersonAddOutline,
      label: "Integration",
      badge: null
    },
    {
      type: "single",
      path: "/authorization",
      icon: KeyRound,
      label: "Authorization",
      badge: null
    },
    {
      type: "single",
      path: "/actionLog",
      icon: MdDataSaverOn,
      label: "Action Logs",
      badge: null
    },
    {
      type: "single",
      path: "/lander",
      icon: PiRocketLight,
      label: "Lander",
      badge: null
    }
  ];

  // Sidebar Content Component (Shared between mobile and desktop)
  const SidebarContent = ({ isMobileView }) => (
    <>
      {/* Header */}
      <div
        className={`${isMobileView ? "px-6" : "px-4"} py-5 relative overflow-hidden noise-texture`}
        style={{
          background: `linear-gradient(180deg, ${theme.bgMain} 0%, ${theme.bgSecondary} 100%)`,
          borderBottom: `1px solid ${theme.borderSubtle}`
        }}
      >
        <div className="relative z-10">
          {isMobileView || !isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`${isMobileView ? "w-11 h-11" : "w-9 h-9"} rounded-xl flex items-center justify-center`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentGradientStart} 0%, ${theme.accentGradientEnd} 100%)`,
                      boxShadow: `0 0 20px ${theme.accentGlow}`
                    }}
                  >
                    <span className={`font-bold ${isMobileView ? "text-xl" : "text-lg"}`} style={{ color: "#FFFFFF" }}>
                      A
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className={`font-bold ${isMobileView ? "text-lg" : "text-base"} tracking-tight`} style={{ color: theme.textPrimary }}>
                    Adelevate
                  </h1>
                  {isMobileView && (
                    <p className="text-xs" style={{ color: theme.textTertiary }}>
                      Analytics Platform
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={isMobileView ? toggleSidebar : toggleSidebarCollapse}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: theme.bgActiveMenu,
                  color: theme.textIcon
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgCardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.bgActiveMenu)}
              >
                {isMobileView ? <X className="w-5 h-5" /> : <BsLayoutSidebar className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accentGradientStart} 0%, ${theme.accentGradientEnd} 100%)`,
                    boxShadow: `0 0 16px ${theme.accentGlow}`
                  }}
                >
                  <span className="font-bold text-lg" style={{ color: "#FFFFFF" }}>
                    A
                  </span>
                </div>
              </div>
              <Tooltip text="Expand Sidebar" show={true}>
                <div className="flex justify-center">
                  <button
                    onClick={toggleSidebarCollapse}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: theme.bgActiveMenu,
                      color: theme.textIcon
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bgActiveMenu;
                    }}
                  >
                    <BsLayoutSidebar
                      className="w-4 h-4"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </button>
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 ${isMobileView ? "px-4 py-6" : "px-3 py-5"} overflow-y-auto custom-scrollbar`}
        style={{ backgroundColor: theme.bgCard }}
      >
        <ul className={`space-y-${isMobileView ? "2" : "1.5"}`}>
          {navItems.map((item) => {
            if (item.type === "single") {
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={!isMobileView && isSidebarCollapsed}
                  isActive={isActive}
                />
              );
            } else if (item.type === "parent") {
              return (
                <ParentNavItem
                  key={item.label}
                  item={item}
                  collapsed={!isMobileView && isSidebarCollapsed}
                  isActive={isActive}
                  navigate={navigate}
                />
              );
            }
            return null;
          })}
        </ul>

        {/* Theme Toggle */}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.borderSubtle}` }}>
          <ThemeToggle collapsed={!isMobileView && isSidebarCollapsed} />
        </div>
      </nav>

      {/* User Profile section */}
      <div
        className={`p-${isMobileView ? "4" : "3"}`}
        style={{
          backgroundColor: theme.bgSecondary,
          borderTop: `1px solid ${theme.dividerSubtle}`
        }}
      >
        {isMobileView || !isSidebarCollapsed ? (
          <>
            <div
              className={`rounded-2xl p-${isMobileView ? "4" : "3"} mb-${isMobileView ? "3" : "2.5"} shadow-sm`}
              style={{
                backgroundColor: theme.bgUserCard,
                border: `1px solid ${theme.borderUserCard}`,
                boxShadow: `0 2px 8px ${theme.shadowSoft}`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className={`${isMobileView ? "w-11 h-11" : "w-10 h-10"} rounded-xl overflow-hidden`}
                    style={{
                      border: `2px solid transparent`,
                      backgroundImage: `linear-gradient(${theme.bgUserCard}, ${theme.bgUserCard}), linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "content-box, border-box"
                    }}
                  >
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-${isMobileView ? "sm" : "xs"} font-bold truncate mb-0.5`}
                    style={{ color: theme.textSecondary }}
                  >
                    {displayName}
                  </p>
                  <p className={`text-${isMobileView ? "xs" : "[10px]"} truncate`} style={{ color: theme.textEmail }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-2${isMobileView ? ".5" : ""} w-full px-${isMobileView ? "4" : "3.5"} py-${isMobileView ? "3" : "2.5"} rounded-xl transition-all duration-200 border font-semibold text-${isMobileView ? "[15px]" : "sm"}`}
              style={{
                backgroundColor: theme.logoutBg,
                border: `1px solid ${theme.logoutBorder}`,
                color: theme.logout
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.logoutBgHover;
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.logoutBg;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <LogOut className={`w-4${isMobileView ? ".5" : ""} h-4${isMobileView ? ".5" : ""}`} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="space-y-2.5">
            <Tooltip text={displayName} show={isSidebarCollapsed}>
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden"
                    style={{
                      border: `2px solid transparent`,
                      backgroundImage: `linear-gradient(${theme.bgUserCard}, ${theme.bgUserCard}), linear-gradient(135deg, ${theme.accentGradientStart}, ${theme.accentGradientEnd})`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "content-box, border-box"
                    }}
                  >
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: theme.online,
                      borderColor: theme.bgCard
                    }}
                  />
                </div>
              </div>
            </Tooltip>
            <Tooltip text="Logout" show={isSidebarCollapsed}>
              <button
                onClick={handleLogout}
                className="flex justify-center items-center w-full p-2.5 rounded-xl transition-all duration-200 border"
                style={{
                  backgroundColor: theme.logoutBg,
                  border: `1px solid ${theme.logoutBorder}`,
                  color: theme.logout
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.logoutBgHover;
                  e.currentTarget.style.transform = "scale(0.98)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.logoutBg;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <LogOut className="w-4 h-4" />
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
        <div
          className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
          style={{
            backgroundColor: `${theme.bgCard}F5`,
            borderBottom: `1px solid ${theme.borderSubtle}`,
            boxShadow: `0 4px 20px ${theme.shadowSoft}`
          }}
        >
          <div className="flex items-center justify-between px-4 py-3.5">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.bgActiveMenu,
                border: `1px solid ${theme.borderSubtle}`
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgCardHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.bgActiveMenu)}
            >
              <Menu className="w-5 h-5" style={{ color: theme.textIcon }} />
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentGradientStart} 0%, ${theme.accentGradientEnd} 100%)`,
                  boxShadow: `0 0 16px ${theme.accentGlow}`
                }}
              >
                <span className="font-bold text-base" style={{ color: "#FFFFFF" }}>
                  A
                </span>
              </div>
              <div>
                <h1
                  className="font-bold text-base tracking-tight"
                  style={{ color: theme.textPrimary }}
                >
                  Adelevate
                </h1>
              </div>
            </div>
            {/* Mobile Theme Toggle Icon */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: theme.bgActiveMenu,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              {isDarkMode ? (
                <Moon className="w-5 h-5" style={{ color: theme.textIcon }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: theme.themeToggleIcon }} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile ? (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300"
            style={{
              backgroundColor: `${theme.bgMain}80`,
              opacity: isSidebarOpen ? 1 : 0,
              pointerEvents: isSidebarOpen ? "auto" : "none"
            }}
            onClick={toggleSidebar}
          />

          {/* Sidebar Content */}
          <div
            className="fixed top-0 left-0 bottom-0 z-50 shadow-2xl transition-transform duration-300 ease-out noise-texture"
            style={{
              background: `linear-gradient(180deg, ${theme.bgMain} 0%, ${theme.bgSecondary} 100%)`,
              transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
              width: deviceType === "xs" ? "300px" : deviceType === "ss" ? "320px" : "340px",
              boxShadow: `20px 0 60px ${theme.shadowDeep}`
            }}
          >
            <div className="h-full flex flex-col">
              <SidebarContent isMobileView={true} />
            </div>
          </div>
        </>
      ) : (
        /* Desktop & Tablet Sidebar */
        <aside
          className="h-screen flex flex-col transition-all duration-300 ease-in-out noise-texture"
          style={{
            background: `linear-gradient(180deg, ${theme.bgMain} 0%, ${theme.bgSecondary} 100%)`,
            borderRight: `1px solid ${theme.borderSubtle}`,
            width: isSidebarCollapsed ? "75px" : "280px",
            boxShadow: `4px 0 20px ${theme.shadowSoft}`
          }}
        >
          <SidebarContent isMobileView={false} />
        </aside>
      )}

      {/* Content padding for mobile view */}
      {isMobile && <div className="h-[61px]"></div>}
    </>
  );
};

export default SlideSidebar;