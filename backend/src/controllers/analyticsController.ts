import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import StockEntry from '../models/StockEntry';
import Branch from '../models/Branch';
import MenuItem from '../models/MenuItem';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getSalesAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date, branch_id, interval = 'daily' } = req.query;

  const query: any = { status: 'completed' };
  if (branch_id) query.branch_id = new mongoose.Types.ObjectId(branch_id as string);

  // Tenant isolation
  if (req.user && req.user.role !== 'customer') {
    if (req.user.company_id) {
      query.company_id = req.user.company_id;
    }
  }

  if (req.user?.role === 'manager') {
    query.branch_id = req.user.branch_id;
  }

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
        total_revenue: { $sum: "$total_amount" },
        order_count: { $sum: 1 },
        avg_order_value: { $avg: "$total_amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(salesData);
});

export const getStockAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date, branch_id } = req.query;

  const query: any = {};
  if (branch_id) query.branch_id = new mongoose.Types.ObjectId(branch_id as string);

  // Tenant isolation
  if (req.user && req.user.role !== 'customer') {
    if (req.user.company_id) {
      query.company_id = req.user.company_id;
    }
  }

  if (req.user?.role === 'manager') {
    query.branch_id = req.user.branch_id;
  }

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  const stockData = await StockEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$entry_type",
        total_quantity: { $sum: "$quantity" },
        total_value: { $sum: "$total_cost" },
        entry_count: { $sum: 1 }
      }
    }
  ]);

  res.json(stockData);
});

export const getProductAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date, branch_id, limit = 10 } = req.query;

  const query: any = { status: 'completed' };
  if (branch_id) query.branch_id = new mongoose.Types.ObjectId(branch_id as string);

  // Tenant isolation
  if (req.user && req.user.role !== 'customer') {
    if (req.user.company_id) {
      query.company_id = req.user.company_id;
    }
  }

  if (req.user?.role === 'manager') {
    query.branch_id = req.user.branch_id;
  }

  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  const productData = await Order.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menu_item_id",
        name: { $first: "$items.menu_item_name" },
        total_sold: { $sum: "$items.quantity" },
        total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } }
      }
    },
    { $sort: { total_sold: -1 } },
    { $limit: Number(limit) }
  ]);

  res.json(productData);
});

export const getBranchPerformance = catchAsync(async (req: AuthRequest, res: Response) => {
  const { start_date, end_date } = req.query;

  const query: any = { status: 'completed' };

  // Tenant isolation
  if (req.user && req.user.role !== 'customer') {
    if (req.user.company_id) {
      query.company_id = req.user.company_id;
    }
  }
  if (start_date || end_date) {
    query.created_at = {};
    if (start_date) query.created_at.$gte = new Date(start_date as string);
    if (end_date) query.created_at.$lte = new Date(end_date as string);
  }

  const performanceData = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$branch_id",
        total_revenue: { $sum: "$total_amount" },
        order_count: { $sum: 1 }
      }
    },
    { $sort: { total_revenue: -1 } }
  ]);

  // Populate branch names
  const populatedData = await Promise.all(performanceData.map(async (item) => {
    const branch = await Branch.findById(item._id);
    return {
      ...item,
      branch_name: branch?.branch_name || 'Unknown'
    };
  }));

  res.json(populatedData);
});
