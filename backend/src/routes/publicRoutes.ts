import express from 'express';
import Business from '../models/Business';
import Product from '../models/Product';
import Category from '../models/Category';
import Menu from '../models/Menu';
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

/**
 * Public List of Active Businesses
 */
router.get('/public/businesses', catchAsync(async (req, res, next) => {
  const businesses = await Business.find({ is_active: true })
    .select('name slug legal_name description address logo banner')
    .sort('name');

  res.status(200).json({
    success: true,
    data: businesses
  });
}));

/**
 * Public Menu Items (from Menu collection, not Products directly)
 */
router.get('/public/menu', catchAsync(async (req, res, next) => {
  const { business_id } = req.query;
  if (!business_id) {
    return next(new AppError('business_id is required', 400));
  }

  // Get menu items for this business with product details
  const menuItems = await Menu.find({
    business_id,
    is_available: true
  })
    .sort('display_order')
    .populate({
      path: 'product_id',
      populate: { path: 'category_id' }
    });

  // Transform to include category grouping
  const categoriesMap = new Map();
  
  menuItems.forEach((item: any) => {
    const product = item.product_id;
    if (!product) return;
    
    const category = product.category_id;
    const categoryId = category?._id?.toString() || 'uncategorized';
    
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        _id: categoryId,
        name: category?.name || 'Other',
        description: category?.description || '',
        items: []
      });
    }
    
    categoriesMap.get(categoryId).items.push({
      _id: item._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      is_available: item.is_available,
      display_order: item.display_order,
      available_from: item.available_from,
      available_to: item.available_to
    });
  });

  // Also get categories that have products
  const categories = await Category.find({
    business_id,
    is_active: true
  });

  const categoriesWithItems = categories.map((cat: any) => {
    const catData = categoriesMap.get(cat._id.toString());
    return {
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      items: catData?.items || []
    };
  }).filter(cat => cat.items.length > 0 || categories.length === 0);

  res.status(200).json({
    success: true,
    data: {
      categories: categoriesWithItems,
      allItems: menuItems.map((item: any) => ({
        _id: item._id,
        name: item.product_id?.name,
        description: item.product_id?.description,
        price: item.product_id?.price,
        image_url: item.product_id?.image_url,
        is_available: item.is_available,
        category_id: item.product_id?.category_id?._id
      }))
    }
  });
}));

export default router;
