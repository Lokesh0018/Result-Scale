"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const loginController_1 = require("../controller/loginController");
const adminController_1 = require("../controller/adminController");
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
exports.router = express_1.default.Router();
// Admin Authentication & Verification (Render only)
exports.router.post("/login", loginController_1.login);
exports.router.patch("/password/:email", adminController_1.updatePassword);
// Client management (Render + Railway)
exports.router.get("/dashboard", adminController_1.getDashboard);
exports.router.post("/clients", adminController_1.addClient);
exports.router.put("/clients/:email", adminController_1.updateClient);
exports.router.delete("/clients/:email", adminController_1.deleteClient);
// Student management (even roll numbers)
exports.router.get("/students", adminController_1.getStudents);
// Activity Logs (Render only)
exports.router.get("/logs", adminController_1.getActivityLogs);
// Central log creation endpoint for Railway (or client) logs
exports.router.post("/logs", async (req, res) => {
    const { userEmail, userRole, action, category, details, status } = req.body;
    try {
        const log = await ActivityLog_1.default.create({
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
    }
    catch (err) {
        console.error("Central log creation failed:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create log centrally."
        });
    }
});
