import express, { Request, Response } from "express";
import { verifyLogin } from "../service/loginService";
import { LogActivity } from "../service/logService";
import { Roles } from "../types/types";

export const login = async (req: Request, res: Response) => {
    const { email, password, role }: {
        email: string,
        password: string,
        role: Roles
    } = req.body;
    try {
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required !",
            });
        }
        const user = await verifyLogin(email, password, role);
        await LogActivity(email, role, role === "admin" ? "Admin Login" : "Client Login", "auth", `Successfully authenticated as ${role}`, "success");
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    }
    catch (err: any) {
        if (email) {
            await LogActivity(email, role || "unknown", "Login Failed", "auth", `Failed login attempt: ${err.message}`, "failure");
        }
        if (err.message === "User not found")
            return res.status(404).json({
                success: false,
                message: err.message
            })

        if (err.message === "Invalid Password !")
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
