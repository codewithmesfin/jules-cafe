import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import Business from '../models/Business';
import Subscription from '../models/Subscription';
import { sendEmail } from '../utils/mailer';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper function to check business subscription status
const checkBusinessSubscriptionStatus = async (user: any) => {
  if (!user.default_business_id || user.role === 'saas_admin') {
    return { businessInactive: false };
  }

  const business = await Business.findById(user.default_business_id);
  if (!business) {
    return { businessInactive: false };
  }

  // Check if business is manually deactivated
  if (!business.is_active) {
    return {
      businessInactive: true,
      businessDeactivated: true,
      subscriptionExpired: false,
      subscriptionPending: false
    };
  }

  // Check subscription status
  const subscription = await Subscription.findOne({
    business_id: business._id
  }).sort({ end_date: -1 });

  if (subscription) {
    // Check if expired
    if (new Date(subscription.end_date) < new Date()) {
      // Mark business as inactive due to expiration
      await Business.findByIdAndUpdate(business._id, { is_active: false });
      return {
        businessInactive: true,
        subscriptionExpired: true,
        businessDeactivated: false,
        subscriptionPending: false
      };
    }

    // Check if pending payment
    if (subscription.status === 'pending') {
      return {
        businessInactive: true,
        subscriptionPending: true,
        businessDeactivated: false,
        subscriptionExpired: false
      };
    }
  }

  return { businessInactive: false };
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, full_name, phone } = req.body;
  if (!email || !password || !full_name) {
    return next(new AppError('Please provide email, password and full name', 400));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists with this email', 400));
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'admin',
    status: 'onboarding',
    full_name,
    phone,
    passwordResetRequired: false,
    assigned_businesses: []
  });
  const token = generateToken(user._id.toString());
  res.status(201).json({
    success: true,
    jwt: token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      full_name: user.full_name,
      phone: user.phone,
    },
    message: 'Account created successfully. Please complete your business setup.',
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;
  const user = await User.findOne({ email: identifier });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  if (user.status === 'onboarding') {
    return res.json({
      jwt: generateToken(user._id.toString()),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        default_business_id: user.default_business_id,
        full_name: user.full_name,
      },
      requiresOnboarding: true,
      message: 'Please complete your business setup to access the dashboard.',
    });
  }
  const inactiveStatuses = ['inactive', 'suspended'];
  if (inactiveStatuses.includes(user.status)) {
    return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
  }
  let businesses: any[] = [];
  if (user.role === 'saas_admin') {
    businesses = await Business.find().select('name logo banner slug');
  } else if (user.role === 'admin') {
    businesses = await Business.find({ owner_id: user._id }).select('name logo banner slug');
  } else {
    // For staff users, get businesses from assigned_businesses
    const assignedBiz = user.assigned_businesses || [];
    businesses = await Business.find({ _id: { $in: assignedBiz } }).select('name logo banner slug');
    // If no businesses assigned but user has default_business_id, add it
    if (businesses.length === 0 && user.default_business_id) {
      const defaultBusiness = await Business.findById(user.default_business_id).select('name logo banner slug');
      if (defaultBusiness) {
        businesses = [defaultBusiness];
        // Update user's assigned_businesses for future logins
        await User.findByIdAndUpdate(user._id, { 
          $addToSet: { assigned_businesses: user.default_business_id } 
        });
      }
    }
  }
  
  // Check business subscription status
  const subscriptionStatus = await checkBusinessSubscriptionStatus(user);
  
  res.json({
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      default_business_id: user.default_business_id,
      full_name: user.full_name,
      ...subscriptionStatus
    },
    businesses,
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id).select('-password').populate('default_business_id');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  let businesses: any[] = [];
  if (user.role === 'saas_admin') {
    businesses = await Business.find().select('name logo banner slug');
  } else if (user.role === 'admin') {
    businesses = await Business.find({ owner_id: user._id }).select('name logo banner slug');
  } else {
    // For staff users, get businesses from assigned_businesses
    const assignedBiz = user.assigned_businesses || [];
    businesses = await Business.find({ _id: { $in: assignedBiz } }).select('name logo banner slug');
    // If no businesses assigned but user has default_business_id, add it
    if (businesses.length === 0 && user.default_business_id) {
      const defaultBusiness = await Business.findById(user.default_business_id).select('name logo banner slug');
      if (defaultBusiness) {
        businesses = [defaultBusiness];
      }
    }
  }
  
  // Check business subscription status
  const subscriptionStatus = await checkBusinessSubscriptionStatus(user);
  
  res.json({
    ...user.toObject(),
    businesses,
    ...subscriptionStatus
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with that email address.', 404));
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;
  const message = `Forgot your password? Reset it here: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({ email: user.email, subject: 'Your password reset token (valid for 10 min)', message });
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token as string;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetRequired = false;
  await user.save();
  res.status(200).json({
    success: true,
    jwt: generateToken(user._id.toString()),
    user: { id: user._id, email: user.email, role: user.role },
    message: 'Password reset successful.',
  });
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { full_name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { full_name, phone }, { new: true, runValidators: true }).select('-password');
  res.json({ success: true, user });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.passwordResetRequired = false;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully.' });
});
