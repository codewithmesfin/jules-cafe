import mongoose, { Schema, Document } from 'mongoose';

export interface IBranchMenuItem extends Document {
  branch_id: mongoose.Types.ObjectId;
  menu_item_id: mongoose.Types.ObjectId;
  is_available: boolean;
}

const BranchMenuItemSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  is_available: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default mongoose.model<IBranchMenuItem>('BranchMenuItem', BranchMenuItemSchema);
