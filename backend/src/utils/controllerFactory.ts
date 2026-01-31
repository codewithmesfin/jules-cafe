import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

export const getAll = (model: Model<any>) => async (req: any, res: Response) => {
  try {
    const filter: any = {};

    // Add simple filtering from query
    if (req.query.branch_id) filter.branch_id = req.query.branch_id;

    // Enforce branch filtering for non-admins if branch_id is relevant to the model
    // and the user has a branch_id assigned.
    const hasBranchField = model.schema.path('branch_id');
    if (hasBranchField && req.user && req.user.role !== 'admin' && req.user.branch_id) {
      filter.branch_id = req.user.branch_id;
    }

    const features = model.find(filter);
    const docs = await features.populate(req.query.populate as string || '');
    res.status(200).json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.findById(req.params.id).populate(req.query.populate as string || '');
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.status(200).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const doc = await model.create(req.body);
    res.status(201).json(doc);
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
    res.status(200).json(doc);
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
