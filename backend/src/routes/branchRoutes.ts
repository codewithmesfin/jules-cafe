import express from 'express';
import Branch from '../models/Branch';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(authorize('admin', 'manager', 'cashier'), factory.getAll(Branch))
  .post(authorize('admin'), factory.createOne(Branch));

router.route('/:id')
  .get(authorize('admin', 'manager', 'cashier'), factory.getOne(Branch))
  .put(authorize('admin', 'manager'), factory.updateOne(Branch))
  .delete(authorize('admin'), factory.deleteOne(Branch));

export default router;
