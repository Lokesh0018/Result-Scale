import express from "express";
import {login} from "../controller/loginController";
import { getDashboard, addClient, updateClient, deleteClient, getStudents, updatePassword } from "../controller/adminController";

export const router = express.Router();

router.post("/login",login);

router.get("/dashboard",getDashboard);
router.post("/clients",addClient);
router.put("/clients/:email",updateClient);
router.delete("/clients/:email",deleteClient);

router.get("/students",getStudents);

router.patch("/password/:email",updatePassword);