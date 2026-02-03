import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import * as factory from '../utils/controllerFactory';
import { checkInventoryForOrderItems, deductInventoryForOrder } from '../utils/inventoryUtils';

/**
 * Create Order with Items
 */
export const createOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { items, customer_id, table_id, notes, payment_method } = req.body;
  const businessId = req.user.default_business_id;
  const userId = req.user._id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order must have at least one item', 400));
  }

  // 1. Check inventory before starting transaction
  const inventoryCheck = await checkInventoryForOrderItems(businessId.toString(), items);
  if (!inventoryCheck.canDeduct) {
    return next(new AppError(`Insufficient stock: ${inventoryCheck.missingIngredients.join(', ')}`, 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Calculate total amount and verify products
    let totalAmount = 0;
    const itemsToCreate = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        throw new AppError(`Product not found: ${item.product_id}`, 404);
      }
      totalAmount += product.price * item.quantity;
      itemsToCreate.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price,
        business_id: businessId,
        creator_id: userId
      });
    }

    // 3. Create the Order
    const order = await Order.create([{
      business_id: businessId,
      creator_id: userId,
      customer_id: customer_id || undefined,
      table_id: table_id || undefined,
      notes,
      total_amount: totalAmount,
      payment_method,
      order_status: 'pending'
    }], { session });

    // 4. Create Order Items
    const orderId = order[0]._id;
    const finalItems = itemsToCreate.map(item => ({ ...item, order_id: orderId }));
    await OrderItem.insertMany(finalItems, { session });

    // 5. Deduct Inventory
    await deductInventoryForOrder(businessId.toString(), orderId.toString(), items, userId.toString(), session);

    await session.commitTransaction();

    // Trigger socket event for new order
    const io = req.app.get('io');
    if (io) {
      io.to(`business_${businessId}`).emit('new-order', {
        ...order[0].toObject(),
        items: finalItems
      });
    }

    res.status(201).json({
      success: true,
      data: order[0]
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * Get All Orders for Business
 */
export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;

  // Basic query
  const orders = await Order.find({ business_id: businessId })
    .populate('customer_id')
    .populate('table_id')
    .sort({ created_at: -1 });

  // If we want items too, we'd have to aggregate or map
  // For simplicity and efficiency, let's just return orders.
  // Frontend can fetch items for specific order if needed,
  // or we can aggregate here.

  const ordersWithItems = await Promise.all(orders.map(async (order) => {
    const items = await OrderItem.find({ order_id: order._id }).populate('product_id');
    return {
      ...order.toObject(),
      items
    };
  }));

  res.status(200).json({
    success: true,
    data: ordersWithItems
  });
});

export const getOrder = factory.getOne(Order, { populate: ['customer_id', 'table_id'] });

export const updateOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, business_id: req.user.default_business_id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Trigger socket event for status update
  if (req.body.order_status) {
    const io = req.app.get('io');
    if (io) {
      io.to(`business_${order.business_id}`).emit('order-status-update', {
        orderId: order._id,
        status: order.order_status
      });
    }
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

export const deleteOrder = factory.deleteOne(Order);

/**
 * Get items for a specific order
 */
export const getOrderItems = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const items = await OrderItem.find({ order_id: req.params.orderId }).populate('product_id');
  res.status(200).json({
    success: true,
    data: items
  });
});
