import { Schema, model, type Document, type Types } from 'mongoose';

export interface StoreDocument extends Document<Types.ObjectId> {
  company: Types.ObjectId;
  name: string;
  code: string;
  manager?: Types.ObjectId;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<StoreDocument>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

storeSchema.index({ company: 1, code: 1 }, { unique: true });
storeSchema.index({ company: 1, name: 1 });

export const Store = model<StoreDocument>('Store', storeSchema);

