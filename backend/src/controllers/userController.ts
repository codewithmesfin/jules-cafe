import { Response, NextFunction } from 'express';
import User from '../models/User';
import Business from '../models/Business';
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

/**
 * Get All SaaS Admins (Super Admin only)
 */
export const getSaasAdmins = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get all admin users (business owners, not staff and not super admin)
  const admins = await User.find({ role: 'admin' })
    .select('email full_name phone status created_at last_login')
    .lean() as any[];

  // Get businesses for each admin
  const adminsWithBusinesses = await Promise.all(
    admins.map(async (admin) => {
      const businesses = await Business.find({ owner_id: admin._id }).lean() as any[];
      return {
        id: admin._id,
        fullName: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        status: admin.status,
        createdAt: admin.created_at,
        lastLogin: admin.last_login,
        businesses: businesses.map((biz) => ({
          id: biz._id,
          name: biz.name,
          plan: biz.subscription_plan || 'starter',
          subscriptionStatus: biz.subscription_status || 'active',
          paymentStatus: biz.payment_status || 'pending',
          location: biz.address,
          subscriptionEnd: biz.subscription_end,
          amount: biz.subscription_amount || 0,
          createdAt: biz.created_at
        }))
      };
    })
  );

  res.status(200).json({
    success: true,
    data: adminsWithBusinesses,
    total: adminsWithBusinesses.length
  });
});

/**
 * Toggle User Status (Super Admin only)
 */
export const toggleUserStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Toggle status
  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      status: user.status
    },
    message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`
  });
});

/**
 * Set User Status (Super Admin only) - allows setting any status
 */
export const setUserStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status. Must be: active, inactive, pending, or suspended', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.status = status;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      status: user.status
    },
    message: `User status updated to ${status}`
  });
});

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
