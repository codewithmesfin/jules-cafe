import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'manager', 'staff', 'cashier'), getAllUsers)
  .post(protect, authorize('admin', 'manager', 'staff', 'cashier'), createUser);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin', 'manager', 'staff', 'cashier'), updateUser)
  .delete(protect, authorize('admin', 'manager', 'staff', 'cashier'), deleteUser);

export default router;
