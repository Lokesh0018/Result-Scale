"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtp = exports.VerifyStudentLogin = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const Client_1 = __importDefault(require("../models/Client"));
const sendOtp = async (email, otp) => {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    email: "munakalalokesh222@gmail.com",
                    name: "Result Scale"
                },
                to: [
                    { email }
                ],
                subject: "Your OTP for Login",
                textContent: `Your OTP is ${otp}. It is valid for 5 minutes.`
            })
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("BREVO ERROR:", data);
            throw new Error(data.message || "Failed to send email");
        }
        console.log("EMAIL SENT:", data);
    }
    catch (error) {
        console.error("BREVO ERROR:", error);
        throw error;
    }
};
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const VerifyStudentLogin = async (email, rollNo, clientEmail) => {
    const student = await Student_1.default.findOne({ email });
    if (!student)
        throw new Error("Student not found!");
    if (student.rollNo !== rollNo)
        throw new Error("Invalid credentials");
    const client = await Client_1.default.findOne({ email: student.clientEmail });
    if (!client || !client.isActive) {
        throw new Error("Portal Access Expired !");
    }
    if (clientEmail && client.email.toLowerCase() !== clientEmail.toLowerCase()) {
        throw new Error("You do not belong to the selected institution.");
    }
    if (client && new Date(client.portalExpiryDate).getTime() < Date.now())
        throw new Error("Portal Access Expired !");
    const otp = generateOtp();
    student.otp = otp;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
    student.otpExpiry = expiry;
    await student.save();
    console.log("SAved");
    await sendOtp(email, otp);
    console.log("Sent");
    const { otp: _otp, otpExpiry: _otpExpiry, sgpa: _sgpa, ...studentDto } = student.toObject();
    return studentDto;
};
exports.VerifyStudentLogin = VerifyStudentLogin;
const VerifyOtp = async (email, otp) => {
    const student = await Student_1.default.findOne({ email });
    if (!student)
        throw new Error("Student not found!");
    if (!student.otpExpiry ||
        student.otpExpiry < new Date()) {
        student.otp = "0";
        student.otpExpiry = new Date(0);
        await student.save();
        throw new Error("OTP expired !");
    }
    if (student.otp !== otp)
        throw new Error("Invalid OTP !");
    student.otp = "0";
    student.otpExpiry = new Date(0);
    await student.save();
    return student;
};
exports.VerifyOtp = VerifyOtp;
