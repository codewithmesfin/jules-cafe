import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const deleteUser = factory.deleteOne(User);

export const createUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

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

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

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
