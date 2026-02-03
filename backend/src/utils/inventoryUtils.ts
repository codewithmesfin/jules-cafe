import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import Ingredient from '../models/Ingredient';
import AppError from './appError';

/**
 * Checks if there is enough stock for a list of order items.
 * Supports both ingredient and product inventory tracking.
 */
export const checkInventoryForOrderItems = async (businessId: string, items: any[]) => {
  const missingIngredients: string[] = [];

  for (const item of items) {
    // Find all recipe entries for this product
    const recipes = await Recipe.find({ product_id: item.product_id });

    for (const recipe of recipes) {
      const requiredQuantity = recipe.quantity_required * item.quantity;

      // Check inventory using new item_id structure
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      // Get ingredient name separately
      const ingredient = await Ingredient.findById(recipe.ingredient_id);

      if (!inventory || inventory.quantity_available < requiredQuantity) {
        const ingredientName = ingredient?.name || 'Unknown Ingredient';
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
 * Supports both ingredient and product inventory tracking.
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

      // Check inventory using new item_id structure
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (inventory) {
        inventory.quantity_available -= deductionQuantity;

        const transactionData = {
          business_id: businessId,
          item_id: recipe.ingredient_id,
          item_type: 'ingredient',
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
 * Supports both ingredient and product inventory tracking.
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

      // Check inventory using new item_id structure
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (inventory) {
        inventory.quantity_available += revertQuantity;

        const transactionData = {
          business_id: businessId,
          item_id: recipe.ingredient_id,
          item_type: 'ingredient',
          change_quantity: revertQuantity,
          reference_type: 'adjustment',
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
 * Add stock to inventory (for purchases/restocking).
 */
export const addInventoryStock = async (
  businessId: string,
  itemId: string,
  itemType: 'ingredient' | 'product',
  quantity: number,
  userId: string,
  note?: string
) => {
  // Find or create inventory record
  let inventory = await Inventory.findOne({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType
  });

  if (inventory) {
    inventory.quantity_available += quantity;
    await inventory.save();
  } else {
    inventory = await Inventory.create({
      business_id: businessId,
      item_id: itemId,
      item_type: itemType,
      quantity_available: quantity,
      reorder_level: 0
    });
  }

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType,
    change_quantity: quantity,
    reference_type: 'purchase',
    creator_id: userId,
    note
  });

  return inventory;
};

/**
 * Deduct stock from inventory (for waste/adjustments).
 */
export const deductInventoryStock = async (
  businessId: string,
  itemId: string,
  itemType: 'ingredient' | 'product',
  quantity: number,
  userId: string,
  note?: string
) => {
  const inventory = await Inventory.findOne({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType
  });

  if (!inventory) {
    throw new AppError('Inventory item not found', 404);
  }

  if (inventory.quantity_available < quantity) {
    throw new AppError('Insufficient stock for deduction', 400);
  }

  inventory.quantity_available -= quantity;
  await inventory.save();

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType,
    change_quantity: -quantity,
    reference_type: 'waste',
    creator_id: userId,
    note
  });

  return inventory;
};
