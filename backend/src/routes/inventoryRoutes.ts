import express from 'express';
import {
  getAllInventory,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryTransactions
} from '../controllers/inventoryController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/transactions', getInventoryTransactions);

router.route('/')
  .get(getAllInventory)
  .post(restrictTo('admin', 'manager'), createInventory);

router.route('/:id')
  .get(getInventory)
  .patch(restrictTo('admin', 'manager'), updateInventory)
  .delete(restrictTo('admin', 'manager'), deleteInventory);

export default router;
