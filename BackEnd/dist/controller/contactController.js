"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuotationRequest = exports.submitInquiry = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
const QuotationRequest_1 = __importDefault(require("../models/QuotationRequest"));
const logService_1 = require("../service/logService");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const submitInquiry = async (req, res) => {
    const { fullName, institutionName, email, phone, subject, message } = req.body;
    try {
        // 1. Validation checks
        if (!fullName || !institutionName || !email || !phone || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format!",
            });
        }
        // Basic phone validation (allowing digits, spaces, hyphens, plus sign, minimum 7 digits)
        const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format!",
            });
        }
        if (message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters long!",
            });
        }
        // 2. Save inquiry to MongoDB
        const inquiry = new Inquiry_1.default({
            fullName: fullName.trim(),
            institutionName: institutionName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim(),
        });
        await inquiry.save();
        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully.",
        });
    }
    catch (error) {
        console.error("Error in submitInquiry controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
};
exports.submitInquiry = submitInquiry;
const submitQuotationRequest = async (req, res) => {
    const { institutionName, contactPerson, email, phone, studentCount, accessDurationDays, expectedReleaseDate, otpRequired, marksMemoRequired, } = req.body;
    try {
        // 1. Validation checks
        if (!institutionName || !contactPerson || !email || !phone || studentCount === undefined || accessDurationDays === undefined || !expectedReleaseDate) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled!",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format!",
            });
        }
        const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format!",
            });
        }
        const students = Number(studentCount);
        if (isNaN(students) || students <= 0) {
            return res.status(400).json({
                success: false,
                message: "Student count must be a positive number!",
            });
        }
        const durationDays = Number(accessDurationDays);
        if (isNaN(durationDays) || durationDays <= 0) {
            return res.status(400).json({
                success: false,
                message: "Access duration must be a positive number of days!",
            });
        }
        // Calculations based on ₹1.5 per student per day of portal access
        const hostingCost = students * durationDays * 1.5;
        const otpCost = 0; // OTP is included at no extra cost
        const estimatedTotal = hostingCost;
        // 2. Save quotation request to MongoDB
        const request = new QuotationRequest_1.default({
            institutionName: institutionName.trim(),
            contactPerson: contactPerson.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            studentCount: students,
            accessDurationDays: durationDays,
            expectedReleaseDate: new Date(expectedReleaseDate),
            hostingCost,
            otpCost,
            estimatedTotal,
            otpRequired: otpRequired !== false,
            marksMemoRequired: marksMemoRequired !== false,
            status: "Pending",
        });
        await request.save();
        // 3. Log activity
        try {
            await (0, logService_1.LogActivity)(email, "client", "Quotation Request Submitted", "client", `Quotation request submitted by ${institutionName} for ${students} students, total estimated: ₹${estimatedTotal}`, "success");
        }
        catch (logErr) {
            console.error("Failed to log activity:", logErr);
        }
        return res.status(201).json({
            success: true,
            message: "Quotation request submitted successfully",
            request
        });
    }
    catch (error) {
        console.error("Error in submitQuotationRequest controller:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
};
exports.submitQuotationRequest = submitQuotationRequest;
