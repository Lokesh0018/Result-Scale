"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.updatePassword = exports.getStudents = exports.deleteStudent = exports.updateStudent = exports.addStudent = exports.getDashboard = void 0;
const clientService_1 = require("../service/clientService");
const logService_1 = require("../service/logService");
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
        if (!normalizedClientEmail || !name || !normalizedEmail || !rollNo || semester === undefined || sgpa === undefined)
            return res.status(400).json({
                success: false,
                message: "Client id, name, email, roll no, semester are required !",
            });
        const student = await (0, clientService_1.AddStudent)(normalizedClientEmail, name, normalizedEmail, rollNo, semester, sgpa);
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Created", "student", `Added student: ${name} (${rollNo}, Sem: ${semester}, SGPA: ${sgpa})`, "success");
        return res.status(201).json({
            success: true,
            message: "Student Added Successfully",
            student
        });
    }
    catch (err) {
        await (0, logService_1.LogActivity)(actorEmail.toLowerCase(), actorRole, "Student Creation Failed", "student", `Failed to add student ${name || ""}: ${err.message}`, "failure");
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
};
exports.addStudent = addStudent;
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
                message: "Client id, name, email, roll no, semester are required !",
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
                message: "Client id, institution name, and email are required !",
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
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.updateProfile = updateProfile;
