import { Roles } from "../types/types";
import { Document } from "mongoose";

export interface IAdmin extends Document {
    email: string;
    password: string;
    role: Roles;
}

export interface IClient extends IAdmin {
    institutionName: string;
    students: number;
    portalExpiryDate: Date;
    institutionType: string;
    logoUrl?: string;
    isActive: boolean;
}

export interface IStudent extends Document {
    clientEmail: string,
    name: string,
    rollNo: string,
    email: string,
    institutionName: string;
    semester: number,
    sgpa: number,
    otp:string,
    otpExpiry:Date,
}