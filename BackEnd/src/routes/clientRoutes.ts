import express from "express";
import mongoose from "mongoose";
import { login } from "../controller/loginController";
import { getDashboard, addStudent, updateStudent, deleteStudent, getStudents, updatePassword, updateProfile } from "../controller/clientController";
import { findClientByIdentifier } from "../service/clientService";
import { verifyLogin } from "../service/loginService";
import Client from "../models/Client";
import Student from "../models/Student";

export const router = express.Router();
router.post("/login", login);

router.get("/dashboard/:clientEmail", getDashboard);
router.post("/students", addStudent);
router.put("/students/:email", updateStudent);
router.delete("/students/:email", deleteStudent);

router.get("/students/:clientEmail", getStudents);

router.patch("/password/:email", updatePassword);
router.put("/profile/:clientEmail", updateProfile);

// Internal lookup endpoints for Railway -> Render
router.get("/internal/lookup/:identifier", async (req: express.Request, res: express.Response) => {
  try {
    const { identifier } = req.params;
    const client = await findClientByIdentifier(identifier as string);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    return res.status(200).json({ success: true, client });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
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

router.post("/internal/update-student-count/:clientId", async (req: express.Request, res: express.Response) => {
  try {
    const { clientId } = req.params;
    const { increment } = req.body;
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $inc: { students: increment } },
      { new: true }
    );
    return res.status(200).json({ success: true, client });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Internal endpoints for Render -> Railway propagation
router.post("/internal/update-students-institution/:clientId", async (req: express.Request, res: express.Response) => {
  try {
    const { clientId } = req.params;
    const { institutionName } = req.body;
    await Student.updateMany({ clientId }, { institutionName });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/internal/delete-students/:clientId", async (req: express.Request, res: express.Response) => {
  try {
    const { clientId } = req.params;
    await Student.deleteMany({ clientId });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Migration endpoint to update legacy student clientId references on Railway database
router.post("/internal/migrate-client-ids", async (req: express.Request, res: express.Response) => {
  try {
    if (process.env.SERVER_TYPE !== "railway") {
      return res.status(400).json({ success: false, message: "Migration must be run on the Railway server." });
    }

    const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
    
    // 1. Fetch all clients from Render
    const response = await fetch(`${renderUrl}/student/institutions`);
    if (!response.ok) {
      throw new Error("Failed to fetch client list from Render");
    }
    const renderRes = await response.json();
    const renderClients = renderRes.data || [];

    if (renderClients.length === 0) {
      return res.status(400).json({ success: false, message: "No clients found on Render to migrate to." });
    }

    // 2. Fetch all local clients on Railway (legacy)
    const localClients = await Client.find().lean();
    
    let migratedCount = 0;
    const details = [];

    for (const localClient of localClients) {
      const email = localClient.email.toLowerCase();
      // Find the corresponding client on Render (matched by email)
      const renderClient = renderClients.find((c: any) => c.email.toLowerCase() === email);
      
      if (renderClient) {
        const oldId = localClient._id;
        const newId = renderClient._id;
        
        if (oldId.toString() !== newId.toString()) {
          // Update all students pointing to oldId to point to newId
          const updateResult = await Student.updateMany(
            { clientId: oldId },
            { $set: { clientId: new mongoose.Types.ObjectId(newId) } }
          );
          
          details.push({
            email,
            oldId,
            newId,
            updatedStudents: updateResult.modifiedCount
          });
          
          migratedCount++;
        }
      }
    }

    // 3. Purge client records on Railway
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