import express from 'express';
import {
  getAllShifts,
  getShift,
  clockIn,
  clockOut
} from '../controllers/shiftController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

router.route('/')
  .get(getAllShifts);

router.route('/:id')
  .get(getShift);

export default router;
