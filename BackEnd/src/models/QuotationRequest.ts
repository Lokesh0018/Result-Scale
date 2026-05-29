import mongoose, { Schema, Document } from "mongoose";

export interface IQuotationRequest extends Document {
  institutionName: string;
  contactPerson: string;
  email: string;
  phone: string;
  studentCount: number;
  accessDurationDays: number;
  expectedReleaseDate: Date;
  hostingCost: number;
  otpCost: number;
  estimatedTotal: number;
  otpRequired?: boolean;
  marksMemoRequired?: boolean;
  status: 'Pending' | 'Under Review' | 'Contacted' | 'Quotation Sent' | 'Approved' | 'Rejected';
  createdAt: Date;
}

const quotationRequestSchema = new Schema<IQuotationRequest>({
  institutionName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  studentCount: { type: Number, required: true },
  accessDurationDays: { type: Number, required: true },
  expectedReleaseDate: { type: Date, required: true },
  hostingCost: { type: Number, required: true },
  otpCost: { type: Number, required: true },
  estimatedTotal: { type: Number, required: true },
  otpRequired: { type: Boolean, default: true },
  marksMemoRequired: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Contacted', 'Quotation Sent', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQuotationRequest>("QuotationRequest", quotationRequestSchema);
