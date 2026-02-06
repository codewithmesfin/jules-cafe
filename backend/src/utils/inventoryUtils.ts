import mongoose from 'mongoose';
import Recipe from '../models/Recipe';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import Ingredient from '../models/Ingredient';
import UnitConversion from '../models/UnitConversion';
import AppError from './appError';

/**
 * Convert quantity from one unit to another using UnitConversion.
 * Returns the converted quantity.
 */
const convertQuantity = async (
  businessId: string,
  quantity: number,
  fromUnit: string,
  toUnit: string
): Promise<number> => {
  // If same unit, no conversion needed
  if (fromUnit === toUnit) {
    return quantity;
  }

  // Try to find conversion factor (from_unit -> to_unit)
  const conversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: fromUnit,
    to_unit: toUnit
  });

  if (conversion) {
    return quantity * conversion.factor;
  }

  // Try reverse conversion (to_unit -> from_unit) and invert
  const reverseConversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: toUnit,
    to_unit: fromUnit
  });

  if (reverseConversion) {
    return quantity / reverseConversion.factor;
  }

  // If no conversion found, assume 1:1 but warn
  console.warn(`No conversion found between ${fromUnit} and ${toUnit}, assuming 1:1`);
  return quantity;
};

/**
 * Checks if there is enough stock for a list of order items.
 * Supports both ingredient and product inventory tracking.
 * Handles UoM conversions between recipe unit and inventory unit.
 */
export const checkInventoryForOrderItems = async (businessId: string, items: any[]) => {
  const missingIngredients: string[] = [];

  for (const item of items) {
    // Find all recipe entries for this product
    const recipes = await Recipe.find({ product_id: item.product_id });

    for (const recipe of recipes) {
      // Get ingredient details with unit populated
      const ingredient = await Ingredient.findById(recipe.ingredient_id).populate('unit_id');
      if (!ingredient) {
        missingIngredients.push(`Unknown Ingredient (ID: ${recipe.ingredient_id})`);
        continue;
      }

      // Get the ingredient's base unit name
      const ingredientUnitName = (ingredient.unit_id as any)?.name ||
        (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');

      // Calculate required quantity in recipe's unit
      const recipeUnit = recipe.unit || ingredientUnitName;
      const requiredQuantityInRecipeUnit = recipe.quantity_required * item.quantity;

      // Get inventory
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (!inventory) {
        const ingredientName = ingredient.name || 'Unknown Ingredient';
        missingIngredients.push(`${ingredientName} (Required: ${requiredQuantityInRecipeUnit} ${recipeUnit}, Available: 0)`);
        continue;
      }

      // Convert required quantity from recipe unit to inventory unit
      const requiredQuantityInInventoryUnit = await convertQuantity(
        businessId,
        requiredQuantityInRecipeUnit,
        recipeUnit,
        inventory.unit || ingredientUnitName
      );

      if (inventory.quantity_available < requiredQuantityInInventoryUnit) {
        const ingredientName = ingredient.name;
        missingIngredients.push(`${ingredientName} (Required: ${requiredQuantityInRecipeUnit} ${recipeUnit}, Available: ${inventory.quantity_available} ${inventory.unit || ingredientUnitName})`);
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
 * Handles UoM conversions between recipe unit and inventory unit.
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
      // Get ingredient details with unit populated
      const ingredient = await Ingredient.findById(recipe.ingredient_id).populate('unit_id');
      if (!ingredient) continue;

      // Get the ingredient's base unit name
      const ingredientUnitName = (ingredient.unit_id as any)?.name ||
        (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');

      // Calculate deduction quantity in recipe's unit
      const recipeUnit = recipe.unit || ingredientUnitName;
      const deductionQuantityInRecipeUnit = recipe.quantity_required * item.quantity;

      // Check inventory
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (inventory) {
        // Convert deduction quantity from recipe unit to inventory unit
        const deductionQuantityInInventoryUnit = await convertQuantity(
          businessId,
          deductionQuantityInRecipeUnit,
          recipeUnit,
          inventory.unit || ingredientUnitName
        );

        inventory.quantity_available -= deductionQuantityInInventoryUnit;

        const transactionData = {
          business_id: businessId,
          item_id: recipe.ingredient_id,
          item_type: 'ingredient',
          change_quantity: -deductionQuantityInInventoryUnit,
          reference_type: 'sale',
          reference_id: orderId,
          creator_id: userId,
          note: `Deducted ${deductionQuantityInRecipeUnit} ${recipeUnit} → ${deductionQuantityInInventoryUnit.toFixed(2)} ${inventory.unit || ingredientUnitName}`
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
 * Handles UoM conversions between ingredient unit and inventory unit.
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
      // Calculate revert quantity in ingredient's base unit
      const revertQuantityInIngredientUnit = recipe.quantity_required * item.quantity;

      // Get ingredient details with unit populated
      const ingredient = await Ingredient.findById(recipe.ingredient_id).populate('unit_id');
      if (!ingredient) continue;

      // Get the unit name from the populated unit or unit_id
      const ingredientUnitName = (ingredient.unit_id as any)?.name ||
        (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');

      // Check inventory
      const inventory = await Inventory.findOne({
        business_id: businessId,
        item_id: recipe.ingredient_id,
        item_type: 'ingredient'
      });

      if (inventory) {
        // Convert revert quantity from ingredient unit to inventory unit
        const revertQuantityInInventoryUnit = await convertQuantity(
          businessId,
          revertQuantityInIngredientUnit,
          ingredientUnitName,
          inventory.unit || ingredientUnitName
        );

        inventory.quantity_available += revertQuantityInInventoryUnit;

        const transactionData = {
          business_id: businessId,
          item_id: recipe.ingredient_id,
          item_type: 'ingredient',
          change_quantity: revertQuantityInInventoryUnit,
          reference_type: 'adjustment',
          reference_id: orderId,
          creator_id: userId,
          note: `Reverted ${revertQuantityInIngredientUnit} ${ingredientUnitName} (converted to ${revertQuantityInInventoryUnit.toFixed(2)} ${inventory.unit || ingredientUnitName})`
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
 * Automatically handles UoM conversion if the input quantity is in a different unit.
 */
export const addInventoryStock = async (
  businessId: string,
  itemId: string,
  itemType: 'ingredient' | 'product',
  quantity: number,
  userId: string,
  inputUnit: string,
  note?: string
) => {
  // Get ingredient details if itemType is 'ingredient'
  let ingredientUnit = '';
  if (itemType === 'ingredient') {
    const ingredient = await Ingredient.findById(itemId).populate('unit_id');
    if (!ingredient) {
      throw new AppError('Ingredient not found', 404);
    }
    // Get the unit name from the populated unit or unit_id
    ingredientUnit = (ingredient.unit_id as any)?.name ||
      (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');
    if (!ingredientUnit) {
      throw new AppError('Ingredient has no unit assigned', 400);
    }
  }

  // Check if inventory exists
  const existingInventory = await Inventory.findOne({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType
  });

  let quantityToAdd = quantity;
  let finalUnit = inputUnit;

  if (existingInventory) {
    // Inventory exists - convert quantity to inventory's stored unit
    if (existingInventory.unit && inputUnit !== existingInventory.unit) {
      quantityToAdd = await convertQuantity(businessId, quantity, inputUnit, existingInventory.unit);
      finalUnit = existingInventory.unit;
    }

    // Use atomic increment
    await Inventory.findByIdAndUpdate(existingInventory._id, {
      $inc: { quantity_available: quantityToAdd }
    });
  } else {
    // New inventory - set unit to input unit (or ingredient unit)
    const unit = itemType === 'ingredient' ? ingredientUnit : inputUnit;
    if (!unit) {
      throw new AppError('Unit is required for new inventory', 400);
    }

    await Inventory.create([{
      creator_id: userId,
      business_id: businessId,
      item_id: itemId,
      item_type: itemType,
      unit: unit,
      quantity_available: quantityToAdd,
      reorder_level: 0
    }]);
    finalUnit = unit;
  }

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType,
    change_quantity: quantityToAdd,
    reference_type: 'purchase',
    creator_id: userId,
    note
  });

  // Return updated inventory
  return await Inventory.findOne({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType
  });
};

/**
 * Deduct stock from inventory (for waste/adjustments).
 * Automatically handles UoM conversion if the input quantity is in a different unit.
 */
export const deductInventoryStock = async (
  businessId: string,
  itemId: string,
  itemType: 'ingredient' | 'product',
  quantity: number,
  inputUnit: string,
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

  // Convert quantity to inventory's stored unit if needed
  let quantityToDeduct = quantity;
  if (inventory.unit && inputUnit !== inventory.unit) {
    quantityToDeduct = await convertQuantity(businessId, quantity, inputUnit, inventory.unit);
  }

  if (inventory.quantity_available < quantityToDeduct) {
    throw new AppError(`Insufficient stock for deduction. Required: ${quantityToDeduct.toFixed(2)} ${inventory.unit}, Available: ${inventory.quantity_available} ${inventory.unit}`, 400);
  }

  inventory.quantity_available -= quantityToDeduct;
  await inventory.save();

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: itemId,
    item_type: itemType,
    change_quantity: -quantityToDeduct,
    reference_type: 'waste',
    creator_id: userId,
    note: note || `Deducted ${quantity} ${inputUnit} (converted to ${quantityToDeduct.toFixed(2)} ${inventory.unit})`
  });

  return inventory;
};
