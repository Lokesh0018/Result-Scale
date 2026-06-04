import mongoose from "mongoose";
import Client from "../models/Client";
import Student from "../models/Student";

export const findClientByIdentifier = async (identifier: string) => {
  if (!identifier) return null;

  if (process.env.SERVER_TYPE === "railway") {
    try {
      const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
      const response = await fetch(`${renderUrl}/client/internal/lookup/${identifier}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.client;
    } catch (error) {
      console.error("Error in railway findClientByIdentifier:", error);
      return null;
    }
  }

  const normalized = identifier.toLowerCase();
  return await Client.findOne({
    $or: [
      { email: normalized },
      ...(mongoose.Types.ObjectId.isValid(identifier) ? [{ _id: new mongoose.Types.ObjectId(identifier) }] : [])
    ]
  });
};

export const GetDashboard = async (identifier: string) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");

  const totalStudents = await Student.countDocuments({ clientId: client._id });

  // Aggregations
  const statsResult = await Student.aggregate([
    { $match: { clientId: client._id } },
    {
      $group: {
        _id: null,
        averageSgpa: { $avg: "$sgpa" },
        passingCount: { $sum: { $cond: [{ $gte: ["$sgpa", 5.0] }, 1, 0] } },
        excellenceCount: { $sum: { $cond: [{ $gte: ["$sgpa", 9.0] }, 1, 0] } }
      }
    }
  ]);

  const stats = statsResult[0] || { averageSgpa: 0, passingCount: 0, excellenceCount: 0 };

  // SGPA Distribution Buckets
  const distributionResult = await Student.aggregate([
    { $match: { clientId: client._id } },
    {
      $group: {
        _id: null,
        excellent: { $sum: { $cond: [{ $gte: ["$sgpa", 9.0] }, 1, 0] } },
        verygood: { $sum: { $cond: [{ $and: [{ $gte: ["$sgpa", 7.5] }, { $lt: ["$sgpa", 9.0] }] }, 1, 0] } },
        good: { $sum: { $cond: [{ $and: [{ $gte: ["$sgpa", 6.0] }, { $lt: ["$sgpa", 7.5] }] }, 1, 0] } },
        improvement: { $sum: { $cond: [{ $lt: ["$sgpa", 6.0] }, 1, 0] } }
      }
    }
  ]);

  const distribution = distributionResult[0] || { excellent: 0, verygood: 0, good: 0, improvement: 0 };

  // Average SGPA Trend by Semester
  const trends = await Student.aggregate([
    { $match: { clientId: client._id } },
    {
      $group: {
        _id: "$semester",
        avg: { $avg: "$sgpa" }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        semester: "$_id",
        avg: 1
      }
    }
  ]);

  // Recent 3 students
  const recentStudents = await Student.find({ clientId: client._id })
    .sort({ _id: -1 })
    .limit(3)
    .lean();

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

export const AddStudent = async (identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const normalizedEmail = email.toLowerCase();
    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent)
        throw new Error(`Already Exists with Email ${normalizedEmail}`);
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");

    // Pre-check roll number uniqueness within the client's institution
    const existingRollNo = await Student.findOne({ rollNo, clientId: client._id });
    if (existingRollNo)
        throw new Error(`Already Exists with Roll Number ${rollNo}`);

    const student = await Student.create({
        clientId: client._id,
        name,
        email: normalizedEmail,
        rollNo,
        institutionName: client.institutionName,
        semester,
        sgpa,
    });
    if (process.env.SERVER_TYPE === "railway") {
        const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
        await fetch(`${renderUrl}/client/internal/update-student-count/${client._id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ increment: 1 })
        });
    } else {
        await Client.findByIdAndUpdate(client._id, { $inc: { students: 1 } });
    }
    return student;
}

export const UpdateStudent = async (oldEmail: string, identifier: string, name: string, email: string, rollNo: string, semester: number, sgpa: number) => {
    const normalizedOldEmail = oldEmail.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const student = await Student.findOne({ email: normalizedOldEmail, clientId: client._id });

    if (!student)
        throw new Error("Student not found !");

    if (normalizedOldEmail !== normalizedEmail) {
        const existingStudent = await Student.findOne({ email: normalizedEmail });
        if (existingStudent)
            throw new Error(`Already Exists with Email ${normalizedEmail}`);
    }

    if (student.rollNo !== rollNo) {
        // Pre-check roll number uniqueness if it is changing
        const existingRollNo = await Student.findOne({ rollNo, clientId: client._id });
        if (existingRollNo)
            throw new Error(`Already Exists with Roll Number ${rollNo}`);
    }

    student.name = name;
    student.email = normalizedEmail;
    student.rollNo = rollNo;
    student.semester = semester;
    student.sgpa = sgpa;

    await student.save();

    return student;
}

export const DeleteStudent = async (email: string, identifier: string) => {
    const normalizedEmail = email.toLowerCase();
    const client = await findClientByIdentifier(identifier);
    if (!client)
        throw new Error("Client not found !");
    const existingStudent = await Student.findOne({ email: normalizedEmail, clientId: client._id });
    if (!existingStudent)
        throw new Error("Student not found !");

    await Student.deleteOne({
        email: normalizedEmail,
        clientId: client._id
    });

    if (process.env.SERVER_TYPE === "railway") {
        const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
        await fetch(`${renderUrl}/client/internal/update-student-count/${client._id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ increment: -1 })
        });
    } else {
        await Client.findByIdAndUpdate(client._id, { $inc: { students: -1 } });
    }

    return existingStudent;
}

export const GetStudents = async (
  identifier: string,
  page?: number,
  limit?: number,
  search?: string,
  semester?: string,
  sgpaRange?: string,
  sortBy?: string,
  sortOrder?: string
) => {
  const client = await findClientByIdentifier(identifier);
  if (!client) throw new Error("Client not found !");

  const students = await Student.find({ clientId: client._id }).lean();

  return {
    students,
    totalStudents: students.length,
    totalPages: 1,
    currentPage: 1
  };
};

export const UpdatePassword = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    const client = await Client.findOne({ email: normalizedEmail });
    if (!client)
        throw new Error("Client not found !");
    client.password = password;
    await client.save();
    const { password: _password, ...clientDto } = client.toObject();
    return {
        ...clientDto,
        _id: client._id.toString()
    };
}

export const UpdateProfile = async (identifier: string, institutionName: string, email: string, password?: string) => {
    const client = await findClientByIdentifier(identifier);
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
    
    await Student.updateMany({ clientId: client._id }, { institutionName });

    // Propagate to Railway
    try {
        const railwayUrl = process.env.RAILWAY_API_URL || "http://localhost:3000";
        await fetch(`${railwayUrl}/client/internal/update-students-institution/${client._id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ institutionName })
        });
    } catch (err) {
        console.error("Failed to propagate institution name update to Railway:", err);
    }

    const { password: _password, ...clientDto } = client.toObject();
    return {
        ...clientDto,
        _id: client._id.toString()
    };
}