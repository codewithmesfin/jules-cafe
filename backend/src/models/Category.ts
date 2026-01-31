import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  is_active: boolean;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  is_active: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<ICategory>('Category', CategorySchema);
