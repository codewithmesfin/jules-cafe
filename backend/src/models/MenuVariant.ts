import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuVariant extends Document {
  menu_item_id: mongoose.Types.ObjectId;
  name: string;
  price_override?: number;
}

const MenuVariantSchema: Schema = new Schema({
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price_override: { type: Number },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<IMenuVariant>('MenuVariant', MenuVariantSchema);
