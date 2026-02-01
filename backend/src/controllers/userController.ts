import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    return next(new AppError('User not found', 404));
  }

  // Role based security for deletion
  if (req.user.role === 'manager') {
    // Managers can only delete staff/cashiers/customers in their branch
    const allowedRoles = ['staff', 'cashier', 'customer'];
    if (!allowedRoles.includes(userToDelete.role)) {
      return next(new AppError('You do not have permission to delete this user', 403));
    }

    if (userToDelete.branch_id?.toString() !== req.user.branch_id?.toString() && userToDelete.role !== 'customer') {
      return next(new AppError('You can only delete users in your own branch', 403));
    }
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(204).json(null);
});

export const createUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

  // Role based security for creation
  if (req.user.role === 'manager') {
    // Managers can only create staff, cashier or customers for their own branch
    const allowedRoles = ['staff', 'cashier', 'customer'];
    if (!allowedRoles.includes(data.role)) {
      return next(new AppError('Managers can only create staff, cashier or customer accounts', 403));
    }
    data.branch_id = req.user.branch_id;
  }

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password || 'password123', salt);

  const user = await User.create({
    ...data,
    password: hashedPassword,
    passwordResetRequired: true, // Admin created users must reset password
  });

  res.status(201).json(user);
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

  const userToUpdate = await User.findById(req.params.id);
  if (!userToUpdate) {
    return next(new AppError('User not found', 404));
  }

  // Role based security for update
  if (req.user.role === 'manager') {
    // Managers can only update users in their own branch
    if (userToUpdate.branch_id?.toString() !== req.user.branch_id?.toString() && userToUpdate.role !== 'customer') {
       // Allow updating customers even if branch_id doesn't match?
       // Actually, customers are usually global or branch-specific.
       // In this system they seem branch-independent unless created by a manager.
       // For now, let's say managers can only update their branch staff or customers.
       if (userToUpdate.role !== 'customer') {
         return next(new AppError('You can only update users in your own branch', 403));
       }
    }

    // Managers cannot upgrade roles to manager or admin
    if (data.role && ['admin', 'manager'].includes(data.role) && data.role !== userToUpdate.role) {
      return next(new AppError('You cannot assign admin or manager roles', 403));
    }

    // Ensure branch_id is not changed by manager
    delete data.branch_id;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(password, salt);
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(user);
});
