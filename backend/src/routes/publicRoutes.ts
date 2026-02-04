import express from 'express';
import Business from '../models/Business';
import Product from '../models/Product';
import Category from '../models/Category';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Public Business Info (by ID or Slug)
 */
router.get('/public/business/:identifier', catchAsync(async (req, res, next) => {
  const { identifier } = req.params;

  let business;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    business = await Business.findById(identifier);
  } else {
    business = await Business.findOne({ slug: identifier });
  }

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  res.status(200).json({
    success: true,
    data: business
  });
}));

/**
 * Public Menu Products
 */
router.get('/public/products', catchAsync(async (req, res, next) => {
  const { business_id } = req.query;
  if (!business_id) {
    return next(new AppError('business_id is required', 400));
  }

  const products = await Product.find({
    business_id,
    is_active: true
  }).populate('category_id');

  res.status(200).json({
    success: true,
    data: products
  });
}));

/**
 * Public Categories
 */
router.get('/public/categories', catchAsync(async (req, res, next) => {
  const { business_id } = req.query;
  if (!business_id) {
    return next(new AppError('business_id is required', 400));
  }

  const categories = await Category.find({
    business_id,
    is_active: true
  });

  res.status(200).json({
    success: true,
    data: categories
  });
}));

export default router;
