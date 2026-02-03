import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import OrderItem from '../models/OrderItem';
import AppError from './appError';

/**
 * Checks if there is enough stock for a list of order items.
 */
export const checkInventoryForOrderItems = async (businessId: string, items: any[]) => {
  const missingIngredients: string[] = [];

  for (const item of items) {
    // Find all recipe entries for this product
    const recipes = await Recipe.find({ product_id: item.product_id }).populate('ingredient_id');

    for (const recipe of recipes) {
      const requiredQuantity = recipe.quantity_required * item.quantity;

      const inventory = await Inventory.findOne({
        business_id: businessId,
        ingredient_id: recipe.ingredient_id
      }).populate('ingredient_id');

      if (!inventory || inventory.quantity_available < requiredQuantity) {
        const ingredientName = (recipe.ingredient_id as any)?.name || 'Unknown Ingredient';
        missingIngredients.push(`${ingredientName} (Required: ${requiredQuantity}, Available: ${inventory?.quantity_available || 0})`);
      }
    }
  }

  return {
    canDeduct: missingIngredients.length === 0,
    missingIngredients
  };
};

/**
 * Deducts stock from inventory based on order items.
 */
export const deductInventoryForOrder = async (
  businessId: string,
  orderId: string,
  items: any[],
  userId: string,
  session?: mongoose.ClientSession
) => {
  for (const item of items) {
    const recipes = await Recipe.find({ product_id: item.product_id });

    for (const recipe of recipes) {
      const deductionQuantity = recipe.quantity_required * item.quantity;

      const inventory = await Inventory.findOne({
        business_id: businessId,
        ingredient_id: recipe.ingredient_id
      });

      if (inventory) {
        inventory.quantity_available -= deductionQuantity;

        const transactionData = {
          business_id: businessId,
          ingredient_id: recipe.ingredient_id,
          change_quantity: -deductionQuantity,
          reference_type: 'sale',
          reference_id: orderId,
          creator_id: userId,
        };

        if (session) {
          await inventory.save({ session });
          await InventoryTransaction.create([transactionData], { session });
        } else {
          await inventory.save();
          await InventoryTransaction.create(transactionData);
        }
      }
    }
  }
};

/**
 * Reverts stock to inventory for an order.
 */
export const revertInventoryForOrder = async (
  businessId: string,
  orderId: string,
  items: any[],
  userId: string,
  session?: mongoose.ClientSession
) => {
  for (const item of items) {
    const recipes = await Recipe.find({ product_id: item.product_id });

    for (const recipe of recipes) {
      const revertQuantity = recipe.quantity_required * item.quantity;

      const inventory = await Inventory.findOne({
        business_id: businessId,
        ingredient_id: recipe.ingredient_id
      });

      if (inventory) {
        inventory.quantity_available += revertQuantity;

        const transactionData = {
          business_id: businessId,
          ingredient_id: recipe.ingredient_id,
          change_quantity: revertQuantity,
          reference_type: 'adjustment', // Reverting is technically an adjustment or reverse sale
          reference_id: orderId,
          creator_id: userId,
        };

        if (session) {
          await inventory.save({ session });
          await InventoryTransaction.create([transactionData], { session });
        } else {
          await inventory.save();
          await InventoryTransaction.create(transactionData);
        }
      }
    }
  }
};
