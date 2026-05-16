import mongoose, { Document, Schema } from "mongoose";
import { Roles } from "../types/types";

export interface IUser extends Document {
  email: string;
  password: string;
  role: Roles;
  institutionName?:string;
  portalExpiryDate?:Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    index:true,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "client", "student"],
    default: "client",
  },

  institutionName:{
    type: String,
    required: function() {
      return this.role === "client" || this.role ===  "student";
    }
  },

  portalExpiryDate: {
    type: Date,

    required: function () {
      return this.role === "client";
    }
  }
});

export default mongoose.model<IUser>("User", userSchema);