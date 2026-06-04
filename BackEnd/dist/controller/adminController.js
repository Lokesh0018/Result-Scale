"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuotationRequest = exports.updateQuotationRequestStatus = exports.getQuotationRequests = exports.deleteInquiry = exports.updateInquiryStatus = exports.getInquiries = exports.getActivityLogs = exports.updatePassword = exports.getStudents = exports.deleteClient = exports.updateClient = exports.addClient = exports.getDashboard = void 0;
const adminService_1 = require("../service/adminService");
const logService_1 = require("../service/logService");
const dbErrorHandler_1 = require("../utils/dbErrorHandler");
const Client_1 = __importDefault(require("../models/Client"));
const clientValidation_1 = require("../utils/clientValidation");
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
    const { institutionName, email, password, portalExpiryDate, institutionType, logoUrl, isActive } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        (0, clientValidation_1.validateClientInput)({ institutionName, email, password, portalExpiryDate });
        const client = await (0, adminService_1.AddClient)(institutionName, email.toLowerCase(), password, new Date(portalExpiryDate), institutionType, logoUrl, isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive)) : true);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Created", "client", `Created client institution: ${institutionName} (${email.toLowerCase()})`, "success");
        return res.status(201).json({
            success: true,
            message: "Client Added Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Creation Failed", "client", `Failed to create client ${email || ""}: ${err.message}`, "failure");
        const { isDuplicate, message } = await (0, dbErrorHandler_1.checkAndLogDuplicate)(err, Client_1.default, { email });
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message
            });
        }
        if (err.message === "Date was Expired !" || err.message === "Invalid portal expiry date !")
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
    const { institutionName, email, password, portalExpiryDate, institutionType, logoUrl, isActive } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        if (!oldEmail)
            return res.status(400).json({
                success: false,
                message: "Client email is required !",
            });
        (0, clientValidation_1.validateClientInput)({ institutionName, email, password, portalExpiryDate });
        const client = await (0, adminService_1.UpdateClient)(institutionName, oldEmail.toLowerCase(), email.toLowerCase(), password, new Date(portalExpiryDate), institutionType, logoUrl, isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive)) : undefined);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Updated", "client", `Updated client institution: ${institutionName} (${email.toLowerCase()})`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Update Failed", "client", `Failed to update client ${oldEmail}: ${err.message}`, "failure");
        // Find existing client to get its _id for checking self-update
        const existingClientForId = await Client_1.default.findOne({ email: oldEmail.toLowerCase() }).lean();
        const client_id = existingClientForId ? existingClientForId._id : undefined;
        const { isDuplicate, message } = await (0, dbErrorHandler_1.checkAndLogDuplicate)(err, Client_1.default, { email, _id: client_id });
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message
            });
        }
        if (err.message === "Client not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });
        if (err.message === "Date was Expired !" || err.message === "Invalid portal expiry date !")
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
        const client = await (0, adminService_1.DeleteClient)(email.toLowerCase());
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Client Deleted", "client", `Deleted client and all enrolled student data: ${email.toLowerCase()}`, "success");
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
        const admin = await (0, adminService_1.UpdatePassword)(email.toLowerCase(), password);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Password Updated", "security", `Admin password updated for: ${email.toLowerCase()}`, "success");
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
const getInquiries = async (req, res) => {
    try {
        const inquiries = await (0, adminService_1.GetInquiries)();
        return res.status(200).json({
            success: true,
            message: "Inquiries fetched successfully",
            inquiries
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
exports.getInquiries = getInquiries;
const updateInquiryStatus = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        if (!status || !['unread', 'read'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status ('unread' or 'read') is required"
            });
        }
        const inquiry = await (0, adminService_1.UpdateInquiryStatus)(id, status);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Inquiry Status Updated", "system", `Updated status of inquiry from ${inquiry.fullName} to ${status}`, "success");
        return res.status(200).json({
            success: true,
            message: "Inquiry status updated successfully",
            inquiry
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Inquiry Status Update Failed", "system", `Failed to update inquiry status for ID ${id}: ${err.message}`, "failure");
        if (err.message === "Inquiry not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
const deleteInquiry = async (req, res) => {
    const id = req.params.id;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        const inquiry = await (0, adminService_1.DeleteInquiry)(id);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Inquiry Deleted", "system", `Deleted inquiry from ${inquiry.fullName} (${inquiry.email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully",
            inquiry
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Inquiry Deletion Failed", "system", `Failed to delete inquiry ID ${id}: ${err.message}`, "failure");
        if (err.message === "Inquiry not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.deleteInquiry = deleteInquiry;
const getQuotationRequests = async (req, res) => {
    try {
        const requests = await (0, adminService_1.GetQuotationRequests)();
        return res.status(200).json({
            success: true,
            message: "Quotation requests fetched successfully",
            requests
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
exports.getQuotationRequests = getQuotationRequests;
const updateQuotationRequestStatus = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        if (!status || !['Pending', 'Under Review', 'Contacted', 'Quotation Sent', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status ('Pending', 'Under Review', 'Contacted', 'Quotation Sent', 'Approved', or 'Rejected') is required"
            });
        }
        const request = await (0, adminService_1.UpdateQuotationRequestStatus)(id, status);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Quotation Request Status Updated", "system", `Updated status of quotation request from ${request.institutionName} to ${status}`, "success");
        return res.status(200).json({
            success: true,
            message: "Quotation request status updated successfully",
            request
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Quotation Request Status Update Failed", "system", `Failed to update status of quotation request ID ${id}: ${err.message}`, "failure");
        if (err.message === "Quotation request not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.updateQuotationRequestStatus = updateQuotationRequestStatus;
const deleteQuotationRequest = async (req, res) => {
    const id = req.params.id;
    const actorEmail = req.headers["x-user-email"] || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] || "admin";
    try {
        const request = await (0, adminService_1.DeleteQuotationRequest)(id);
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Quotation Request Deleted", "system", `Deleted quotation request from ${request.institutionName} (${request.email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Quotation request deleted successfully",
            request
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail, actorRole, "Quotation Request Deletion Failed", "system", `Failed to delete quotation request ID ${id}: ${err.message}`, "failure");
        if (err.message === "Quotation request not found !") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.deleteQuotationRequest = deleteQuotationRequest;
