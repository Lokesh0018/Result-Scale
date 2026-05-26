import express from "express";
import { submitInquiry } from "../controller/contactController";

export const router = express.Router();

router.post("/submit", submitInquiry);
