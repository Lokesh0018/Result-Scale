import express from "express";
import { login, verifyOtp, getActiveInstitutions } from "../controller/studentController";

export const router = express.Router();

router.get("/institutions", getActiveInstitutions);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);