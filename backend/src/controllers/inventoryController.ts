import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';

export const getAllInventory = factory.getAll(Inventory);
export const getInventory = factory.getOne(Inventory);
export const createInventory = factory.createOne(Inventory);
export const updateInventory = factory.updateOne(Inventory);
export const deleteInventory = factory.deleteOne(Inventory);

export const getInventoryTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const transactions = await InventoryTransaction.find({
    business_id: req.user.default_business_id
  }).populate('ingredient_id').sort('-created_at');
  res.status(200).json(transactions);
});
