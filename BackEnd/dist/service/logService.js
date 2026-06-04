"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityLogs = exports.LogActivity = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const LogActivity = async (userEmail, userRole, action, category, details, status) => {
    // 1. Skip logging on Railway environment
    if (process.env.IS_RAILWAY === "true") {
        return;
    }
    // 2. Skip student logs to reduce memory/disk usage
    if (userRole === "student" || category === "student") {
        return;
    }
    try {
        await ActivityLog_1.default.create({
            userEmail,
            userRole,
            action,
            category,
            details,
            status,
            timestamp: new Date(),
        });
    }
    catch (err) {
        console.error("Failed to write activity log:", err);
    }
};
exports.LogActivity = LogActivity;
const GetActivityLogs = async () => {
    return await ActivityLog_1.default.find().sort({ timestamp: -1 }).lean();
};
exports.GetActivityLogs = GetActivityLogs;
