"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfile = exports.UpdatePassword = exports.GetStudents = exports.DeleteStudent = exports.UpdateStudent = exports.AddStudent = exports.GetDashboard = exports.findClientByIdentifier = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const rollNo_1 = require("../utils/rollNo");
const normalizeEmail = (email) => email.toLowerCase();
const findClientByIdentifier = async (identifier) => {
    if (!identifier)
        return null;
    const normalized = normalizeEmail(identifier);
    if (process.env.SERVER_TYPE === "railway") {
        try {
            const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
            const response = await fetch(`${renderUrl}/client/internal/lookup/${encodeURIComponent(normalized)}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            return data.client;
        }
        catch (error) {
            console.error("Error in railway findClientByIdentifier:", error);
            return null;
        }
    }
    return await Client_1.default.findOne({ email: normalized });
};
exports.findClientByIdentifier = findClientByIdentifier;
const buildDashboardFromStudents = (client, students) => {
    const totalStudents = students.length;
    const passingCount = students.filter((student) => Number(student.sgpa) >= 5.0).length;
    const excellenceCount = students.filter((student) => Number(student.sgpa) >= 9.0).length;
    const averageSgpa = totalStudents > 0
        ? students.reduce((sum, student) => sum + Number(student.sgpa || 0), 0) / totalStudents
        : 0;
    const distribution = students.reduce((acc, student) => {
        const sgpa = Number(student.sgpa || 0);
        if (sgpa >= 9.0)
            acc.excellent += 1;
        else if (sgpa >= 7.5)
            acc.verygood += 1;
        else if (sgpa >= 6.0)
            acc.good += 1;
        else
            acc.improvement += 1;
        return acc;
    }, { excellent: 0, verygood: 0, good: 0, improvement: 0 });
    const trendMap = new Map();
    students.forEach((student) => {
        const semester = Number(student.semester);
        const current = trendMap.get(semester) || { total: 0, count: 0 };
        current.total += Number(student.sgpa || 0);
        current.count += 1;
        trendMap.set(semester, current);
    });
    const trends = Array.from(trendMap.entries())
        .map(([semester, value]) => ({ semester, avg: value.count ? value.total / value.count : 0 }))
        .sort((a, b) => a.semester - b.semester);
    const recentStudents = [...students]
        .sort((a, b) => `${b._id || ""}`.localeCompare(`${a._id || ""}`))
        .slice(0, 3);
    return {
        client,
        stats: {
            totalStudents,
            averageSgpa,
            passingRate: totalStudents > 0 ? Math.floor((passingCount / totalStudents) * 100) : 0,
            excellenceRate: totalStudents > 0 ? Math.floor((excellenceCount / totalStudents) * 100) : 0,
        },
        distribution,
        trends,
        recentStudents,
    };
};
const GetDashboard = async (identifier) => {
    const client = await (0, exports.findClientByIdentifier)(identifier);
    if (!client)
        throw new Error("Client not found !");
    const clientEmail = normalizeEmail(client.email || identifier);
    const students = await Student_1.default.find({ clientEmail }).lean();
    return buildDashboardFromStudents(client, students);
};
exports.GetDashboard = GetDashboard;
const AddStudent = async (identifier, name, email, rollNo, semester, sgpa) => {
    (0, rollNo_1.assertRollNoBelongsToServer)(rollNo);
    const normalizedEmail = normalizeEmail(email);
    const normalizedClientEmail = normalizeEmail(identifier);
    const existingStudent = await Student_1.default.findOne({ email: normalizedEmail });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${normalizedEmail}`);
    const client = await (0, exports.findClientByIdentifier)(normalizedClientEmail);
    if (!client)
        throw new Error("Client not found !");
    const existingRollNo = await Student_1.default.findOne({ rollNo, clientEmail: normalizedClientEmail });
    if (existingRollNo)
        throw new Error(`Already Exists with Roll Number ${rollNo}`);
    const student = await Student_1.default.create({
        clientEmail: normalizedClientEmail,
        name,
        email: normalizedEmail,
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    if (process.env.SERVER_TYPE === "railway") {
        try {
            const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
            await fetch(`${renderUrl}/client/internal/update-student-count/${encodeURIComponent(normalizedClientEmail)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ increment: 1 }),
            });
        }
        catch (err) {
            console.error("Failed to update student count on Render:", err);
        }
    }
    else {
        await Client_1.default.findOneAndUpdate({ email: normalizedClientEmail }, { $inc: { students: 1 } });
    }
    return student;
};
exports.AddStudent = AddStudent;
const UpdateStudent = async (oldEmail, identifier, name, email, rollNo, semester, sgpa) => {
    (0, rollNo_1.assertRollNoBelongsToServer)(rollNo);
    const normalizedOldEmail = normalizeEmail(oldEmail);
    const normalizedEmail = normalizeEmail(email);
    const normalizedClientEmail = normalizeEmail(identifier);
    const client = await (0, exports.findClientByIdentifier)(normalizedClientEmail);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student_1.default.findOne({ email: normalizedOldEmail, clientEmail: normalizedClientEmail });
    if (!student)
        throw new Error("Student not found !");
    if (normalizedOldEmail !== normalizedEmail) {
        const existingStudent = await Student_1.default.findOne({ email: normalizedEmail });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }
    if (student.rollNo !== rollNo) {
        const existingRollNo = await Student_1.default.findOne({ rollNo, clientEmail: normalizedClientEmail });
        if (existingRollNo)
            throw new Error(`Already Exists with Roll Number ${rollNo}`);
    }
    student.name = name;
    student.email = normalizedEmail;
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;
    student.clientEmail = normalizedClientEmail;
    student.institutionName = client.institutionName;
    await student.save();
    return student;
};
exports.UpdateStudent = UpdateStudent;
const DeleteStudent = async (email, identifier) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedClientEmail = normalizeEmail(identifier);
    const client = await (0, exports.findClientByIdentifier)(normalizedClientEmail);
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student_1.default.findOne({ email: normalizedEmail, clientEmail: normalizedClientEmail });
    if (!existingStudent)
        throw new Error("Student not found !");
    (0, rollNo_1.assertRollNoBelongsToServer)(existingStudent.rollNo);
    await Student_1.default.deleteOne({ email: normalizedEmail, clientEmail: normalizedClientEmail });
    if (process.env.SERVER_TYPE === "railway") {
        try {
            const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
            await fetch(`${renderUrl}/client/internal/update-student-count/${encodeURIComponent(normalizedClientEmail)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ increment: -1 }),
            });
        }
        catch (err) {
            console.error("Failed to update student count on Render:", err);
        }
    }
    else {
        await Client_1.default.findOneAndUpdate({ email: normalizedClientEmail }, { $inc: { students: -1 } });
    }
    return existingStudent;
};
exports.DeleteStudent = DeleteStudent;
const GetStudents = async (identifier) => {
    const client = await (0, exports.findClientByIdentifier)(identifier);
    if (!client)
        throw new Error("Client not found !");
    const clientEmail = normalizeEmail(client.email || identifier);
    const students = await Student_1.default.find({ clientEmail }).lean();
    return {
        students,
        totalStudents: students.length,
        totalPages: 1,
        currentPage: 1,
    };
};
exports.GetStudents = GetStudents;
const UpdatePassword = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    const client = await Client_1.default.findOne({ email: normalizedEmail });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return { ...clientDto, _id: client._id.toString() };
};
exports.UpdatePassword = UpdatePassword;
const UpdateProfile = async (identifier, institutionName, email, password) => {
    const client = await (0, exports.findClientByIdentifier)(identifier);
    if (!client)
        throw new Error("Client not found !");
    const normalizedOldEmail = normalizeEmail(client.email || identifier);
    const normalizedEmail = normalizeEmail(email);
    if (normalizedOldEmail !== normalizedEmail) {
        const existingClient = await Client_1.default.findOne({ email: normalizedEmail });
        if (existingClient)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }
    client.institutionName = institutionName;
    client.email = normalizedEmail;
    if (password)
        client.password = password;
    await client.save();
    await Student_1.default.updateMany({ clientEmail: normalizedOldEmail }, { institutionName, clientEmail: normalizedEmail });
    try {
        const railwayUrl = process.env.RAILWAY_API_URL || "http://localhost:3000";
        await fetch(`${railwayUrl}/client/internal/update-students-institution/${encodeURIComponent(normalizedOldEmail)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ institutionName, clientEmail: normalizedEmail }),
        });
    }
    catch (err) {
        console.error("Failed to propagate institution/client email update to Railway:", err);
    }
    const { password: _password, ...clientDto } = client.toObject();
    return { ...clientDto, _id: client._id.toString() };
};
exports.UpdateProfile = UpdateProfile;
