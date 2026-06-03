import mongoose from "mongoose";
import Client from "../models/Client";
import Student from "../models/Student";

export const GetDashboard = async (clientEmail: string) => {
  const client = await Client.findOne({ email: clientEmail }).lean();
  if (!client) throw new Error("Client not found !");
  const students = await Student.find({
    clientId: client._id
  }).lean();
  return {
    students,
    client
  };
};

export const AddStudent = async (clientEmail: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await Client.findOne({ email: clientEmail });
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.create({
        clientId: client._id,
        name,
        email,
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    await Client.findByIdAndUpdate(client._id, { $inc: { students: 1 } });
    return student;
}

export const UpdateStudent = async (oldEmail: string, clientEmail: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const client = await Client.findOne({ email: clientEmail });
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.findOne({ email: oldEmail, clientId: client._id });

    if (!student)
        throw new Error("Student not found !");

    if (oldEmail !== email) {
        const existingStudent = await Student.findOne({ email });
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
}

export const DeleteStudent = async (email: string, clientEmail: string) => {
    const client = await Client.findOne({ email: clientEmail });
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student.findOne({ email, clientId: client._id });
    if (!existingStudent)
        throw new Error("Student not found !");

    await Student.deleteOne({
        email,
        clientId: client._id
    });

    await Client.findByIdAndUpdate(client._id, { $inc: { students: -1 } });

    return existingStudent;
}

export const GetStudents = async (clientEmail: string) => {
    const client = await Client.findOne({ email: clientEmail });
    if (!client)
        throw new Error("Client not found !");
    return await Student.find({ clientId: client._id }).lean();
}

export const UpdatePassword = async (email: string, password: string) => {
    const client = await Client.findOne({ email });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}

export const UpdateProfile = async (clientEmail: string, institutionName: string, email: string, password?: string) => {
    const client = await Client.findOne({ email: clientEmail });
    if (!client)
        throw new Error("Client not found !");
    
    if (client.email !== email) {
        const existingClient = await Client.findOne({ email });
        if (existingClient)
            throw new Error(`Already Exists with Email ${email}`);
    }

    client.institutionName = institutionName;
    client.email = email;
    if (password) {
        client.password = password;
    }
    await client.save();
    
    await Student.updateMany({ clientId: client._id }, { institutionName });

    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}