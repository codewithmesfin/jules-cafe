import { Response, NextFunction } from 'express';
import Business from '../models/Business';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';

/**
 * Setup Business (First time)
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
