import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllCategories)
  .post(restrictTo('admin', 'manager'), createCategory);

router.route('/:id')
  .get(getCategory)
  .patch(restrictTo('admin', 'manager'), updateCategory)
  .delete(restrictTo('admin', 'manager'), deleteCategory);

export default router;
