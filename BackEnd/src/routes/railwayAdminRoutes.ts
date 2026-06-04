import express from "express";
import { getDashboard, getStudents, getQuotationRequests, updateQuotationRequestStatus, deleteQuotationRequest } from "../controller/adminController";
import { getActivityLogs } from "../controller/adminController";

export const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/students", getStudents);
router.get("/logs", getActivityLogs);

router.get("/quotation-requests", getQuotationRequests);
router.patch("/quotation-requests/:id/status", updateQuotationRequestStatus);
router.delete("/quotation-requests/:id", deleteQuotationRequest);
