import { Schema, model, type Document, type Types } from 'mongoose';

export interface CompanyDocument extends Document<Types.ObjectId> {
  name: string;
  code: string;
  currency: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    currency: { type: String, required: true, uppercase: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export const Company = model<CompanyDocument>('Company', companySchema);

