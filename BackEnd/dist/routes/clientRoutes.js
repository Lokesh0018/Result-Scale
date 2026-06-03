"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const loginController_1 = require("../controller/loginController");
const clientController_1 = require("../controller/clientController");
exports.router = express_1.default.Router();
exports.router.post("/login", loginController_1.login);
exports.router.get("/dashboard/:clientEmail", clientController_1.getDashboard);
exports.router.post("/students", clientController_1.addStudent);
exports.router.put("/students/:email", clientController_1.updateStudent);
exports.router.delete("/students/:email", clientController_1.deleteStudent);
exports.router.get("/students/:clientEmail", clientController_1.getStudents);
exports.router.patch("/password/:email", clientController_1.updatePassword);
exports.router.put("/profile/:clientEmail", clientController_1.updateProfile);
