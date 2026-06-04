"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLogin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const Client_1 = __importDefault(require("../models/Client"));
const verifyLogin = async (email, password, role) => {
    const normalizedEmail = email.toLowerCase();
    let user;
    if (role === "admin")
        user = await Admin_1.default.findOne({ email: normalizedEmail });
    if (role === "client") {
        if (process.env.SERVER_TYPE === "railway") {
            const renderUrl = process.env.RENDER_API_URL || "http://localhost:3001";
            const response = await fetch(`${renderUrl}/client/internal/verify-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Authentication failed");
            }
            const data = await response.json();
            return data.user;
        }
        user = await Client_1.default.findOne({ email: normalizedEmail });
        if (user && new Date(user.portalExpiryDate).getTime() < Date.now()) {
            throw new Error("Portal Access Expired !");
        }
    }
    if (!user)
        throw new Error("User not found");
    if (user.password !== password)
        throw new Error("Invalid Password !");
    const { password: _password, ...userDto } = user.toObject();
    return userDto;
};
exports.verifyLogin = verifyLogin;
