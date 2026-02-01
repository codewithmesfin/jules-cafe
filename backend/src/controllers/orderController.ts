import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import InventoryItem from '../models/InventoryItem';
import StockEntry from '../models/StockEntry';
import * as factory from '../utils/controllerFactory';
import { sendEmail } from '../utils/mailer';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllOrders = factory.getAll(Order);
export const getOrder = factory.getOne(Order);
export const updateOrder = factory.updateOne(Order);
export const deleteOrder = factory.deleteOne(Order);

export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Automatically set created_by to the authenticated user's ID
  data.created_by = req.user?._id || req.user?.id;

  // Force branch_id for non-admins
  const filterRoles = ['manager', 'staff', 'cashier'];
  if (req.user && filterRoles.includes(req.user.role)) {
    data.branch_id = req.user.branch_id;
  }

  if (!data.branch_id) {
    return next(new AppError('branch_id is required', 400));
  }

  const order = await Order.create(data);

  // Deduct Inventory based on Recipes
  try {
    for (const item of order.items) {
      // Find the default recipe for this menu item
      const recipe = await Recipe.findOne({ menu_item_id: item.menu_item_id, is_default: true, is_active: true });
      if (recipe) {
        const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
        for (const ingredient of ingredients) {
          const deductionQuantity = (ingredient.quantity * item.quantity) / (recipe.yield_quantity || 1);

          // Find the inventory item for this branch and ingredient
          const inventoryItem = await InventoryItem.findOne({
            branch_id: order.branch_id,
            item_id: ingredient.item_id
          });

          if (inventoryItem) {
            const previousQuantity = inventoryItem.current_quantity;
            inventoryItem.current_quantity -= deductionQuantity;
            await inventoryItem.save();

            // Create stock entry for deduction
            await StockEntry.create({
              branch_id: order.branch_id,
              item_id: ingredient.item_id,
              entry_type: 'sale',
              quantity: deductionQuantity,
              previous_quantity: previousQuantity,
              new_quantity: inventoryItem.current_quantity,
              reference_type: 'Order',
              reference_id: order._id,
              performed_by: req.user?._id || req.user?.id || 'system',
              notes: `Stock deducted for order ${order.order_number}`,
            });
          }
        }
      }
    }
  } catch (inventoryError) {
    console.error('Failed to deduct inventory:', inventoryError);
    // We continue even if inventory deduction fails to not block the order
  }

  // Attempt to send email to customer if email is provided
  try {
    const customer = await User.findById(order.customer_id);
    if (customer && customer.email) {
      await sendEmail({
        email: customer.email,
        subject: `Order Confirmation - ${order.order_number}`,
        message: `Your order ${order.order_number} has been placed successfully. Total: ${order.total_amount}`,
      });
    }
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Don't fail the order creation if email fails
  }

  res.status(201).json(order);
});

export const getStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const query: any = {};

  // Branch filtering for managers
  if (req.user?.role === 'manager' && req.user.branch_id) {
    query.branch_id = req.user.branch_id;
  }

  // Basic stats for dashboard
  const totalOrders = await Order.countDocuments(query);

  const revenueMatch: any = { status: 'completed' };
  if (query.branch_id) revenueMatch.branch_id = query.branch_id;

  const totalRevenue = await Order.aggregate([
    { $match: revenueMatch },
    { $group: { _id: null, total: { $sum: '$total_amount' } } },
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    // Mocking other fields for frontend compatibility if needed
    avgRating: 4.5,
    topBranches: [],
    revenuePerDay: []
  });
});
