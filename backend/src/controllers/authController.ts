import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/mailer';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: any, res: Response) => {
  try {
    const { email, password, role, branch_id, company, full_name, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If an admin is creating a user, set passwordResetRequired to true
    const isAdminCreating = req.user && req.user.role === 'admin';

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'customer',
      branch_id,
      company,
      full_name,
      phone,
      passwordResetRequired: isAdminCreating
    });

    res.status(201).json({
      jwt: generateToken(user._id.toString()),
      user: {
        ...user.toJSON(),
        id: user._id.toString(),
        branch_id: user.branch_id?.toString()
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier is email

    const user = await User.findOne({ email: identifier });

    if (user && (await bcrypt.compare(password, user.password || ''))) {
      res.json({
        jwt: generateToken(user._id.toString()),
        user: {
          ...user.toJSON(),
          id: user._id.toString(),
          branch_id: user.branch_id?.toString()
        },
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with that email address.' });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 mins)
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${req.get('origin')}/reset-password/${resetToken}`;

    const message = `Forgot your password? Click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.\nIf you didn't forget your password, please ignore this email!`;

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

      return res.status(500).json({ error: 'There was an error sending the email. Try again later!' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Get user based on token
    const token = req.params.token as string;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has expired' });
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
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
