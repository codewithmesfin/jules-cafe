import express from 'express';
import { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuItemController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.route('/')
  .get(getAllMenuItems)
  .post(protect, authorize('admin', 'manager'), upload.single('image'), createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('admin', 'manager'), upload.single('image'), updateMenuItem)
  .delete(protect, authorize('admin', 'manager'), deleteMenuItem);

export default router;
