// @/utils/actionLog.js
import { supabase } from "@/supabaseClient";

export async function logAction({
  userEmail,
  action,
  details = "",
  platform = "",
  ruleName = null,
  ruleConditions = null,
  platformIcon = "",
  status = "success",
}) {
  if (!userEmail) {
    console.error("Cannot log action: userEmail missing");
    return;
  }

  // IMPORTANT: These two fixes ensure view and draft appear correctly

  // 1. Make sure action is always lowercase
  const normalizedAction = String(action).toLowerCase().trim();

  // 2. Set draft status for draft actions
  let normalizedStatus = status;
  if (normalizedAction === "draft") {
    normalizedStatus = "draft";
  }

  try {
    await supabase.from("Adelevate_Action_Log").insert([
      {
        email: userEmail,
        action: normalizedAction, // Use normalized action
        details,
        platform,
        rule_name: ruleName,
        rule_conditions: ruleConditions,
        platform_icon: platformIcon,
        status: normalizedStatus, // Use normalized status
      },
    ]);
  } catch (e) {
    console.error("Action logging error:", e);
  }
}
