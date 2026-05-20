import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userEmail: string;
  userRole: string;
  action: string;
  category: "auth" | "student" | "client" | "system" | "security";
  details: string;
  status: "success" | "failure";
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userEmail: {
    type: String,
    required: true,
    index: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["auth", "student", "client", "system", "security"],
    index: true,
  },
  details: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    required: true,
    enum: ["success", "failure"],
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
