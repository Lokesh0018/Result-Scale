import express, { Request, Response } from "express";
import { GetDashboard, AddClient, UpdateClient, DeleteClient, GetStudents, UpdatePassword } from "../service/adminService";

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
    try {
        const { institutionName, email, password, portalExpiryDate } = req.body;
        if (!institutionName || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await AddClient(institutionName, email, password, new Date(portalExpiryDate));
        return res.status(201).json({
            success: true,
            message: "Client Added Successfully",
            client
        });
    }
    catch (err: any) {
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
    try {
        const oldEmail = req.params.email as string;
        const { institutionName, email, password, portalExpiryDate } = req.body;
        if (!institutionName || !oldEmail || !email || !password || !portalExpiryDate)
            return res.status(400).json({
                success: false,
                message: "Institution name, email, password, portal expiry date are required !",
            });
        const client = await UpdateClient(institutionName, oldEmail, email, password, new Date(portalExpiryDate));
        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            client
        });
    }
    catch (err: any) {
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
    try {
        const email = req.params.email as string;
        const client = await DeleteClient(email);
        return res.status(200).json({
            success: true,
            message: "Client Deleted Successfully",
            client
        });
    }
    catch (err: any) {
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
    try {
        const email = req.params.email as string;
        const { password } = req.body;
        const admin = await UpdatePassword(email, password);
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err: any) {
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