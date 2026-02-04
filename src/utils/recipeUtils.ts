import type { Recipe, Inventory as InventoryItem } from '../types';

/**
 * Calculates how many portions of a menu item can be made based on current inventory.
 * BOM (Bill of Materials) logic.
 */
export const calculateAvailablePortions = (recipe: any, inventory: any[]): number => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;

  const portionsPerIngredient = (recipe.ingredients as any[]).map(req => {
    // Note: In a real app, we'd match by ingredient ID.
    // Here we match by name as per mock data structure.
    const invItem = inventory.find(i => i.item_name.toLowerCase() === req.item_name.toLowerCase());

    if (!invItem) return 0;

    // Calculate how many times we can satisfy this requirement
    return Math.floor(invItem.quantity / req.quantity);
  });

  const availablePortions = Math.min(...portionsPerIngredient);

  return availablePortions < 0 ? 0 : availablePortions;
};
