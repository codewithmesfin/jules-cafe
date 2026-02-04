import { Response, NextFunction } from 'express';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';
import bcrypt from 'bcryptjs';

/**
 * Create Staff User (Admin/Manager only)
 */
export const createStaff = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password, full_name, phone, role } = req.body;
  const businessId = req.user.default_business_id;

  if (!['manager', 'cashier', 'waiter'].includes(role)) {
    return next(new AppError('Invalid role for staff', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  let hashedPassword;
  if (role !== 'waiter') {
    if (!password) {
      return next(new AppError('Password is required for this role', 400));
    }
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  } else {
    // Waiters don't have login access, so no password needed
    hashedPassword = undefined;
  }

  const user = await User.create({
    email,
    password: hashedPassword,
    full_name,
    phone,
    role,
    status: 'active',
    default_business_id: businessId,
    assigned_businesses: [businessId],
    created_by: req.user._id
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }
  });
});

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
