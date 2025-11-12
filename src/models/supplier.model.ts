import { Schema, model, type Document, type Types } from 'mongoose';

export interface SupplierDocument extends Document<Types.ObjectId> {
  company: Types.ObjectId;
  supplierId: string;
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  creditReport?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<SupplierDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    supplierId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    creditReport: { type: String, trim: true },
    address: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
);

supplierSchema.index({ company: 1, supplierId: 1 }, { unique: true });

export const Supplier = model<SupplierDocument>('Supplier', supplierSchema);

