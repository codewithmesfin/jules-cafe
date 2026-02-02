import express from 'express';
import { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuItemController';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(getAllMenuItems)
  .post(authorize('admin', 'manager'), upload.single('image'), createMenuItem);

router.route('/:id')
  .get(getMenuItem)
  .put(authorize('admin', 'manager'), upload.single('image'), updateMenuItem)
  .delete(authorize('admin', 'manager'), deleteMenuItem);

export default router;
