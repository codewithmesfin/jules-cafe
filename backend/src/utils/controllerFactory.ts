import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import catchAsync from './catchAsync';
import AppError from './appError';

export const getAll = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active (except for customers)
    // Note: 'onboarding' status is handled by requireOnboardingComplete middleware
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (req.user && req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }
    
    const features = model.find();

    // Tenant isolation: filter by company_id if model has it and user is not superadmin
    if (req.user && req.user.role !== 'customer' && model.schema.path('company_id')) {
      console.log(`[${model.modelName}] User company_id:`, req.user.company_id);
      console.log(`[${model.modelName}] Model has company_id path:`, model.schema.path('company_id'));
      if (req.user.company_id) {
        // For admin users, also return items without company_id (backwards compatibility)
        if (req.user.role === 'admin') {
          features.or([
            { company_id: req.user.company_id },
            { company_id: { $exists: false } },
            { company_id: null }
          ]);
        } else {
          features.where('company_id').equals(req.user.company_id);
        }
      } else {
        console.log(`[${model.modelName}] No company_id on user, returning empty results`);
        const emptyResults: any[] = [];
        return res.status(200).json(emptyResults);
      }
    }

    // Branch isolation for branch-specific models (like MenuItem with branch_id)
    const branchFilterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && branchFilterRoles.includes(req.user.role) && model.schema.path('branch_id')) {
      if (req.user.branch_id) {
        // For branch-based roles, show items for their branch OR items without branch_id (global items)
        features.or([
          { branch_id: req.user.branch_id },
          { branch_id: { $exists: false } },
          { branch_id: null }
        ]);
      }
    }

    // Automatic branch filtering for manager/staff/cashier
    // Note: For User model, this is handled by userController.getAllUsers which allows access to all customers
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role)) {
      // Skip branch filtering for User model - managers need to see all users (including customers without branch)
      if (model.modelName !== 'User' && model.schema.path('branch_id') && req.user.branch_id) {
        features.where('branch_id').equals(req.user.branch_id);
      } else if (model.modelName === 'Branch' && req.user.branch_id) {
        features.where('_id').equals(req.user.branch_id);
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
    // Check if user is active (except for customers)
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (req.user && req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    const doc = await model.findById(req.params.id).populate(req.query.populate as string || '');
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && req.user.role !== 'customer' && doc.company_id) {
      if (doc.company_id.toString() !== req.user.company_id?.toString()) {
        return next(new AppError('You do not have permission to access this document', 403));
      }
    }

    // Branch security check for manager/staff/cashier
    // Note: For User model, managers can access customers regardless of branch
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role)) {
      // Skip branch check for User model - managers need to access all customers
      if (model.modelName !== 'User' && doc.branch_id) {
        if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
          return next(new AppError('You do not have permission to access this document', 403));
        }
      }
      // For Branch model, ensure user can only access their assigned branch
      if (model.modelName === 'Branch' && doc._id.toString() !== req.user.branch_id?.toString()) {
        return next(new AppError('You do not have permission to access this branch', 403));
      }
    }

    // Transform _id to id for frontend compatibility
    const transformedDoc = { ...doc.toObject(), id: doc._id.toString() };
    res.status(200).json(transformedDoc);
  });

export const createOne = (model: Model<any>) =>
  catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is active (except for customers)
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (req.user && req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    // Automatically set created_by to the authenticated user's ID
    const requestBody = {
      ...req.body,
      created_by: req.user?._id || req.user?.id,
    };

    // Auto-set company_id
    if (req.user && req.user.company_id && model.schema.path('company_id')) {
      requestBody.company_id = req.user.company_id;
    }

    // Idempotency check
    if (requestBody.client_request_id && model.schema.path('client_request_id')) {
      const existingDoc = await model.findOne({ client_request_id: requestBody.client_request_id });
      if (existingDoc) {
        return res.status(200).json({ ...existingDoc.toObject(), id: existingDoc._id.toString() });
      }
    }

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
    // Check if user is active (except for customers)
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (req.user && req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    let doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && req.user.role !== 'customer' && doc.company_id) {
      if (doc.company_id.toString() !== req.user.company_id?.toString()) {
        return next(new AppError('You do not have permission to update this document', 403));
      }
    }

    // Branch security check
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role)) {
      if (doc.branch_id) {
        if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
          return next(new AppError('You do not have permission to update this document', 403));
        }
      } else if (model.modelName === 'Branch') {
        if (doc._id.toString() !== req.user.branch_id?.toString()) {
          return next(new AppError('You do not have permission to update this branch', 403));
        }
      }
    }

    // Prevent non-admins from changing branch_name (for Branch model)
    if (req.user?.role !== 'admin' && model.modelName === 'Branch') {
      delete req.body.branch_name;
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
    // Check if user is active (except for customers)
    const inactiveStatuses = ['inactive', 'pending', 'suspended'];
    if (req.user && req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
      return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
    }

    const doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('Document not found', 404));
    }

    // Tenant security check
    if (req.user && req.user.role !== 'customer' && doc.company_id) {
      if (doc.company_id.toString() !== req.user.company_id?.toString()) {
        return next(new AppError('You do not have permission to delete this document', 403));
      }
    }

    // Branch security check
    const filterRoles = ['manager', 'staff', 'cashier'];
    if (req.user && filterRoles.includes(req.user.role)) {
      if (doc.branch_id) {
        if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
          return next(new AppError('You do not have permission to delete this document', 403));
        }
      } else if (model.modelName === 'Branch') {
        if (doc._id.toString() !== req.user.branch_id?.toString()) {
          return next(new AppError('You do not have permission to delete this branch', 403));
        }
      }
    }

    await model.findByIdAndDelete(req.params.id);
    res.status(204).json(null);
  });
