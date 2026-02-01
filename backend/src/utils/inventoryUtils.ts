import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import InventoryItem from '../models/InventoryItem';
import StockEntry from '../models/StockEntry';
import { IOrder } from '../models/Order';

/**
 * Deducts stock from inventory based on order items and their recipes.
 */
export const deductInventoryForOrder = async (order: IOrder, userId: string) => {
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
          await inventoryItem.save();

          await StockEntry.create({
            branch_id: order.branch_id,
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
};

/**
 * Reverts stock to inventory (adds back) for an order (e.g. on cancellation or edit).
 */
export const revertInventoryForOrder = async (order: IOrder, userId: string) => {
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
          await inventoryItem.save();

          await StockEntry.create({
            branch_id: order.branch_id,
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
};
