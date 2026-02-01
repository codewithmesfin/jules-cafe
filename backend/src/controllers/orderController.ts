import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { deductInventoryForOrder, revertInventoryForOrder } from '../utils/inventoryUtils';
import { sendEmail } from '../utils/mailer';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllOrders = factory.getAll(Order);
export const getOrder = factory.getOne(Order);
export const updateOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const existingOrder = await Order.findById(req.params.id);
  if (!existingOrder) {
    return next(new AppError('Order not found', 404));
  }

  // Branch security check
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && existingOrder.branch_id) {
    if (existingOrder.branch_id.toString() !== req.user.branch_id?.toString()) {
      return next(new AppError('You do not have permission to update this order', 403));
    }
  }

  const itemsChanged = req.body.items && JSON.stringify(req.body.items) !== JSON.stringify(existingOrder.items);
  const statusChanged = req.body.status && req.body.status !== existingOrder.status;

  // Handle inventory adjustments
  if (itemsChanged && existingOrder.status !== 'cancelled') {
    await revertInventoryForOrder(existingOrder, req.user?._id || req.user?.id || 'system');
  } else if (statusChanged && req.body.status === 'cancelled' && existingOrder.status !== 'cancelled') {
    await revertInventoryForOrder(existingOrder, req.user?._id || req.user?.id || 'system');
  } else if (statusChanged && existingOrder.status === 'cancelled' && req.body.status !== 'cancelled') {
    // Will be handled after update
  }

  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    return next(new AppError('Order not found after update', 404));
  }

  if (itemsChanged && order.status !== 'cancelled') {
    await deductInventoryForOrder(order, req.user?._id || req.user?.id || 'system');
  } else if (statusChanged && existingOrder.status === 'cancelled' && order.status !== 'cancelled') {
    await deductInventoryForOrder(order, req.user?._id || req.user?.id || 'system');
  }

  res.status(200).json(order);
});

export const deleteOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Branch security check
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && order.branch_id) {
    if (order.branch_id.toString() !== req.user.branch_id?.toString()) {
      return next(new AppError('You do not have permission to delete this order', 403));
    }
  }

  // Revert inventory if order was active
  if (order.status !== 'cancelled' && order.status !== 'completed') {
    try {
      await revertInventoryForOrder(order, req.user?._id || req.user?.id || 'system');
    } catch (err) {
      console.error('Failed to revert inventory on deletion:', err);
    }
  }

  await Order.findByIdAndDelete(req.params.id);
  res.status(204).json(null);
});

export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  // Force branch_id for non-admins
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role)) {
    data.branch_id = req.user.branch_id;
  }

  if (!data.branch_id) {
    return next(new AppError('branch_id is required', 400));
  }

  // Idempotency check
  if (data.client_request_id) {
    const existingOrder = await Order.findOne({ client_request_id: data.client_request_id });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }
  }

  const order = await Order.create(data);

  // Deduct Inventory based on Recipes
  try {
    await deductInventoryForOrder(order, req.user?._id || req.user?.id || 'system');
  } catch (inventoryError) {
    console.error('Failed to deduct inventory:', inventoryError);
    // We continue even if inventory deduction fails to not block the order
  }

  // Attempt to send email to customer if email is provided
  try {
    const customer = await User.findById(order.customer_id);
    if (customer && customer.email) {
      await sendEmail({
        email: customer.email,
        subject: `Order Confirmation - ${order.order_number}`,
        message: `Your order ${order.order_number} has been placed successfully. Total: ${order.total_amount}`,
      });
    }
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Don't fail the order creation if email fails
  }

  res.status(201).json(order);
});

export const getStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const query: any = {};

  // Branch filtering for managers
  if (req.user?.role === 'manager' && req.user.branch_id) {
    query.branch_id = req.user.branch_id;
  }

  // Basic stats for dashboard
  const totalOrders = await Order.countDocuments(query);

  const revenueMatch: any = { status: 'completed' };
  if (query.branch_id) revenueMatch.branch_id = query.branch_id;

  const totalRevenue = await Order.aggregate([
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: '$total_amount' } } },
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    // Mocking other fields for frontend compatibility if needed
    avgRating: 4.5,
    topBranches: [],
    revenuePerDay: []
  });
});
