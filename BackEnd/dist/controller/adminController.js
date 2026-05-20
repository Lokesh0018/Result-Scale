"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityLogs = exports.updatePassword = exports.getStudents = exports.deleteClient = exports.updateClient = exports.addClient = exports.getDashboard = void 0;
const adminService_1 = require("../service/adminService");
const logService_1 = require("../service/logService");
const getDashboard = async (req, res) => {
    try {
        const data = await (0, adminService_1.GetDashboard)();
        return res.status(200).json({
            success: true,
            message: "DashBoard Fetched Successfully",
            data
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
};
exports.getDashboard = getDashboard;
const addClient = async (req, res) => {
    const { institutionName, email, password, portalExpiryDate } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        if (!institutionName || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await (0, adminService_1.AddClient)(institutionName, email, password, new Date(portalExpiryDate));
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Created", "client", `Created client institution: ${institutionName} (${email})`, "success");
        return res.status(201).json({
            success: true,
            message: "Client Added Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Creation Failed", "client", `Failed to create client ${email || ""}: ${err.message}`, "failure");
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });
        if (err.message === "Date was Expired !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.addClient = addClient;
const updateClient = async (req, res) => {
    const oldEmail = req.params.email;
    const { institutionName, email, password, portalExpiryDate } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        if (!institutionName || !oldEmail || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await (0, adminService_1.UpdateClient)(institutionName, oldEmail, email, password, new Date(portalExpiryDate));
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Updated", "client", `Updated client institution: ${institutionName} (${email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Update Failed", "client", `Failed to update client ${oldEmail}: ${err.message}`, "failure");
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });
        if (err.message === "Client not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });
        if (err.message === "Date was Expired !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    const email = req.params.email;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        const client = await (0, adminService_1.DeleteClient)(email);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Deleted", "client", `Deleted client and all enrolled student data: ${email}`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Deleted Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Deletion Failed", "client", `Failed to delete client ${email}: ${err.message}`, "failure");
        if (err.message === "Client not found !") {
            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.deleteClient = deleteClient;
const getStudents = async (req, res) => {
    try {
        const students = await (0, adminService_1.GetStudents)();
        return res.status(200).json({
            success: true,
            message: "Students Fetched Successfully",
            students
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getStudents = getStudents;
const updatePassword = async (req, res) => {
    const email = req.params.email;
    const { password } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        const admin = await (0, adminService_1.UpdatePassword)(email, password);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Password Updated", "security", `Admin password updated for: ${email}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Password Update Failed", "security", `Failed to update admin password for ${email}: ${err.message}`, "failure");
        if (err.message === "Admin not found !") {
            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.updatePassword = updatePassword;
const getActivityLogs = async (req, res) => {
    try {
        const logs = await (0, logService_1.GetActivityLogs)();
        return res.status(200).json({
            success: true,
            message: "Activity logs fetched successfully",
            logs
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.getActivityLogs = getActivityLogs;
