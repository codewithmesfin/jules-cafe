import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(authorize('admin', 'manager', 'cashier'), getAllUsers)
  .post(authorize('admin', 'manager'), createUser);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin', 'manager'), updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;
