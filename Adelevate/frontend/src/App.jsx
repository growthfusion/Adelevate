import { BrowserRouter, Routes, Route } from "react-router-dom";
import SlideSidebar from "./components/slide-sidebar";
import Page from "./features/dashboard/page";
import RulesDashboard from "./features/automation/rules/Rules";
import LogsDashboard from "./features/logs/logs_table"
import ActionLogsDashboard from "./features/action_logs/Alogs";

import EditRuleFormActivate from "@/features/automation/rules/EditRules_Activate";
import EditRuleFormBudget from "@/features/automation/rules/EditRules_Budget";
import EditRuleFormPause from "@/features/automation/rules/EditRules_Pause";

function App() {
  return (
      <BrowserRouter>
        <div className="flex h-screen">
          <SlideSidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
                <Route path="rules" element={<RulesDashboard />} />
                <Route path="editActivate" element={<EditRuleFormActivate />} />
                <Route path="editBudget" element={<EditRuleFormBudget />} />
                <Route path="editPause" element={<EditRuleFormPause />} />
                <Route path="/" element={<Page />} />

                <Route path="log" element={<LogsDashboard />} />
                <Route path="actionlog" element={<ActionLogsDashboard />} />

            </Routes>
          </main>
        </div>
      </BrowserRouter>
  );
}

export default App;

