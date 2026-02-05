import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BankAccount from '../models/BankAccount';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    role: string;
  };
}

// Get all bank accounts
export const getBankAccounts = catchAsync(async (req: AuthRequest, res: Response) => {
  const bankAccounts = await BankAccount.find({ is_active: true }).sort({ created_at: -1 });

  res.json({
    success: true,
    count: bankAccounts.length,
    data: bankAccounts
  });
});

// Create bank account
export const createBankAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const { bank_name, account_number, account_name, branch } = req.body;

  if (!req.user || req.user.role !== 'saas_admin') {
    throw new AppError('Only super admin can manage bank accounts', 403);
  }

  // Check if account number already exists
  const existing = await BankAccount.findOne({ account_number });
  if (existing) {
    throw new AppError('Bank account number already registered', 400);
  }

  const bankAccount = await BankAccount.create({
    bank_name,
    account_number,
    account_name,
    branch,
    created_by: req.user._id
  });

  res.status(201).json({
    success: true,
    data: bankAccount
  });
});

// Update bank account
export const updateBankAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bank_name, account_name, branch, is_active } = req.body;

  if (!req.user || req.user.role !== 'saas_admin') {
    throw new AppError('Only super admin can manage bank accounts', 403);
  }

  const bankAccount = await BankAccount.findByIdAndUpdate(
    id,
    { bank_name, account_name, branch, is_active },
    { new: true, runValidators: true }
  );

  if (!bankAccount) {
    throw new AppError('Bank account not found', 404);
  }

  res.json({
    success: true,
    data: bankAccount
  });
});

// Delete bank account (soft delete)
export const deleteBankAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user || req.user.role !== 'saas_admin') {
    throw new AppError('Only super admin can manage bank accounts', 403);
  }

  const bankAccount = await BankAccount.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );

  if (!bankAccount) {
    throw new AppError('Bank account not found', 404);
  }

  res.json({
    success: true,
    message: 'Bank account deleted successfully'
  });
});
