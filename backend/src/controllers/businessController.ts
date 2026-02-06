import { Response, NextFunction } from 'express';
import Business from '../models/Business';
import User from '../models/User';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';

export const switchBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { business_id } = req.body;
  if (!business_id) return next(new AppError('Business ID is required', 400));
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'saas_admin' || user.role === 'admin') {
    const business = await Business.findById(business_id);
    if (!business) return next(new AppError('Business not found', 404));
    if (user.role === 'admin' && business.owner_id.toString() !== user._id.toString()) {
      return next(new AppError('You do not have access to this business', 403));
    }
  } else {
    const hasAccess = user.assigned_businesses?.some((id: any) => id.toString() === business_id);
    if (!hasAccess) return next(new AppError('You do not have access to this business', 403));
  }
  user.default_business_id = business_id as any;
  await user.save();
  const business = await Business.findById(business_id);
  res.status(200).json({ success: true, data: business });
});

export const getMyBusinesses = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));
  let businesses;
  if (user.role === 'saas_admin') {
    businesses = await Business.find().sort('-created_at');
  } else if (user.role === 'admin') {
    businesses = await Business.find({ owner_id: user._id }).sort('-created_at');
  } else {
    const businessIds = user.assigned_businesses || [];
    businesses = await Business.find({ _id: { $in: businessIds } }).sort('-created_at');
  }
  res.status(200).json({ success: true, data: businesses });
});

export const addBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const business = await Business.create({ name, slug, legal_name, address, description, owner_id: req.user._id });
  const user = await User.findById(req.user._id);
  if (user) {
    user.default_business_id = business._id as any;
    await user.save();
  }
  res.status(201).json({ success: true, data: business });
});

export const setupBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, legal_name, address, description } = req.body;
  const userId = req.user._id;
  const existing = await Business.findOne({ owner_id: userId });
  if (existing) return next(new AppError('Business already setup for this account', 400));
  const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const business = await Business.create({ name, slug, legal_name, address, description, owner_id: userId });
  const user = await User.findById(userId);
  if (user) {
    user.default_business_id = business._id as any;
    user.status = 'active';
    await user.save();
  }
  res.status(201).json({ success: true, data: business });
});

export const getMyBusiness = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const business = await Business.findById(req.user.default_business_id);
  if (!business) return next(new AppError('Business not found', 404));
  res.status(200).json({ success: true, data: business });
});

/**
 * Get All Business Invoices (Super Admin only)
 */
export const getBusinessInvoices = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Fetch all invoices with populated business and subscription details
  const invoices = await Invoice.find()
    .sort({ created_at: -1 })
    .populate('business_id', 'name owner_id')
    .lean() as any[];
  
  // Transform invoices for the frontend
  const invoicesWithDetails = invoices.map((invoice) => {
    const business = invoice.business_id as any;
    return {
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoice_number,
      businessId: business?._id,
      businessName: business?.name || 'Unknown Business',
      adminId: business?.owner_id,
      adminName: 'Business Owner',
      amount: invoice.subtotal,
      vatAmount: invoice.vat_amount,
      total: invoice.total,
      status: invoice.status,
      invoiceDate: invoice.created_at,
      dueDate: invoice.due_date,
      paymentDate: invoice.paid_date
    };
  });

  res.status(200).json({ success: true, data: invoicesWithDetails });
});

/**
 * Get Pending Payments (Super Admin only)
 */
export const getPendingPayments = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Fetch all payments with populated invoice and business details
  const payments = await Payment.find()
    .sort({ created_at: -1 })
    .populate('business_id', 'name owner_id')
    .populate('invoice_id', 'invoice_number total status')
    .lean() as any[];
  
  // Transform payments for the frontend
  const paymentsWithDetails = payments.map((payment) => {
    const business = payment.business_id as any;
    const invoice = payment.invoice_id as any;
    return {
      id: payment._id.toString(),
      paymentNumber: `PAY-${payment._id.toString().slice(-8)}`,
      invoiceNumber: invoice?.invoice_number || 'N/A',
      businessId: business?._id,
      businessName: business?.name || 'Unknown Business',
      adminId: business?.owner_id,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      status: payment.status,
      paymentDate: payment.created_at,
      bankAccount: payment.bank_account?.bank_name || 'N/A',
      reference: payment.transaction_reference,
      payerName: payment.payer_name,
      payerPhone: payment.payer_phone,
      payerEmail: payment.payer_email,
      notes: payment.notes
    };
  });

  res.status(200).json({ success: true, data: paymentsWithDetails });
});

/**
 * Toggle Business Status (Super Admin only)
 */
export const toggleBusinessStatus = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const business = await Business.findById(id);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Toggle is_active status
  business.is_active = !business.is_active;
  await business.save();

  res.status(200).json({
    success: true,
    data: {
      id: business._id,
      is_active: business.is_active
    },
    message: `Business ${business.is_active ? 'activated' : 'deactivated'} successfully`
  });
});

/**
 * Verify Payment (Super Admin only)
 * When verified: updates payment status and marks invoice as paid
 * When rejected: updates payment status to rejected
 */
export const verifyPayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { paymentId, status } = req.body;

  if (!paymentId) {
    return next(new AppError('Payment ID is required', 400));
  }

  if (!['verified', 'rejected'].includes(status)) {
    return next(new AppError('Invalid status. Must be verified or rejected', 400));
  }

  // Find the payment
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Update payment status
  payment.status = status;
  if (status === 'verified') {
    payment.verified_at = new Date();
    payment.verified_by = req.user._id;
  }
  await payment.save();

  // Update invoice status based on payment verification
  if (payment.invoice_id) {
    const invoiceStatus = status === 'verified' ? 'paid' : 'rejected';
    const updatedInvoice = await Invoice.findByIdAndUpdate(payment.invoice_id, {
      status: invoiceStatus,
      paid_date: status === 'verified' ? new Date() : undefined
    }, { new: true });

    // If payment is verified, activate the business and create new subscription
    if (status === 'verified' && updatedInvoice) {
      // Activate the business
      await Business.findByIdAndUpdate(payment.business_id, {
        is_active: true
      });

      // Get the original subscription to determine billing cycle
      const originalSubscription = await Subscription.findById(updatedInvoice.subscription_id);
      const billing_cycle = originalSubscription?.billing_cycle || 'monthly';
      const days = billing_cycle === 'yearly' ? 365 : 30;

      // Create new subscription period
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      await Subscription.create({
        business_id: payment.business_id,
        plan: 'standard',
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        billing_cycle,
        daily_rate: 100
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      id: payment._id,
      status: payment.status,
      invoice_id: payment.invoice_id
    },
    message: `Payment ${status === 'verified' ? 'verified' : 'rejected'} successfully`
  });
});

export const getBusiness = factory.getOne(Business);

export const getAllBusinesses = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if user is active
  if (req.user && !req.user.is_active) {
    return next(new AppError('Your account is not active. Please contact the Administrator.', 423));
  }
  
  let businesses = await Business.find().sort('-created_at');
  
  // Transform to add owner_name
  const transformedBusinesses = await Promise.all(businesses.map(async (business: any) => {
    const doc = business.toObject();
    doc.id = business._id.toString();
    
    // Populate owner name
    if (doc.owner_id) {
      const owner = await User.findById(doc.owner_id).select('full_name email');
      if (owner) {
        doc.owner_name = owner.full_name || owner.email;
      }
    }
    
    return doc;
  }));
  
  res.status(200).json(transformedBusinesses);
});
export const updateBusiness = factory.updateOne(Business);
export const deleteBusiness = factory.deleteOne(Business);
