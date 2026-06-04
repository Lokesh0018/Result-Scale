import express from "express";
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

router.post("/internal/migrate-client-ids", async (_req: express.Request, res: express.Response) => {
  return res.status(410).json({
    success: false,
    message: "Legacy student-id migration endpoint is retired. Students now use clientEmail as the foreign key.",
  });
});
