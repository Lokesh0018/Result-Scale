"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfile = exports.UpdatePassword = exports.GetStudents = exports.DeleteStudent = exports.UpdateStudent = exports.AddStudent = exports.GetDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const findClientByIdentifier = async (identifier) => {
    if (!identifier)
        return null;
    const normalized = identifier.toLowerCase();
    return await Client_1.default.findOne({
        $or: [
            { email: normalized },
            ...(mongoose_1.default.Types.ObjectId.isValid(identifier) ? [{ _id: new mongoose_1.default.Types.ObjectId(identifier) }] : [])
        ]
    });
};
const GetDashboard = async (identifier) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const totalStudents = await Student_1.default.countDocuments({ clientId: client._id });
    // Aggregations
    const statsResult = await Student_1.default.aggregate([
        { $match: { clientId: client._id } },
        {
            $group: {
                _id: null,
                averageSgpa: { $avg: "$sgpa" },
                passingCount: { $sum: { $cond: [{ $gte: ["$sgpa", 5.0] }, 1, 0] } },
                excellenceCount: { $sum: { $cond: [{ $gte: ["$sgpa", 9.0] }, 1, 0] } }
            }
        }
    ]);
    const stats = statsResult[0] || { averageSgpa: 0, passingCount: 0, excellenceCount: 0 };
    // SGPA Distribution Buckets
    const distributionResult = await Student_1.default.aggregate([
        { $match: { clientId: client._id } },
        {
            $group: {
                _id: null,
                excellent: { $sum: { $cond: [{ $gte: ["$sgpa", 9.0] }, 1, 0] } },
                verygood: { $sum: { $cond: [{ $and: [{ $gte: ["$sgpa", 7.5] }, { $lt: ["$sgpa", 9.0] }] }, 1, 0] } },
                good: { $sum: { $cond: [{ $and: [{ $gte: ["$sgpa", 6.0] }, { $lt: ["$sgpa", 7.5] }] }, 1, 0] } },
                improvement: { $sum: { $cond: [{ $lt: ["$sgpa", 6.0] }, 1, 0] } }
            }
        }
    ]);
    const distribution = distributionResult[0] || { excellent: 0, verygood: 0, good: 0, improvement: 0 };
    // Average SGPA Trend by Semester
    const trends = await Student_1.default.aggregate([
        { $match: { clientId: client._id } },
        {
            $group: {
                _id: "$semester",
                avg: { $avg: "$sgpa" }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                semester: "$_id",
                avg: 1
            }
        }
    ]);
    // Recent 3 students
    const recentStudents = await Student_1.default.find({ clientId: client._id })
        .sort({ _id: -1 })
        .limit(3)
        .lean();
    return {
        client,
        stats: {
            totalStudents,
            averageSgpa: stats.averageSgpa || 0,
            passingRate: totalStudents > 0 ? Math.floor((stats.passingCount / totalStudents) * 100) : 0,
            excellenceRate: totalStudents > 0 ? Math.floor((stats.excellenceCount / totalStudents) * 100) : 0
        },
        distribution,
        trends,
        recentStudents
    };
};
exports.GetDashboard = GetDashboard;
const AddStudent = async (identifier, name, email, rollNo, semester, sgpa) => {
    const normalizedEmail = email.toLowerCase();
    const existingStudent = await Student_1.default.findOne({ email: normalizedEmail });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${normalizedEmail}`);
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    // Pre-check roll number uniqueness within the client's institution
    const existingRollNo = await Student_1.default.findOne({ rollNo, clientId: client._id });
    if (existingRollNo)
        throw new Error(`Already Exists with Roll Number ${rollNo}`);
    const student = await Student_1.default.create({
        clientId: client._id,
        name,
        email: normalizedEmail,
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    await Client_1.default.findByIdAndUpdate(client._id, { $inc: { students: 1 } });
    return student;
};
exports.AddStudent = AddStudent;
const UpdateStudent = async (oldEmail, identifier, name, email, rollNo, semester, sgpa) => {
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student_1.default.findOne({ email: normalizedOldEmail, clientId: client._id });
    if (!student)
        throw new Error("Student not found !");
    if (normalizedOldEmail !== normalizedEmail) {
        const existingStudent = await Student_1.default.findOne({ email: normalizedEmail });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }
    if (student.rollNo !== rollNo) {
        // Pre-check roll number uniqueness if it is changing
        const existingRollNo = await Student_1.default.findOne({ rollNo, clientId: client._id });
        if (existingRollNo)
            throw new Error(`Already Exists with Roll Number ${rollNo}`);
    }
    student.name = name;
    student.email = normalizedEmail;
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;
    await student.save();
    return student;
};
exports.UpdateStudent = UpdateStudent;
const DeleteStudent = async (email, identifier) => {
    const normalizedEmail = email.toLowerCase();
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student_1.default.findOne({ email: normalizedEmail, clientId: client._id });
    if (!existingStudent)
        throw new Error("Student not found !");
    await Student_1.default.deleteOne({
        email: normalizedEmail,
        clientId: client._id
    });
    await Client_1.default.findByIdAndUpdate(client._id, { $inc: { students: -1 } });
    return existingStudent;
};
exports.DeleteStudent = DeleteStudent;
const GetStudents = async (identifier, page, limit, search, semester, sgpaRange, sortBy, sortOrder) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const students = await Student_1.default.find({ clientId: client._id }).lean();
    return {
        students,
        totalStudents: students.length,
        totalPages: 1,
        currentPage: 1
    };
};
exports.GetStudents = GetStudents;
const UpdatePassword = async (email, password) => {
    const normalizedEmail = email.toLowerCase();
    const client = await Client_1.default.findOne({ email: normalizedEmail });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdatePassword = UpdatePassword;
const UpdateProfile = async (identifier, institutionName, email, password) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const normalizedEmail = email.toLowerCase();
    if (client.email.toLowerCase() !== normalizedEmail) {
        const existingClient = await Client_1.default.findOne({ email: normalizedEmail });
        if (existingClient)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }
    client.institutionName = institutionName;
    client.email = normalizedEmail;
    if (password) {
        client.password = password;
    }
    await client.save();
    await Student_1.default.updateMany({ clientId: client._id }, { institutionName });
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdateProfile = UpdateProfile;
