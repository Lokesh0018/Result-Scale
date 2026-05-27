import Admin from "../models/Admin";
import Client from "../models/Client";
import Student from "../models/Student";
import Inquiry from "../models/Inquiry";

export const GetDashboard = async () => {
    return await Client.find().lean();
}

export const AddClient = async (institutionName: string, email: string, password: string, portalExpiryDate: Date) => {
    const existingClient = await Client.findOne({ email });

    if (existingClient)
        throw new Error(`Already Exists with Email ${email}`);

    if (portalExpiryDate.getTime() < Date.now())
        throw new Error("Date was Expired !");

    const client = await Client.create({
        email,
        password,
        role: "client",
        institutionName,
        students: 0,
        portalExpiryDate,
    });

    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}

export const UpdateClient = async (institutionName: string, oldEmail: string, email: string, password: string, portalExpiryDate: Date) => {
    const client = await Client.findOne({ email: oldEmail });
    if (!client)
        throw new Error("Client not found !");
    
    if (oldEmail !== email) {
        const existingClient = await Client.findOne({ email });
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
}

export const DeleteClient = async (email: string) => {
    const existingClient = await Client.findOne({ email });
    if (!existingClient)
        throw new Error("Client not found !");
    await Client.deleteOne({ email });
    await Student.deleteMany({clientId:existingClient.id});
    const { password: _password, ...clientDto } = existingClient.toObject();
    return clientDto;
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