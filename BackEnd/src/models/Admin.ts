import mongoose, { Schema } from "mongoose";
import { IAdmin } from "../interface/IUser";

const adminSchema = new Schema<IAdmin>({
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
        default:"admin",
        required: true,
    },
})

export default mongoose.model<IAdmin>("Admin", adminSchema);