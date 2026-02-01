import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import InventoryItem from '../models/InventoryItem';
import Item from '../models/Item';
import StockEntry from '../models/StockEntry';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const query: any = { is_active: true };

  // Branch security for manager/staff/cashier
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && req.user.branch_id) {
    query.branch_id = req.user.branch_id;
  } else if (req.query.branch_id) {
    query.branch_id = req.query.branch_id;
  }

  const doc = await InventoryItem.find(query)
    .populate('item_id', 'item_name category unit item_type')
    .populate('branch_id', 'branch_name')
    .sort({ 'item_id.item_name': 1 });

  const transformedDoc = doc.map((item: any) => ({
    ...item.toObject(),
    id: item._id.toString(),
    item_id: item.item_id?._id?.toString() || item.item_id?.toString(),
    // Map to frontend expected field names
    item_name: item.item_id?.item_name || item.item_name || 'Unknown',
    category: item.item_id?.category || item.category || '',
    unit: item.item_id?.unit || item.unit || '',
    quantity: item.current_quantity ?? 0,
    min_stock: item.min_stock_level ?? 0,
  }));

  res.status(200).json(transformedDoc);
});

export const getOneInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const doc = await InventoryItem.findById(req.params.id)
    .populate('item_id', 'item_name category unit item_type')
    .populate('branch_id', 'branch_name');

  if (!doc) {
    return next(new AppError('Document not found', 404));
  }

  // Branch security check
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && doc.branch_id) {
    if (doc.branch_id.toString() !== req.user.branch_id?.toString()) {
      return next(new AppError('You do not have permission to access this inventory item', 403));
    }
  }

  const item: any = doc.toObject();
  res.status(200).json({
    ...item,
    id: doc._id.toString(),
    item_id: item.item_id?._id?.toString() || item.item_id?.toString(),
    // Map to frontend expected field names
    item_name: item.item_id?.item_name || item.item_name || 'Unknown',
    category: item.item_id?.category || item.category || '',
    unit: item.item_id?.unit || item.unit || '',
    quantity: item.current_quantity ?? 0,
    min_stock: item.min_stock_level ?? 0,
  });
});

export const createInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  // Auto-set/Force branch_id for non-admins
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role)) {
    data.branch_id = req.user.branch_id;
  }

  if (!data.branch_id) {
    return next(new AppError('branch_id is required', 400));
  }

  // Validate item_id is provided
  if (!data.item_id || data.item_id === '') {
    return next(new AppError('item_id is required. Please select an item from the Items catalog.', 400));
  }

  // Validate item_id is a valid ObjectId
  if (!data.item_id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid item_id format', 400));
  }

  // Verify the item exists in Items table
  const item = await Item.findById(data.item_id);
  if (!item) {
    return next(new AppError('Item not found in Items catalog', 400));
  }

  // Only 'inventory' type items can be added to inventory
  if (item.item_type !== 'inventory') {
    return next(new AppError('Selected item must be of type "inventory"', 400));
  }

  // Auto-populate fields from Items table if not provided
  if (!data.item_name) {
    data.item_name = item.item_name;
  }
  if (!data.category && item.category) {
    data.category = item.category;
  }
  if (!data.unit && item.unit) {
    data.unit = item.unit;
  }

  // Set default values for required fields if not provided
  if (data.min_stock_level === undefined || data.min_stock_level === null) {
    data.min_stock_level = data.min_stock ?? 0;
  }
  if (data.current_quantity === undefined || data.current_quantity === null) {
    data.current_quantity = data.quantity ?? 0;
  }

  // Check if inventory already exists for this branch and item
  const existing = await InventoryItem.findOne({
    branch_id: data.branch_id,
    item_id: data.item_id,
  });

  if (existing) {
    return next(new AppError('Inventory item already exists for this branch. Use update instead.', 400));
  }

  // Create with properly mapped field names
  const doc = await InventoryItem.create([{
    branch_id: data.branch_id,
    item_id: data.item_id,
    current_quantity: data.current_quantity,
    min_stock_level: data.min_stock_level,
    last_restocked: new Date(),
    created_by: data.created_by,
  }]);
  const createdDoc = doc[0];

  // Create stock entry for the initial stock
  if (data.quantity > 0) {
    await StockEntry.create({
      branch_id: data.branch_id,
      item_id: data.item_id,
      entry_type: 'purchase',
      quantity: data.quantity,
      previous_quantity: 0,
      new_quantity: data.quantity,
      reference_type: 'Inventory',
      reference_id: createdDoc._id,
      performed_by: req.user?._id || req.user?.id || 'system',
      notes: 'Initial inventory creation',
    });
  }

  // Fetch the created document with populated fields
  const populatedDoc = await InventoryItem.findById(createdDoc._id)
    .populate('item_id', 'item_name category unit item_type')
    .populate('branch_id', 'branch_name');

  if (!populatedDoc) {
    return next(new AppError('Failed to fetch created inventory item', 500));
  }

  const invItem: any = populatedDoc.toObject();
  res.status(201).json({
    ...invItem,
    id: invItem._id.toString(),
    item_id: invItem.item_id?._id?.toString() || invItem.item_id?.toString(),
    // Map to frontend expected field names
    item_name: invItem.item_id?.item_name || invItem.item_name || 'Unknown',
    category: invItem.item_id?.category || invItem.category || '',
    unit: invItem.item_id?.unit || invItem.unit || '',
    quantity: invItem.current_quantity ?? 0,
    min_stock: invItem.min_stock_level ?? 0,
  });
});

export const updateInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  const existingDoc = await InventoryItem.findById(req.params.id);
  if (!existingDoc) {
    return next(new AppError('Document not found', 404));
  }

  // Branch security check
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && existingDoc.branch_id) {
    if (existingDoc.branch_id.toString() !== req.user.branch_id?.toString()) {
      return next(new AppError('You do not have permission to update this inventory item', 403));
    }
  }

  // Handle stock update
  if (data.quantity !== undefined) {
    const quantityChange = parseFloat(data.quantity);
    const previousQuantity = existingDoc.current_quantity || 0;
    const newQuantity = previousQuantity + quantityChange;

    if (newQuantity < 0) {
      return next(new AppError('Insufficient stock', 400));
    }

    existingDoc.current_quantity = newQuantity;
    existingDoc.last_restocked = new Date();
    await existingDoc.save();

    // Create stock entry
    const entryType = quantityChange >= 0 ? 'purchase' : 'sale';
    await StockEntry.create({
      branch_id: existingDoc.branch_id,
      item_id: existingDoc.item_id,
      entry_type: entryType,
      quantity: Math.abs(quantityChange),
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: 'Inventory',
      reference_id: existingDoc._id,
      performed_by: (req as any).user?._id || 'system',
      notes: data.notes || 'Manual stock adjustment',
    });
  }

  if (data.min_stock !== undefined) {
    existingDoc.min_stock_level = parseFloat(data.min_stock);
    await existingDoc.save();
  }

  const updatedDoc = await InventoryItem.findById(req.params.id)
    .populate('item_id', 'item_name category unit item_type')
    .populate('branch_id', 'branch_name');

  if (!updatedDoc) {
    return next(new AppError('Document not found after update', 404));
  }

  const invItem: any = updatedDoc.toObject();
  res.status(200).json({
    ...invItem,
    id: invItem._id.toString(),
    item_id: invItem.item_id?._id?.toString() || invItem.item_id?.toString(),
    // Map to frontend expected field names
    item_name: invItem.item_id?.item_name || invItem.item_name || 'Unknown',
    category: invItem.item_id?.category || invItem.category || '',
    unit: invItem.item_id?.unit || invItem.unit || '',
    quantity: invItem.current_quantity ?? 0,
    min_stock: invItem.min_stock_level ?? 0,
  });
});

export const deleteInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const existingDoc = await InventoryItem.findById(req.params.id);
  if (!existingDoc) {
    return next(new AppError('Document not found', 404));
  }

  // Branch security check
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role) && existingDoc.branch_id) {
    if (existingDoc.branch_id.toString() !== req.user.branch_id?.toString()) {
      return next(new AppError('You do not have permission to delete this inventory item', 403));
    }
  }

  await InventoryItem.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Inventory item deleted' });
});
