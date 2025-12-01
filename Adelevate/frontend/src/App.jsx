import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

// Import ThemeProvider
import { ThemeProvider } from "@/context/ThemeContext";

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
import LanderPage from "./features/lander/page";
import AuthCallback from "@/pages/AuthCallback.jsx";
import ReportPage from "./features/report/ReportPage";

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

// Protected Layout Component (includes sidebar)
function ProtectedLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SlideSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function App() {
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
            path="/lander"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <LanderPage />
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

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
