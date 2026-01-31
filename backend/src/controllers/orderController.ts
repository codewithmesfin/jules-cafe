import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';
import { sendEmail } from '../utils/mailer';

export const getAllOrders = factory.getAll(Order);
export const getOrder = factory.getOne(Order);
export const updateOrder = factory.updateOne(Order);
export const deleteOrder = factory.deleteOne(Order);

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.create(req.body);

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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const revenuePerDay = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          total: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topBranches = await Order.aggregate([
      {
        $group: {
          _id: '$branch_id',
          count: { $sum: 1 },
          sales: { $sum: '$total_amount' }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $project: {
          branch_name: '$branch.branch_name',
          count: 1
        }
      }
    ]);

    // Average rating
    const Review = mongoose.model('Review');
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avg: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      totalOrders,
      totalCustomers,
      revenuePerDay,
      topBranches,
      avgRating: avgRating.length > 0 ? avgRating[0].avg / avgRating[0].count : 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
