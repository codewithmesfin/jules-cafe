import express from 'express';
import MenuVariant from '../models/MenuVariant';
import BranchMenuItem from '../models/BranchMenuItem';
import InventoryItem from '../models/InventoryItem';
import Recipe from '../models/Recipe';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';
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
import { 
  getAllReservations, 
  getReservation, 
  createReservation, 
  updateReservation, 
  deleteReservation 
} from '../controllers/reservationController';

const router = express.Router();

// Apply protect and onboarding check to all routes that need authentication
router.use(protect);
router.use(requireOnboardingComplete);

router.get('/stats', authorize('admin', 'manager'), getStats);

// Analytics
router.get('/analytics/sales', authorize('admin', 'manager'), getSalesAnalytics);
router.get('/analytics/stock', authorize('admin', 'manager'), getStockAnalytics);
router.get('/analytics/products', authorize('admin', 'manager'), getProductAnalytics);
router.get('/analytics/branches', authorize('admin'), getBranchPerformance);

// MenuVariant
router.route('/menu-variants')
  .get(factory.getAll(MenuVariant))
  .post(authorize('admin', 'manager'), factory.createOne(MenuVariant));
router.route('/menu-variants/:id')
  .get(factory.getOne(MenuVariant))
  .put(authorize('admin', 'manager'), factory.updateOne(MenuVariant))
  .delete(authorize('admin', 'manager'), factory.deleteOne(MenuVariant));

// BranchMenuItem
router.route('/branch-menu-items')
  .get(factory.getAll(BranchMenuItem))
  .post(authorize('admin', 'manager'), factory.createOne(BranchMenuItem));
router.route('/branch-menu-items/:id')
  .get(factory.getOne(BranchMenuItem))
  .put(authorize('admin', 'manager'), factory.updateOne(BranchMenuItem))
  .delete(authorize('admin', 'manager'), factory.deleteOne(BranchMenuItem));

// Reservation
router.route('/reservations')
  .get(getAllReservations)
  .post(createReservation);
router.route('/reservations/:id')
  .get(getReservation)
  .put(updateReservation)
  .delete(authorize('admin', 'manager'), deleteReservation);

// InventoryItem (using custom controller for item_id reference)
router.route('/inventory')
  .get(authorize('admin', 'manager', 'staff'), getAllInventory)
  .post(authorize('admin', 'manager'), createInventory);
router.route('/inventory/:id')
  .get(authorize('admin', 'manager', 'staff'), getOneInventory)
  .put(authorize('admin', 'manager', 'staff'), updateInventory)
  .delete(authorize('admin', 'manager'), deleteInventory);

// Recipe
router.route('/recipes')
  .get(authorize('admin', 'manager', 'staff'), factory.getAll(Recipe))
  .post(authorize('admin', 'manager'), factory.createOne(Recipe));
router.route('/recipes/:id')
  .get(authorize('admin', 'manager', 'staff'), factory.getOne(Recipe))
  .put(authorize('admin', 'manager'), factory.updateOne(Recipe))
  .delete(authorize('admin', 'manager'), factory.deleteOne(Recipe));

export default router;
