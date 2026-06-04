import Client from "../models/Client";
import Student from "../models/Student";
import { assertRollNoBelongsToServer } from "../utils/rollNo";

const normalizeEmail = (email: string) => email.toLowerCase();

export const findClientByIdentifier = async (identifier: string) => {
  if (!identifier) return null;

  const normalized = normalizeEmail(identifier);

  if (process.env.SERVER_TYPE === "railway") {
    try {
      const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
      const response = await fetch(`${renderUrl}/client/internal/lookup/${encodeURIComponent(normalized)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.client;
    } catch (error) {
      console.error("Error in railway findClientByIdentifier:", error);
      return null;
    }
  }

  return await Client.findOne({ email: normalized });
};

const buildDashboardFromStudents = (client: any, students: any[]) => {
  const totalStudents = students.length;
  const passingCount = students.filter((student) => Number(student.sgpa) >= 5.0).length;
  const excellenceCount = students.filter((student) => Number(student.sgpa) >= 9.0).length;
  const averageSgpa = totalStudents > 0
    ? students.reduce((sum, student) => sum + Number(student.sgpa || 0), 0) / totalStudents
    : 0;

  const distribution = students.reduce((acc, student) => {
    const sgpa = Number(student.sgpa || 0);
    if (sgpa >= 9.0) acc.excellent += 1;
    else if (sgpa >= 7.5) acc.verygood += 1;
    else if (sgpa >= 6.0) acc.good += 1;
    else acc.improvement += 1;
    return acc;
  }, { excellent: 0, verygood: 0, good: 0, improvement: 0 });

  const trendMap = new Map<number, { total: number; count: number }>();
  students.forEach((student) => {
    const semester = Number(student.semester);
    const current = trendMap.get(semester) || { total: 0, count: 0 };
    current.total += Number(student.sgpa || 0);
    current.count += 1;
    trendMap.set(semester, current);
  });

  const trends = Array.from(trendMap.entries())
    .map(([semester, value]) => ({ semester, avg: value.count ? value.total / value.count : 0 }))
    .sort((a, b) => a.semester - b.semester);

  const recentStudents = [...students]
    .sort((a, b) => `${b._id || ""}`.localeCompare(`${a._id || ""}`))
    .slice(0, 3);

  return {
    client,
    stats: {
      totalStudents,
      averageSgpa,
      passingRate: totalStudents > 0 ? Math.floor((passingCount / totalStudents) * 100) : 0,
      excellenceRate: totalStudents > 0 ? Math.floor((excellenceCount / totalStudents) * 100) : 0,
    },
    distribution,
    trends,
    recentStudents,
  };
};

export const GetDashboard = async (identifier: string) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");

  const clientEmail = normalizeEmail(client.email || identifier);
  const students = await Student.find({ clientEmail }).lean();
  return buildDashboardFromStudents(client, students);
};

export const AddStudent = async (identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
  assertRollNoBelongsToServer(rollNo);
  const normalizedEmail = normalizeEmail(email);
  const normalizedClientEmail = normalizeEmail(identifier);

  const existingStudent = await Student.findOne({ email: normalizedEmail });
  if (existingStudent) throw new Error(`Already Exists with Email ${normalizedEmail}`);

  const client = await findClientByIdentifier(normalizedClientEmail);
  if (!client) throw new Error("Client not found !");

  const existingRollNo = await Student.findOne({ rollNo, clientEmail: normalizedClientEmail });
  if (existingRollNo) throw new Error(`Already Exists with Roll Number ${rollNo}`);

  const student = await Student.create({
    clientEmail: normalizedClientEmail,
    name,
    email: normalizedEmail,
    rollNo,
    institutionName: client.institutionName,
    semester,
    sgpa,
  });

  if (process.env.SERVER_TYPE !== "railway") {
    await Client.findOneAndUpdate({ email: normalizedClientEmail }, { $inc: { students: 1 } });
  }

  return student;
};

export const UpdateStudent = async (oldEmail: string, identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
  assertRollNoBelongsToServer(rollNo);
  const normalizedOldEmail = normalizeEmail(oldEmail);
  const normalizedEmail = normalizeEmail(email);
  const normalizedClientEmail = normalizeEmail(identifier);

  const client = await findClientByIdentifier(normalizedClientEmail);
  if (!client) throw new Error("Client not found !");

  const student = await Student.findOne({ email: normalizedOldEmail, clientEmail: normalizedClientEmail });
  if (!student) throw new Error("Student not found !");

  if (normalizedOldEmail !== normalizedEmail) {
    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent) throw new Error(`Already Exists with Email ${normalizedEmail}`);
  }

  if (student.rollNo !== rollNo) {
    const existingRollNo = await Student.findOne({ rollNo, clientEmail: normalizedClientEmail });
    if (existingRollNo) throw new Error(`Already Exists with Roll Number ${rollNo}`);
  }

  student.name = name;
  student.email = normalizedEmail;
  student.rollNo = rollNo;
  student.semester = semester;
  student.sgpa = sgpa;
  student.clientEmail = normalizedClientEmail;
  student.institutionName = client.institutionName;

  await student.save();
  return student;
};

export const DeleteStudent = async (email: string, identifier: string) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedClientEmail = normalizeEmail(identifier);

  const client = await findClientByIdentifier(normalizedClientEmail);
  if (!client) throw new Error("Client not found !");

  const existingStudent = await Student.findOne({ email: normalizedEmail, clientEmail: normalizedClientEmail });
  if (!existingStudent) throw new Error("Student not found !");

  assertRollNoBelongsToServer(existingStudent.rollNo);

  await Student.deleteOne({ email: normalizedEmail, clientEmail: normalizedClientEmail });

  if (process.env.SERVER_TYPE !== "railway") {
    await Client.findOneAndUpdate({ email: normalizedClientEmail }, { $inc: { students: -1 } });
  }

  return existingStudent;
};

export const GetStudents = async (identifier: string) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");

  const clientEmail = normalizeEmail(client.email || identifier);
  const students = await Student.find({ clientEmail }).lean();

  return {
    students,
    totalStudents: students.length,
    totalPages: 1,
    currentPage: 1,
  };
};

export const UpdatePassword = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const client = await Client.findOne({ email: normalizedEmail });
  if (!client) throw new Error("Client not found !");
  client.password = password;
  await client.save();
  const { password: _password, ...clientDto } = client.toObject();
  return { ...clientDto, _id: client._id.toString() };
};

export const UpdateProfile = async (identifier: string, institutionName: string, email: string, password?: string) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");

  const normalizedOldEmail = normalizeEmail(client.email || identifier);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedOldEmail !== normalizedEmail) {
    const existingClient = await Client.findOne({ email: normalizedEmail });
    if (existingClient) throw new Error(`Already Exists with Email ${normalizedEmail}`);
  }

  client.institutionName = institutionName;
  client.email = normalizedEmail;
  if (password) client.password = password;
  await client.save();

  await Student.updateMany({ clientEmail: normalizedOldEmail }, { institutionName, clientEmail: normalizedEmail });

  try {
    const railwayUrl = process.env.RAILWAY_API_URL || "http://localhost:3000";
    await fetch(`${railwayUrl}/client/internal/update-students-institution/${encodeURIComponent(normalizedOldEmail)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institutionName, clientEmail: normalizedEmail }),
    });
  } catch (err) {
    console.error("Failed to propagate institution/client email update to Railway:", err);
  }

  const { password: _password, ...clientDto } = client.toObject();
  return { ...clientDto, _id: client._id.toString() };
};
