"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const loginController_1 = require("../controller/loginController");
const clientController_1 = require("../controller/clientController");
const clientService_1 = require("../service/clientService");
const loginService_1 = require("../service/loginService");
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
exports.router = express_1.default.Router();
exports.router.post("/login", loginController_1.login);
exports.router.get("/dashboard/:clientEmail", clientController_1.getDashboard);
exports.router.post("/students", clientController_1.addStudent);
exports.router.put("/students/:email", clientController_1.updateStudent);
exports.router.delete("/students/:email", clientController_1.deleteStudent);
exports.router.get("/students/:clientEmail", clientController_1.getStudents);
exports.router.patch("/password/:email", clientController_1.updatePassword);
exports.router.put("/profile/:clientEmail", clientController_1.updateProfile);
exports.router.get("/internal/lookup/:identifier", async (req, res) => {
    try {
        const { identifier } = req.params;
        const client = await (0, clientService_1.findClientByIdentifier)(identifier);
        if (!client)
            return res.status(404).json({ success: false, message: "Client not found" });
        return res.status(200).json({ success: true, client });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.router.post("/internal/verify-login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await (0, loginService_1.verifyLogin)(email, password, role);
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});
exports.router.post("/internal/update-student-count/:clientEmail", async (req, res) => {
    try {
        const clientEmail = req.params.clientEmail;
        const { increment } = req.body;
        const client = await Client_1.default.findOneAndUpdate({ email: clientEmail.toLowerCase() }, { $inc: { students: increment } }, { new: true });
        return res.status(200).json({ success: true, client });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.router.post("/internal/update-students-institution/:clientEmail", async (req, res) => {
    try {
        const clientEmail = req.params.clientEmail;
        const { institutionName, clientEmail: newClientEmail } = req.body;
        await Student_1.default.updateMany({ clientEmail: clientEmail.toLowerCase() }, { institutionName, ...(newClientEmail ? { clientEmail: newClientEmail.toLowerCase() } : {}) });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.router.post("/internal/delete-students/:clientEmail", async (req, res) => {
    try {
        const clientEmail = req.params.clientEmail;
        await Student_1.default.deleteMany({ clientEmail: clientEmail.toLowerCase() });
        return res.status(200).json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.router.post("/internal/migrate-client-ids", async (_req, res) => {
    return res.status(410).json({
        success: false,
        message: "Legacy student-id migration endpoint is retired. Students now use clientEmail as the foreign key.",
    });
});
