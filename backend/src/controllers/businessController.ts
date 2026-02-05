import { Response, NextFunction } from 'express';
import Business from '../models/Business';
import User from '../models/User';
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
  const businesses = await Business.find().select('_id name owner_id').lean() as any[];
  const ownerIds = businesses.map(b => b.owner_id);
  const owners = await User.find({ _id: { $in: ownerIds } }).select('full_name email').lean() as any[];

  // Mock invoices data based on businesses
  const invoicesWithDetails = businesses.map((business) => {
    const owner = owners.find(o => o._id.toString() === business.owner_id?.toString());
    return {
      id: `inv-${business._id}`,
      invoiceNumber: `INV-${business._id.toString().slice(-8)}`,
      businessId: business._id,
      businessName: business.name,
      adminId: business.owner_id,
      adminName: owner?.full_name || 'Unknown',
      amount: 599,
      vatAmount: 89.85,
      total: 688.85,
      status: 'paid',
      invoiceDate: business.created_at,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  });

  res.status(200).json({ success: true, data: invoicesWithDetails });
});

/**
 * Get Pending Payments (Super Admin only)
 */
export const getPendingPayments = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businesses = await Business.find().select('_id name owner_id').lean() as any[];
  const ownerIds = businesses.map(b => b.owner_id);
  const owners = await User.find({ _id: { $in: ownerIds } }).select('full_name email').lean() as any[];

  // Mock pending payments
  const paymentsWithDetails = businesses.slice(0, 2).map((business) => {
    const owner = owners.find(o => o._id.toString() === business.owner_id?.toString());
    return {
      id: `pay-${business._id}`,
      businessId: business._id,
      businessName: business.name,
      adminId: business.owner_id,
      adminName: owner?.full_name || 'Unknown',
      amount: 599,
      paymentDate: new Date(),
      status: 'pending',
      bankAccount: 'Commercial Bank of Ethiopia'
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
 */
export const verifyPayment = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { paymentId, status } = req.body;

  // In real implementation, this would update Payment model
  res.status(200).json({
    success: true,
    data: {
      id: paymentId,
      status
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
