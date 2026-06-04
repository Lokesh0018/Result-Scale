import { Request, Response, NextFunction } from "express";

/**
 * Simple token-based auth middleware.
 * Expects header: Authorization: Bearer <token>
 * Token = base64(email:role) — lightweight, no JWT dependency needed.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role) throw new Error("Invalid token");
        // Attach to request for downstream use
        (req as any).authEmail = email;
        (req as any).authRole = role;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role) throw new Error("Invalid token");
        if (role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
        }
        (req as any).authEmail = email;
        (req as any).authRole = role;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

export const requireClient = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: Missing token" });
    }
    try {
        const token = authHeader.slice(7);
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [email, role] = decoded.split(":");
        if (!email || !role) throw new Error("Invalid token");
        if (role !== "client" && role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Clients only" });
        }
        (req as any).authEmail = email;
        (req as any).authRole = role;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
