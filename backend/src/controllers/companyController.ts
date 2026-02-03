import { Response, NextFunction } from 'express';
import Company from '../models/Company';
import User from '../models/User';
import Branch from '../models/Branch';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

/**
 * Setup Company - Create company for onboarding admin
 * This is the first step in the onboarding flow
 */
export const setupCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { 
    name, 
    legal_name, 
    address, 
    phone, 
    email, 
    website,
    branch_name,
    branch_address,
    branch_phone,
    branch_email,
    opening_time,
    closing_time,
    capacity
  } = req.body;

  console.log('=== COMPANY SETUP DEBUG ===');
  console.log('User from auth:', req.user);
  console.log('User role:', req.user?.role);
  console.log('User status:', req.user?.status);
  console.log('User company_id:', req.user?.company_id);

  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Only allow onboarding admin users to setup company
  console.log('Check: role is admin?', req.user.role !== 'admin');
  console.log('Check: status is onboarding?', req.user.status !== 'onboarding');
  
  if (req.user.role !== 'admin') {
    return next(new AppError('Only company admins can setup a company', 403));
  }

  // Allow admins who are onboarding OR admins with active status but no company
  if (req.user.status !== 'onboarding' && req.user.status !== 'active') {
    return next(new AppError('Your account status does not allow company setup', 403));
  }

  // If user is already active and has a company, don't allow setup
  if (req.user.status === 'active' && req.user.company_id) {
    return next(new AppError('You already have a company associated with your account', 400));
  }

  // Check if user already has a company
  if (req.user.company_id) {
    return next(new AppError('You already have a company associated with your account', 400));
  }

  // Create the company
  const company = await Company.create({
    name,
    legal_name,
    address,
    phone,
    email,
    website,
    created_by: req.user._id,
    setup_completed: true,
    setup_step: 'completed',
    subscription: {
      plan: 'trial',
      status: 'active',
      max_branches: 1,
      max_users: 5,
      max_menu_items: 50,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    }
  });

  // Create the main branch for the company
  const branch = await Branch.create({
    branch_name: branch_name || 'Main Branch',
    location_address: branch_address || address || 'TBD',
    phone: branch_phone || phone,
    email: branch_email || email,
    opening_time: opening_time || '09:00',
    closing_time: closing_time || '22:00',
    capacity: capacity || 50,
    company_id: company._id,
    created_by: req.user._id
  });

  // Update user with company_id, branch_id, and mark as active
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      company_id: company._id,
      branch_id: branch._id,
      status: 'active'
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: {
      company,
      branch,
      user: updatedUser,
    },
    message: 'Company setup completed successfully. Your account is now active.',
  });
});

/**
 * Get current company's details
 */
export const getMyCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.company_id) {
    return next(new AppError('No company associated with your account', 404));
  }

  const company = await Company.findById(req.user.company_id);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  res.status(200).json({
    success: true,
    data: company,
  });
});

/**
 * Update company details
 */
export const updateCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  // Only company owner (admin) can update company
  if (req.user.role !== 'admin') {
    return next(new AppError('Only company owner can update company details', 403));
  }

  const allowedFields = [
    'name', 'legal_name', 'description', 'category', 'address', 'phone', 'email', 'website',
    'logo', 'favicon', 'primary_color', 'settings'
  ];

  const updates: any = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Handle subscription updates (nested object)
  if (req.body.subscription !== undefined) {
    if (req.body.subscription.max_branches !== undefined) {
      updates['subscription.max_branches'] = req.body.subscription.max_branches;
    }
    if (req.body.subscription.plan !== undefined) {
      updates['subscription.plan'] = req.body.subscription.plan;
    }
    if (req.body.subscription.status !== undefined) {
      updates['subscription.status'] = req.body.subscription.status;
    }
  }

  const company = await Company.findByIdAndUpdate(
    req.user.company_id,
    updates,
    { new: true, runValidators: true }
  );

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  res.status(200).json({
    success: true,
    data: company,
  });
});

/**
 * Get company's branches
 */
export const getCompanyBranches = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  const branches = await Branch.find({ company_id: req.user.company_id });

  res.status(200).json({
    success: true,
    data: branches,
    count: branches.length,
  });
});

/**
 * Create a new branch for the company
 */
export const createBranch = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  // Check branch limit based on subscription
  const company = await Company.findById(req.user.company_id);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const currentBranchCount = await Branch.countDocuments({ company_id: req.user.company_id });
  if (currentBranchCount >= company.subscription.max_branches) {
    return next(new AppError(`You have reached the maximum number of branches (${company.subscription.max_branches}). Please upgrade your plan.`, 400));
  }

  const branch = await Branch.create({
    ...req.body,
    company_id: req.user.company_id,
    created_by: req.user._id
  });

  res.status(201).json({
    success: true,
    data: branch,
  });
});

/**
 * Get company statistics
 */
export const getCompanyStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  const company = await Company.findById(req.user.company_id);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const branchCount = await Branch.countDocuments({ company_id: req.user.company_id });
  const userCount = await User.countDocuments({ company_id: req.user.company_id });

  res.status(200).json({
    success: true,
    data: {
      company: {
        name: company.name,
        plan: company.subscription.plan,
        status: company.subscription.status,
      },
      usage: {
        branches: {
          current: branchCount,
          max: company.subscription.max_branches,
        },
        users: {
          current: userCount,
          max: company.subscription.max_users,
        },
      },
      setup_completed: company.setup_completed,
    },
  });
});

/**
 * Delete company (admin only, with proper validation)
 */
export const deleteCompany = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  if (!req.user.company_id) {
    return next(new AppError('No company associated with your account', 400));
  }

  // Only company owner can delete company
  if (req.user.role !== 'admin') {
    return next(new AppError('Only company owner can delete company', 403));
  }

  // This is a destructive action - in production, implement proper safeguards
  const company = await Company.findByIdAndDelete(req.user.company_id);
  
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  // Delete all branches
  await Branch.deleteMany({ company_id: req.user.company_id });

  // Deactivate user
  await User.findByIdAndUpdate(req.user._id, {
    company_id: null,
    branch_id: null,
    status: 'inactive'
  });

  res.status(200).json({
    success: true,
    message: 'Company and all associated data have been deleted.',
  });
});
