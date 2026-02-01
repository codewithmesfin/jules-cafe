import express from 'express';
import MenuVariant from '../models/MenuVariant';
import BranchMenuItem from '../models/BranchMenuItem';
import Reservation from '../models/Reservation';
import InventoryItem from '../models/InventoryItem';
import Recipe from '../models/Recipe';
import * as factory from '../utils/controllerFactory';
import { protect, authorize } from '../middleware/auth';
import { getStats } from '../controllers/orderController';
import {
  getSalesAnalytics,
  getStockAnalytics,
  getProductAnalytics,
  getBranchPerformance
} from '../controllers/analyticsController';
import { 
  getAllInventory, 
  getOneInventory, 
  createInventory, 
  updateInventory, 
  deleteInventory 
} from '../controllers/inventoryController';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'manager'), getStats);

// Analytics
router.get('/analytics/sales', protect, authorize('admin', 'manager'), getSalesAnalytics);
router.get('/analytics/stock', protect, authorize('admin', 'manager'), getStockAnalytics);
router.get('/analytics/products', protect, authorize('admin', 'manager'), getProductAnalytics);
router.get('/analytics/branches', protect, authorize('admin'), getBranchPerformance);

// MenuVariant
router.route('/menu-variants')
  .get(factory.getAll(MenuVariant))
  .post(protect, authorize('admin', 'manager'), factory.createOne(MenuVariant));
router.route('/menu-variants/:id')
  .get(factory.getOne(MenuVariant))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(MenuVariant))
  .delete(protect, authorize('admin', 'manager'), factory.deleteOne(MenuVariant));

// BranchMenuItem
router.route('/branch-menu-items')
  .get(factory.getAll(BranchMenuItem))
  .post(protect, authorize('admin', 'manager'), factory.createOne(BranchMenuItem));
router.route('/branch-menu-items/:id')
  .get(factory.getOne(BranchMenuItem))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(BranchMenuItem))
  .delete(protect, authorize('admin', 'manager'), factory.deleteOne(BranchMenuItem));

// Reservation
router.route('/reservations')
  .get(protect, factory.getAll(Reservation))
  .post(protect, factory.createOne(Reservation));
router.route('/reservations/:id')
  .get(protect, factory.getOne(Reservation))
  .put(protect, factory.updateOne(Reservation))
  .delete(protect, factory.deleteOne(Reservation));

// InventoryItem (using custom controller for item_id reference)
router.route('/inventory')
  .get(protect, authorize('admin', 'manager', 'staff'), getAllInventory)
  .post(protect, authorize('admin', 'manager'), createInventory);
router.route('/inventory/:id')
  .get(protect, authorize('admin', 'manager', 'staff'), getOneInventory)
  .put(protect, authorize('admin', 'manager', 'staff'), updateInventory)
  .delete(protect, authorize('admin', 'manager'), deleteInventory);

// Recipe
router.route('/recipes')
  .get(protect, authorize('admin', 'manager', 'staff'), factory.getAll(Recipe))
  .post(protect, authorize('admin', 'manager'), factory.createOne(Recipe));
router.route('/recipes/:id')
  .get(protect, authorize('admin', 'manager', 'staff'), factory.getOne(Recipe))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(Recipe))
  .delete(protect, authorize('admin', 'manager'), factory.deleteOne(Recipe));

export default router;
