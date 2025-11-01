import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import React from "react";

import SlideSidebar from "./components/slide-sidebar";
import Page from "./features/dashboard/Page";
import LoginPage from "./components/login";
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

import { supabase } from "@/supabaseClient";
import PrivateRoute from "@/components/PrivateRoute.jsx";
import AuthCallback from "@/pages/AuthCallback.jsx";


function AuthEventLogger() {
    React.useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[Global onAuthStateChange]", event, !!session);
        });
        return () => sub?.subscription?.unsubscribe?.();
    }, []);
    return null;
}

function App() {
    return (
        <BrowserRouter>
            <AuthEventLogger />

            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <div className="flex h-screen">
                                <SlideSidebar />
                                <main className="flex-1 overflow-auto">
                                    <Routes>
                                        <Route path="logout" element={<Page />} />
                                        <Route path="rules" element={<RulesDashboard />} />
                                        <Route path="editActivate" element={<EditRuleFormActivate />} />
                                        <Route path="editBudget" element={<EditRuleFormBudget />} />
                                        <Route path="editPause" element={<EditRuleFormPause />} />
                                        <Route path="editExclusion" element={<EditRuleFormExclusion />} />
                                        <Route path="log" element={<LogsDashboard />} />
                                        <Route path="actionlog" element={<ActionLogsDashboard />} />
                                        <Route path="campaigns" element={<Campaigns />} />
                                        <Route path="dashboard" element={<CampaignPerformanceHub />} />
                                        <Route path="authorization" element={<AuthorizationPage />} />
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </main>
                            </div>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
