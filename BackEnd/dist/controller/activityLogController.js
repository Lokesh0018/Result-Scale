"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivityLogs = exports.storeActivityLog = void 0;
const logService_1 = require("../service/logService");
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
const storeActivityLog = async (req, res) => {
    try {
        if (env_1.env.serverType !== "railway") {
            return (0, apiResponse_1.sendFailure)(res, 400, "Activity logs must be stored through the Railway API");
        }
        const { userEmail, userRole, action, category, details, status } = req.body;
        if (!userEmail || !userRole || !action || !category || !status) {
            return (0, apiResponse_1.sendFailure)(res, 400, "userEmail, userRole, action, category and status are required");
        }
        const log = await (0, logService_1.StoreActivityLog)(userEmail, userRole, action, category, details || "", status);
        return (0, apiResponse_1.sendSuccess)(res, 201, "Activity log stored successfully", { log });
    }
    catch (err) {
        return (0, apiResponse_1.sendFailure)(res, 500, err.message, { message: err.message });
    }
};
exports.storeActivityLog = storeActivityLog;
const listActivityLogs = async (req, res) => {
    try {
        const logs = await (0, logService_1.GetActivityLogs)();
        return (0, apiResponse_1.sendSuccess)(res, 200, "Activity logs fetched successfully", { logs });
    }
    catch (err) {
        return (0, apiResponse_1.sendFailure)(res, 500, err.message, { message: err.message });
    }
};
exports.listActivityLogs = listActivityLogs;
