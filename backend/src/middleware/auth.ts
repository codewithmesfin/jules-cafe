import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Business from '../models/Business';
import Subscription from '../models/Subscription';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export interface AuthRequest extends Request {
  user?: any;
  business?: any;
}

/**
 * Protect middleware - Verify JWT token and load user
 */
export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError('Server configuration error', 500));
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  
  if (!req.user) {
    return next(new AppError('User not found', 401));
  }

  // Check if user is active
  if (!req.user.is_active) {
    return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
  }

  // Load business information for admin/manager/cashier users
  if (req.user.default_business_id) {
    const business = await Business.findById(req.user.default_business_id);
    if (business) {
      req.business = business;

      // Check if business is inactive due to subscription expiration
      if (!business.is_active) {
        // Check if subscription has expired
        const subscription = await Subscription.findOne({ 
          business_id: business._id,
          status: 'active'
        }).sort({ end_date: -1 });

        if (subscription && new Date(subscription.end_date) < new Date()) {
          // Subscription has expired - mark user for billing redirect
          req.user.businessInactive = true;
          req.user.subscriptionExpired = true;
        } else if (subscription && subscription.status === 'pending') {
          // Subscription pending payment
          req.user.businessInactive = true;
          req.user.subscriptionPending = true;
        } else {
          // Business manually deactivated by super admin
          req.user.businessInactive = true;
          req.user.businessDeactivated = true;
        }
      }
    }
  }

  next();
});

/**
 * restrictTo middleware - Check if user has required roles
 * saas_admin is always allowed
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Not authenticated', 401));

    if (req.user.role === 'saas_admin' || roles.includes(req.user.role)) {
      return next();
    }

    return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
  };
};

/**
 * BusinessIsolation middleware - Scope all data queries to user's default business
 */
export const businessIsolation = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (req.user.role === 'saas_admin') {
    return next();
  }

  if (!req.user.default_business_id) {
    return next(new AppError('No business associated with your account', 400));
  }

  // Add business filter to request for use in controllers
  (req as any).businessId = req.user.default_business_id;

  next();
});

/**
 * CheckBusinessStatus middleware - Redirect to billing if business is inactive
 */
export const checkBusinessStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Skip for super admins and users without business
  if (req.user.role === 'saas_admin' || !req.user.default_business_id) {
    return next();
  }

  // Check if business is inactive
  if (req.user.businessInactive) {
    // Return a flag that frontend can use to redirect
    res.locals.businessInactive = true;
    res.locals.subscriptionExpired = req.user.subscriptionExpired || false;
    res.locals.subscriptionPending = req.user.subscriptionPending || false;
    res.locals.businessDeactivated = req.user.businessDeactivated || false;
  }

  next();
});
