import ActivityLog from "../models/ActivityLog";

export const LogActivity = async (
  userEmail: string,
  userRole: string,
  action: string,
  category: "auth" | "student" | "client" | "system" | "security",
  details: string,
  status: "success" | "failure"
) => {
  try {
    await ActivityLog.create({
      userEmail,
      userRole,
      action,
      category,
      details,
      status,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
};

export const GetActivityLogs = async () => {
  return await ActivityLog.find().sort({ timestamp: -1 }).lean();
};
