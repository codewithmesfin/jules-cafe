import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import Company from '../models/Company';
import { sendEmail } from '../utils/mailer';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

/**
 * Register/Signup - Creates a new admin user for a new tenant
 * The user is created in 'onboarding' status and must complete company setup
 */
export const register = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password, full_name, phone, role } = req.body;
  console.log('Signup request body:', req.body);
  console.log('Role received:', role);

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Determine user role and status
  const userRole = role === 'admin' ? 'admin' : 'customer';
  const userStatus = role === 'admin' ? 'onboarding' : 'active';

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    role: userRole,
    status: userStatus,
    full_name,
    phone,
    passwordResetRequired: false,
  });

  // Generate JWT token
  const token = generateToken(user._id.toString());

  res.status(201).json({
    success: true,
    jwt: token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      company_id: user.company_id,
      full_name: user.full_name,
      phone: user.phone,
      passwordResetRequired: user.passwordResetRequired,
    },
    message: userRole === 'admin' 
      ? 'Account created successfully. Please complete your company setup.'
      : 'Account created successfully!',
  });
});

/**
 * Login - Authenticate user and return JWT
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({ email: identifier });

  if (!user || !(await bcrypt.compare(password || '', user.password || ''))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check account status and provide appropriate messages
  if (user.status === 'onboarding') {
    return res.json({
      jwt: generateToken(user._id.toString()),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        branch_id: user.branch_id,
        company_id: user.company_id,
        full_name: user.full_name,
        phone: user.phone,
        passwordResetRequired: user.passwordResetRequired,
      },
      requiresOnboarding: true,
      message: 'Please complete your company setup to access the dashboard.',
    });
  }

  const inactiveStatuses = ['inactive', 'pending', 'suspended'];
  if (user.role !== 'customer' && inactiveStatuses.includes(user.status)) {
    return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
  }

  res.json({
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      branch_id: user.branch_id,
      company_id: user.company_id,
      full_name: user.full_name,
      phone: user.phone,
      passwordResetRequired: user.passwordResetRequired,
    },
  });
});

/**
 * Get current user profile
 */
export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('company_id', 'name logo settings setup_completed')
    .populate('branch_id', 'branch_name location_address');

  res.json(user);
});

/**
 * Forgot Password - Send password reset email
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to field
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire (10 mins)
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  // Send email
  const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

/**
 * Reset Password - Set new password using reset token
 */
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token as string;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetRequired = false;
  await user.save();

  // Log the user in, send JWT
  res.status(200).json({
    success: true,
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    message: 'Password reset successful.',
  });
});

/**
 * Update Profile - Update current user's profile
 */
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { full_name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { full_name, phone },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    user,
  });
});

/**
 * Change Password - Change user's password
 */
export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user || !user.password) {
    return next(new AppError('User not found or has no password', 400));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.passwordResetRequired = false;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});
