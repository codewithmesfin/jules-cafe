import express from 'express';
import Table from '../models/Table';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(factory.getAll(Table))
  .post(authorize('admin', 'manager'), factory.createOne(Table));

router.route('/:id')
  .get(factory.getOne(Table))
  .put(authorize('admin', 'manager'), factory.updateOne(Table))
  .delete(authorize('admin', 'manager'), factory.deleteOne(Table));

export default router;
