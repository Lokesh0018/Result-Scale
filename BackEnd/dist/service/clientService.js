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
    return await Client_1.default.findOne({
        $or: [
            { email: identifier },
            ...(mongoose_1.default.Types.ObjectId.isValid(identifier) ? [{ _id: new mongoose_1.default.Types.ObjectId(identifier) }] : [])
        ]
    });
};
const GetDashboard = async (identifier) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const students = await Student_1.default.find({
        clientId: client._id
    }).lean();
    return {
        students,
        client
    };
};
exports.GetDashboard = GetDashboard;
const AddStudent = async (identifier, name, email, rollNo, semester, sgpa) => {
    const existingStudent = await Student_1.default.findOne({ email });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student_1.default.create({
        clientEmail: identifier,
        name,
        email,
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
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student_1.default.findOne({ email: oldEmail, clientId: client._id });
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
const DeleteStudent = async (email, identifier) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student_1.default.findOne({ email, clientId: client._id });
    if (!existingStudent)
        throw new Error("Student not found !");
    await Student_1.default.deleteOne({
        email,
        clientId: client._id
    });
    await Client_1.default.findByIdAndUpdate(client._id, { $inc: { students: -1 } });
    return existingStudent;
};
exports.DeleteStudent = DeleteStudent;
const GetStudents = async (identifier) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    return await Student_1.default.find({ clientId: client._id }).lean();
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
const UpdateProfile = async (identifier, institutionName, email, password) => {
    const client = await findClientByIdentifier(identifier);
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
    await Student_1.default.updateMany({ clientId: client._id }, { institutionName });
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdateProfile = UpdateProfile;
