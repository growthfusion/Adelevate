import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Home, Menu, X, LogOut, KeyRound, Sun, Moon, FileText } from "lucide-react";
import { BsLayoutSidebar } from "react-icons/bs";
import { TbAutomation } from "react-icons/tb";
import { MdDataSaverOn } from "react-icons/md";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { IoPersonAddOutline } from "react-icons/io5";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { PiRocketLight } from "react-icons/pi";

// Redux imports
import { toggleTheme, selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

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

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
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

  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
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
const Tooltip = ({ children, text, show = false, theme }) => {
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
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Tooltip text={isDarkMode ? "Light Mode" : "Dark Mode"} show={collapsed} theme={theme}>
      <button
        onClick={handleToggle}
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
                  color: isHovered ? theme.blue : theme.textIcon,
                  opacity: 1
                }}
              />
            ) : (
              <Sun
                className="w-5 h-5 absolute inset-0 transition-all duration-300"
                style={{
                  color: isHovered ? theme.yellow : theme.textIcon,
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
              backgroundColor: isDarkMode ? theme.blue : theme.borderSubtle
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
const NavItem = ({ item, collapsed, isActive, theme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const active = isActive(item.path);

  return (
    <li>
      <Tooltip text={item.label} show={collapsed} theme={theme}>
        <a
          href={item.path}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden`}
          style={{
            backgroundColor: active
              ? theme.bgActiveMenu || theme.bgCardHover
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
                background: `linear-gradient(180deg, ${theme.blue}, ${theme.cyan})`
              }}
            />
          )}

          <div className={`flex items-center ${collapsed ? "" : "gap-3.5"} relative z-10`}>
            <item.icon
              className="w-5 h-5 transition-colors"
              style={{
                color: active
                  ? theme.blue
                  : isHovered
                    ? theme.blue
                    : theme.textIcon || theme.textTertiary
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
                backgroundColor: active ? theme.blue : `${theme.blue}20`,
                color: active ? "#FFFFFF" : theme.blue
              }}
            >
              {item.badge}
            </span>
          )}
          {item.badge && collapsed && (
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
              style={{
                backgroundColor: theme.blue,
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
const ParentNavItem = ({ item, collapsed, isActive, navigate, theme }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredChild, setHoveredChild] = useState(null);
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
      <Tooltip text={item.label} show={collapsed} theme={theme}>
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
                ? theme.bgActiveMenu || theme.bgCardHover
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
                background: `linear-gradient(180deg, ${theme.blue}, ${theme.cyan})`
              }}
            />
          )}

          <div className={`flex items-center ${collapsed ? "" : "gap-3.5"} relative z-10`}>
            <item.icon
              className="w-5 h-5 transition-colors"
              style={{
                color:
                  isOpen || hasActiveChild
                    ? theme.blue
                    : isHovered
                      ? theme.blue
                      : theme.textIcon || theme.textTertiary
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
                    ? theme.blue
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
                        ? theme.bgActiveMenu || theme.bgCardHover
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
                            ? theme.blue
                            : childHovered
                              ? theme.textTertiary
                              : theme.textMuted,
                          boxShadow: childActive ? `0 0 8px ${theme.blue}50` : "none"
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
                          backgroundColor: childActive ? theme.blue : `${theme.blue}20`,
                          color: childActive ? "#FFFFFF" : theme.blue
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
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);

  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [user, setUser] = useState(null);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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
      path: "/report",
      icon: FileText,
      label: "Report",
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
      path: "/log",
      icon: MdOutlineDataSaverOff,
      label: "Logs",
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
                    className={`${isMobileView ? "w-11 h-11" : "w-9 h-9"} rounded-xl flex items-center justify-center relative overflow-hidden`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                      boxShadow: `0 0 20px ${theme.blue}40`
                    }}
                  >
                    <span
                      className={`font-bold ${isMobileView ? "text-xl" : "text-lg"} relative z-10`}
                      style={{ color: "#FFFFFF" }}
                    >
                      A
                    </span>
                    <div className="absolute inset-0 shimmer-effect opacity-30" />
                  </div>
                </div>
                <div>
                  <h1
                    className={`font-bold ${isMobileView ? "text-lg" : "text-base"} tracking-tight`}
                    style={{ color: theme.textPrimary }}
                  >
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
                className="p-2 rounded-lg transition-all duration-200 hover:scale-95"
                style={{
                  backgroundColor: theme.bgActiveMenu || theme.bgCardHover,
                  color: theme.textIcon || theme.textTertiary
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgCardHover)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.bgActiveMenu || theme.bgCardHover)
                }
              >
                {isMobileView ? <X className="w-5 h-5" /> : <BsLayoutSidebar className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                    boxShadow: `0 0 16px ${theme.blue}40`
                  }}
                >
                  <span className="font-bold text-lg relative z-10" style={{ color: "#FFFFFF" }}>
                    A
                  </span>
                  <div className="absolute inset-0 shimmer-effect opacity-30" />
                </div>
              </div>
              <Tooltip text="Expand Sidebar" show={true} theme={theme}>
                <div className="flex justify-center">
                  <button
                    onClick={toggleSidebarCollapse}
                    className="p-2 rounded-lg transition-all duration-200 hover:scale-95"
                    style={{
                      backgroundColor: theme.bgActiveMenu || theme.bgCardHover,
                      color: theme.textIcon || theme.textTertiary
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bgCardHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.bgActiveMenu || theme.bgCardHover;
                    }}
                  >
                    <BsLayoutSidebar className="w-4 h-4" style={{ transform: "rotate(180deg)" }} />
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
                  theme={theme}
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
                  theme={theme}
                />
              );
            }
            return null;
          })}
        </ul>

        {/* Theme Toggle */}
        <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${theme.borderSubtle}` }}>
          <ThemeToggle collapsed={!isMobileView && isSidebarCollapsed} />
        </div>
      </nav>

      {/* User Profile section - REDESIGNED WITH BETTER SPACING */}
      <div
        className={`${isMobileView ? "p-5" : "p-4"}`}
        style={{
          backgroundColor: theme.bgSecondary,
          borderTop: `1px solid ${theme.dividerSubtle || theme.borderSubtle}`
        }}
      >
        {isMobileView || !isSidebarCollapsed ? (
          <div className="space-y-4">
            {/* Profile Card */}
            <div
              className={`rounded-2xl ${isMobileView ? "p-5" : "p-4"} transition-all duration-300 relative overflow-hidden group`}
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${profileHovered ? theme.blue + "30" : theme.borderSubtle}`,
                boxShadow: profileHovered
                  ? `0 8px 24px ${theme.shadowDeep}`
                  : `0 2px 8px ${theme.shadowSoft}`,
                transform: profileHovered ? "translateY(-2px)" : "translateY(0)"
              }}
              onMouseEnter={() => setProfileHovered(true)}
              onMouseLeave={() => setProfileHovered(false)}
            >
              {/* Gradient Background Effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at top right, ${theme.blue}10, transparent 70%)`
                }}
              />

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative flex-shrink-0">
                  {/* Avatar with gradient border */}
                  <div
                    className={`${isMobileView ? "w-14 h-14" : "w-12 h-12"} rounded-2xl overflow-hidden relative`}
                    style={{
                      border: `2px solid transparent`,
                      backgroundImage: `linear-gradient(${theme.bgCard}, ${theme.bgCard}), linear-gradient(135deg, ${theme.blue}, ${theme.cyan})`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "content-box, border-box"
                    }}
                  >
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {/* Online status indicator */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: theme.green,
                      borderColor: theme.bgCard,
                      boxShadow: `0 0 8px ${theme.green}60`
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.bgCard }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`${isMobileView ? "text-base" : "text-sm"} font-bold truncate mb-1`}
                    style={{ color: theme.textPrimary }}
                  >
                    {displayName}
                  </p>
                  <p
                    className={`${isMobileView ? "text-sm" : "text-xs"} truncate`}
                    style={{ color: theme.textTertiary }}
                  >
                    {user?.email}
                  </p>
                  {isMobileView && (
                    <div
                      className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: `${theme.blue}15`,
                        color: theme.blue
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: theme.blue }}
                      />
                      Active Now
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button - Enhanced Design */}
            <button
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHovered(true)}
              onMouseLeave={() => setLogoutHovered(false)}
              className={`flex items-center justify-center gap-3 w-full ${isMobileView ? "px-5 py-3.5" : "px-4 py-3"} rounded-xl transition-all duration-300 border font-semibold ${isMobileView ? "text-base" : "text-sm"} relative overflow-hidden group`}
              style={{
                backgroundColor: logoutHovered ? `${theme.red}20` : `${theme.red}10`,
                border: `1px solid ${logoutHovered ? `${theme.red}50` : `${theme.red}30`}`,
                color: theme.red,
                transform: logoutHovered ? "scale(0.98)" : "scale(1)",
                boxShadow: logoutHovered ? `0 4px 16px ${theme.red}30` : "none"
              }}
            >
              {/* Shimmer effect on hover */}
              {logoutHovered && <div className="absolute inset-0 shimmer-effect opacity-20" />}

              <LogOut
                className={`${isMobileView ? "w-5 h-5" : "w-4 h-4"} transition-transform duration-300 relative z-10`}
                style={{
                  transform: logoutHovered ? "translateX(-2px)" : "translateX(0)"
                }}
              />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        ) : (
          // Collapsed Profile View
          <div className="space-y-3">
            <Tooltip text={displayName} show={isSidebarCollapsed} theme={theme}>
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105"
                    style={{
                      border: `2px solid transparent`,
                      backgroundImage: `linear-gradient(${theme.bgCard}, ${theme.bgCard}), linear-gradient(135deg, ${theme.blue}, ${theme.cyan})`,
                      backgroundOrigin: "border-box",
                      backgroundClip: "content-box, border-box"
                    }}
                  >
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      backgroundColor: theme.green,
                      borderColor: theme.bgCard,
                      boxShadow: `0 0 8px ${theme.green}60`
                    }}
                  />
                </div>
              </div>
            </Tooltip>

            <Tooltip text="Logout" show={isSidebarCollapsed} theme={theme}>
              <button
                onClick={handleLogout}
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
                className="flex justify-center items-center w-full p-3 rounded-xl transition-all duration-300 border relative overflow-hidden"
                style={{
                  backgroundColor: logoutHovered ? `${theme.red}20` : `${theme.red}10`,
                  border: `1px solid ${logoutHovered ? `${theme.red}50` : `${theme.red}30`}`,
                  color: theme.red,
                  transform: logoutHovered ? "scale(0.95)" : "scale(1)",
                  boxShadow: logoutHovered ? `0 4px 16px ${theme.red}30` : "none"
                }}
              >
                {logoutHovered && <div className="absolute inset-0 shimmer-effect opacity-20" />}
                <LogOut className="w-4.5 h-4.5 relative z-10" />
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
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-95"
              style={{
                backgroundColor: theme.bgActiveMenu || theme.bgCardHover,
                border: `1px solid ${theme.borderSubtle}`
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgCardHover)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.bgActiveMenu || theme.bgCardHover)
              }
            >
              <Menu className="w-5 h-5" style={{ color: theme.textIcon || theme.textTertiary }} />
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.cyan} 100%)`,
                  boxShadow: `0 0 16px ${theme.blue}40`
                }}
              >
                <span className="font-bold text-base relative z-10" style={{ color: "#FFFFFF" }}>
                  A
                </span>
                <div className="absolute inset-0 shimmer-effect opacity-30" />
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
              onClick={handleThemeToggle}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-95"
              style={{
                backgroundColor: theme.bgActiveMenu || theme.bgCardHover,
                border: `1px solid ${theme.borderSubtle}`
              }}
            >
              {isDarkMode ? (
                <Moon className="w-5 h-5" style={{ color: theme.blue }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: theme.yellow }} />
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
