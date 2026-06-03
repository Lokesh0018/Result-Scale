"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteQuotationRequest = exports.UpdateQuotationRequestStatus = exports.GetQuotationRequests = exports.DeleteInquiry = exports.UpdateInquiryStatus = exports.GetInquiries = exports.UpdatePassword = exports.GetStudents = exports.DeleteClient = exports.UpdateClient = exports.AddClient = exports.GetDashboard = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
const QuotationRequest_1 = __importDefault(require("../models/QuotationRequest"));
const GetDashboard = async () => {
    return await Client_1.default.find().lean();
};
exports.GetDashboard = GetDashboard;
const AddClient = async (institutionName, email, password, portalExpiryDate, institutionType, logoUrl, isActive) => {
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
        institutionType: institutionType || "University",
        logoUrl: logoUrl || "",
        isActive: isActive !== undefined ? isActive : true,
    });
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
};
exports.AddClient = AddClient;
const UpdateClient = async (institutionName, oldEmail, email, password, portalExpiryDate, institutionType, logoUrl, isActive) => {
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
    if (institutionType !== undefined) {
        client.institutionType = institutionType;
    }
    if (logoUrl !== undefined) {
        client.logoUrl = logoUrl;
    }
    if (isActive !== undefined) {
        client.isActive = isActive;
    }
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
const GetInquiries = async () => {
    return await Inquiry_1.default.find().sort({ createdAt: -1 }).lean();
};
exports.GetInquiries = GetInquiries;
const UpdateInquiryStatus = async (id, status) => {
    const inquiry = await Inquiry_1.default.findById(id);
    if (!inquiry)
        throw new Error("Inquiry not found !");
    inquiry.status = status;
    await inquiry.save();
    return inquiry.toObject();
};
exports.UpdateInquiryStatus = UpdateInquiryStatus;
const DeleteInquiry = async (id) => {
    const inquiry = await Inquiry_1.default.findById(id);
    if (!inquiry)
        throw new Error("Inquiry not found !");
    await Inquiry_1.default.deleteOne({ _id: id });
    return inquiry.toObject();
};
exports.DeleteInquiry = DeleteInquiry;
const GetQuotationRequests = async () => {
    return await QuotationRequest_1.default.find().sort({ createdAt: -1 }).lean();
};
exports.GetQuotationRequests = GetQuotationRequests;
const UpdateQuotationRequestStatus = async (id, status) => {
    const request = await QuotationRequest_1.default.findById(id);
    if (!request)
        throw new Error("Quotation request not found !");
    request.status = status;
    await request.save();
    return request.toObject();
};
exports.UpdateQuotationRequestStatus = UpdateQuotationRequestStatus;
const DeleteQuotationRequest = async (id) => {
    const request = await QuotationRequest_1.default.findById(id);
    if (!request)
        throw new Error("Quotation request not found !");
    await QuotationRequest_1.default.deleteOne({ _id: id });
    return request.toObject();
};
exports.DeleteQuotationRequest = DeleteQuotationRequest;
