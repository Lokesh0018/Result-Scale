"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const contactController_1 = require("../controller/contactController");
exports.router = express_1.default.Router();
exports.router.post("/submit", contactController_1.submitInquiry);
