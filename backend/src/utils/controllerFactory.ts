import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import catchAsync from './catchAsync';
import AppError from './appError';

export const getAll = (model: Model<any>, options: { populate?: any } = {}) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active
    if (req.user && !req.user.is_active) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }
    
    const features = model.find();

    // Tenant isolation: filter by business_id if model has it
    if (req.user && model.schema.path('business_id')) {
      if (req.user.default_business_id) {
        features.where('business_id').equals(req.user.default_business_id);
      } else if (req.user.role !== 'saas_admin') {
        // If user has no business_id but model requires it, return empty (except for saas_admin)
        return res.status(200).json([]);
      }
    }

    if (options.populate) features.populate(options.populate);
    const docs = await features.populate(req.query.populate as string || '');

    // Transform _id to id for frontend compatibility
    const transformedDocs = docs.map((doc: any) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
    }));
    res.status(200).json(transformedDocs);
  });

export const getOne = (model: Model<any>, options: { populate?: any } = {}) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active
    if (req.user && !req.user.is_active) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    const query = model.findById(req.params.id);
    if (options.populate) query.populate(options.populate);
    query.populate(req.query.populate as string || '');

    const doc = await query;
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && doc.business_id) {
      if (!req.user.default_business_id || doc.business_id.toString() !== req.user.default_business_id.toString()) {
        if (req.user.role !== 'saas_admin') {
          return next(new AppError('You do not have permission to access this document', 403));
        }
      }
    }

    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(200).json(transformedDoc);
  });

export const createOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active
    if (req.user && !req.user.is_active) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    // Automatically set creator_id to the authenticated user's ID
    const requestBody = {
      ...req.body,
      creator_id: req.user?._id || req.user?.id,
    };

    // Auto-set business_id
    if (req.user && req.user.default_business_id && model.schema.path('business_id')) {
      requestBody.business_id = req.user.default_business_id;
    }

    const doc = await model.create(requestBody);
    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(201).json(transformedDoc);
  });

export const updateOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active
    if (req.user && !req.user.is_active) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    let doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && doc.business_id) {
      if (!req.user.default_business_id || doc.business_id.toString() !== req.user.default_business_id.toString()) {
        if (req.user.role !== 'saas_admin') {
          return next(new AppError('You do not have permission to update this document', 403));
        }
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
    // Check if user is active
    if (req.user && !req.user.is_active) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    const doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && doc.business_id) {
      if (!req.user.default_business_id || doc.business_id.toString() !== req.user.default_business_id.toString()) {
        if (req.user.role !== 'saas_admin') {
          return next(new AppError('You do not have permission to delete this document', 403));
        }
      }
    }

    await model.findByIdAndDelete(req.params.id);
    res.status(204).json(null);
  });
