import ActivityLog from "../models/ActivityLog";
import { env } from "../config/env";
import { fetchJsonWithRetry } from "../utils/http";

export type ActivityCategory = "auth" | "student" | "client" | "system" | "security";
export type ActivityStatus = "success" | "failure";

export const StoreActivityLog = async (
  userEmail: string,
  userRole: string,
  action: string,
  category: ActivityCategory,
  details: string,
  status: ActivityStatus
) => {
  return await ActivityLog.create({
    userEmail: userEmail || "unknown",
    userRole: userRole || "unknown",
    action,
    category,
    details,
    status,
    timestamp: new Date(),
  });
};

export const LogActivity = async (
  userEmail: string,
  userRole: string,
  action: string,
  category: ActivityCategory,
  details: string,
  status: ActivityStatus
) => {
  try {
    if (env.serverType === "railway") {
      await StoreActivityLog(userEmail, userRole, action, category, details, status);
      return;
    }

    await fetchJsonWithRetry(`${env.railwayApiUrl}/activity-logs/internal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail, userRole, action, category, details, status }),
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
};

export const GetActivityLogs = async () => {
  return await ActivityLog.find().sort({ timestamp: -1 }).lean();
};
