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
    const normalizedEmail = email.toLowerCase();
    const existingClient = await Client_1.default.findOne({ email: normalizedEmail });
    if (existingClient)
        throw new Error(`Already Exists with Email ${normalizedEmail}`);
    if (isNaN(portalExpiryDate.getTime()))
        throw new Error("Invalid portal expiry date !");
    // Allow setting the expiry date to today by comparing against the start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (portalExpiryDate.getTime() < startOfToday.getTime())
        throw new Error("Date was Expired !");
    const client = await Client_1.default.create({
        email: normalizedEmail,
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
    return {
        ...clientDto,
        _id: client._id.toString()
    };
};
exports.AddClient = AddClient;
const UpdateClient = async (institutionName, oldEmail, email, password, portalExpiryDate, institutionType, logoUrl, isActive) => {
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const client = await Client_1.default.findOne({ email: normalizedOldEmail });
    if (!client)
        throw new Error("Client not found !");
    if (normalizedOldEmail !== normalizedEmail) {
        const existingClient = await Client_1.default.findOne({ email: normalizedEmail });
        if (existingClient)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }
    if (isNaN(portalExpiryDate.getTime()))
        throw new Error("Invalid portal expiry date !");
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (portalExpiryDate.getTime() < startOfToday.getTime())
        throw new Error("Date was Expired !");
    client.email = normalizedEmail;
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
    return {
        ...clientDto,
        _id: client._id.toString()
    };
};
exports.UpdateClient = UpdateClient;
const DeleteClient = async (email) => {
    const normalizedEmail = email.toLowerCase();
    const existingClient = await Client_1.default.findOne({ email: normalizedEmail });
    if (!existingClient)
        throw new Error("Client not found !");
    const railwayUrl = process.env.RAILWAY_API_URL || "http://localhost:3000";
    await Promise.all([
        Client_1.default.deleteOne({ email: normalizedEmail }),
        Student_1.default.deleteMany({ clientEmail: normalizedEmail }),
        fetch(`${railwayUrl}/client/internal/delete-students/${encodeURIComponent(normalizedEmail)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }).catch((err) => {
            console.error("Failed to propagate student deletion to Railway:", err);
            return null;
        })
    ]);
    const { password: _password, ...clientDto } = existingClient.toObject();
    return {
        ...clientDto,
        _id: existingClient._id.toString()
    };
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
