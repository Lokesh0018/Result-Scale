import express, { Request, Response } from "express"
import { GetDashboard, AddStudent, UpdateStudent, DeleteStudent, GetStudents, UpdatePassword, UpdateProfile, findClientByIdentifier, StudentExists } from "../service/clientService"
import { LogActivity } from "../service/logService"
import Client from "../models/Client"
import Student from "../models/Student"
import { checkAndLogDuplicate } from "../utils/dbErrorHandler"
import { env, ServerType } from "../config/env"
import { expectedServerForRollNo, isValidRollNo } from "../utils/rollNo"
import { fetchJsonWithRetry } from "../utils/http"
import { sendFailure, sendSuccess } from "../utils/apiResponse"
import { buildStudentUploadPlan } from "../utils/studentUploadPlan"

type StudentUploadPayload = {
    clientEmail: string;
    name: string;
    email: string;
    rollNo: string;
    semester: number;
    sgpa: number;
};

const apiUrlForServer = (server: ServerType) => server === "render" ? env.renderApiUrl : env.railwayApiUrl;

const validateStudentPayload = (payload: Partial<StudentUploadPayload>) => {
    if (!payload.clientEmail || !payload.name || !payload.email || !payload.rollNo || payload.semester === undefined || payload.sgpa === undefined) {
        throw new Error("Client email, name, email, roll no, semester and SGPA are required !");
    }

    if (!isValidRollNo(payload.rollNo)) {
        throw new Error("Roll number format is invalid");
    }
};

const checkPeerStudentDuplicate = async (payload: StudentUploadPayload) => {
    const peerServer: ServerType = env.serverType === "render" ? "railway" : "render";
    const peerUrl = apiUrlForServer(peerServer);
    const query = new URLSearchParams({
        clientEmail: payload.clientEmail.toLowerCase(),
        email: payload.email.toLowerCase(),
        rollNo: payload.rollNo,
    });

    const data: any = await fetchJsonWithRetry(`${peerUrl}/client/internal/student-exists?${query.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (data.exists || data.data?.exists) {
        throw new Error("Student already exists in another database API");
    }
};

const createStudentOnCorrectServer = async (payload: StudentUploadPayload, actorEmail: string, actorRole: string) => {
    validateStudentPayload(payload);
    const normalizedPayload = {
        ...payload,
        clientEmail: payload.clientEmail.toLowerCase(),
        email: payload.email.toLowerCase(),
    };
    const expectedServer = expectedServerForRollNo(normalizedPayload.rollNo);

    if (expectedServer !== env.serverType) {
        const data: any = await fetchJsonWithRetry(`${apiUrlForServer(expectedServer)}/client/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": actorEmail,
                "X-User-Role": actorRole,
            },
            body: JSON.stringify(normalizedPayload),
        });
        return data.student || data.data?.student;
    }

    await checkPeerStudentDuplicate(normalizedPayload);
    return await AddStudent(
        normalizedPayload.clientEmail,
        normalizedPayload.name,
        normalizedPayload.email,
        normalizedPayload.rollNo,
        normalizedPayload.semester,
        normalizedPayload.sgpa
    );
};

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
        const student = await createStudentOnCorrectServer({
            clientEmail: normalizedClientEmail,
            name,
            email: normalizedEmail,
            rollNo,
            semester,
            sgpa
        }, actorEmail.toLowerCase(), actorRole);
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Created", "student", `Added student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return sendSuccess(res, 201, "Student Added Successfully", { student });
    }
    catch (err: any) {
        await LogActivity(actorEmail.toLowerCase(), actorRole, "Student Creation Failed", "student", `Failed to add student ${name || ""}: ${err.message}`, "failure");
        
        const { isDuplicate, message } = await checkAndLogDuplicate(err, Student, { email: normalizedEmail, rollNo, clientEmail: normalizedClientEmail });
        if (isDuplicate) {
            return sendFailure(res, 409, message);
        }

        const status = err.message?.includes("required") || err.message?.includes("invalid") ? 400 : 500;
        return sendFailure(res, status, err.message, { message: err.message });
    }
}

export const bulkUploadStudents = async (req: Request, res: Response) => {
    const records = Array.isArray(req.body?.students) ? req.body.students : [];
    const actorEmail = req.headers["x-user-email"] as string || req.body?.clientEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] as string || "client";

    if (records.length === 0) {
        return sendFailure(res, 400, "students must be a non-empty array");
    }

    const summary = {
        totalRecords: records.length,
        successfullyUploaded: 0,
        failedUploads: 0,
        firestoreCount: 0,
        mongoDBCount: 0,
        failures: [] as Array<{ index: number; rollNo?: string; email?: string; message: string }>,
    };
    const uploadedStudents = [];

    for (const { index, record, target } of buildStudentUploadPlan(records)) {
        try {
            const payload: StudentUploadPayload = {
                clientEmail: (record.clientEmail || req.body.clientEmail || "").toLowerCase(),
                name: record.name,
                email: (record.email || "").toLowerCase(),
                rollNo: record.rollNo,
                semester: Number(record.semester),
                sgpa: Number(record.sgpa),
            };
            const student = await createStudentOnCorrectServer(payload, actorEmail.toLowerCase(), actorRole);
            uploadedStudents.push(student);
            summary.successfullyUploaded += 1;
            if (target === "render") summary.firestoreCount += 1;
            else summary.mongoDBCount += 1;
        } catch (err: any) {
            summary.failedUploads += 1;
            summary.failures.push({
                index,
                rollNo: record.rollNo,
                email: record.email,
                message: err.message || "Upload failed",
            });
        }
    }

    await LogActivity(
        actorEmail.toLowerCase(),
        actorRole,
        "Student Upload",
        "student",
        `Bulk upload completed. Total: ${summary.totalRecords}, Success: ${summary.successfullyUploaded}, Failed: ${summary.failedUploads}, Firestore: ${summary.firestoreCount}, MongoDB: ${summary.mongoDBCount}`,
        summary.failedUploads === 0 ? "success" : "failure"
    );

    return sendSuccess(res, summary.failedUploads === 0 ? 201 : 207, "Student upload completed", {
        summary,
        students: uploadedStudents,
    });
};

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
