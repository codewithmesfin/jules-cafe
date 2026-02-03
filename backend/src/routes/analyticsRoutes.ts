import express from 'express';
import {
  getSalesAnalytics,
  getProductAnalytics,
  getStockAnalytics
} from '../controllers/analyticsController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager', 'saas_admin'));

router.get('/sales', getSalesAnalytics);
router.get('/products', getProductAnalytics);
router.get('/stock', getStockAnalytics);

export default router;
