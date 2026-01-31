import express from 'express';
import Category from '../models/Category';
import * as factory from '../utils/controllerFactory';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(factory.getAll(Category))
  .post(protect, authorize('admin', 'manager'), factory.createOne(Category));

router.route('/:id')
  .get(factory.getOne(Category))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(Category))
  .delete(protect, authorize('admin', 'manager'), factory.deleteOne(Category));

export default router;
