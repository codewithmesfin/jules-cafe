import mongoose, { Schema, Document } from 'mongoose';

export interface IBranchMenuItem extends Document {
  branch_id: mongoose.Types.ObjectId;
  menu_item_id: mongoose.Types.ObjectId;
  is_available: boolean;
  created_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BranchMenuItemSchema: Schema = new Schema({
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  menu_item_id: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  is_available: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IBranchMenuItem>('BranchMenuItem', BranchMenuItemSchema);
