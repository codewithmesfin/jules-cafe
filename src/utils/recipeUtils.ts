import type { Recipe, InventoryItem } from '../types';

/**
 * Calculates how many portions of a menu item can be made based on current inventory.
 * BOM (Bill of Materials) logic.
 */
export const calculateAvailablePortions = (recipe: Recipe, inventory: InventoryItem[]): number => {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;

  const portionsPerIngredient = recipe.ingredients.map(req => {
    // Match by item_id if available, otherwise fall back to name matching
    let invItem;
    if (req.item_id) {
      invItem = inventory.find(i => {
        const iId = typeof i.item_id === 'string' ? i.item_id : (i.item_id as any)?._id || (i.item_id as any)?.id;
        return iId === req.item_id;
      });
    }
    // Fall back to name matching if no item_id match or no item_id
    if (!invItem) {
      invItem = inventory.find(i => i.item_name.toLowerCase() === req.item_name.toLowerCase());
    }

    if (!invItem) return 0;

    // Calculate how many times we can satisfy this requirement
    return Math.floor(invItem.quantity / req.quantity);
  });

  const availablePortions = Math.min(...portionsPerIngredient);

  return availablePortions < 0 ? 0 : availablePortions;
};
