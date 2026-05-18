import express from "express";
import { login, verifyOtp } from "../controller/studentController";

export const router = express.Router();

router.post("/login", login);
router.post("/verify-otp", verifyOtp);