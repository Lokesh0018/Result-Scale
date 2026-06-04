"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityLogs = exports.LogActivity = exports.StoreActivityLog = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const env_1 = require("../config/env");
const http_1 = require("../utils/http");
const StoreActivityLog = async (userEmail, userRole, action, category, details, status) => {
    return await ActivityLog_1.default.create({
        userEmail: userEmail || "unknown",
        userRole: userRole || "unknown",
        action,
        category,
        details,
        status,
        timestamp: new Date(),
    });
};
exports.StoreActivityLog = StoreActivityLog;
const LogActivity = async (userEmail, userRole, action, category, details, status) => {
    try {
        if (env_1.env.serverType === "railway") {
            await (0, exports.StoreActivityLog)(userEmail, userRole, action, category, details, status);
            return;
        }
        await (0, http_1.fetchJsonWithRetry)(`${env_1.env.railwayApiUrl}/activity-logs/internal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, userRole, action, category, details, status }),
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
