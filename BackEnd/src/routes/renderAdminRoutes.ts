import express from "express";
import { login } from "../controller/loginController";
import { 
  getDashboard, addClient, updateClient, deleteClient, getStudents, 
  updatePassword, getActivityLogs
} from "../controller/adminController";
import ActivityLog from "../models/ActivityLog";

export const router = express.Router();

// Admin Authentication & Verification (Render only)
router.post("/login", login);
router.patch("/password/:email", updatePassword);

// Client management (Render + Railway)
router.get("/dashboard", getDashboard);
router.post("/clients", addClient);
router.put("/clients/:email", updateClient);
router.delete("/clients/:email", deleteClient);

// Student management (even roll numbers)
router.get("/students", getStudents);

// Activity Logs (Render only)
router.get("/logs", getActivityLogs);

// Central log creation endpoint for Railway (or client) logs
router.post("/logs", async (req: express.Request, res: express.Response) => {
  const { userEmail, userRole, action, category, details, status } = req.body;
  try {
    const log = await ActivityLog.create({
      userEmail,
      userRole,
      action,
      category,
      details,
      status,
      timestamp: new Date(),
    });
    return res.status(201).json({
      success: true,
      message: "Log written centrally on Render.",
      log
    });
  } catch (err: any) {
    console.error("Central log creation failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create log centrally."
    });
  }
});
