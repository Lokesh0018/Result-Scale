import mongoose from "mongoose";
import Client from "../models/Client";
import Student from "../models/Student";

export const GetDashboard = async (clientId: string) => {
  const students = await Student.find({
    clientId: new mongoose.Types.ObjectId(clientId)
  }).lean();
  const client = await Client.findById(clientId).lean();
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

export const AddStudent = async (clientId: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await Client.findById(clientId);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.create({
        clientId,
        name,
        email: normalizedEmail,
        rollNo,
        institutionName:client.institutionName,
        semester,
        sgpa,
    });
    await Client.findByIdAndUpdate(clientId, { $inc: { students: 1 } });
    return student;
}

export const UpdateStudent = async (oldEmail: string, clientId: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const student = await Student.findOne({ email: oldEmail, clientId });

    if (!student)
        throw new Error("Student not found !");

    if (normalizedOldEmail !== normalizedEmail) {
        const existingStudent = await Student.findOne({ email: normalizedEmail });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }

    student.name = name;
    student.email = normalizedEmail;
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;

    await student.save();

    return student;
}

export const DeleteStudent = async (email: string, clientId: string) => {
    const existingStudent = await Student.findOne({ email, clientId });
    if (!existingStudent)
        throw new Error("Student not found !");

    await Student.deleteOne({
        email,
        clientId
    });

    await Client.findByIdAndUpdate(clientId, { $inc: { students: -1 } });

    return existingStudent;
}

export const GetStudents = async (clientId: string) => {
    return await Student.find({ clientId }).lean();
}

export const UpdatePassword = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    const client = await Client.findOne({ email: normalizedEmail });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}

export const UpdateProfile = async (clientId: string, institutionName: string, email: string, password?: string) => {
    const client = await Client.findById(clientId);
    if (!client)
        throw new Error("Client not found !");
    
    const normalizedEmail = email.toLowerCase();
    if (client.email.toLowerCase() !== normalizedEmail) {
        const existingClient = await Client.findOne({ email: normalizedEmail });
        if (existingClient)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }

    client.institutionName = institutionName;
    client.email = normalizedEmail;
    if (password) {
        client.password = password;
    }
    await client.save();
    
    await Student.updateMany({ clientId }, { institutionName });

    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}