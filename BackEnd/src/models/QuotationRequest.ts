import mongoose, { Schema, Document } from "mongoose";

export interface IQuotationRequest extends Document {
  institutionName: string;
  institutionType: 'College' | 'University' | 'Examination Board' | 'Other';
  contactPerson: string;
  email: string;
  phone: string;
  cityState: string;
  studentCount: number;
  expectedReleaseDate: Date;
  accessDuration: '7 Days' | '15 Days' | '30 Days' | 'Custom';
  customDurationDays?: number;
  expectedTraffic: 'Low' | 'Medium' | 'High';
  otpRequired: boolean;
  memoDownloadRequired: boolean;
  message?: string;
  status: 'unread' | 'read' | 'contacted';
  createdAt: Date;
}

const quotationRequestSchema = new Schema<IQuotationRequest>({
  institutionName: {
    type: String,
    required: true,
    trim: true,
  },
  institutionType: {
    type: String,
    enum: ["College", "University", "Examination Board", "Other"],
    required: true,
  },
  contactPerson: {
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
  cityState: {
    type: String,
    required: true,
    trim: true,
  },
  studentCount: {
    type: Number,
    required: true,
  },
  expectedReleaseDate: {
    type: Date,
    required: true,
  },
  accessDuration: {
    type: String,
    enum: ["7 Days", "15 Days", "30 Days", "Custom"],
    required: true,
  },
  customDurationDays: {
    type: Number,
    default: 0,
  },
  expectedTraffic: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  otpRequired: {
    type: Boolean,
    required: true,
    default: false,
  },
  memoDownloadRequired: {
    type: Boolean,
    required: true,
    default: false,
  },
  message: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["unread", "read", "contacted"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IQuotationRequest>("QuotationRequest", quotationRequestSchema);
