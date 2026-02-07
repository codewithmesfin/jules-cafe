import Product from '../models/Product';
import * as factory from '../utils/controllerFactory';
import { checkInventoryForOrderItems } from '../utils/inventoryUtils';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';

export const getAllProducts = factory.getAll(Product);
export const getProduct = factory.getOne(Product);
export const createProduct = factory.createOne(Product);
export const updateProduct = factory.updateOne(Product);
export const deleteProduct = factory.deleteOne(Product);

/**
 * Get products that are available based on inventory
 * Filters out products whose recipe ingredients are not in stock
 */
export const getAvailableProducts = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  
  // Get all active products for the business
  const products = await Product.find({ 
    business_id: businessId,
    is_active: true 
  });
  
  // Create a map of product IDs to names for better error messages
  const productMap = new Map(products.map(p => [p._id.toString(), p.name]));
  
  const availableProducts = [];
  const unavailableProducts = [];
  
  for (const product of products) {
    // Check inventory for this product (quantity 1 to check availability)
    const inventoryCheck = await checkInventoryForOrderItems(businessId.toString(), [{
      product_id: product._id,
      quantity: 1
    }], productMap);
    
    if (inventoryCheck.canDeduct) {
      availableProducts.push(product);
    } else {
      // Improve error messages by replacing product ID with name
      const improvedReasons = inventoryCheck.missingIngredients.map((reason: string) => {
        // Replace product ID with product name in error message
        let improvedReason = reason;
        productMap.forEach((name, id) => {
          improvedReason = improvedReason.replace(`(ID: ${id})`, `(Product: ${name})`);
        });
        return improvedReason;
      });
      
      unavailableProducts.push({
        product: product,
        reasons: improvedReasons
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      available: availableProducts,
      unavailable: unavailableProducts
    }
  });
});
