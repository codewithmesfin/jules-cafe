import { Request, Response, NextFunction } from 'express';
import MenuItem from '../models/MenuItem';
import Item from '../models/Item';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllMenuItems = factory.getAll(MenuItem);
export const getMenuItem = factory.getOne(MenuItem);
export const deleteMenuItem = factory.deleteOne(MenuItem);

export const createMenuItem = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  // Auto-set company_id from user
  if (req.user?.company_id) {
    data.company_id = req.user.company_id;
  }

  // Auto-set branch_id from user (for manager/staff/cashier) or from request
  if (!data.branch_id) {
    if (['manager', 'staff', 'cashier'].includes(req.user?.role) && req.user?.branch_id) {
      data.branch_id = req.user.branch_id;
    }
  }

  // Validate item_id is required and references Items table
  if (!data.item_id || data.item_id === '') {
    return next(new AppError('item_id is required. Please select an item from the Items catalog.', 400));
  }

  // Validate item_id is a valid ObjectId
  if (!data.item_id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid item_id format', 400));
  }

  // Verify the item exists in Items table and is of type 'menu_item'
  const item = await Item.findById(data.item_id);
  if (!item) {
    return next(new AppError('Item not found in Items catalog', 400));
  }
  if (item.item_type !== 'menu_item') {
    return next(new AppError('Selected item must be of type "menu_item"', 400));
  }

  // Validate category_id is required
  if (!data.category_id || data.category_id === '') {
    return next(new AppError('category_id is required', 400));
  }

  // Validate category_id is a valid ObjectId
  if (!data.category_id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid category_id format', 400));
  }

  // Auto-populate name from Items table if not provided
  if (!data.name && item) {
    data.name = item.item_name;
  }

  // Auto-populate image_url from Items table if not provided
  if (!data.image_url && item?.image_url) {
    data.image_url = item.image_url;
  }

  // Auto-populate description from Items table if not provided
  if (!data.description && item?.description) {
    data.description = item.description;
  }

  if (req.file) {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    data.image_url = `${baseUrl}/uploads/${req.file.filename}`;
  }

  const doc = await MenuItem.create(data);
  res.status(201).json(doc);
});

export const updateMenuItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Validate item_id if provided
  if (data.item_id && data.item_id !== '') {
    if (!data.item_id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Invalid item_id format', 400));
    }

    // Verify the item exists in Items table
    const item = await Item.findById(data.item_id);
    if (!item) {
      return next(new AppError('Item not found in Items catalog', 400));
    }

    // Auto-update name from Items table if item changed
    if (item && !data.name) {
      data.name = item.item_name;
    }
  }

  // Validate category_id if provided
  if (data.category_id && data.category_id !== '') {
    if (!data.category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Invalid category_id format', 400));
    }
  }

  // If a new file is uploaded, use it; otherwise keep the existing image_url
  if (req.file) {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    data.image_url = `${baseUrl}/uploads/${req.file.filename}`;
  } else if (req.body.image_url) {
    data.image_url = req.body.image_url;
  }

  const doc = await MenuItem.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('Document not found', 404));
  }
  res.status(200).json(doc);
});
