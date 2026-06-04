import { Request, Response } from "express";
import { VerifyStudentLogin, VerifyOtp } from "../service/studentService";
import { LogActivity } from "../service/logService";
import Client from "../models/Client";

export const login = async (req: Request, res: Response) => {
    const { email, rollNo, clientEmail } = req.body;
    try {
        if (!email || !rollNo) {
            return res.status(400).json({
                success: false,
                message: "Email and roll number are required !",
            });
        }
        const student = await VerifyStudentLogin(email, rollNo, clientEmail);
        await LogActivity(email, "student", "Login OTP Requested", "auth", `OTP sent for roll number: ${rollNo}`, "success");
        return res.status(200).json({
            success: true,
            message: "OTP Sent",
            student,
        });
    }
    catch (err: any) {
        if (email) {
            await LogActivity(email, "student", "Login OTP Request Failed", "auth", `Failed login request: ${err.message}`, "failure");
        }
        if (err.message === "Student not found!")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        if (err.message === "Invalid credentials")
            return res.status(401).json({
                success: false,
                message: err.message,
            });

        if (err.message === "Portal Access Expired !")
            return res.status(403).json({
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
    const { email, otp } = req.body;
    try {
        const student = await VerifyOtp(email, otp);
        await LogActivity(email, "student", "Login Successful", "auth", "OTP verified successfully. Access granted.", "success");
        return res.status(200).json({
            success: true,
            message: "OTP verified Successfully",
            student
        });
    }
    catch (err: any) {
        if (email) {
            await LogActivity(email, "student", "OTP Verification Failed", "auth", `Verification failed: ${err.message}`, "failure");
        }
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

export const getActiveInstitutions = async (req: Request, res: Response) => {
    try {
        let institutions;
        if (process.env.SERVER_TYPE === "railway") {
            const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
            const response = await fetch(`${renderUrl}/student/institutions`);
            if (!response.ok) throw new Error("Failed to fetch institutions from Render");
            const data = await response.json();
            institutions = data.data;
        } else {
            institutions = await Client.find()
                .select("-password")
                .lean();
        }

        return res.status(200).json({
            success: true,
            data: institutions
        });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch institutions",
            err: err.message
        });
    }
};