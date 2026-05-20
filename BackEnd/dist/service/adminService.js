"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePassword = exports.GetStudents = exports.DeleteClient = exports.UpdateClient = exports.AddClient = exports.GetDashboard = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const GetDashboard = async () => {
    return await Client_1.default.find().lean();
};
exports.GetDashboard = GetDashboard;
const AddClient = async (institutionName, email, password, portalExpiryDate) => {
    const existingClient = await Client_1.default.findOne({ email });
    if (existingClient)
        throw new Error(`Already Exists with Email ${email}`);
    if (portalExpiryDate.getTime() < Date.now())
        throw new Error("Date was Expired !");
    const client = await Client_1.default.create({
        email,
        password,
        role: "client",
        institutionName,
        students: 0,
        portalExpiryDate,
    });
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.AddClient = AddClient;
const UpdateClient = async (institutionName, oldEmail, email, password, portalExpiryDate) => {
    const client = await Client_1.default.findOne({ email: oldEmail });
    if (!client)
        throw new Error("Client not found !");
    if (oldEmail !== email) {
        const existingClient = await Client_1.default.findOne({ email });
        if (existingClient)
            throw new Error(`Already Exists with Email ${email}`);
    }
    if (portalExpiryDate.getTime() < Date.now())
        throw new Error("Date was Expired !");
    client.email = email;
    client.password = password;
    client.institutionName = institutionName;
    client.portalExpiryDate = portalExpiryDate;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.UpdateClient = UpdateClient;
const DeleteClient = async (email) => {
    const existingClient = await Client_1.default.findOne({ email });
    if (!existingClient)
        throw new Error("Client not found !");
    await Client_1.default.deleteOne({ email });
    await Student_1.default.deleteMany({ clientId: existingClient.id });
    const { password: _password, ...clientDto } = existingClient.toObject();
    return clientDto;
};
exports.DeleteClient = DeleteClient;
const GetStudents = async () => {
    return await Student_1.default.find().lean();
};
exports.GetStudents = GetStudents;
const UpdatePassword = async (email, password) => {
    const admin = await Admin_1.default.findOne({ email });
    if (!admin)
        throw new Error("Admin not found !");
    admin.password = password;
    await admin.save();
    const { password: _password, ...adminDto } = admin.toObject();
    return adminDto;
};
exports.UpdatePassword = UpdatePassword;
