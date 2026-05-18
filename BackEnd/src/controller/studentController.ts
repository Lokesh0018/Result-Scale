import { Request, Response } from "express";
import { VerifyStudentLogin, VerifyOtp } from "../service/studentService";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, rollNo } = req.body;
        if (!email || !rollNo) {
            return res.status(400).json({
                success: false,
                message: "Email and roll number are required !",
            });
        }
        const student = await VerifyStudentLogin(email, rollNo);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            student,
        });
    }
    catch (err: any) {
        if (err.message === "Student not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        if (err.message === "Invalid credentials")
            return res.status(401).json({
                success: false,
                message: err.message,
            });

        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            err: err.message,
        });
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const sgpa = await VerifyOtp(email, otp);
        return res.status(200).json({
            success: true,
            message: "OTP verified Successfully",
            sgpa
        });
    }
    catch (err: any) {
        if (err.message === "Student not found!")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        if (err.message === "OTP expired !")
            return res.status(401).json({
                success: false,
                message: err.message
            });

        if (err.message === "Invalid OTP !")
            return res.status(401).json({
                success: false,
                message: err.message
            });
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            err: err.message,
        });
    }
}