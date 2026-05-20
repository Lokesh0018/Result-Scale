import mongoose, { Schema } from "mongoose";
import { IStudent } from "../interface/IUser";
import Client from "./Client";

const studentSchema = new Schema<IStudent>({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: Client,
        required: true,
        index: true,
    },

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    rollNo: {
        type: String,
        required: true,
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
        type: Number,
        required: true,
    },

    otp: {
        type: String,
    },

    otpExpiry: {
        type: Date
    }
})

// Compound unique index: same email can exist across different clients,
// but must be unique within a single client's dataset
studentSchema.index({ clientId: 1, email: 1 }, { unique: true })
studentSchema.index({ clientId: 1, rollNo: 1 }, { unique: true })

export default mongoose.model<IStudent>("Student", studentSchema);