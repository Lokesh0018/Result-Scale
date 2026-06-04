"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClient = exports.requireAdmin = exports.requireAuth = void 0;
/**
 * Simple token-based auth middleware.
 * Expects header: Authorization: Bearer <token>
 * Token = base64(email:role) — lightweight, no JWT dependency needed.
 */
const requireAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role)
            throw new Error("Invalid token");
        // Attach to request for downstream use
        req.authEmail = email;
        req.authRole = role;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role)
            throw new Error("Invalid token");
        if (role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
        }
        req.authEmail = email;
        req.authRole = role;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
exports.requireAdmin = requireAdmin;
const requireClient = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role)
            throw new Error("Invalid token");
        if (role !== "client" && role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Clients only" });
        }
        req.authEmail = email;
        req.authRole = role;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
exports.requireClient = requireClient;
