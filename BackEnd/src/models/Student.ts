import mongoose, { Schema } from "mongoose";
import { IStudent } from "../interface/IUser";

const studentSchema = new Schema<IStudent>({
    clientEmail: {
        type: String,
        required: true,
        index:true,
    },

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique:true,
    },

    rollNo: {
        type: String,
        required:true,
    },

    institutionName: {
        type: String,
        required: true,
    },

    semester: {
        type: Number,
        required: true,
    },

    sgpa: {
        type:Number,
        required:true,
    },

    otp:{
        type:String,
    },

    otpExpiry:{
        type:Date
    }
})

export default mongoose.model<IStudent>("Student",studentSchema);