"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const loginController_1 = require("../controller/loginController");
const clientController_1 = require("../controller/clientController");
const authMiddleware_1 = require("../middleware/authMiddleware");
exports.router = express_1.default.Router();
// Public
exports.router.post("/login", loginController_1.login);
// Protected (client or admin)
exports.router.get("/dashboard/:clientId", authMiddleware_1.requireClient, clientController_1.getDashboard);
exports.router.post("/students", authMiddleware_1.requireClient, clientController_1.addStudent);
exports.router.put("/students/:email", authMiddleware_1.requireClient, clientController_1.updateStudent);
exports.router.delete("/students/:email", authMiddleware_1.requireClient, clientController_1.deleteStudent);
exports.router.get("/students/:clientId", authMiddleware_1.requireClient, clientController_1.getStudents);
exports.router.patch("/password/:email", authMiddleware_1.requireClient, clientController_1.updatePassword);
exports.router.put("/profile/:clientId", authMiddleware_1.requireClient, clientController_1.updateProfile);
