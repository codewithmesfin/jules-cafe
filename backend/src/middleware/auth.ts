import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Company from '../models/Company';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export interface AuthRequest extends Request {
  user?: any;
  tenant?: any;
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

  // Check if user is active (except for customers who can access their own routes)
  // 'onboarding' status is allowed but restricted by other middleware/routes
  const inactiveStatuses = ['inactive', 'pending', 'suspended'];
  if (req.user.role !== 'customer' && inactiveStatuses.includes(req.user.status)) {
    return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
  }

  // Load tenant (company) information for admin users
  if (req.user.role === 'admin' && req.user.company_id) {
    const company = await Company.findById(req.user.company_id);
    if (company) {
      req.tenant = company;
    }
  }

  next();
});

/**
 * RequireOnboardingComplete middleware - Ensure company setup is complete
 * This middleware should be applied to all protected routes except company-setup
 */
export const requireOnboardingComplete = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Only applies to admin users in onboarding status
  if (req.user.role !== 'admin' || req.user.status !== 'onboarding') {
    return next(); // Skip for non-onboarding users
  }

  // Check if company setup is complete
  if (!req.user.company_id) {
    return next(new AppError('Please complete company setup first', 423));
  }

  const company = await Company.findById(req.user.company_id);
  if (!company || !company.setup_completed) {
    return next(new AppError('Please complete company setup first', 423));
  }

  next();
});

/**
 * TenantIsolation middleware - Scope all data queries to user's company
 * This middleware automatically adds company_id filter to queries
 */
export const tenantIsolation = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Customers don't need tenant isolation (they're scoped by their own data)
  if (req.user.role === 'customer') {
    return next();
  }

  // Skip for onboarding users (they shouldn't access data until setup is complete)
  if (req.user.status === 'onboarding') {
    return next();
  }

  // Admin users must have a company_id for tenant isolation
  if (req.user.role === 'admin' && !req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  // Store tenant context for use in controllers
  if (req.user.company_id) {
    const company = await Company.findById(req.user.company_id);
    if (company) {
      req.tenant = company;
    }
  }

  // Add tenant filter to request for use in controllers
  (req as any).tenantId = req.user.company_id;
  (req as any).branchId = req.user.branch_id;

  next();
});

/**
 * BranchIsolation middleware - Scope queries to user's assigned branch
 * This is more restrictive than tenantIsolation for staff/cashier roles
 */
export const branchIsolation = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Managers, staff, and cashiers must be assigned to a branch
  const branchBasedRoles = ['manager', 'staff', 'cashier'];
  if (branchBasedRoles.includes(req.user.role) && !req.user.branch_id) {
    return next(new AppError('You are not assigned to a branch', 400));
  }

  next();
});

/**
 * Authorize middleware - Check if user has required roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user?.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

/**
 * AuthorizeTenantOwner middleware - Ensure user is the company owner
 */
export const authorizeTenantOwner = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Only company owners can perform this action', 403));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  next();
});
