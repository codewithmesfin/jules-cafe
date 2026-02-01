import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Review from '../models/Review';
import Branch from '../models/Branch';
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
  const userId = req.user?._id || req.user?.id || (existingOrder.created_by as any);
  if (itemsChanged && existingOrder.status !== 'cancelled') {
    await revertInventoryForOrder(existingOrder, userId);
  } else if (statusChanged && req.body.status === 'cancelled' && existingOrder.status !== 'cancelled') {
    await revertInventoryForOrder(existingOrder, userId);
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
    await deductInventoryForOrder(order, userId);
  } else if (statusChanged && existingOrder.status === 'cancelled' && order.status !== 'cancelled') {
    await deductInventoryForOrder(order, userId);
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
      const userId = req.user?._id || req.user?.id || (order.created_by as any);
      await revertInventoryForOrder(order, userId);
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
    const userId = req.user?._id || req.user?.id || (order.created_by as any);
    await deductInventoryForOrder(order, userId);
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
  const branchId = req.user?.role === 'manager' ? req.user.branch_id : req.query.branch_id;

  if (branchId) {
    query.branch_id = branchId;
  }

  // 1. Basic counts
  const totalOrders = await Order.countDocuments(query);

  // 2. Revenue calculation
  const revenueMatch: any = { status: 'completed', ...query };
  const totalRevenueData = await Order.aggregate([
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: '$total_amount' } } },
  ]);
  const totalRevenue = totalRevenueData[0]?.total || 0;

  // 3. Revenue per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenuePerDay = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        created_at: { $gte: thirtyDaysAgo },
        ...query
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
        total: { $sum: "$total_amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 4. Orders per Branch
  let topBranches = [];
  if (!branchId) {
    const branchStats = await Order.aggregate([
      {
        $group: {
          _id: "$branch_id",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populate branch names
    topBranches = await Promise.all(branchStats.map(async (stat) => {
      const branch = await Branch.findById(stat._id);
      return {
        name: branch?.branch_name || 'Unknown Branch',
        count: stat.count
      };
    }));
  }

  // 5. Average Rating
  const reviewMatch: any = { is_approved: true };
  if (branchId) reviewMatch.branch_id = branchId;

  const ratingData = await Review.aggregate([
    { $match: reviewMatch },
    { $group: { _id: null, avg: { $avg: "$rating" } } }
  ]);
  const avgRating = ratingData[0]?.avg || 0;

  res.json({
    totalOrders,
    totalRevenue,
    avgRating,
    topBranches,
    revenuePerDay
  });
});
