import Admin from "../models/Admin";
import Client from "../models/Client";
import Student from "../models/Student";
import Inquiry from "../models/Inquiry";
import QuotationRequest from "../models/QuotationRequest";
import { env } from "../config/env";

export const GetDashboard = async () => {
    return await Client.find().lean();
}

export const AddClient = async (
    institutionName: string,
    email: string,
    password: string,
    portalExpiryDate: Date,
    institutionType?: string,
    logoUrl?: string,
    isActive?: boolean
) => {
    const normalizedEmail = email.toLowerCase();
    const existingClient = await Client.findOne({ email: normalizedEmail });

    if (existingClient)
        throw new Error(`Already Exists with Email ${normalizedEmail}`);

    if (isNaN(portalExpiryDate.getTime()))
        throw new Error("Invalid portal expiry date !");

    // Allow setting the expiry date to today by comparing against the start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (portalExpiryDate.getTime() < startOfToday.getTime())
        throw new Error("Date was Expired !");

    const client = await Client.create({
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
}

export const UpdateClient = async (
    institutionName: string,
    oldEmail: string,
    email: string,
    password: string,
    portalExpiryDate: Date,
    institutionType?: string,
    logoUrl?: string,
    isActive?: boolean
) => {
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const client = await Client.findOne({ email: normalizedOldEmail });
    if (!client)
        throw new Error("Client not found !");
    
    if (normalizedOldEmail !== normalizedEmail) {
        const existingClient = await Client.findOne({ email: normalizedEmail });
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
}

export const DeleteClient = async (email: string) => {
    const normalizedEmail = email.toLowerCase();
    const existingClient = await Client.findOne({ email: normalizedEmail });
    if (!existingClient)
        throw new Error("Client not found !");
    
    // Delete Client from Firestore (local on Render)
    await Client.deleteOne({ email: normalizedEmail });

    // Delete odd students locally on Render and even students on Railway using Promise.all
    try {
        await Promise.all([
            Student.deleteMany({ clientEmail: normalizedEmail }),
            fetch(`${env.railwayApiUrl}/client/internal/delete-students/${normalizedEmail}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }).then(async (res) => {
                if (!res.ok) {
                    console.error(`Railway deletion failed: ${res.statusText}`);
                }
            })
        ]);
    } catch (err) {
        console.error("Error deleting client students across databases:", err);
    }

    const { password: _password, ...clientDto } = existingClient.toObject();
    return {
        ...clientDto,
        _id: existingClient._id.toString()
    };
}

export const GetStudents = async () => {
    return await Student.find().lean();
}

export const UpdatePassword = async (email: string, password: string) => {
    const admin = await Admin.findOne({ email });
    if (!admin)
        throw new Error("Admin not found !");
    admin.password = password;
    await admin.save();
    const { password: _password, ...adminDto } = admin.toObject();
    return adminDto;
}

export const GetInquiries = async () => {
    return await Inquiry.find().sort({ createdAt: -1 }).lean();
}

export const UpdateInquiryStatus = async (id: string, status: 'unread' | 'read') => {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry)
        throw new Error("Inquiry not found !");
    inquiry.status = status;
    await inquiry.save();
    return inquiry.toObject();
}

export const DeleteInquiry = async (id: string) => {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry)
        throw new Error("Inquiry not found !");
    await Inquiry.deleteOne({ _id: id });
    return inquiry.toObject();
}

export const GetQuotationRequests = async () => {
    return await QuotationRequest.find().sort({ createdAt: -1 }).lean();
}

export const UpdateQuotationRequestStatus = async (id: string, status: 'Pending' | 'Under Review' | 'Contacted' | 'Quotation Sent' | 'Approved' | 'Rejected') => {
    const request = await QuotationRequest.findById(id);
    if (!request)
        throw new Error("Quotation request not found !");
    request.status = status;
    await request.save();
    return request.toObject();
}

export const DeleteQuotationRequest = async (id: string) => {
    const request = await QuotationRequest.findById(id);
    if (!request)
        throw new Error("Quotation request not found !");
    await QuotationRequest.deleteOne({ _id: id });
    return request.toObject();
}
