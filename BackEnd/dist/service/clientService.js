"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfile = exports.UpdatePassword = exports.GetStudents = exports.DeleteStudent = exports.UpdateStudent = exports.AddStudent = exports.GetDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const GetDashboard = async (clientId) => {
    const students = await Student_1.default.find({
        clientId: new mongoose_1.default.Types.ObjectId(clientId)
    }).lean();
    const client = await Client_1.default.findById(clientId).lean();
    return {
        students,
        client
    };
};
exports.GetDashboard = GetDashboard;
const AddStudent = async (clientId, name, email, rollNo, semester, sgpa) => {
    const existingStudent = await Student_1.default.findOne({ email });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await Client_1.default.findById(clientId);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student_1.default.create({
        clientId,
        name,
        email,
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    await Client_1.default.findByIdAndUpdate(clientId, { $inc: { students: 1 } });
    return student;
};
exports.AddStudent = AddStudent;
const UpdateStudent = async (oldEmail, clientId, name, email, rollNo, semester, sgpa) => {
    const student = await Student_1.default.findOne({ email: oldEmail, clientId });
    if (!student)
        throw new Error("Student not found !");
    if (oldEmail !== email) {
        const existingStudent = await Student_1.default.findOne({ email });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${email}`);
    }
    student.name = name;
    student.email = email;
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;
    await student.save();
    return student;
};
exports.UpdateStudent = UpdateStudent;
const DeleteStudent = async (email, clientId) => {
    const existingStudent = await Student_1.default.findOne({ email, clientId });
    if (!existingStudent)
        throw new Error("Student not found !");
    await Student_1.default.deleteOne({
        email,
        clientId
    });
    await Client_1.default.findByIdAndUpdate(clientId, { $inc: { students: -1 } });
    return existingStudent;
};
exports.DeleteStudent = DeleteStudent;
const GetStudents = async (clientId) => {
    return await Student_1.default.find({ clientId }).lean();
};
exports.GetStudents = GetStudents;
const UpdatePassword = async (email, password) => {
    const client = await Client_1.default.findOne({ email });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdatePassword = UpdatePassword;
const UpdateProfile = async (clientId, institutionName, email, password) => {
    const client = await Client_1.default.findById(clientId);
    if (!client)
        throw new Error("Client not found !");
    if (client.email !== email) {
        const existingClient = await Client_1.default.findOne({ email });
        if (existingClient)
            throw new Error(`Already Exists with Email ${email}`);
    }
    client.institutionName = institutionName;
    client.email = email;
    if (password) {
        client.password = password;
    }
    await client.save();
    await Student_1.default.updateMany({ clientId }, { institutionName });
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdateProfile = UpdateProfile;
