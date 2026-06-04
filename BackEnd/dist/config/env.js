"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const normalizeServerType = (value) => {
    const normalized = (value || "").toLowerCase();
    return normalized === "railway" ? "railway" : "render";
};
exports.env = {
    serverType: normalizeServerType(process.env.SERVER_TYPE || (process.env.IS_RAILWAY === "true" ? "railway" : "render")),
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGO_URI || "",
    renderApiUrl: process.env.RENDER_API_URL || "http://localhost:3001",
    railwayApiUrl: process.env.RAILWAY_API_URL || "http://localhost:3000",
    corsOrigins: (process.env.CORS_ORIGINS || "https://resultscale.web.app,http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
};
process.env.SERVER_TYPE = exports.env.serverType;
