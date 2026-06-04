"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateClientInput = void 0;
const validateClientInput = (input) => {
    const missing = [];
    if (!input.institutionName?.trim())
        missing.push("institutionName");
    if (!input.email?.trim())
        missing.push("email");
    if (!input.password?.trim())
        missing.push("password");
    if (!input.portalExpiryDate)
        missing.push("portalExpiryDate");
    if (missing.length > 0) {
        throw new Error("Institution name, email, password, portal expiry date are required !");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        throw new Error("Please enter a valid email address");
    }
};
exports.validateClientInput = validateClientInput;
