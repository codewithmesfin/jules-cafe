import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllUsers = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let query: any = {};

  // Tenant isolation for non-customer users
  // Note: Customers are returned regardless of company_id (for multi-tenant customer lists)
  if (req.user && req.user.role !== 'customer' && req.user.company_id) {
    // For admin/manager/cashier, show users in their company OR customers without company_id
    query = {
      $or: [
        { company_id: req.user.company_id },
        { role: 'customer' } // Include customers even without company_id
      ]
    };
  }

  if (req.user.role === 'manager' || req.user.role === 'staff' || req.user.role === 'cashier') {
    // Managers/Staff/Cashiers can see users in their branch OR any customer
    query = {
      ...query,
      $or: [
        { branch_id: req.user.branch_id },
        { role: 'customer' }
      ]
    };
  }

  const docs = await User.find(query).populate(req.query.populate as string || '');

  const transformedDocs = docs.map((doc: any) => ({
    ...doc.toObject(),
    id: doc._id.toString()
  }));

  res.status(200).json(transformedDocs);
});
export const getUser = factory.getOne(User);
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    return next(new AppError('User not found', 404));
  }

  // Role based security for deletion
  if (req.user.role === 'manager') {
    // Managers can only delete staff/cashiers/customers in their branch
    const allowedRoles = ['staff', 'cashier', 'customer'];
    if (!allowedRoles.includes(userToDelete.role)) {
      return next(new AppError('You do not have permission to delete this user', 403));
    }

    if (userToDelete.branch_id?.toString() !== req.user.branch_id?.toString() && userToDelete.role !== 'customer') {
      return next(new AppError('You can only delete users in your own branch', 403));
    }
  } else if (req.user.role === 'staff' || req.user.role === 'cashier') {
    // Staff/Cashiers can only delete customers
    if (userToDelete.role !== 'customer') {
      return next(new AppError('You only have permission to delete customer accounts', 403));
    }
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(204).json(null);
});

export const createUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

  // Role based security for creation
  if (req.user.role === 'manager') {
    // Managers can only create staff, cashier or customers for their own branch
    const allowedRoles = ['staff', 'cashier', 'customer'];
    if (!allowedRoles.includes(data.role)) {
      return next(new AppError('Managers can only create staff, cashier or customer accounts', 403));
    }
    data.branch_id = req.user.branch_id;
  } else if (req.user.role === 'staff' || req.user.role === 'cashier') {
    // Staff and Cashiers can ONLY create customer accounts
    if (data.role !== 'customer') {
      return next(new AppError('You only have permission to create customer accounts', 403));
    }
    // They can't set branch_id for customers (or it defaults to their own if we want, but customers are often branch-independent)
    // For consistency with manager, let's set it to their branch.
    data.branch_id = req.user.branch_id;
  }

  // Automatically set created_by and company_id
  data.created_by = req.user?._id || req.user?.id;
  if (req.user && req.user.company_id) {
    data.company_id = req.user.company_id;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password || 'password123', salt);

  const user = await User.create({
    ...data,
    password: hashedPassword,
    passwordResetRequired: true, // Admin created users must reset password
  });

  res.status(201).json(user);
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { password, ...rest } = req.body;
  const data = { ...rest };

  const userToUpdate = await User.findById(req.params.id);
  if (!userToUpdate) {
    return next(new AppError('User not found', 404));
  }

  // Role based security for update
  if (req.user.role === 'admin') {
    // Admins can update any user without restrictions
  } else if (req.user.role === 'manager') {
    // Managers can only update users in their own branch (except customers)
    const canUpdate = userToUpdate.role === 'customer' || 
                      userToUpdate.branch_id?.toString() === req.user.branch_id?.toString();
    if (!canUpdate) {
      return next(new AppError('You can only update users in your own branch', 403));
    }

    // Managers cannot upgrade roles to manager or admin
    if (data.role && ['admin', 'manager'].includes(data.role) && data.role !== userToUpdate.role) {
      return next(new AppError('You cannot assign admin or manager roles', 403));
    }

    // Ensure branch_id is not changed by manager
    delete data.branch_id;
  } else if (req.user.role === 'staff' || req.user.role === 'cashier') {
    // Staff/Cashiers can only update customers
    if (userToUpdate.role !== 'customer') {
      return next(new AppError('You only have permission to update customer accounts', 403));
    }
    // They cannot change the role or branch_id
    delete data.role;
    delete data.branch_id;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(password, salt);
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(user);
});
