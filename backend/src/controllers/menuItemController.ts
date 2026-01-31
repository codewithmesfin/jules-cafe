import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import * as factory from '../utils/controllerFactory';

export const getAllMenuItems = factory.getAll(MenuItem);
export const getMenuItem = factory.getOne(MenuItem);
export const deleteMenuItem = factory.deleteOne(MenuItem);

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
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
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      data.image_url = `${baseUrl}/uploads/${req.file.filename}`;
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
