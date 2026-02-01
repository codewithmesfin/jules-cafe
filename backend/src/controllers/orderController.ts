import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { sendEmail } from '../utils/mailer';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllOrders = factory.getAll(Order);
export const getOrder = factory.getOne(Order);
export const updateOrder = factory.updateOne(Order);
export const deleteOrder = factory.deleteOne(Order);

export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  const order = await Order.create(data);

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

export const getStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Basic stats for dashboard
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total_amount' } } },
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    // Add more as needed
  });
});
