import express from "express";
import {login} from "../controller/loginController";
import { getDashboard, addClient, updateClient, deleteClient, getStudents, updatePassword, getActivityLogs } from "../controller/adminController";

export const router = express.Router();

router.post("/login",login);

router.get("/dashboard",getDashboard);
router.post("/clients",addClient);
router.put("/clients/:email",updateClient);
router.delete("/clients/:email",deleteClient);

router.get("/students",getStudents);
router.get("/logs",getActivityLogs);

router.patch("/password/:email",updatePassword);