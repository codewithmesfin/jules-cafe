import mongoose from 'mongoose';
import InventoryItem from '../models/InventoryItem';
import StockEntry from '../models/StockEntry';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import Item from '../models/Item';

/**
 * Inventory Service - Handles all stock operations
 * 
 * All operations reference Items table as the master catalog:
 * - MenuItem.item_id → Item
 * - InventoryItem.item_id → Item
 * - RecipeIngredient.item_id → Item
 * - StockEntry.item_id → Item
 */
class InventoryService {
  /**
   * Get current stock level for an item at a branch
   */
  async getStock(branchId: string, itemId: string) {
    const inventory = await InventoryItem.findOne({
      branch_id: branchId,
      item_id: itemId
    }).populate('item_id', 'item_name unit category item_type');
    
    return inventory;
  }

  /**
   * Get all inventory at a branch with item details from Items table
   */
  async getBranchInventory(branchId: string, options?: { 
    itemType?: string; 
    category?: string;
    includeLowStock?: boolean;
  }) {
    let query: any = { branch_id: branchId, is_active: true };
    
    if (options?.includeLowStock) {
      query.$expr = { $lte: ['$current_quantity', '$min_stock_level'] };
    }
    
    let items = InventoryItem.find(query)
      .populate('item_id', 'item_name unit category item_type sku')
      .sort({ 'item_id.item_name': 1 });

    return await items;
  }

  /**
   * Get low stock items at a branch
   */
  async getLowStockItems(branchId: string) {
    return await InventoryItem.find({
      branch_id: branchId,
      is_active: true,
      $expr: { $lte: ['$current_quantity', '$min_stock_level'] }
    }).populate('item_id', 'item_name unit category sku');
  }

  /**
   * Get all items from master Items table
   */
  async getItems(options?: {
    itemType?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const query: any = {};
    
    if (options?.itemType) query.item_type = options.itemType;
    if (options?.category) query.category = options.category;
    if (options?.isActive !== undefined) query.is_active = options.isActive;
    if (options?.search) {
      query.$or = [
        { item_name: { $regex: options.search, $options: 'i' } },
        { sku: { $regex: options.search, $options: 'i' } }
      ];
    }

    return await Item.find(query).sort({ item_name: 1 });
  }

  /**
   * Get item by ID from Items table
   */
  async getItemById(itemId: string) {
    return await Item.findById(itemId);
  }

  /**
   * Add stock to inventory (purchase, transfer in, adjustment up)
   */
  async addStock(params: {
    branchId: string;
    itemId: string; // From Items table
    quantity: number;
    unitCost?: number;
    entryType: 'purchase' | 'transfer_in' | 'adjustment' | 'return';
    referenceType?: string;
    referenceId?: string;
    reason?: string;
    performedBy: string;
    notes?: string;
    session?: mongoose.ClientSession;
  }) {
    const { branchId, itemId, quantity, unitCost, entryType, referenceType, referenceId, reason, performedBy, notes, session } = params;

    // Get or create inventory record
    let inventory = await InventoryItem.findOne({
      branch_id: branchId,
      item_id: itemId
    }).session(session!);

    const previousQuantity = inventory?.current_quantity || 0;
    const newQuantity = previousQuantity + quantity;

    // Update or create inventory item
    if (inventory) {
      inventory.current_quantity = newQuantity;
      inventory.last_restocked = new Date();
      if (unitCost) {
        inventory.last_purchase_price = unitCost;
        inventory.average_cost = ((inventory.average_cost || 0) * previousQuantity + unitCost * quantity) / newQuantity;
      }
      await inventory.save({ session });
    } else {
      const newInventory = await InventoryItem.create([{
        branch_id: branchId,
        item_id: itemId,
        current_quantity: quantity,
        min_stock_level: 0,
        last_restocked: new Date(),
        last_purchase_price: unitCost,
        average_cost: unitCost
      }], { session });
      inventory = newInventory[0];
    }

    // Create stock entry record
    await StockEntry.create([{
      branch_id: branchId,
      item_id: itemId, // References Items table
      entry_type: entryType,
      quantity: Math.abs(quantity),
      unit_cost: unitCost,
      total_cost: unitCost ? Math.abs(quantity) * unitCost : undefined,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: referenceType,
      reference_id: referenceId,
      reason,
      performed_by: performedBy,
      notes
    }], { session });

    return inventory;
  }

  /**
   * Remove stock from inventory (sale, waste, transfer out, adjustment down)
   */
  async removeStock(params: {
    branchId: string;
    itemId: string; // From Items table
    quantity: number;
    entryType: 'sale' | 'waste' | 'transfer_out' | 'adjustment';
    referenceType?: string;
    referenceId?: string;
    reason?: string;
    performedBy: string;
    notes?: string;
    session?: mongoose.ClientSession;
  }) {
    const { branchId, itemId, quantity, entryType, referenceType, referenceId, reason, performedBy, notes, session } = params;

    const inventory = await InventoryItem.findOne({
      branch_id: branchId,
      item_id: itemId
    }).session(session!);

    if (!inventory) {
      throw new Error(`No inventory record found for item ${itemId} at branch ${branchId}`);
    }

    const previousQuantity = inventory.current_quantity;
    const newQuantity = previousQuantity - quantity;

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Available: ${previousQuantity}, Requested: ${quantity}`);
    }

    inventory.current_quantity = newQuantity;
    await inventory.save({ session });

    await StockEntry.create([{
      branch_id: branchId,
      item_id: itemId, // References Items table
      entry_type: entryType,
      quantity: -Math.abs(quantity),
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reference_type: referenceType,
      reference_id: referenceId,
      reason,
      performed_by: performedBy,
      notes
    }], { session });

    return inventory;
  }

  /**
   * Deduct inventory for a completed order
   * Uses Item references from Recipe → RecipeIngredient → Item
   */
  async deductOrderInventory(params: {
    branchId: string;
    orderId: string;
    orderItems: Array<{
      menuItemId: string;
      quantity: number;
      menuItemName: string;
    }>;
    performedBy: string;
    session?: mongoose.ClientSession;
  }) {
    const { branchId, orderId, orderItems, performedBy, session } = params;
    const deductions: any[] = [];

    for (const orderItem of orderItems) {
      const recipe = await Recipe.findOne({
        menu_item_id: orderItem.menuItemId,
        is_default: true,
        is_active: true
      }).session(session!);

      if (!recipe) {
        console.warn(`No default recipe found for menu item: ${orderItem.menuItemName}`);
        continue;
      }

      // Get all ingredients - each references Items table
      const ingredients = await RecipeIngredient.find({
        recipe_id: recipe._id
      }).populate('item_id', 'item_name').session(session!);

      for (const ingredient of ingredients) {
        const requiredQty = orderItem.quantity * ingredient.quantity;
        const totalRequired = requiredQty * (1 + (ingredient.wastage_percentage || 0) / 100);

        const inventory = await InventoryItem.findOne({
          branch_id: branchId,
          item_id: (ingredient.item_id as any)._id // References Item
        }).session(session!);

        if (!inventory) {
          throw new Error(`Inventory not found for ingredient: ${(ingredient.item_id as any).item_name}`);
        }

        if (inventory.current_quantity < totalRequired) {
          throw new Error(`Insufficient stock for ${orderItem.menuItemName}. Ingredient: ${(ingredient.item_id as any).item_name}`);
        }

        await this.removeStock({
          branchId,
          itemId: (ingredient.item_id as any)._id.toString(),
          quantity: totalRequired,
          entryType: 'sale',
          referenceType: 'Order',
          referenceId: orderId,
          reason: `Order ${orderItem.quantity}x ${orderItem.menuItemName}`,
          performedBy,
          session
        });

        deductions.push({
          itemId: (ingredient.item_id as any)._id,
          itemName: (ingredient.item_id as any).item_name,
          quantity: totalRequired,
          recipeId: recipe._id
        });
      }
    }

    return deductions;
  }

  /**
   * Get stock movement history for an item
   */
  async getStockHistory(params: {
    branchId?: string;
    itemId?: string; // From Items table
    entryType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }) {
    const { branchId, itemId, entryType, startDate, endDate, limit = 50, skip = 0 } = params;

    const query: any = {};
    if (branchId) query.branch_id = branchId;
    if (itemId) query.item_id = itemId;
    if (entryType) query.entry_type = entryType;
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = startDate;
      if (endDate) query.created_at.$lte = endDate;
    }

    const entries = await StockEntry.find(query)
      .populate('item_id', 'item_name category unit sku') // From Items table
      .populate('branch_id', 'branch_name')
      .populate('performed_by', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StockEntry.countDocuments(query);

    return { entries, total };
  }

  /**
   * Get consumption summary (what has been sold/consumed)
   */
  async getConsumptionSummary(branchId: string, startDate: Date, endDate: Date) {
    const consumption = await StockEntry.aggregate([
      {
        $match: {
          branch_id: new mongoose.Types.ObjectId(branchId),
          entry_type: 'sale',
          created_at: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$item_id',
          total_consumed: { $sum: { $abs: '$quantity' } },
          total_cost: { $sum: '$total_cost' },
          entry_count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'items', // Join with Items table
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          item_name: '$item.item_name',
          sku: '$item.sku',
          unit: '$item.unit',
          category: '$item.category',
          total_consumed: 1,
          total_cost: 1,
          entry_count: 1
        }
      },
      { $sort: { total_consumed: -1 } }
    ]);

    return consumption;
  }

  /**
   * Record waste/spoilage
   */
  async recordWaste(params: {
    branchId: string;
    items: Array<{ itemId: string; quantity: number; reason?: string }>; // itemId from Items table
    performedBy: string;
    notes?: string;
    session?: mongoose.ClientSession;
  }) {
    const { branchId, items, performedBy, notes, session } = params;

    const wasteEntries = [];
    for (const item of items) {
      const inventory = await InventoryItem.findOne({
        branch_id: branchId,
        item_id: item.itemId // References Items table
      }).session(session!);

      if (!inventory) continue;

      const previousQuantity = inventory.current_quantity;
      inventory.current_quantity = Math.max(0, previousQuantity - item.quantity);
      await inventory.save({ session });

      const entry = await StockEntry.create([{
        branch_id: branchId,
        item_id: item.itemId, // References Items table
        entry_type: 'waste',
        quantity: -Math.abs(item.quantity),
        previous_quantity: previousQuantity,
        new_quantity: inventory.current_quantity,
        reason: item.reason,
        performed_by: performedBy,
        notes
      }], { session });

      wasteEntries.push(entry);
    }

    return wasteEntries;
  }

  /**
   * Transfer stock between branches
   */
  async transferStock(params: {
    fromBranchId: string;
    toBranchId: string;
    itemId: string; // From Items table
    quantity: number;
    performedBy: string;
    notes?: string;
    session?: mongoose.ClientSession;
  }) {
    const { fromBranchId, toBranchId, itemId, quantity, performedBy, notes, session } = params;

    await this.removeStock({
      branchId: fromBranchId,
      itemId,
      quantity,
      entryType: 'transfer_out',
      referenceType: 'Transfer',
      reason: `Transfer to ${toBranchId}`,
      performedBy,
      session
    });

    const destInventory = await this.addStock({
      branchId: toBranchId,
      itemId,
      quantity,
      entryType: 'transfer_in',
      referenceType: 'Transfer',
      reason: `Transfer from ${fromBranchId}`,
      performedBy,
      notes,
      session
    });

    return destInventory;
  }

  /**
   * Adjust stock manually (count variance)
   */
  async adjustStock(params: {
    branchId: string;
    itemId: string; // From Items table
    newQuantity: number;
    reason: string;
    performedBy: string;
    notes?: string;
    session?: mongoose.ClientSession;
  }) {
    const { branchId, itemId, newQuantity, reason, performedBy, notes, session } = params;

    const inventory = await InventoryItem.findOne({
      branch_id: branchId,
      item_id: itemId
    }).session(session!);

    if (!inventory) {
      throw new Error('Inventory item not found');
    }

    const previousQuantity = inventory.current_quantity;
    const adjustment = newQuantity - previousQuantity;

    inventory.current_quantity = newQuantity;
    await inventory.save({ session });

    await StockEntry.create([{
      branch_id: branchId,
      item_id: itemId, // References Items table
      entry_type: 'adjustment',
      quantity: adjustment,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      reason,
      performed_by: performedBy,
      notes
    }], { session });

    return inventory;
  }
}

export default new InventoryService();
