import express from 'express';
import {
  getAllTables,
  getTable,
  createTable,
  updateTable,
  deleteTable
} from '../controllers/tableController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllTables)
  .post(restrictTo('admin', 'manager'), createTable);

router.route('/:id')
  .get(getTable)
  .patch(restrictTo('admin', 'manager'), updateTable)
  .delete(restrictTo('admin', 'manager'), deleteTable);

export default router;
