"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controller/studentController");
exports.router = express_1.default.Router();
exports.router.post("/login", studentController_1.login);
exports.router.post("/verify-otp", studentController_1.verifyOtp);
