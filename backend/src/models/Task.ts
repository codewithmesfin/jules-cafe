import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  business_id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigned_to?: mongoose.Types.ObjectId; // User ID
  due_date?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const TaskSchema: Schema = new Schema({
  business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  due_date: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<ITask>('Task', TaskSchema);
