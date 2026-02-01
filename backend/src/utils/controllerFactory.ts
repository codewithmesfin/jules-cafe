import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import catchAsync from './catchAsync';
import AppError from './appError';

export const getAll = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const features = model.find();

    // Automatic branch filtering for manager/staff/cashier
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role) && model.schema.path('branch_id')) {
      if (req.user.branch_id) {
        features.where('branch_id').equals(req.user.branch_id);
      }
    } else if (req.query.branch_id && model.schema.path('branch_id')) {
      // Manual filtering for others (e.g. admin or customers browsing a specific branch)
      features.where('branch_id').equals(req.query.branch_id);
    }

    const docs = await features.populate(req.query.populate as string || '');
    // Transform _id to id for frontend compatibility
    const transformedDocs = docs.map((doc: any) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
      name: doc.branch_name || doc.name, // Transform branch_name to name for frontend compatibility
    }));
    res.status(200).json(transformedDocs);
  });

export const getOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const doc = await model.findById(req.params.id).populate(req.query.populate as string || '');
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Branch security check for manager/staff/cashier
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role) && doc.branch_id) {
      if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
        return next(new AppError('You do not have permission to access this document', 403));
      }
    }

    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(200).json(transformedDoc);
  });

export const createOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Automatically set created_by to the authenticated user's ID
    const requestBody = {
      ...req.body,
      created_by: req.user?._id || req.user?.id,
    };

    // Auto-set branch_id for manager/staff/cashier if not provided
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role) && model.schema.path('branch_id')) {
      if (!requestBody.branch_id && req.user.branch_id) {
        requestBody.branch_id = req.user.branch_id;
      }
    }

    const doc = await model.create(requestBody);
    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(201).json(transformedDoc);
  });

export const updateOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Branch security check
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role) && doc.branch_id) {
      if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
        return next(new AppError('You do not have permission to update this document', 403));
      }
    }

    doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc?.toObject(), id: doc?._id.toString() };
    res.status(200).json(transformedDoc);
  });

export const deleteOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Branch security check
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role) && doc.branch_id) {
      if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
        return next(new AppError('You do not have permission to delete this document', 403));
      }
    }

    await model.findByIdAndDelete(req.params.id);
    res.status(204).json(null);
  });
