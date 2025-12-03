import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  FlaskConical,
  Zap,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: null },
  { name: "All Landers", href: "/landers", icon: FileText, badge: "47" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, badge: null },
  { name: "A/B Tests", href: "/ab-tests", icon: FlaskConical, badge: "3" },
  { name: "Optimizations", href: "/optimizations", icon: Zap, badge: "12" }
];

const Sidebar = ({ isOpen }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => {}} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-gradient-to-b from-indigo-900 to-indigo-800 text-white
          flex-shrink-0 transition-all duration-300 z-30
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:relative h-full
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">LanderPro</span>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <Zap className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-indigo-200 hover:bg-white/5 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.name : ""}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-indigo-700">
          {/* Settings & Help */}
          <div className="px-3 py-4 space-y-2">
            <NavLink
              to="/settings"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white transition-all
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </NavLink>
            <NavLink
              to="/help"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-indigo-200 hover:bg-white/5 hover:text-white transition-all
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Help</span>}
            </NavLink>
          </div>

          {/* User Profile */}
          <div className="px-3 py-4 border-t border-indigo-700">
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">JD</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">John Doe</div>
                  <div className="text-xs text-indigo-300 truncate">john@example.com</div>
                </div>
              )}
            </div>
          </div>

          {/* Collapse Toggle */}
          <div className="px-3 pb-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
