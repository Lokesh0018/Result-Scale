"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtp = exports.VerifyStudentLogin = void 0;
const Student_1 = __importDefault(require("../models/Student"));
const Client_1 = __importDefault(require("../models/Client"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendOtp = async (email, otp) => {
    await transporter.sendMail({
        from: "munakalalokesh222@gmail.com",
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });
};
const VerifyStudentLogin = async (email, rollNo) => {
    const student = await Student_1.default.findOne({ email });
    if (!student)
        throw new Error("Student not found!");
    if (student.rollNo !== rollNo)
        throw new Error("Invalid credentials");
    const client = await Client_1.default.findById(student.clientId);
    if (client && new Date(client.portalExpiryDate).getTime() < Date.now())
        throw new Error("Portal Access Expired !");
    const otp = generateOtp();
    student.otp = otp;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
    student.otpExpiry = expiry;
    await student.save();
    await sendOtp(email, otp);
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
