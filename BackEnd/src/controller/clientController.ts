import express, { Request, Response } from "express"
import { GetDashboard, AddStudent, UpdateStudent, DeleteStudent, GetStudents, UpdatePassword } from "../service/clientService"

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.body;
        const data = await GetDashboard(clientId);
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

export const addStudent = async (req: Request, res: Response) => {
    try {
        const { clientId, name, email, rollNo, semester, sgpa } = req.body;
        if (!clientId || !name || !email || !rollNo || semester === undefined || sgpa === undefined)
            return res.status(400).json({
                success: false,
                message: "Client id, name, email, roll no, semester are required !",
            });
        const student = await AddStudent(clientId, name, email, rollNo, semester, sgpa);
        return res.status(201).json({
            success: true,
            message: "Student Added Successfully",
            student
        });
    }
    catch (err: any) {
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const oldEmail = req.params.email as string;
        const { clientId, name, email, rollNo, semester, sgpa } = req.body;
        if (!oldEmail || !clientId || !name || !email || !rollNo || !semester)
            return res.status(400).json({
                success: false,
                message: "Client id, name, email, roll no, semester are required !",
            });

        const student = await UpdateStudent(oldEmail, clientId, name, email, rollNo, semester, sgpa);
        return res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            student
        });
    }
    catch (err: any) {
        if (err.message.includes("Already Exists"))
            return res.status(409).json({
                success: false,
                message: err.message
            });

        if (err.message === "Student not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const email = req.params.email as string;
        const { clientId } = req.body;
        const student = await DeleteStudent(email, clientId);
        return res.status(200).json({
            success: true,
            message: "Student Deleted Successfully",
            student
        });
    }
    catch (err: any) {
        if (err.message === "Student not found !")
            return res.status(404).json({
                success: false,
                message: err.message
            });

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const getStudents = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
        const students = await GetStudents(clientId);
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