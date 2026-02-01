import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/mailer';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { email, password, role, branch_id, company, full_name, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Self-registration should always be as 'customer' and not require password reset
  // Only admins can create non-customer users via the user management dashboard
  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'customer',
    branch_id,
    company,
    full_name,
    phone,
    passwordResetRequired: false,
  });

  res.status(201).json({
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      company: user.company,
      full_name: user.full_name,
      phone: user.phone,
      passwordResetRequired: user.passwordResetRequired,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({ email: identifier });

  if (!user || !(await bcrypt.compare(password, user.password || ''))) {
    return next(new AppError('Invalid email or password', 401));
  }

  res.json({
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
      company: user.company,
      full_name: user.full_name,
      phone: user.phone,
      passwordResetRequired: user.passwordResetRequired,
    },
  });
});

export const getMe = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

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

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get user based on token
  const token = req.params.token as string;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is user, set the new password
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
    jwt: generateToken(user._id.toString()),
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});
