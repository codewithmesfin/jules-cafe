import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuVariant extends Document {
  menu_item_id: mongoose.Types.ObjectId;
  company_id?: mongoose.Types.ObjectId;
  name: string;
  price_override?: number;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const MenuVariantSchema: Schema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  price_override: { type: Number },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IMenuVariant>('MenuVariant', MenuVariantSchema);
