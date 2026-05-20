import Student from "../models/Student";
import nodemailer from "nodemailer";

const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Lazy transporter — created on first use so env vars are guaranteed to be loaded
let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
    if (!transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error(
                "Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env"
            );
        }
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        console.log("Email transporter initialized with:", process.env.EMAIL_USER);
    }
    return transporter;
};

const sendOtp = async (email: string, otp: string, name: string): Promise<void> => {
    const t = getTransporter();
    await t.sendMail({
        from: `"ResultScale" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your ResultScale OTP - Verify Your Identity",
        text: `Hello ${name},\n\nYour OTP is ${otp}. It is valid for 10 minutes.\n\nNever share this OTP with anyone.\n\n© ResultScale`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
              <h2 style="color:#667eea">ResultScale OTP</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your one-time password is:</p>
              <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#667eea;
                          background:#f0f0ff;padding:16px;text-align:center;border-radius:8px;
                          border:2px dashed #667eea;margin:16px 0">
                ${otp}
              </div>
              <p style="color:#666;font-size:13px">Valid for 10 minutes. Never share this OTP.</p>
            </div>
        `,
    });
};

export const VerifyStudentLogin = async (email: string, rollNo: string) => {
    // Find by email first, then verify rollNo matches
    const student = await Student.findOne({ email: email.trim().toLowerCase() });

    if (!student)
        throw new Error("Student not found !");

    if (student.rollNo.trim().toLowerCase() !== rollNo.trim().toLowerCase())
        throw new Error("Invalid credentials");

    const otp = generateOtp();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    student.otp = otp;
    student.otpExpiry = expiry;
    await student.save();

    await sendOtp(student.email, otp, student.name);

    // Return safe DTO (no OTP fields, no sgpa yet)
    return {
        _id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        semester: student.semester,
        institutionName: student.institutionName,
    };
};

export const VerifyOtp = async (email: string, otp: string) => {
    const student = await Student.findOne({ email: email.trim().toLowerCase() });

    if (!student)
        throw new Error("Student not found!");

    if (!student.otpExpiry || student.otpExpiry < new Date()) {
        student.otp = "0";
        student.otpExpiry = new Date(0);
        await student.save();
        throw new Error("OTP expired !");
    }

    if (student.otp !== otp)
        throw new Error("Invalid OTP !");

    // Clear OTP after successful verification
    student.otp = "0";
    student.otpExpiry = new Date(0);
    await student.save();

    // Return only the CSV fields required for display
    return {
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        semester: student.semester,
        sgpa: student.sgpa,
        institutionName: student.institutionName,
    };
};
