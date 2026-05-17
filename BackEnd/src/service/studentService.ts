import Student from "../models/Student";
import nodemailer from "nodemailer";

const generateOtp = (): string => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendOtp = async (email: string,otp: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });
};

export const VerifyStudentLogin = async (email: string,rollNo: string) => {

    const student = await Student.findOne({ email });

    if (!student)
        throw new Error("Student not found!");

    if (student.rollNo !== rollNo)
        throw new Error("Invalid credentials");

    const otp = generateOtp();

    student.otp = otp;

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    student.otpExpiry = expiry;

    await student.save();

    await sendOtp(email, otp);

    const {
        otp: _otp,
        otpExpiry: _otpExpiry,
        sgpa: _sgpa,
        ...studentDto
    } = student.toObject();

    return studentDto;
};

export const VerifyOtp = async (email: string,otp: string) => {

    const student = await Student.findOne({ email });

    if (!student)
        throw new Error("Student not found!");

    if (
        !student.otpExpiry ||
        student.otpExpiry < new Date()
    ) {

        student.otp = "0";
        student.otpExpiry = new Date(0);

        await student.save();

        throw new Error("OTP expired!");
    }

    if (student.otp !== otp)
        throw new Error("Invalid OTP!");

    student.otp = "0";
    student.otpExpiry = new Date(0);

    await student.save();

    return student.sgpa;
};