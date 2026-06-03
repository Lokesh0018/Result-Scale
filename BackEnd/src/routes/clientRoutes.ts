import express from "express";
import {login} from "../controller/loginController";
import { getDashboard, addStudent, updateStudent, deleteStudent, getStudents, updatePassword, updateProfile } from "../controller/clientController";

export const router = express.Router();
router.post("/login",login);

router.get("/dashboard/:clientId",getDashboard);
router.post("/students",addStudent);
router.put("/students/:email",updateStudent);
router.delete("/students/:email",deleteStudent);

router.get("/students/:clientId",getStudents);

router.patch("/password/:email",updatePassword);
router.put("/profile/:clientId",updateProfile);