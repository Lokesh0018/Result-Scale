import mongoose from "mongoose";
import Client from "../models/Client";
import Student from "../models/Student";

const findClientByIdentifier = async (identifier: string) => {
  if (!identifier) return null;
  return await Client.findOne({
    $or: [
      { email: identifier },
      ...(mongoose.Types.ObjectId.isValid(identifier) ? [{ _id: new mongoose.Types.ObjectId(identifier) }] : [])
    ]
  });
};

export const GetDashboard = async (identifier: string) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");
  const students = await Student.find({
    clientEmail: client.email
  }).lean();
  return {
    students,
    client
  };
};

export const AddStudent = async (identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.create({
        clientEmail: identifier,
        name,
        email: email.toLowerCase(),
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    await Client.findByIdAndUpdate(client._id, { $inc: { students: 1 } });
    return student;
}

export const UpdateStudent = async (oldEmail: string, identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.findOne({ email: oldEmail.toLowerCase(), clientEmail: client.email });

    if (!student)
        throw new Error("Student not found !");

    if (oldEmail.toLowerCase() !== email.toLowerCase()) {
        const existingStudent = await Student.findOne({ email: email.toLowerCase() });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${email}`);
    }

    student.name = name;
    student.email = email.toLowerCase();
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;

    await student.save();

    return student;
}

export const DeleteStudent = async (email: string, identifier: string) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student.findOne({ email: email.toLowerCase(), clientEmail: client.email });
    if (!existingStudent)
        throw new Error("Student not found !");

    await Student.deleteOne({
        email: email.toLowerCase(),
        clientEmail: client.email
    });

    await Client.findByIdAndUpdate(client._id, { $inc: { students: -1 } });

    return existingStudent;
}

export const GetStudents = async (identifier: string) => {
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    return await Student.find({ clientEmail: client.email }).lean();
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

export const UpdateProfile = async (identifier: string, institutionName: string, email: string, password?: string) => {
    const client = await findClientByIdentifier(identifier);
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
    
    await Student.updateMany({ clientEmail: client.email }, { institutionName });

    const { password: _password, ...clientDto } = client.toObject();
    return clientDto;
}