import express from "express";
import { 
  getDashboard, addClient, updateClient, deleteClient, getStudents,
  getInquiries, updateInquiryStatus, deleteInquiry,
  getQuotationRequests, updateQuotationRequestStatus, deleteQuotationRequest
} from "../controller/adminController";

export const router = express.Router();

// Client management
router.get("/dashboard", getDashboard);
router.post("/clients", addClient);
router.put("/clients/:email", updateClient);
router.delete("/clients/:email", deleteClient);

// Student management (odd roll numbers)
router.get("/students", getStudents);

// Inquiries (Railway only)
router.get("/inquiries", getInquiries);
router.patch("/inquiries/:id/status", updateInquiryStatus);
router.delete("/inquiries/:id", deleteInquiry);

// Quotation Requests (Railway only)
router.get("/quotation-requests", getQuotationRequests);
router.patch("/quotation-requests/:id/status", updateQuotationRequestStatus);
router.delete("/quotation-requests/:id", deleteQuotationRequest);
