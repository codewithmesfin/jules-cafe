import { Response, NextFunction } from 'express';
import Business from '../models/Business';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';

export const switchBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { business_id } = req.body;
  if (!business_id) return next(new AppError('Business ID is required', 400));
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'saas_admin' || user.role === 'admin') {
    const business = await Business.findById(business_id);
    if (!business) return next(new AppError('Business not found', 404));
    if (user.role === 'admin' && business.owner_id.toString() !== user._id.toString()) {
      return next(new AppError('You do not have access to this business', 403));
    }
  } else {
    const hasAccess = user.assigned_businesses?.some((id: any) => id.toString() === business_id);
    if (!hasAccess) return next(new AppError('You do not have access to this business', 403));
  }
  user.default_business_id = business_id as any;
  await user.save();
  const business = await Business.findById(business_id);
  res.status(200).json({ success: true, data: business });
});

export const getMyBusinesses = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  let businesses;
  if (user.role === 'saas_admin') {
    businesses = await Business.find().sort('-created_at');
  } else if (user.role === 'admin') {
    businesses = await Business.find({ owner_id: user._id }).sort('-created_at');
  } else {
    const businessIds = user.assigned_businesses || [];
    businesses = await Business.find({ _id: { $in: businessIds } }).sort('-created_at');
  }
  res.status(200).json({ success: true, data: businesses });
});

export const addBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const business = await Business.create({ name, slug, legal_name, address, description, owner_id: req.user._id });
  const user = await User.findById(req.user._id);
  if (user) {
    user.default_business_id = business._id as any;
    await user.save();
  }
  res.status(201).json({ success: true, data: business });
});

export const setupBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  const userId = req.user._id;
  const existing = await Business.findOne({ owner_id: userId });
  if (existing) return next(new AppError('Business already setup for this account', 400));
  const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const business = await Business.create({ name, slug, legal_name, address, description, owner_id: userId });
  const user = await User.findById(userId);
  if (user) {
    user.default_business_id = business._id as any;
    user.status = 'active';
    await user.save();
  }
  res.status(201).json({ success: true, data: business });
});

export const getMyBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const business = await Business.findById(req.user.default_business_id);
  if (!business) return next(new AppError('Business not found', 404));
  res.status(200).json({ success: true, data: business });
});

export const getBusiness = factory.getOne(Business);
export const getAllBusinesses = factory.getAll(Business);
export const updateBusiness = factory.updateOne(Business);
export const deleteBusiness = factory.deleteOne(Business);
