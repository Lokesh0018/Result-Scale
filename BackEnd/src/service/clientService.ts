import Client from "../models/Client";
import Student from "../models/Student";

export const GetDashboard = async (clientId: string) => {
    return await Student.find({ clientId }).lean();
}

export const AddStudent = async (clientId: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${email}`);
    const client = await Client.findById(clientId);
    const student = await Student.create({
        clientId,
        name,
        email,
        rollNo,
        institutionName:client?.institutionName,
        semester,
        sgpa,
    })
    return student;
}

export const UpdateStudent = async (oldEmail: string, clientId: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const student = await Student.findOne({ email: oldEmail, clientId });

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

export const DeleteStudent = async (email: string, clientId: string) => {
    const existingStudent = await Student.findOne({ email, clientId });
    if (!existingStudent)
        throw new Error("Student not found !");

    await Student.deleteOne({
        email,
        clientId
    });

    return existingStudent;
}

export const GetStudents = async (clientId: string) => {
    return await Student.find({ clientId }).lean();
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