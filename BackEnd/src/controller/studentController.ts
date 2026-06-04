import { Request, Response } from "express";
import { VerifyStudentLogin, VerifyOtp } from "../service/studentService";
import { LogActivity } from "../service/logService";
import Client from "../models/Client";
import { env } from "../config/env";

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
        await LogActivity(email, "student", "OTP Request", "auth", `OTP sent for roll number: ${rollNo}`, "success");
        return res.status(200).json({
            success: true,
            message: "OTP Sent",
            student,
        });
    }
    catch (err: any) {
        if (email) {
            await LogActivity(email, "student", "OTP Request Failed", "auth", `Failed login request: ${err.message}`, "failure");
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
        await LogActivity(email, "student", "Student Login", "auth", "OTP verified successfully. Access granted.", "success");
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
        if (env.serverType === "railway") {
            const response = await fetch(`${env.renderApiUrl}/student/institutions`);
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
