"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveInstitutions = exports.verifyOtp = exports.login = void 0;
const studentService_1 = require("../service/studentService");
const logService_1 = require("../service/logService");
const Client_1 = __importDefault(require("../models/Client"));
const login = async (req, res) => {
    const { email, rollNo, clientId, clientEmail } = req.body;
    try {
        if (!email || !rollNo) {
            return res.status(400).json({
                success: false,
                message: "Email and roll number are required!",
            });
        }
        // Resolve clientId from clientEmail if clientId not provided
        let resolvedClientId = clientId;
        if (!resolvedClientId && clientEmail) {
            const client = await Client_1.default.findOne({ email: clientEmail }).lean();
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: "Institution not found.",
                });
            }
            resolvedClientId = client._id.toString();
        }
        const student = await (0, studentService_1.VerifyStudentLogin)(email, rollNo, resolvedClientId);
        await (0, logService_1.LogActivity)(email, "student", "Login OTP Requested", "auth", `OTP sent for roll number: ${rollNo}`, "success");
        return res.status(200).json({
            success: true,
            message: "OTP Sent",
            student,
        });
    }
    catch (err) {
        if (email) {
            await (0, logService_1.LogActivity)(email, "student", "Login OTP Request Failed", "auth", `Failed login request: ${err.message}`, "failure");
        }
        if (err.message === "Student not found!")
            return res.status(404).json({ success: false, message: err.message });
        if (err.message === "Invalid credentials")
            return res.status(401).json({ success: false, message: err.message });
        if (err.message === "Portal Access Expired!")
            return res.status(403).json({ success: false, message: err.message });
        if (err.message.includes("do not belong"))
            return res.status(403).json({ success: false, message: err.message });
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            err: err.message,
        });
    }
};
exports.login = login;
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required!",
            });
        }
        const student = await (0, studentService_1.VerifyOtp)(email, otp);
        await (0, logService_1.LogActivity)(email, "student", "Login Successful", "auth", "OTP verified successfully. Access granted.", "success");
        return res.status(200).json({
            success: true,
            message: "OTP verified Successfully",
            student
        });
    }
    catch (err) {
        if (email) {
            await (0, logService_1.LogActivity)(email, "student", "OTP Verification Failed", "auth", `Verification failed: ${err.message}`, "failure");
        }
        if (err.message === "Student not found!")
            return res.status(404).json({ success: false, message: err.message });
        if (err.message === "OTP expired!")
            return res.status(401).json({ success: false, message: err.message });
        if (err.message === "Invalid OTP!")
            return res.status(401).json({ success: false, message: err.message });
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            err: err.message,
        });
    }
};
exports.verifyOtp = verifyOtp;
const getActiveInstitutions = async (_req, res) => {
    try {
        // Only return active and non-expired institutions
        const institutions = await Client_1.default.find({
            isActive: true,
            portalExpiryDate: { $gt: new Date() }
        })
            .select("-password")
            .lean();
        return res.status(200).json({
            success: true,
            data: institutions
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch institutions",
            err: err.message
        });
    }
};
exports.getActiveInstitutions = getActiveInstitutions;
