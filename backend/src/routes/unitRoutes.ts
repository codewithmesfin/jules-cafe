import express from 'express';
import {
  getAllUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  getAllConversions,
  getConversion,
  createConversion,
  updateConversion,
  deleteConversion
} from '../controllers/unitController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.route('/units')
  .get(getAllUnits)
  .post(restrictTo('admin', 'manager'), createUnit);

router.route('/units/:id')
  .get(getUnit)
  .patch(restrictTo('admin', 'manager'), updateUnit)
  .delete(restrictTo('admin', 'manager'), deleteUnit);

router.route('/conversions')
  .get(getAllConversions)
  .post(restrictTo('admin', 'manager'), createConversion);

router.route('/conversions/:id')
  .get(getConversion)
  .patch(restrictTo('admin', 'manager'), updateConversion)
  .delete(restrictTo('admin', 'manager'), deleteConversion);

export default router;
