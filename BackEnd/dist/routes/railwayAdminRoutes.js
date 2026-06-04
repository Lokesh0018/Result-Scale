"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
exports.router = express_1.default.Router();
// Client management
exports.router.get("/dashboard", adminController_1.getDashboard);
exports.router.post("/clients", adminController_1.addClient);
exports.router.put("/clients/:email", adminController_1.updateClient);
exports.router.delete("/clients/:email", adminController_1.deleteClient);
// Student management (odd roll numbers)
exports.router.get("/students", adminController_1.getStudents);
// Inquiries (Railway only)
exports.router.get("/inquiries", adminController_1.getInquiries);
exports.router.patch("/inquiries/:id/status", adminController_1.updateInquiryStatus);
exports.router.delete("/inquiries/:id", adminController_1.deleteInquiry);
// Quotation Requests (Railway only)
exports.router.get("/quotation-requests", adminController_1.getQuotationRequests);
exports.router.patch("/quotation-requests/:id/status", adminController_1.updateQuotationRequestStatus);
exports.router.delete("/quotation-requests/:id", adminController_1.deleteQuotationRequest);
