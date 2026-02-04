import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getOrderItems
} from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .patch(updateOrder)
  .delete(deleteOrder);

router.get('/:orderId/items', getOrderItems);

export default router;
