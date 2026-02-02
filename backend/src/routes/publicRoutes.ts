import express from 'express';
import MenuItem from '../models/MenuItem';
import Category from '../models/Category';
import Branch from '../models/Branch';
import BranchMenuItem from '../models/BranchMenuItem';
import MenuVariant from '../models/MenuVariant';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';

const router = express.Router();

// Public routes for menu display - no authentication required

// Menu Items - public read-only access
router.route('/public/menu-items')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await MenuItem.find({ is_active: true });
    // Transform _id to id for frontend compatibility
    const transformedDocs = doc.map((d: any) => ({
      ...d.toObject(),
      id: d._id.toString()
    }));
    res.status(200).json({
      status: 'success',
      results: transformedDocs.length,
      data: transformedDocs
    });
  }));

router.route('/public/menu-items/:id')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await MenuItem.findById(req.params.id);
    if (!doc) {
      return next(new (require('../utils/appError').default)('Menu item not found', 404));
    }
    // Transform _id to id for frontend compatibility
    const transformedDoc = {
      ...doc.toObject(),
      id: doc._id.toString()
    };
    res.status(200).json({
      status: 'success',
      data: transformedDoc
    });
  }));

// Categories - public read-only access
router.route('/public/categories')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await Category.find({ is_active: true });
    // Transform _id to id for frontend compatibility
    const transformedDocs = doc.map((d: any) => ({
      ...d.toObject(),
      id: d._id.toString()
    }));
    res.status(200).json({
      status: 'success',
      results: transformedDocs.length,
      data: transformedDocs
    });
  }));

router.route('/public/categories/:id')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await Category.findById(req.params.id);
    if (!doc) {
      return next(new (require('../utils/appError').default)('Category not found', 404));
    }
    // Transform _id to id for frontend compatibility
    const transformedDoc = {
      ...doc.toObject(),
      id: doc._id.toString()
    };
    res.status(200).json({
      status: 'success',
      data: transformedDoc
    });
  }));

// Branches - public read-only access
router.route('/public/branches')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await Branch.find({ is_active: true });
    // Transform _id to id and branch_name to name for frontend compatibility
    const transformedDocs = doc.map((d: any) => ({
      ...d.toObject(),
      id: d._id.toString(),
      name: d.branch_name
    }));
    res.status(200).json({
      status: 'success',
      results: transformedDocs.length,
      data: transformedDocs
    });
  }));

router.route('/public/branches/:id')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await Branch.findById(req.params.id);
    if (!doc) {
      return next(new (require('../utils/appError').default)('Branch not found', 404));
    }
    // Transform _id to id and branch_name to name for frontend compatibility
    const transformedDoc = {
      ...doc.toObject(),
      id: doc._id.toString(),
      name: doc.branch_name
    };
    res.status(200).json({
      status: 'success',
      data: transformedDoc
    });
  }));

// Branch Menu Items - public read-only access
router.route('/public/branch-menu-items')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await BranchMenuItem.find();
    // Transform _id to id for frontend compatibility
    const transformedDocs = doc.map((d: any) => ({
      ...d.toObject(),
      id: d._id.toString()
    }));
    res.status(200).json({
      status: 'success',
      results: transformedDocs.length,
      data: transformedDocs
    });
  }));

router.route('/public/branch-menu-items/:id')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await BranchMenuItem.findById(req.params.id);
    if (!doc) {
      return next(new (require('../utils/appError').default)('Branch menu item not found', 404));
    }
    // Transform _id to id for frontend compatibility
    const transformedDoc = {
      ...doc.toObject(),
      id: doc._id.toString()
    };
    res.status(200).json({
      status: 'success',
      data: transformedDoc
    });
  }));

// Menu Variants - public read-only access
router.route('/public/menu-variants')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await MenuVariant.find({ is_active: true });
    // Transform _id to id for frontend compatibility
    const transformedDocs = doc.map((d: any) => ({
      ...d.toObject(),
      id: d._id.toString()
    }));
    res.status(200).json({
      status: 'success',
      results: transformedDocs.length,
      data: transformedDocs
    });
  }));

router.route('/public/menu-variants/:id')
  .get(catchAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const doc = await MenuVariant.findById(req.params.id);
    if (!doc) {
      return next(new (require('../utils/appError').default)('Menu variant not found', 404));
    }
    // Transform _id to id for frontend compatibility
    const transformedDoc = {
      ...doc.toObject(),
      id: doc._id.toString()
    };
    res.status(200).json({
      status: 'success',
      data: transformedDoc
    });
  }));

export default router;
