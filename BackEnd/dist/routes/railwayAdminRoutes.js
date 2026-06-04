"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const adminController_2 = require("../controller/adminController");
exports.router = express_1.default.Router();
exports.router.get("/dashboard", adminController_1.getDashboard);
exports.router.get("/students", adminController_1.getStudents);
exports.router.get("/logs", adminController_2.getActivityLogs);
exports.router.get("/quotation-requests", adminController_1.getQuotationRequests);
exports.router.patch("/quotation-requests/:id/status", adminController_1.updateQuotationRequestStatus);
exports.router.delete("/quotation-requests/:id", adminController_1.deleteQuotationRequest);
