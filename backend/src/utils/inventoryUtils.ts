import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import InventoryItem from '../models/InventoryItem';
import StockEntry from '../models/StockEntry';
import { IOrder } from '../models/Order';
import AppError from './appError';

/**
 * Checks if there is enough stock for an order.
 */
export const checkInventoryForOrder = async (order: IOrder) => {
  const missingIngredients: string[] = [];

  for (const item of order.items) {
    const recipe = await Recipe.findOne({ menu_item_id: item.menu_item_id, is_default: true, is_active: true });
    if (recipe) {
      const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
      for (const ingredient of ingredients) {
        const requiredQuantity = (ingredient.quantity * item.quantity) / (recipe.yield_quantity || 1);

        const inventoryItem = await InventoryItem.findOne({
          branch_id: order.branch_id,
          item_id: ingredient.item_id
        }).populate('item_id');

        if (!inventoryItem || inventoryItem.current_quantity < requiredQuantity) {
          const itemName = (inventoryItem?.item_id as any)?.item_name || 'Unknown Ingredient';
          missingIngredients.push(`${itemName} (Required: ${requiredQuantity}, Available: ${inventoryItem?.current_quantity || 0})`);
        }
      }
    }
  }

  return {
    canDeduct: missingIngredients.length === 0,
    missingIngredients
  };
};

/**
 * Deducts stock from inventory based on order items and their recipes.
 */
export const deductInventoryForOrder = async (order: IOrder, userId: string, session?: mongoose.ClientSession) => {
  for (const item of order.items) {
    const recipe = await Recipe.findOne({ menu_item_id: item.menu_item_id, is_default: true, is_active: true });
    if (recipe) {
      const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
      for (const ingredient of ingredients) {
        const deductionQuantity = (ingredient.quantity * item.quantity) / (recipe.yield_quantity || 1);

        const inventoryItem = await InventoryItem.findOne({
          branch_id: order.branch_id,
          item_id: ingredient.item_id
        });

        if (inventoryItem) {
          const previousQuantity = inventoryItem.current_quantity;
          inventoryItem.current_quantity -= deductionQuantity;

          if (session) {
            await inventoryItem.save({ session });
            await StockEntry.create([{
              branch_id: order.branch_id,
              company_id: order.company_id,
              item_id: ingredient.item_id,
              entry_type: 'sale',
              quantity: deductionQuantity,
              previous_quantity: previousQuantity,
              new_quantity: inventoryItem.current_quantity,
              reference_type: 'Order',
              reference_id: order._id,
              performed_by: userId,
              notes: `Stock deducted for order ${order.order_number}`,
            }], { session });
          } else {
            await inventoryItem.save();
            await StockEntry.create({
              branch_id: order.branch_id,
              company_id: order.company_id,
              item_id: ingredient.item_id,
              entry_type: 'sale',
              quantity: deductionQuantity,
              previous_quantity: previousQuantity,
              new_quantity: inventoryItem.current_quantity,
              reference_type: 'Order',
              reference_id: order._id,
              performed_by: userId,
              notes: `Stock deducted for order ${order.order_number}`,
            });
          }
        }
      }
    }
  }
};

/**
 * Reverts stock to inventory (adds back) for an order (e.g. on cancellation or edit).
 */
export const revertInventoryForOrder = async (order: IOrder, userId: string, session?: mongoose.ClientSession) => {
  for (const item of order.items) {
    const recipe = await Recipe.findOne({ menu_item_id: item.menu_item_id, is_default: true, is_active: true });
    if (recipe) {
      const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id });
      for (const ingredient of ingredients) {
        const revertQuantity = (ingredient.quantity * item.quantity) / (recipe.yield_quantity || 1);

        const inventoryItem = await InventoryItem.findOne({
          branch_id: order.branch_id,
          item_id: ingredient.item_id
        });

        if (inventoryItem) {
          const previousQuantity = inventoryItem.current_quantity;
          inventoryItem.current_quantity += revertQuantity;

          if (session) {
            await inventoryItem.save({ session });
            await StockEntry.create([{
              branch_id: order.branch_id,
              company_id: order.company_id,
              item_id: ingredient.item_id,
              entry_type: 'return',
              quantity: revertQuantity,
              previous_quantity: previousQuantity,
              new_quantity: inventoryItem.current_quantity,
              reference_type: 'Order',
              reference_id: order._id,
              performed_by: userId,
              notes: `Stock reverted for order ${order.order_number}`,
            }], { session });
          } else {
            await inventoryItem.save();
            await StockEntry.create({
              branch_id: order.branch_id,
              company_id: order.company_id,
              item_id: ingredient.item_id,
              entry_type: 'return',
              quantity: revertQuantity,
              previous_quantity: previousQuantity,
              new_quantity: inventoryItem.current_quantity,
              reference_type: 'Order',
              reference_id: order._id,
              performed_by: userId,
              notes: `Stock reverted for order ${order.order_number}`,
            });
          }
        }
      }
    }
  }
};
