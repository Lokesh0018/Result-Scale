"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitInquiry = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
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
