import { BrowserRouter, Routes, Route } from "react-router-dom";
import SlideSidebar from "./components/slide-sidebar";
import Page from "./features/dashboard/Page";
import LoginPage from "./components/login";
import RulesDashboard from "./features/automation/rules/Rules";
import LogsDashboard from "./features/table_logs/logs_table";
import ActionLogsDashboard from "./features/action_logs/Alogs";
import EditRuleFormActivate from "./features/automation/rules/EditRules_Activate";
import EditRuleFormBudget from "./features/automation/rules/EditRules_Budget";
import EditRuleFormPause from "./features/automation/rules/EditRules_Pause";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route
                    path="/*"
                    element={
                        <div className="flex h-screen">
                            <SlideSidebar />
                            <main className="flex-1 overflow-auto">
                                <Routes>
                                    <Route path="/" element={<Page />} />
                                    <Route path="rules" element={<RulesDashboard />} />
                                    <Route path="editActivate" element={<EditRuleFormActivate />} />
                                    <Route path="editBudget" element={<EditRuleFormBudget />} />
                                    <Route path="editPause" element={<EditRuleFormPause />} />
                                    <Route path="log" element={<LogsDashboard />} />
                                    <Route path="actionlog" element={<ActionLogsDashboard />} />
                                </Routes>
                            </main>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
