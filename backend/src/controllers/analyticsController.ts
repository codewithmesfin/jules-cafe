import { Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import InventoryTransaction from '../models/InventoryTransaction';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Get Sales Analytics
 */
export const getSalesAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date, interval = 'daily' } = req.query;
  const businessId = req.user.default_business_id;

  const query: any = {
    business_id: businessId,
    order_status: 'completed'
  };

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  let format = "%Y-%m-%d";
  if (interval === 'weekly') format = "%Y-W%U";
  if (interval === 'monthly') format = "%Y-%m";
  if (interval === 'yearly') format = "%Y";

  const salesData = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format, date: "$created_at" } },
        revenue: { $sum: "$total_amount" },
        count: { $sum: 1 },
        avg_value: { $avg: "$total_amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(salesData);
});

/**
 * Get Product Analytics (Top Selling)
 */
export const getProductAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date, limit = 10 } = req.query;
  const businessId = req.user.default_business_id;

  const query: any = {
    business_id: businessId
  };

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  const productData = await OrderItem.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$product_id",
        count: { $sum: "$quantity" },
        revenue: { $sum: { $multiply: ["$quantity", "$price"] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        count: 1,
        revenue: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: Number(limit) }
  ]);

  res.json(productData);
});

/**
 * Get Stock Movement Analytics
 */
export const getStockAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date } = req.query;
  const businessId = req.user.default_business_id;

  const query: any = { business_id: businessId };

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  const stockData = await InventoryTransaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$reference_type",
        total_quantity: { $sum: "$change_quantity" },
        transaction_count: { $sum: 1 }
      }
    }
  ]);

  res.json(stockData);
});
