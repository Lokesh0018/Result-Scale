import { Roles } from "../types/types";
import mongoose, { Document } from "mongoose";

export interface IAdmin extends Document {
    email: string;
    password: string;
    role: Roles;
}

export interface IClient extends IAdmin {
    institutionName: string;
    students: number;
    portalExpiryDate: Date;
}

export interface IStudent extends Document {
    clientId: mongoose.Types.ObjectId,
    name: string,
    rollNo: string,
    email: string,
    semester: number,
    sgpa: number,
    otp:number,
    otpExpiry:Date,
}