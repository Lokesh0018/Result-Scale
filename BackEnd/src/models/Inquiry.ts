import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  fullName: string;
  institutionName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: Date;
}

const inquirySchema = new Schema<IInquiry>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  institutionName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IInquiry>("Inquiry", inquirySchema);
