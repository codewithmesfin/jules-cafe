import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import BankAccount from '../models/BankAccount';
import Business from '../models/Business';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Pricing constants (prices are INCLUDING VAT)
export const PRICING = {
  basic: { daily: 100, name: 'Basic' }, // 100 ETB/day including 15% VAT
  pro: { daily: 250, name: 'Pro' }, // 250 ETB/day including 15% VAT
  enterprise: { daily: 500, name: 'Enterprise' } // 500 ETB/day including 15% VAT
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

// Helper function to calculate price breakdown (prices already include VAT)
const calculatePriceBreakdown = (dailyRate: number, billingCycle: string) => {
  const days = billingCycle === 'yearly' ? 365 : 30;
  const discountPercent = billingCycle === 'yearly' ? YEARLY_DISCOUNT : 0;
  
  // Price with VAT
  const priceWithVAT = dailyRate * days;
  
  // Calculate subtotal (remove VAT from the price)
  const subtotal = priceWithVAT / (1 + VAT_RATE / 100);
  const vatAmount = priceWithVAT - subtotal;
  
  // Apply discount
  const discount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discount;
  const total = subtotalAfterDiscount + vatAmount;
  
  return {
    days,
    subtotal,
    vat_amount: vatAmount,
    discount_percent: discountPercent,
    discount_amount: discount,
    subtotal_after_discount: subtotalAfterDiscount,
    total
  };
};

// Get current subscription for a business
export const getCurrentSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.default_business_id;
  
  if (!businessId) {
    // Return null if no business associated - user needs to set up a business first
    return res.json({
      success: true,
      data: null,
      message: 'No business associated with your account. Please set up your business first.'
    });
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
  const priceBreakdown = calculatePriceBreakdown(dailyRate, billing_cycle);
  
  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + priceBreakdown.days);

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
    days: priceBreakdown.days,
    subtotal: priceBreakdown.subtotal,
    vat_amount: priceBreakdown.vat_amount,
    discount: priceBreakdown.discount_amount,
    discount_percent: priceBreakdown.discount_percent,
    total: priceBreakdown.total,
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
  const priceBreakdown = calculatePriceBreakdown(dailyRate, cycleKey);

  res.json({
    success: true,
    data: {
      plan: PRICING[planKey as keyof typeof PRICING].name,
      plan_key: planKey,
      billing_cycle: cycleKey,
      days: priceBreakdown.days,
      daily_rate: dailyRate,
      subtotal: priceBreakdown.subtotal,
      discount_percent: priceBreakdown.discount_percent,
      discount_amount: priceBreakdown.discount_amount,
      subtotal_after_discount: priceBreakdown.subtotal_after_discount,
      vat_rate: VAT_RATE,
      vat_amount: priceBreakdown.vat_amount,
      total: priceBreakdown.total
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
