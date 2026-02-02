import express from 'express';
import { getAllOrders, getOrder, createOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(getAllOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .put(updateOrder)
  .delete(authorize('admin', 'manager'), deleteOrder);

export default router;
