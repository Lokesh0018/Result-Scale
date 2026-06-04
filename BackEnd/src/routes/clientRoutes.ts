import express from "express";
import { login } from "../controller/loginController";
import {
    getDashboard, addStudent, updateStudent, deleteStudent,
    getStudents, updatePassword, updateProfile
} from "../controller/clientController";
import { requireClient } from "../middleware/authMiddleware";

export const router = express.Router();

// Public
router.post("/login", login);

// Protected (client or admin)
router.get("/dashboard/:clientId", requireClient, getDashboard);
router.post("/students", requireClient, addStudent);
router.put("/students/:email", requireClient, updateStudent);
router.delete("/students/:email", requireClient, deleteStudent);
router.get("/students/:clientId", requireClient, getStudents);
router.patch("/password/:email", requireClient, updatePassword);
router.put("/profile/:clientId", requireClient, updateProfile);
