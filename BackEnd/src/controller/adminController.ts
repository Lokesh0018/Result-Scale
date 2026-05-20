import express, { Request, Response } from "express";
import { GetDashboard, AddClient, UpdateClient, DeleteClient, GetStudents, UpdatePassword } from "../service/adminService";
import { GetActivityLogs, LogActivity } from "../service/logService";

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const data = await GetDashboard();
        return res.status(200).json({
            success: true,
            message: "DashBoard Fetched Successfully",
            data
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
}

export const addClient = async (req: Request, res: Response) => {
    const { institutionName, email, password, portalExpiryDate } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] as string || "admin";
    try {
        if (!institutionName || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await AddClient(institutionName, email, password, new Date(portalExpiryDate));
        await LogActivity(actorEmail, actorRole, "Client Created", "client", `Created client institution: ${institutionName} (${email})`, "success");
        return res.status(201).json({
            success: true,
            message: "Client Added Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Creation Failed", "client", `Failed to create client ${email || ""}: ${err.message}`, "failure");
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });
        if (err.message === "Date was Expired !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const updateClient = async (req: Request, res: Response) => {
    const oldEmail = req.params.email as string;
    const { institutionName, email, password, portalExpiryDate } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] as string || "admin";
    try {
        if (!institutionName || !oldEmail || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await UpdateClient(institutionName, oldEmail, email, password, new Date(portalExpiryDate));
        await LogActivity(actorEmail, actorRole, "Client Updated", "client", `Updated client institution: ${institutionName} (${email})`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Update Failed", "client", `Failed to update client ${oldEmail}: ${err.message}`, "failure");
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });

        if (err.message === "Client not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        if (err.message === "Date was Expired !")
            return res.status(400).json({
                success: false,
                message: err.message
            });
            
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const deleteClient = async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const actorEmail = req.headers["x-user-email"] as string || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] as string || "admin";
    try {
        const client = await DeleteClient(email);
        await LogActivity(actorEmail, actorRole, "Client Deleted", "client", `Deleted client and all enrolled student data: ${email}`, "success");
        return res.status(200).json({
            success: true,
            message: "Client Deleted Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Client Deletion Failed", "client", `Failed to delete client ${email}: ${err.message}`, "failure");
        if (err.message === "Client not found !") {
            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await GetStudents();
        return res.status(200).json({
            success: true,
            message: "Students Fetched Successfully",
            students
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const updatePassword = async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const { password } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || "admin@resultscale.com";
    const actorRole = req.headers["x-user-role"] as string || "admin";
    try {
        const admin = await UpdatePassword(email, password);
        await LogActivity(actorEmail, actorRole, "Password Updated", "security", `Admin password updated for: ${email}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Password Update Failed", "security", `Failed to update admin password for ${email}: ${err.message}`, "failure");
        if(err.message === "Admin not found !"){
            return res.status(404).json({
            success: false,
            message: err.message,
        });
        }
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        const logs = await GetActivityLogs();
        return res.status(200).json({
            success: true,
            message: "Activity logs fetched successfully",
            logs
        });
    }
    catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}