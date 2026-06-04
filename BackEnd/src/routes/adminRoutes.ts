import express from "express";
import { login } from "../controller/loginController";
import {
    getDashboard, addClient, updateClient, deleteClient, getStudents,
    updatePassword, getActivityLogs, getInquiries, updateInquiryStatus, deleteInquiry,
    getQuotationRequests, updateQuotationRequestStatus, deleteQuotationRequest
} from "../controller/adminController";
import { requireAdmin } from "../middleware/authMiddleware";

export const router = express.Router();

// Public
router.post("/login", login);

// Protected (admin only)
router.get("/dashboard", requireAdmin, getDashboard);
router.post("/clients", requireAdmin, addClient);
router.put("/clients/:email", requireAdmin, updateClient);
router.delete("/clients/:email", requireAdmin, deleteClient);

router.get("/students", requireAdmin, getStudents);
router.get("/logs", requireAdmin, getActivityLogs);

router.patch("/password/:email", requireAdmin, updatePassword);

router.get("/inquiries", requireAdmin, getInquiries);
router.patch("/inquiries/:id/status", requireAdmin, updateInquiryStatus);
router.delete("/inquiries/:id", requireAdmin, deleteInquiry);

router.get("/quotation-requests", requireAdmin, getQuotationRequests);
router.patch("/quotation-requests/:id/status", requireAdmin, updateQuotationRequestStatus);
router.delete("/quotation-requests/:id", requireAdmin, deleteQuotationRequest);
