import express from "express";
import { login } from "../controller/loginController";
import {
  getDashboard, addClient, updateClient, deleteClient, getStudents,
  updatePassword, getActivityLogs, getInquiries, updateInquiryStatus, deleteInquiry,
  getQuotationRequests, updateQuotationRequestStatus, deleteQuotationRequest
} from "../controller/adminController";

export const router = express.Router();

router.post("/login", login);

router.get("/dashboard", getDashboard);
router.post("/clients", addClient);
router.put("/clients/:email", updateClient);
router.delete("/clients/:email", deleteClient);

router.get("/students", getStudents);

router.patch("/password/:email", updatePassword);

router.get("/logs", getActivityLogs);

router.get("/inquiries", getInquiries);
router.patch("/inquiries/:id/status", updateInquiryStatus);
router.delete("/inquiries/:id", deleteInquiry);

router.get("/quotation-requests", getQuotationRequests);
router.patch("/quotation-requests/:id/status", updateQuotationRequestStatus);
router.delete("/quotation-requests/:id", deleteQuotationRequest);
