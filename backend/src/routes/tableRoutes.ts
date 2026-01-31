import express from 'express';
import Table from '../models/Table';
import * as factory from '../utils/controllerFactory';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(factory.getAll(Table))
  .post(protect, authorize('admin', 'manager'), factory.createOne(Table));

router.route('/:id')
  .get(factory.getOne(Table))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(Table))
  .delete(protect, authorize('admin', 'manager'), factory.deleteOne(Table));

export default router;
