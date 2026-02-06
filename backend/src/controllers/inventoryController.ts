import mongoose from 'mongoose';
import Inventory from '../models/Inventory';
import InventoryTransaction from '../models/InventoryTransaction';
import Ingredient from '../models/Ingredient';
import UnitConversion from '../models/UnitConversion';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export const getAllInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  
  const inventory = await Inventory.find({ business_id: businessId })
    .populate('item_id')
    .sort({ created_at: -1 });

  const transformed = inventory.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));

  res.status(200).json(transformed);
});

export const getInventory = factory.getOne(Inventory, { populate: 'item_id' });

export const createInventory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { item_id, item_type, quantity_available, reorder_level, unit } = req.body;
  const businessId = req.user.default_business_id;

  // Get the unit from the ingredient if item_type is 'ingredient'
  let unitName = unit;
  if (item_type === 'ingredient') {
    const ingredient = await Ingredient.findById(item_id).populate('unit_id');
    if (!ingredient) {
      return next(new AppError('Ingredient not found', 404));
    }
    // Get the unit name from the populated unit
    unitName = (ingredient.unit_id as any)?.name ||
      (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');
    if (!unitName) {
      return next(new AppError('Ingredient has no unit assigned', 400));
    }
  }

  if (!unitName) {
    return next(new AppError('Unit is required', 400));
  }

  // Check if inventory already exists
  const existingInventory = await Inventory.findOne({
    business_id: businessId,
    item_id: item_id,
    item_type: item_type
  });

  if (existingInventory) {
    // Inventory exists - ADD to existing quantity using atomic increment
    const inventory = await Inventory.findByIdAndUpdate(
      existingInventory._id,
      { $inc: { quantity_available: quantity_available } },
      { new: true }
    );

    // Record transaction
    await InventoryTransaction.create({
      business_id: businessId,
      item_id: item_id,
      item_type: item_type,
      change_quantity: quantity_available,
      reference_type: 'purchase',
      creator_id: req.user._id,
      note: 'Stock entry'
    });

    return res.status(200).json({
      success: true,
      data: { ...inventory!.toObject(), id: inventory!._id.toString() }
    });
  } else {
    // Inventory doesn't exist - create new
    const inventory = await Inventory.create([{
      creator_id: req.user._id,
      business_id: businessId,
      item_id: item_id,
      item_type: item_type,
      unit: unitName,
      quantity_available: quantity_available || 0,
      reorder_level: reorder_level || 0
    }]);

    // Record transaction
    await InventoryTransaction.create({
      business_id: businessId,
      item_id: item_id,
      item_type: item_type,
      change_quantity: quantity_available,
      reference_type: 'purchase',
      creator_id: req.user._id,
      note: 'Stock entry'
    });

    return res.status(201).json({
      success: true,
      data: { ...inventory[0].toObject(), id: inventory[0]._id.toString() }
    });
  }
});

export const updateInventory = factory.updateOne(Inventory);

export const deleteInventory = factory.deleteOne(Inventory);

/**
 * Helper function to convert quantity between units
 */
const convertQuantityBetweenUnits = async (
  businessId: string,
  quantity: number,
  fromUnit: string,
  toUnit: string
): Promise<{ quantity: number; converted: boolean }> => {
  if (fromUnit === toUnit) {
    return { quantity, converted: false };
  }

  // Try to find conversion factor (from_unit -> to_unit)
  const conversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: fromUnit,
    to_unit: toUnit
  });

  if (conversion) {
    return { quantity: quantity * conversion.factor, converted: true };
  }

  // Try reverse conversion (to_unit -> from_unit)
  const reverseConversion = await UnitConversion.findOne({
    business_id: businessId,
    from_unit: toUnit,
    to_unit: fromUnit
  });

  if (reverseConversion) {
    return { quantity: quantity / reverseConversion.factor, converted: true };
  }

  // If no conversion found, return original quantity with warning
  console.warn(`No conversion found between ${fromUnit} and ${toUnit}, assuming 1:1`);
  return { quantity, converted: false };
};

export const addStock = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { item_id, item_type, quantity, unit, note } = req.body;
  const businessId = req.user.default_business_id;

  if (!unit) {
    return next(new AppError('Unit is required for stock entry', 400));
  }

  // For ingredients, always convert to the ingredient's base unit
  let baseUnit = unit;
  let ingredientBaseUnit = '';

  if (item_type === 'ingredient') {
    const ingredient = await Ingredient.findById(item_id).populate('unit_id');
    if (!ingredient) {
      return next(new AppError('Ingredient not found', 404));
    }
    // Get the ingredient's base unit name
    ingredientBaseUnit = (ingredient.unit_id as any)?.name ||
      (typeof ingredient.unit_id === 'object' ? (ingredient.unit_id as any).name : '');
    if (!ingredientBaseUnit) {
      return next(new AppError('Ingredient has no unit assigned', 400));
    }
    baseUnit = ingredientBaseUnit;
  }

  // Check if inventory exists
  const existingInventory = await Inventory.findOne({
    business_id: businessId,
    item_id: item_id,
    item_type: item_type
  });

  let quantityToAdd = quantity;
  let converted = false;

  if (existingInventory) {
    // Inventory exists - convert to inventory's stored unit (which is the ingredient's base unit)
    if (unit !== existingInventory.unit) {
      const result = await convertQuantityBetweenUnits(businessId, quantity, unit, existingInventory.unit);
      quantityToAdd = result.quantity;
      converted = result.converted;
    }

    // Use atomic increment
    await Inventory.findByIdAndUpdate(existingInventory._id, {
      $inc: { quantity_available: quantityToAdd }
    });
  } else {
    // New inventory - convert to ingredient's base unit
    if (unit !== baseUnit) {
      const result = await convertQuantityBetweenUnits(businessId, quantity, unit, baseUnit);
      quantityToAdd = result.quantity;
      converted = result.converted;
    }

    await Inventory.create([{
      creator_id: req.user._id,
      business_id: businessId,
      item_id: item_id,
      item_type: item_type,
      unit: baseUnit,
      quantity_available: quantityToAdd,
      reorder_level: 0
    }]);
  }

  // Record transaction
  await InventoryTransaction.create({
    business_id: businessId,
    item_id: item_id,
    item_type: item_type,
    change_quantity: converted ? quantityToAdd : quantity,
    reference_type: 'purchase',
    creator_id: req.user._id,
    note: note || `Added ${quantity} ${unit} → ${quantityToAdd.toFixed(2)} ${baseUnit}`
  });

  // Return updated inventory
  const updatedInventory = await Inventory.findOne({
    business_id: businessId,
    item_id: item_id,
    item_type: item_type
  });

  res.status(200).json({
    success: true,
    data: {
      ...updatedInventory!.toObject(),
      id: updatedInventory!._id.toString()
    }
  });
});

export const getInventoryTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  
  const transactions = await InventoryTransaction.find({ business_id: businessId })
    .sort('-created_at');

  // Transform and populate item_id based on item_type
  const transformed = await Promise.all(transactions.map(async (t) => {
    let populatedItem = null;
    if (t.item_type === 'ingredient') {
      const Ingredient = mongoose.model('Ingredient');
      populatedItem = await Ingredient.findById(t.item_id);
    } else if (t.item_type === 'product') {
      const Product = mongoose.model('Product');
      populatedItem = await Product.findById(t.item_id);
    }
    
    return {
      ...t.toObject(),
      id: t._id.toString(),
      item_id: populatedItem ? { ...populatedItem.toObject(), id: populatedItem._id.toString() } : null
    };
  }));

  res.status(200).json(transformed);
});
