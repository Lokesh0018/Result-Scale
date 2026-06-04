import express, { Request, Response } from "express"
import { GetDashboard, AddStudent, UpdateStudent, DeleteStudent, GetStudents, UpdatePassword, UpdateProfile, findClientByIdentifier } from "../service/clientService"
import { LogActivity } from "../service/logService"
import Client from "../models/Client"
import Student from "../models/Student"
import { checkAndLogDuplicate } from "../utils/dbErrorHandler"

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const clientEmail = req.params.clientEmail as string;
        const data = await GetDashboard(clientEmail.toLowerCase());
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
    const { clientEmail, name, email, rollNo, semester, sgpa } = req.body;
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] as string || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        if (!normalizedClientEmail || !name || !normalizedEmail || !rollNo || semester === undefined || sgpa === undefined)
            return res.status(400).json({
                success: false,
                message: "Client email, name, email, roll no, semester are required !",
            });
        const student = await AddStudent(normalizedClientEmail, name, normalizedEmail, rollNo, semester, sgpa);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Created", "student", `Added student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(201).json({
            success: true,
            message: "Student Added Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Creation Failed", "student", `Failed to add student ${name || ""}: ${err.message}`, "failure");
        
        const { isDuplicate, message } = await checkAndLogDuplicate(err, Student, { email: normalizedEmail, rollNo, clientEmail: normalizedClientEmail });
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const updateStudent = async (req: Request, res: Response) => {
    const oldEmail = req.params.email as string;
    const { clientEmail, name, email, rollNo, semester, sgpa } = req.body;
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] as string || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        if (!normalizedOldEmail || !normalizedClientEmail || !name || !normalizedEmail || !rollNo || !semester)
            return res.status(400).json({
                success: false,
                message: "Client email, name, email, roll no, semester are required !",
            });

        const student = await UpdateStudent(normalizedOldEmail, normalizedClientEmail, name, normalizedEmail, rollNo, semester, sgpa);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Updated", "student", `Updated student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Update Failed", "student", `Failed to update student ${oldEmail}: ${err.message}`, "failure");
        
        // Find student by oldEmail to check self-update
        const existingStudentForId = await Student.findOne({ email: normalizedOldEmail, clientEmail: normalizedClientEmail }).lean();
        const student_id = existingStudentForId ? existingStudentForId._id : undefined;

        const { isDuplicate, message } = await checkAndLogDuplicate(err, Student, { email: normalizedEmail, rollNo, clientEmail: normalizedClientEmail, _id: student_id });
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message
            });
        }

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
    const { clientEmail } = req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] as string || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        const student = await DeleteStudent(normalizedEmail, normalizedClientEmail);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Deleted", "student", `Deleted student: ${student.name} (${student.rollNo})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Deleted Successfully",
            student
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Deletion Failed", "student", `Failed to delete student ${email}: ${err.message}`, "failure");
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
        const clientEmail = req.params.clientEmail as string;
        const result = await GetStudents(clientEmail.toLowerCase());

        return res.status(200).json({
            success: true,
            message: "Students Fetched Successfully",
            ...result
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
    const normalizedEmail = email.toLowerCase();
    const actorEmail = req.headers["x-user-email"] as string || normalizedEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        const admin = await UpdatePassword(normalizedEmail, password);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Password Updated", "security", `Client password updated for: ${normalizedEmail}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Password Update Failed", "security", `Failed to update client password for ${email}: ${err.message}`, "failure");
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

export const updateProfile = async (req: Request, res: Response) => {
    const clientEmail = req.params.clientEmail as string;
    const { institutionName, email, password } = req.body;
    const normalizedClientEmail = clientEmail.toLowerCase();
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] as string || normalizedEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] as string || "client";
    try {
        if (!normalizedClientEmail || !institutionName || !normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Client email, institution name, and email are required !",
            });
        }
        const client = await UpdateProfile(normalizedClientEmail, institutionName, normalizedEmail, password);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Profile Updated", "client", `Client profile updated: ${institutionName} (${normalizedEmail})`, "success");
        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            client
        });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Profile Update Failed", "client", `Failed to update client profile: ${err.message}`, "failure");
        
        const client = await findClientByIdentifier(normalizedClientEmail);
        const client_id = client ? client._id : undefined;

        const { isDuplicate, message } = await checkAndLogDuplicate(err, Client, { email: normalizedEmail, _id: client_id });
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}