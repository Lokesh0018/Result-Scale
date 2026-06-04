import express from "express";
import { login } from "../controller/loginController";
import { getDashboard, addStudent, bulkUploadStudents, updateStudent, deleteStudent, getStudents, updatePassword, updateProfile } from "../controller/clientController";
import { findClientByIdentifier, StudentExists } from "../service/clientService";
import { verifyLogin } from "../service/loginService";
import Client from "../models/Client";
import Student from "../models/Student";

export const router = express.Router();
router.post("/login", login);

router.get("/dashboard/:clientEmail", getDashboard);
router.post("/students", addStudent);
router.post("/students/bulk", bulkUploadStudents);
router.put("/students/:email", updateStudent);
router.delete("/students/:email", deleteStudent);

router.get("/students/:clientEmail", getStudents);

router.patch("/password/:email", updatePassword);
router.put("/profile/:clientEmail", updateProfile);

router.get("/internal/lookup/:identifier", async (req: express.Request, res: express.Response) => {
  try {
    const { identifier } = req.params;
    const client = await findClientByIdentifier(identifier as string);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });
    return res.status(200).json({ success: true, client });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/internal/student-exists", async (req: express.Request, res: express.Response) => {
  try {
    const clientEmail = req.query.clientEmail as string;
    const email = req.query.email as string | undefined;
    const rollNo = req.query.rollNo as string | undefined;

    if (!clientEmail) {
      return res.status(400).json({ success: false, message: "clientEmail is required", error: {} });
    }

    const exists = await StudentExists(clientEmail, email, rollNo);
    return res.status(200).json({
      success: true,
      message: "Student existence checked successfully",
      data: { exists },
      exists,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, error: { message: err.message } });
  }
});

router.post("/internal/verify-login", async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, role } = req.body;
    const user = await verifyLogin(email, password, role);
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/internal/update-student-count/:clientEmail", async (req: express.Request, res: express.Response) => {
  try {
    const clientEmail = req.params.clientEmail as string;
    const { increment } = req.body;
    const client = await Client.findOneAndUpdate(
      { email: clientEmail.toLowerCase() },
      { $inc: { students: increment } },
      { new: true }
    );
    return res.status(200).json({ success: true, client });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/internal/update-students-institution/:clientEmail", async (req: express.Request, res: express.Response) => {
  try {
    const clientEmail = req.params.clientEmail as string;
    const { institutionName, clientEmail: newClientEmail } = req.body;
    await Student.updateMany(
      { clientEmail: clientEmail.toLowerCase() },
      { institutionName, ...(newClientEmail ? { clientEmail: newClientEmail.toLowerCase() } : {}) }
    );
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/internal/delete-students/:clientEmail", async (req: express.Request, res: express.Response) => {
  try {
    const clientEmail = req.params.clientEmail as string;
    await Student.deleteMany({ clientEmail: clientEmail.toLowerCase() });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/internal/migrate-client-ids", async (req: express.Request, res: express.Response) => {
  try {
    if (process.env.SERVER_TYPE !== "railway") {
      return res.status(400).json({ success: false, message: "Migration must be run on the Railway server." });
    }

    // 1. Fetch all local clients on Railway (legacy)
    const localClients = await Client.find().lean();
    
    let migratedCount = 0;
    const details = [];

    for (const localClient of localClients) {
      const email = localClient.email.toLowerCase();
      // Update all students pointing to localClient._id to use clientEmail using raw collection to bypass Mongoose schema restrictions
      const updateResult = await Student.collection.updateMany(
        {
          $or: [
            { clientId: localClient._id },
            { clientId: localClient._id.toString() }
          ]
        },
        {
          $set: { clientEmail: email },
          $unset: { clientId: "" }
        }
      );
      
      details.push({
        email,
        clientId: localClient._id,
        updatedStudents: updateResult.modifiedCount
      });
      
      migratedCount++;
    }

    // 2. Purge client records on Railway
    const deleteResult = await Client.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `Successfully migrated ${migratedCount} clients' student records and purged Railway client collection.`,
      migratedClientsCount: migratedCount,
      purgedLocalClientsCount: deleteResult.deletedCount,
      details
    });
  } catch (err: any) {
    console.error("Migration error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
