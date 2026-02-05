import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import BankAccount from '../models/BankAccount';
import Business from '../models/Business';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Pricing constants
export const PRICING = {
  basic: { daily: 100, name: 'Basic' },
  pro: { daily: 250, name: 'Pro' },
  enterprise: { daily: 500, name: 'Enterprise' }
};

export const VAT_RATE = 15; // 15% VAT
export const YEARLY_DISCOUNT = 20; // 20% discount for yearly

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    default_business_id?: mongoose.Types.ObjectId;
    id?: string;
  };
}

// Get current subscription for a business
export const getCurrentSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  
  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  const subscription = await Subscription.findOne({ business_id: businessId })
    .sort({ created_at: -1 });

  res.json({
    success: true,
    data: subscription
  });
});

// Create new subscription (upgrade/downgrade)
export const createSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  const { plan, billing_cycle } = req.body;

  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  if (!['basic', 'pro', 'enterprise'].includes(plan)) {
    throw new AppError('Invalid plan selected', 400);
  }

  if (!['monthly', 'yearly'].includes(billing_cycle)) {
    throw new AppError('Invalid billing cycle', 400);
  }

  const dailyRate = PRICING[plan as keyof typeof PRICING].daily;
  const days = billing_cycle === 'yearly' ? 365 : 30;
  
  // Calculate discount
  const discountPercent = billing_cycle === 'yearly' ? YEARLY_DISCOUNT : 0;
  const subtotal = dailyRate * days;
  const discount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discount;
  const vatAmount = subtotalAfterDiscount * (VAT_RATE / 100);
  const total = subtotalAfterDiscount + vatAmount;

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const subscription = await Subscription.create({
    business_id: businessId,
    plan,
    status: 'pending',
    start_date: startDate,
    end_date: endDate,
    billing_cycle,
    daily_rate: dailyRate
  });

  // Create invoice
  const invoice = await Invoice.create({
    business_id: businessId,
    subscription_id: subscription._id,
    plan: PRICING[plan as keyof typeof PRICING].name,
    billing_cycle,
    days,
    subtotal,
    vat_amount: vatAmount,
    discount,
    discount_percent: discountPercent,
    total,
    status: 'pending',
    period_start: startDate,
    period_end: endDate,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  });

  res.status(201).json({
    success: true,
    data: {
      subscription,
      invoice
    }
  });
});

// Get invoices for a business
export const getInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  
  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  const invoices = await Invoice.find({ business_id: businessId })
    .sort({ created_at: -1 });

  res.json({
    success: true,
    count: invoices.length,
    data: invoices
  });
});

// Get single invoice
export const getInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  const { id } = req.params;
  
  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  const invoice = await Invoice.findOne({ _id: id, business_id: businessId });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: invoice
  });
});

// Submit payment proof
export const submitPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  const { invoice_id, bank_name, account_number, account_name, transaction_reference, payer_name, payer_phone, payer_email, notes } = req.body;

  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  // Get invoice to verify amount
  const invoice = await Invoice.findOne({ _id: invoice_id, business_id: businessId });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  // Get bank accounts from database (only active ones)
  const bankAccounts = await BankAccount.find({ is_active: true });
  const selectedBank = bankAccounts.find(bank => 
    bank.bank_name === bank_name && bank.account_number === account_number
  );

  if (!selectedBank) {
    throw new AppError('Invalid bank account selected', 400);
  }

  const payment = await Payment.create({
    invoice_id,
    business_id: businessId,
    amount: invoice.total,
    bank_account: {
      bank_name,
      account_number,
      account_name
    },
    payment_method: 'bank_transfer',
    transaction_reference,
    payer_name,
    payer_phone,
    payer_email,
    notes,
    status: 'pending'
  });

  // Update invoice status
  invoice.status = 'pending';
  await invoice.save();

  res.status(201).json({
    success: true,
    data: payment
  });
});

// Get payments for a business
export const getPayments = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  
  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  const payments = await Payment.find({ business_id: businessId })
    .sort({ created_at: -1 });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// Get bank accounts (from super admin settings)
export const getBankAccountInfo = catchAsync(async (req: AuthRequest, res: Response) => {
  const bankAccounts = await BankAccount.find({ is_active: true }).sort({ created_at: -1 });

  res.json({
    success: true,
    data: bankAccounts
  });
});

// Calculate subscription price
export const calculatePrice = catchAsync(async (req: AuthRequest, res: Response) => {
  const { plan, billing_cycle } = req.query;

  if (!plan || !billing_cycle) {
    throw new AppError('Plan and billing cycle are required', 400);
  }

  const planKey = plan as string;
  const cycleKey = billing_cycle as 'monthly' | 'yearly';

  if (!['basic', 'pro', 'enterprise'].includes(planKey)) {
    throw new AppError('Invalid plan', 400);
  }

  if (!['monthly', 'yearly'].includes(cycleKey)) {
    throw new AppError('Invalid billing cycle', 400);
  }

  const dailyRate = PRICING[planKey as keyof typeof PRICING].daily;
  const days = cycleKey === 'yearly' ? 365 : 30;
  const discountPercent = cycleKey === 'yearly' ? YEARLY_DISCOUNT : 0;
  
  const subtotal = dailyRate * days;
  const discount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discount;
  const vatAmount = subtotalAfterDiscount * (VAT_RATE / 100);
  const total = subtotalAfterDiscount + vatAmount;

  res.json({
    success: true,
    data: {
      plan: PRICING[planKey as keyof typeof PRICING].name,
      plan_key: planKey,
      billing_cycle: cycleKey,
      days,
      daily_rate: dailyRate,
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discount,
      subtotal_after_discount: subtotalAfterDiscount,
      vat_rate: VAT_RATE,
      vat_amount: vatAmount,
      total
    }
  });
});

// Cancel subscription
export const cancelSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  const { id } = req.params;

  if (!businessId) {
    throw new AppError('Business ID not found', 400);
  }

  const subscription = await Subscription.findOne({ _id: id, business_id: businessId });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  subscription.status = 'cancelled';
  await subscription.save();

  res.json({
    success: true,
    data: subscription
  });
});
