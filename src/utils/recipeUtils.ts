import type { Recipe, Ingredient, InventoryItem } from '../types';

/**
 * Calculates how many portions of a menu item can be made based on current inventory.
 * BOM (Bill of Materials) logic.
 */
export const calculateAvailablePortions = (
  recipe: Recipe,
  inventory: InventoryItem[],
  ingredients: Ingredient[]
): number => {
  if (!recipe.ingredient_id || !recipe.quantity_required) return 0;

  // Find the ingredient name from the ingredients list
  const ingredient = ingredients.find(ing => ing.id === recipe.ingredient_id);
  if (!ingredient) return 0;

  // Find the inventory item by ingredient name
  const invItem = inventory.find(i => i.item_name.toLowerCase() === ingredient.name.toLowerCase());
  if (!invItem) return 0;

  // Calculate how many times we can satisfy this requirement
  const portions = Math.floor(invItem.quantity / recipe.quantity_required);
  return portions < 0 ? 0 : portions;
};
