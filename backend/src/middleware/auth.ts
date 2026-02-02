import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  req.user = await User.findById(decoded.id).select('-password');
  
  if (!req.user) {
    return next(new AppError('User not found', 401));
  }

  // Check if user is active (except for customers who can access their own routes)
  // Only block if status is explicitly set to inactive, pending, or suspended
  // 'onboarding' status is allowed but restricted by other logic/frontend
  const inactiveStatuses = ['inactive', 'pending', 'suspended'];
  if (req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
    return next(new AppError('Your account is not active. Please contact the Administrator to activate your account.', 423));
  }

  next();
});

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user?.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
