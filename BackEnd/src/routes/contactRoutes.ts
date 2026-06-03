import express from "express";
import { submitInquiry, submitQuotationRequest } from "../controller/contactController";

export const router = express.Router();

router.post("/submit", submitInquiry);
router.post("/quotation-request", submitQuotationRequest);
