import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export const getAllInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  
  const inventory = await Inventory.find({ business_id: businessId })
    .populate('item_id')
    .sort({ created_at: -1 });

  const transformed = inventory.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));

  res.status(200).json(transformed);
});

export const getInventory = factory.getOne(Inventory, { populate: 'item_id' });

export const createInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { item_id, item_type, quantity_available, reorder_level } = req.body;
  const businessId = req.user.default_business_id;

  // Use atomic upsert to prevent race conditions
  const inventory = await Inventory.findOneAndUpdate(
    { business_id: businessId, item_id: item_id, item_type: item_type },
    { 
      $set: { 
        quantity_available: quantity_available || 0,
        reorder_level: reorder_level || 0
      },
      $setOnInsert: { 
        creator_id: req.user._id,
        business_id: businessId,
        item_id: item_id,
        item_type: item_type
      }
    },
    { 
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  res.status(201).json({
    success: true,
    data: { ...inventory.toObject(), id: inventory._id.toString() }
  });
});

export const updateInventory = factory.updateOne(Inventory);

export const deleteInventory = factory.deleteOne(Inventory);

export const addStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { item_id, item_type, quantity, note } = req.body;
  const businessId = req.user.default_business_id;

  // Use atomic upsert to prevent race conditions
  const inventory = await Inventory.findOneAndUpdate(
    { business_id: businessId, item_id: item_id, item_type: item_type },
    { 
      $inc: { quantity_available: quantity },
      $setOnInsert: { 
        creator_id: req.user._id,
        business_id: businessId,
        item_id: item_id,
        item_type: item_type,
        reorder_level: 0
      }
    },
    { 
      upsert: true,
      new: true
    }
  );

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: item_id,
    item_type: item_type,
    change_quantity: quantity,
    reference_type: 'purchase',
    creator_id: req.user._id,
    note
  });

  res.status(200).json({
    success: true,
    data: {
      ...inventory.toObject(),
      id: inventory._id.toString(),
      transaction: { quantity, note }
    }
  });
});

export const getInventoryTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  
  const transactions = await InventoryTransaction.find({ business_id: businessId })
    .populate('item_id')
    .sort('-created_at');

  const transformed = transactions.map(t => ({
    ...t.toObject(),
    id: t._id.toString()
  }));

  res.status(200).json(transformed);
});
