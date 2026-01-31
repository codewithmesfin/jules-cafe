import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

export const getAll = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const features = model.find();
    // Add simple filtering if needed
    if (req.query.branch_id) features.where('branch_id').equals(req.query.branch_id);

    const docs = await features.populate(req.query.populate as string || '');
    // Transform _id to id for frontend compatibility
    const transformedDocs = docs.map((doc: any) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
      name: doc.branch_name || doc.name, // Transform branch_name to name for frontend compatibility
    }));
    res.status(200).json(transformedDocs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.findById(req.params.id).populate(req.query.populate as string || '');
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(200).json(transformedDoc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.create(req.body);
    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(201).json(transformedDoc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(200).json(transformedDoc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.status(204).json(null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
