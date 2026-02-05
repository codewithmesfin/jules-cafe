import express from 'express';
import {
  createStaff,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/staff', restrictTo('admin', 'manager'), createStaff);

router.route('/')
  .get(restrictTo('admin', 'manager', 'cashier', 'saas_admin'), getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo('admin', 'saas_admin'), deleteUser);

export default router;
