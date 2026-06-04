"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLogin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const Client_1 = __importDefault(require("../models/Client"));
/**
 * Generates a simple bearer token: base64(email:role)
 * This is intentionally simple — for production JWT would be preferred,
 * but this avoids adding a new dependency and is consistent with the codebase.
 */
const generateToken = (email, role) => {
    return Buffer.from(`${email}:${role}`).toString("base64");
};
const verifyLogin = async (email, password, role) => {
    let user;
    if (role === "admin")
        user = await Admin_1.default.findOne({ email });
    if (role === "client") {
        user = await Client_1.default.findOne({ email });
        if (user && !user.isActive) {
            throw new Error("Portal Access Expired!");
        }
        if (user && new Date(user.portalExpiryDate).getTime() < Date.now()) {
            throw new Error("Portal Access Expired!");
        }
    }
    if (!user)
        throw new Error("User not found");
    if (user.password !== password)
        throw new Error("Invalid Password!");
    const { password: _password, ...userDto } = user.toObject();
    const token = generateToken(email, role);
    return { ...userDto, token };
};
exports.verifyLogin = verifyLogin;
