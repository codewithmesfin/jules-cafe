import express from 'express';
import Category from '../models/Category';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(factory.getAll(Category))
  .post(authorize('admin', 'manager'), factory.createOne(Category));

router.route('/:id')
  .get(factory.getOne(Category))
  .put(authorize('admin', 'manager'), factory.updateOne(Category))
  .delete(authorize('admin', 'manager'), factory.deleteOne(Category));

export default router;
