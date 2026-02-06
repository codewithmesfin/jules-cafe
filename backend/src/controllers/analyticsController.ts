import { Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import InventoryTransaction from '../models/InventoryTransaction';
import Customer from '../models/Customer';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

/**
 * Get Date Range from Period
 */
const getDateRangeFromPeriod = (period: string) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return { start, end: now };
};

/**
 * Get Sales Analytics - Summary (Totals)
 */
export const getSalesSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const { period = 'week' } = req.query;
  const businessId = req.user.default_business_id;
  
  const { start, end } = getDateRangeFromPeriod(period as string);
  
  const query = {
    business_id: businessId,
    order_status: 'completed',
    created_at: { $gte: start, $lte: end }
  };
  
  // Get total revenue and orders
  const totals = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total_amount" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$total_amount" }
      }
    }
  ]);
  
  // Get total customers
  const totalCustomers = await Order.distinct('customer_id', query);
  
  // Get recent orders
  const recentOrders = await Order.find(query)
    .sort({ created_at: -1 })
    .limit(10)
    .populate('customer_id', 'name')
    .lean();
  
  // Get trends (daily data)
  const trends = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
        revenue: { $sum: "$total_amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({
    totalRevenue: totals[0]?.totalRevenue || 0,
    totalOrders: totals[0]?.totalOrders || 0,
    totalCustomers: totalCustomers.length,
    avgOrderValue: totals[0]?.avgOrderValue || 0,
    recentOrders: recentOrders.map(o => ({
      id: o._id,
      order_number: o.order_number,
      customer_name: o.customer_id?.name || 'Guest',
      item_count: o.items?.length || 0,
      total: o.total_amount,
      status: o.order_status,
      created_at: o.created_at
    })),
    trends
  });
});

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
 * Get Product Analytics - Summary (Top Products)
 */
export const getProductsSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const { period = 'week', limit = 5 } = req.query;
  const businessId = req.user.default_business_id;
  
  const { start, end } = getDateRangeFromPeriod(period as string);
  
  const query = {
    business_id: businessId,
    created_at: { $gte: start, $lte: end }
  };
  
  const productData = await OrderItem.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$product_id",
        totalSold: { $sum: "$quantity" },
        totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
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
        totalSold: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: Number(limit) }
  ]);
  
  res.json(productData);
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
