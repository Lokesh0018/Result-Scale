import express, { Request, Response } from "express";
import { verifyLogin } from "../service/loginService";
import { Roles } from "../types/types";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, role }: {
            email: string,
            password: string,
            role: Roles
        } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required !",
            });
        }
        const user = await verifyLogin(email, password, role);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    }
    catch (err: any) {
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