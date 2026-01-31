import express from 'express';
import Branch from '../models/Branch';
import * as factory from '../utils/controllerFactory';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(factory.getAll(Branch))
  .post(protect, authorize('admin'), factory.createOne(Branch));

router.route('/:id')
  .get(factory.getOne(Branch))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(Branch))
  .delete(protect, authorize('admin'), factory.deleteOne(Branch));

export default router;
