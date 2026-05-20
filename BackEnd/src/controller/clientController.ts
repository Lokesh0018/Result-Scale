import express, { Request, Response } from "express"
import { GetDashboard, AddStudent, UpdateStudent, DeleteStudent, GetStudents, UpdatePassword } from "../service/clientService"
import { LogActivity } from "../service/logService"
import Client from "../models/Client"

const getClientEmail = async (clientId: string): Promise<string> => {
    try {
        const client = await Client.findById(clientId);
        return client ? client.email : "unknown_client";
    } catch {
        return "unknown_client";
    }
}

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
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
    const { clientId, name, email, rollNo, semester, sgpa } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || (clientId ? await getClientEmail(clientId) : "unknown_client");
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        if (!clientId || !name || !email || !rollNo || semester === undefined || sgpa === undefined)
            return res.status(400).json({
                success: false,
                message: "Client id, name, email, roll no, semester are required !",
            });
        const student = await AddStudent(clientId, name, email, rollNo, semester, sgpa);
        await LogActivity(actorEmail, actorRole, "Student Created", "student", `Added student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(201).json({
            success: true,
            message: "Student Added Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Student Creation Failed", "student", `Failed to add student ${name || ""}: ${err.message}`, "failure");
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
    const oldEmail = req.params.email as string;
    const { clientId, name, email, rollNo, semester, sgpa } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || (clientId ? await getClientEmail(clientId) : "unknown_client");
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        if (!oldEmail || !clientId || !name || !email || !rollNo || !semester)
            return res.status(400).json({
                success: false,
                message: "Client id, name, email, roll no, semester are required !",
            });

        const student = await UpdateStudent(oldEmail, clientId, name, email, rollNo, semester, sgpa);
        await LogActivity(actorEmail, actorRole, "Student Updated", "student", `Updated student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Student Update Failed", "student", `Failed to update student ${oldEmail}: ${err.message}`, "failure");
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
    const email = req.params.email as string;
    const { clientId } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || (clientId ? await getClientEmail(clientId) : "unknown_client");
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        const student = await DeleteStudent(email, clientId);
        await LogActivity(actorEmail, actorRole, "Student Deleted", "student", `Deleted student: ${student.name} (${student.rollNo})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Deleted Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Student Deletion Failed", "student", `Failed to delete student ${email}: ${err.message}`, "failure");
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
    const email = req.params.email as string;
    const { password } = req.body;
    const actorEmail = req.headers["x-user-email"] as string || email || "unknown_client";
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        const admin = await UpdatePassword(email, password);
        await LogActivity(actorEmail, actorRole, "Password Updated", "security", `Client password updated for: ${email}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail, actorRole, "Password Update Failed", "security", `Failed to update client password for ${email}: ${err.message}`, "failure");
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