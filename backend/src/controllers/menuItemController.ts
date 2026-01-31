import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Item from '../models/Item';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';

export const getAllMenuItems = factory.getAll(MenuItem);
export const getMenuItem = factory.getOne(MenuItem);
export const deleteMenuItem = factory.deleteOne(MenuItem);

export const createMenuItem = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body };
    
    // Automatically set created_by to the authenticated user's ID
    data.created_by = req.user?._id || req.user?.id;
    
    // Validate item_id is required and references Items table
    if (!data.item_id || data.item_id === '') {
      return res.status(400).json({ error: 'item_id is required. Please select an item from the Items catalog.' });
    }
    
    // Validate item_id is a valid ObjectId
    if (!data.item_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid item_id format' });
    }
    
    // Verify the item exists in Items table and is of type 'menu_item'
    const item = await Item.findById(data.item_id);
    if (!item) {
      return res.status(400).json({ error: 'Item not found in Items catalog' });
    }
    if (item.item_type !== 'menu_item') {
      return res.status(400).json({ error: 'Selected item must be of type "menu_item"' });
    }
    
    // Validate category_id is required
    if (!data.category_id || data.category_id === '') {
      return res.status(400).json({ error: 'category_id is required' });
    }
    
    // Validate category_id is a valid ObjectId
    if (!data.category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid category_id format' });
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    
    // Validate item_id if provided
    if (data.item_id && data.item_id !== '') {
      if (!data.item_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid item_id format' });
      }
      
      // Verify the item exists in Items table
      const item = await Item.findById(data.item_id);
      if (!item) {
        return res.status(400).json({ error: 'Item not found in Items catalog' });
      }
      
      // Auto-update name from Items table if item changed
      if (item && !data.name) {
        data.name = item.item_name;
      }
    }
    
    // Validate category_id if provided
    if (data.category_id && data.category_id !== '') {
      if (!data.category_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid category_id format' });
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
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.status(200).json(doc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
