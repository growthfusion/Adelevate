import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "@/app/store";
import { selectThemeColors, selectIsDarkMode } from "@/features/theme/themeSlice";

// Components
import SlideSidebar from "./components/slide-sidebar";
import PrivateRoute from "@/components/PrivateRoute.jsx";
import AnimatedLoginPage from "./components/login";

// Pages
import Page from "./features/dashboard/Page";
import RulesDashboard from "./features/automation/rules/Rules";
import LogsDashboard from "./features/table_logs/logs_table";
import ActionLogsDashboard from "./features/action_logs/Alogs";
import EditRuleFormActivate from "./features/automation/rules/EditRules_Activate";
import EditRuleFormBudget from "./features/automation/rules/EditRules_Budget";
import EditRuleFormPause from "./features/automation/rules/EditRules_Pause";
import EditRuleFormExclusion from "./features/automation/rules/ExclusionRules";
import Campaigns from "./features/campaigns/page";
import CampaignPerformanceHub from "./features/metric_dashboard/campaign-performance/index";
import AuthorizationPage from "@/features/authorization/AuthorizationPage.jsx";
import Add_Acounts from "./features/addAccount/page";

import AuthCallback from "@/pages/AuthCallback.jsx";
import ReportPage from "./features/report/ReportPage";

// Feature Pages
import LanderDashboardPage from "./features/lander/dashboard/pages/DashboardPage";
import LandersPage from "./features/lander/lander/pages/LandersPage";
import LanderDetailPage from "./features/lander/lander/pages/LanderDetailPage";
import CreateLanderPage from "./features/lander/lander/pages/CreateLanderPage";
import ABTestsPage from "./features/lander/abtest/pages/ABTestsPage";
import CreateABTestPage from "./features/lander/abtest/pages/CreateABTestPage";
import OptimizationsPage from "./features/lander/optimizations/pages/OptimizationsPage";

// Supabase
import { supabase } from "@/supabaseClient";

// Auth Event Logger Component
function AuthEventLogger() {
  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Global onAuthStateChange]", event, !!session);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);
  return null;
}

// Theme Provider Component - Syncs theme to DOM
function ThemeProvider({ children }) {
  const theme = useSelector(selectThemeColors);
  const isDarkMode = useSelector(selectIsDarkMode);

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(isDarkMode ? "dark" : "light");

    // Set data attribute
    root.setAttribute("data-theme", isDarkMode ? "dark" : "light");

    // Update body styles
    document.body.style.backgroundColor = theme.bgMain;
    document.body.style.color = theme.textPrimary;

    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", theme.bgMain);
  }, [isDarkMode, theme]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "app-theme-mode" && event.newValue) {
        // Force re-render by dispatching action
        // This is handled in themeSlice
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: theme.bgMain,
        color: theme.textPrimary
      }}
    >
      {children}
    </div>
  );
}

// Protected Layout Component (includes sidebar)
function ProtectedLayout({ children }) {
  const theme = useSelector(selectThemeColors);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: theme.bgMain }}>
      <SlideSidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: theme.bgSecondary }}>
        {children}
      </main>
    </div>
  );
}

// Inner App Component (needs access to Redux)
function AppContent() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthEventLogger />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AnimatedLoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <CampaignPerformanceHub />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/logout"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <Page />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/rules"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <RulesDashboard />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/editActivate"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <EditRuleFormActivate />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/editBudget"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <EditRuleFormBudget />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/editPause"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <EditRuleFormPause />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/editExclusion"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <EditRuleFormExclusion />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/log"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <LogsDashboard />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/actionlog"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <ActionLogsDashboard />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/campaigns"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <Campaigns />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/authorization"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <AuthorizationPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/addAccount"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <Add_Acounts />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <ReportPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* Lander Management Routes with Sidebar */}
          <Route
            path="/lander-dashboard"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <LanderDashboardPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/lander"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <LandersPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/landers/:id"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <LanderDetailPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/landers/create"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <CreateLanderPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* A/B Testing Routes */}
          <Route
            path="/ab-tests"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <ABTestsPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/ab-tests/create"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <CreateABTestPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* Optimizations Route */}
          <Route
            path="/optimizations"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <OptimizationsPage />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
