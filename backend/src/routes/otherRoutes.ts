import express from 'express';
import MenuVariant from '../models/MenuVariant';
import BranchMenuItem from '../models/BranchMenuItem';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import Item from '../models/Item';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete, AuthRequest } from '../middleware/auth';
import { getStats } from '../controllers/orderController';
import catchAsync from '../utils/catchAsync';
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

// Recipe with ingredients
router.route('/recipes')
  .get(authorize('admin', 'manager', 'staff'), factory.getAll(Recipe))
  .post(authorize('admin', 'manager'), catchAsync(async (req: AuthRequest, res: any, next: any) => {
    // Create recipe
    const recipeData = { ...req.body };
    
    // Auto-set company_id
    if (req.user && req.user.company_id) {
      recipeData.company_id = req.user.company_id;
    }
    
    const recipe = await Recipe.create(recipeData);
    
    // If ingredients are provided in the request, create them
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      for (const ing of req.body.ingredients) {
        // Get item name from Items table
        let itemName = ing.item_name;
        if (ing.item_id) {
          const item = await Item.findById(ing.item_id);
          if (item) {
            itemName = item.item_name;
          }
        }
        
        await RecipeIngredient.create({
          recipe_id: recipe._id,
          company_id: recipeData.company_id,
          item_id: ing.item_id,
          item_name: itemName || 'Unknown',
          quantity: ing.quantity,
          unit: ing.unit,
          wastage_percentage: ing.wastage_percentage || 0,
          is_optional: ing.is_optional || false,
          notes: ing.notes,
        });
      }
    }
    
    res.status(201).json(recipe);
  }));

// Get recipes with ingredients populated
router.get('/recipes-with-ingredients', authorize('admin', 'manager', 'staff'), catchAsync(async (req: AuthRequest, res: any, next: any) => {
  const query: any = { is_active: true };
  
  // Tenant isolation
  if (req.user && req.user.role !== 'customer' && req.user.company_id) {
    query.company_id = req.user.company_id;
  }
  
  const recipes = await Recipe.find(query).sort({ menu_item_id: 1 });
  
  const recipesWithIngredients = await Promise.all(recipes.map(async (recipe) => {
    const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
    return {
      ...recipe.toObject(),
      id: recipe._id.toString(),
      ingredients: ingredients.map(ing => ({
        item_id: ing.item_id?.toString() || ing.item_id,
        item_name: ing.item_name,
        quantity: ing.quantity,
        unit: ing.unit,
        wastage_percentage: ing.wastage_percentage,
        is_optional: ing.is_optional,
      })),
    };
  }));
  
  res.status(200).json(recipesWithIngredients);
}));

router.route('/recipes/:id')
  .get(authorize('admin', 'manager', 'staff'), factory.getOne(Recipe))
  .put(authorize('admin', 'manager'), factory.updateOne(Recipe))
  .delete(authorize('admin', 'manager'), factory.deleteOne(Recipe));

export default router;
