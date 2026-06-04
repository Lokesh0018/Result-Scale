import Admin from "../models/Admin";
import Client from "../models/Client";
import { Roles } from "../types/types";

/**
 * Generates a simple bearer token: base64(email:role)
 * This is intentionally simple — for production JWT would be preferred,
 * but this avoids adding a new dependency and is consistent with the codebase.
 */
const generateToken = (email: string, role: string): string => {
    return Buffer.from(`${email}:${role}`).toString("base64");
};

export const verifyLogin = async (email: string, password: string, role: Roles) => {
    const normalizedEmail = email.toLowerCase();
    let user;
    if (role === "admin")
        user = await Admin.findOne({ email });
    if (role === "client") {
        user = await Client.findOne({ email });
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
