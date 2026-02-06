import express from 'express';
import {
  getSalesSummary,
  getSalesAnalytics,
  getProductsSummary,
  getProductAnalytics,
  getStockAnalytics
} from '../controllers/analyticsController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager', 'cashier', 'saas_admin'));

router.get('/sales/summary', getSalesSummary);
router.get('/sales', getSalesAnalytics);
router.get('/products/summary', getProductsSummary);
router.get('/products', getProductAnalytics);
router.get('/stock', getStockAnalytics);

export default router;
