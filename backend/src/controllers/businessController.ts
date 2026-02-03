import { Response, NextFunction } from 'express';
import Business from '../models/Business';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';

/**
 * Switch Business Workspace - Update user's default business
 */
export const switchBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { business_id } = req.body;
  
  if (!business_id) {
    return next(new AppError('Business ID is required', 400));
  }

  // Check if user has access to this business
  const user = await User.findById(req.user._id);
  
  // Admin can access any business they own
  // Manager/Cashier can only access businesses they're assigned to
  if (user.role === 'saas_admin' || user.role === 'admin') {
    const business = await Business.findById(business_id);
    if (!business) {
      return next(new AppError('Business not found', 404));
    }
    // For admin, check if they own this business
    if (user.role === 'admin' && business.owner_id.toString() !== user._id.toString()) {
      return next(new AppError('You do not have access to this business', 403));
    }
  } else {
    // For manager/cashier, check if business is in their list
    const hasAccess = user.businesses?.some((b: any) => b.business_id.toString() === business_id);
    if (!hasAccess) {
      return next(new AppError('You do not have access to this business', 403));
    }
  }

  // Update user's default business
  user.default_business_id = business_id as any;
  await user.save();

  const business = await Business.findById(business_id);

  res.status(200).json({
    success: true,
    data: business
  });
});

/**
 * Get All Businesses for Admin
 */
export const getMyBusinesses = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id);
  
  let businesses;
  if (user.role === 'saas_admin') {
    // SaaS admin sees all businesses
    businesses = await Business.find().sort('-created_at');
  } else if (user.role === 'admin') {
    // Admin sees businesses they own
    businesses = await Business.find({ owner_id: user._id }).sort('-created_at');
  } else {
    // Manager/Cashier - get businesses from their assignment
    const businessIds = user.businesses?.map((b: any) => b.business_id) || [];
    businesses = await Business.find({ _id: { $in: businessIds } }).sort('-created_at');
  }

  res.status(200).json({
    success: true,
    data: businesses
  });
});

/**
 * Add Business (Admin only)
 */
export const addBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  
  // Generate slug from name
  const slug = name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const business = await Business.create({
    name,
    slug,
    legal_name,
    address,
    description,
    owner_id: req.user._id
  });

  // Add this business to user's businesses and set as default
  const user = await User.findById(req.user._id);
  user.default_business_id = business._id as any;
  await user.save();

  res.status(201).json({
    success: true,
    data: business
  });
});

/**
 * Setup Business (First time - for new admin)
 */
export const setupBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  const userId = req.user._id;

  // Check if business already exists for this owner
  const existing = await Business.findOne({ owner_id: userId });
  if (existing) {
    return next(new AppError('Business already setup for this account', 400));
  }

  // Generate slug from name
  const slug = name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const business = await Business.create({
    name,
    slug,
    legal_name,
    address,
    description,
    owner_id: userId
  });

  // Update user's default_business_id and status
  req.user.default_business_id = business._id as any;
  req.user.status = 'active';
  await req.user.save();

  res.status(201).json({
    success: true,
    data: business
  });
});

export const getMyBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const business = await Business.findById(req.user.default_business_id);
  if (!business) {
    return next(new AppError('Business not found', 404));
  }
  res.status(200).json({
    success: true,
    data: business
  });
});

export const getBusiness = factory.getOne(Business);
export const getAllBusinesses = factory.getAll(Business);
export const updateBusiness = factory.updateOne(Business);
export const deleteBusiness = factory.deleteOne(Business);
