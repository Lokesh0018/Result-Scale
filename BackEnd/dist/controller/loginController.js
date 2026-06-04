"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const loginService_1 = require("../service/loginService");
const logService_1 = require("../service/logService");
const login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required !",
            });
        }
        const user = await (0, loginService_1.verifyLogin)(email, password, role);
        await (0, logService_1.LogActivity)(email, role, "Login Successful", "auth", `Successfully authenticated as ${role}`, "success");
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    }
    catch (err) {
        if (email) {
            await (0, logService_1.LogActivity)(email, role || "unknown", "Login Failed", "auth", `Failed login attempt: ${err.message}`, "failure");
        }
        if (err.message === "User not found")
            return res.status(404).json({
                success: false,
                message: err.message
            });
        if (err.message === "Invalid Password !")
            return res.status(401).json({
                success: false,
                message: err.message,
            });
        if (err.message === "Portal Access Expired !")
            return res.status(403).json({
                success: false,
                message: err.message,
            });
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
            err: err.message,
        });
    }
};
exports.login = login;
