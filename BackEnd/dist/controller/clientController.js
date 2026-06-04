"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.updatePassword = exports.getStudents = exports.deleteStudent = exports.updateStudent = exports.bulkUploadStudents = exports.addStudent = exports.getDashboard = void 0;
const clientService_1 = require("../service/clientService");
const logService_1 = require("../service/logService");
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const dbErrorHandler_1 = require("../utils/dbErrorHandler");
const env_1 = require("../config/env");
const rollNo_1 = require("../utils/rollNo");
const http_1 = require("../utils/http");
const apiResponse_1 = require("../utils/apiResponse");
const studentUploadPlan_1 = require("../utils/studentUploadPlan");
const apiUrlForServer = (server) => server === "render" ? env_1.env.renderApiUrl : env_1.env.railwayApiUrl;
const validateStudentPayload = (payload) => {
    if (!payload.clientEmail || !payload.name || !payload.email || !payload.rollNo || payload.semester === undefined || payload.sgpa === undefined) {
        throw new Error("Client email, name, email, roll no, semester and SGPA are required !");
    }
    if (!(0, rollNo_1.isValidRollNo)(payload.rollNo)) {
        throw new Error("Roll number format is invalid");
    }
};
const checkPeerStudentDuplicate = async (payload) => {
    const peerServer = env_1.env.serverType === "render" ? "railway" : "render";
    const peerUrl = apiUrlForServer(peerServer);
    const query = new URLSearchParams({
        clientEmail: payload.clientEmail.toLowerCase(),
        email: payload.email.toLowerCase(),
        rollNo: payload.rollNo,
    });
    const data = await (0, http_1.fetchJsonWithRetry)(`${peerUrl}/client/internal/student-exists?${query.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (data.exists || data.data?.exists) {
        throw new Error("Student already exists in another database API");
    }
};
const createStudentOnCorrectServer = async (payload, actorEmail, actorRole) => {
    validateStudentPayload(payload);
    const normalizedPayload = {
        ...payload,
        clientEmail: payload.clientEmail.toLowerCase(),
        email: payload.email.toLowerCase(),
    };
    const expectedServer = (0, rollNo_1.expectedServerForRollNo)(normalizedPayload.rollNo);
    if (expectedServer !== env_1.env.serverType) {
        const data = await (0, http_1.fetchJsonWithRetry)(`${apiUrlForServer(expectedServer)}/client/students`, {
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
    return await (0, clientService_1.AddStudent)(normalizedPayload.clientEmail, normalizedPayload.name, normalizedPayload.email, normalizedPayload.rollNo, normalizedPayload.semester, normalizedPayload.sgpa);
};
const getDashboard = async (req, res) => {
    try {
        const clientEmail = req.params.clientEmail;
        const data = await (0, clientService_1.GetDashboard)(clientEmail.toLowerCase());
        return res.status(200).json({
            success: true,
            message: "DashBoard Fetched Successfully",
            data
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
};
exports.getDashboard = getDashboard;
const addStudent = async (req, res) => {
    const { clientEmail, name, email, rollNo, semester, sgpa } = req.body;
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] || "client";
    try {
        const student = await createStudentOnCorrectServer({
            clientEmail: normalizedClientEmail,
            name,
            email: normalizedEmail,
            rollNo,
            semester,
            sgpa
        }, actorEmail.toLowerCase(), actorRole);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Created", "student", `Added student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return (0, apiResponse_1.sendSuccess)(res, 201, "Student Added Successfully", { student });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Creation Failed", "student", `Failed to add student ${name || ""}: ${err.message}`, "failure");
        const { isDuplicate, message } = await (0, dbErrorHandler_1.checkAndLogDuplicate)(err, Student_1.default, { email: normalizedEmail, rollNo, clientEmail: normalizedClientEmail });
        if (isDuplicate) {
            return (0, apiResponse_1.sendFailure)(res, 409, message);
        }
        const status = err.message?.includes("required") || err.message?.includes("invalid") ? 400 : 500;
        return (0, apiResponse_1.sendFailure)(res, status, err.message, { message: err.message });
    }
};
exports.addStudent = addStudent;
const bulkUploadStudents = async (req, res) => {
    const records = Array.isArray(req.body?.students) ? req.body.students : [];
    const actorEmail = req.headers["x-user-email"] || req.body?.clientEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] || "client";
    if (records.length === 0) {
        return (0, apiResponse_1.sendFailure)(res, 400, "students must be a non-empty array");
    }
    const summary = {
        totalRecords: records.length,
        successfullyUploaded: 0,
        failedUploads: 0,
        firestoreCount: 0,
        mongoDBCount: 0,
        failures: [],
    };
    const uploadedStudents = [];
    for (const { index, record, target } of (0, studentUploadPlan_1.buildStudentUploadPlan)(records)) {
        try {
            const payload = {
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
            if (target === "render")
                summary.firestoreCount += 1;
            else
                summary.mongoDBCount += 1;
        }
        catch (err) {
            summary.failedUploads += 1;
            summary.failures.push({
                index,
                rollNo: record.rollNo,
                email: record.email,
                message: err.message || "Upload failed",
            });
        }
    }
    await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Upload", "student", `Bulk upload completed. Total: ${summary.totalRecords}, Success: ${summary.successfullyUploaded}, Failed: ${summary.failedUploads}, Firestore: ${summary.firestoreCount}, MongoDB: ${summary.mongoDBCount}`, summary.failedUploads === 0 ? "success" : "failure");
    return (0, apiResponse_1.sendSuccess)(res, summary.failedUploads === 0 ? 201 : 207, "Student upload completed", {
        summary,
        students: uploadedStudents,
    });
};
exports.bulkUploadStudents = bulkUploadStudents;
const updateStudent = async (req, res) => {
    const oldEmail = req.params.email;
    const { clientEmail, name, email, rollNo, semester, sgpa } = req.body;
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] || "client";
    try {
        if (!normalizedOldEmail || !normalizedClientEmail || !name || !normalizedEmail || !rollNo || !semester)
            return res.status(400).json({
                success: false,
                message: "Client email, name, email, roll no, semester are required !",
            });
        const student = await (0, clientService_1.UpdateStudent)(normalizedOldEmail, normalizedClientEmail, name, normalizedEmail, rollNo, semester, sgpa);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Updated", "student", `Updated student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            student
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Update Failed", "student", `Failed to update student ${oldEmail}: ${err.message}`, "failure");
        // Find student by oldEmail to check self-update
        const existingStudentForId = await Student_1.default.findOne({ email: normalizedOldEmail, clientEmail: normalizedClientEmail }).lean();
        const student_id = existingStudentForId ? existingStudentForId._id : undefined;
        const { isDuplicate, message } = await (0, dbErrorHandler_1.checkAndLogDuplicate)(err, Student_1.default, { email: normalizedEmail, rollNo, clientEmail: normalizedClientEmail, _id: student_id });
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
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    const email = req.params.email;
    const { clientEmail } = req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedClientEmail = clientEmail ? clientEmail.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] || normalizedClientEmail;
    const actorRole = req.headers["x-user-role"] || "client";
    try {
        const student = await (0, clientService_1.DeleteStudent)(normalizedEmail, normalizedClientEmail);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Deleted", "student", `Deleted student: ${student.name} (${student.rollNo})`, "success");
        return res.status(200).json({
            success: true,
            message: "Student Deleted Successfully",
            student
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Deletion Failed", "student", `Failed to delete student ${email}: ${err.message}`, "failure");
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
};
exports.deleteStudent = deleteStudent;
const getStudents = async (req, res) => {
    try {
        const clientEmail = req.params.clientEmail;
        const result = await (0, clientService_1.GetStudents)(clientEmail.toLowerCase());
        return res.status(200).json({
            success: true,
            message: "Students Fetched Successfully",
            ...result
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getStudents = getStudents;
const updatePassword = async (req, res) => {
    const email = req.params.email;
    const { password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const actorEmail = req.headers["x-user-email"] || normalizedEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] || "client";
    try {
        const admin = await (0, clientService_1.UpdatePassword)(normalizedEmail, password);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Password Updated", "security", `Client password updated for: ${normalizedEmail}`, "success");
        return res.status(200).json({
            message: "Password Changed Successfully",
            admin
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Password Update Failed", "security", `Failed to update client password for ${email}: ${err.message}`, "failure");
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
};
exports.updatePassword = updatePassword;
const updateProfile = async (req, res) => {
    const clientEmail = req.params.clientEmail;
    const { institutionName, email, password } = req.body;
    const normalizedClientEmail = clientEmail.toLowerCase();
    const normalizedEmail = email ? email.toLowerCase() : "";
    const actorEmail = req.headers["x-user-email"] || normalizedEmail || "unknown_client";
    const actorRole = req.headers["x-user-role"] || "client";
    try {
        if (!normalizedClientEmail || !institutionName || !normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Client email, institution name, and email are required !",
            });
        }
        const client = await (0, clientService_1.UpdateProfile)(normalizedClientEmail, institutionName, normalizedEmail, password);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Profile Updated", "client", `Client profile updated: ${institutionName} (${normalizedEmail})`, "success");
        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            client
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Profile Update Failed", "client", `Failed to update client profile: ${err.message}`, "failure");
        const client = await (0, clientService_1.findClientByIdentifier)(normalizedClientEmail);
        const client_id = client ? client._id : undefined;
        const { isDuplicate, message } = await (0, dbErrorHandler_1.checkAndLogDuplicate)(err, Client_1.default, { email: normalizedEmail, _id: client_id });
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
};
exports.updateProfile = updateProfile;
