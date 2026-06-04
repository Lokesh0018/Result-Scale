"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const activityLogController_1 = require("../controller/activityLogController");
exports.router = express_1.default.Router();
exports.router.get("/", activityLogController_1.listActivityLogs);
exports.router.post("/internal", activityLogController_1.storeActivityLog);
