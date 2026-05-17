import mongoose, { Schema } from "mongoose";
import { IClient } from "../interface/IUser";

const clientSchema = new Schema<IClient>({
    email: {
        type: String,
        index: true,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default: "client",
        required: true,
    },

    institutionName: {
        type: String,
        required: true,
    },

    students: {
        type: Number,
        required: true,
        default: 0,
    },
    
    portalExpiryDate: {
        type: Date,
        required: true,
    },
})

export default mongoose.model<IClient>("Client", clientSchema);