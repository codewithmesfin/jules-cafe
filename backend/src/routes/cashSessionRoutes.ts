import express from 'express';
import {
  getAllCashSessions,
  getCashSession,
  createCashSession,
  updateCashSession,
  closeCashSession
} from '../controllers/cashSessionController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllCashSessions)
  .post(restrictTo('admin', 'manager', 'cashier'), createCashSession);

router.route('/:id')
  .get(getCashSession)
  .patch(restrictTo('admin', 'manager', 'cashier'), updateCashSession);

router.post('/:id/close', restrictTo('admin', 'manager', 'cashier'), closeCashSession);

export default router;
