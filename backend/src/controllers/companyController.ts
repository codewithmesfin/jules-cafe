import { Response, NextFunction } from 'express';
import Company from '../models/Company';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

export const setupCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, address, phone, email, website } = req.body;

  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Only allow onboarding users to setup company
  if (req.user.role !== 'admin' || req.user.status !== 'onboarding') {
    return next(new AppError('Not authorized for company setup', 403));
  }

  // Create company
  const company = await Company.create({
    name,
    address,
    phone,
    email,
    website
  });

  // Update user with company_id and mark as active
  await User.findByIdAndUpdate(req.user._id, {
    company_id: company._id,
    status: 'active'
  });

  res.status(201).json({
    status: 'success',
    data: company
  });
});

export const getMyCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.company_id) {
    return next(new AppError('No company associated with this user', 404));
  }

  const company = await Company.findById(req.user.company_id);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  res.status(200).json(company);
});
