import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import InventoryItem from '../models/InventoryItem';
import StockEntry from '../models/StockEntry';
import { IOrder } from '../models/Order';

/**
 * Deducts stock from inventory based on order items and their recipes.
 * Throws error if insufficient stock is available.
 */
export const deductInventoryForOrder = async (order: IOrder, userId: string) => {
  const insufficientItems: string[] = [];
  
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
          // Check if there's enough stock
          if (inventoryItem.current_quantity < deductionQuantity) {
            // Try to get item name for better error message
            const itemDoc = await import('../models/Item').then(m => m.default.findById(ingredient.item_id));
            const itemName = itemDoc?.item_name || 'Unknown item';
            insufficientItems.push(`${itemName} (need ${deductionQuantity.toFixed(2)}, have ${inventoryItem.current_quantity.toFixed(2)})`);
            continue;
          }
          
          const previousQuantity = inventoryItem.current_quantity;
          inventoryItem.current_quantity -= deductionQuantity;
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
  
  if (insufficientItems.length > 0) {
    throw new Error(`Insufficient stock for: ${insufficientItems.join(', ')}`);
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
};
