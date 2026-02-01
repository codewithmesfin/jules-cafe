import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'manager'), getAllUsers)
  .post(protect, authorize('admin', 'manager'), createUser);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin', 'manager'), updateUser)
  .delete(protect, authorize('admin', 'manager'), deleteUser);

export default router;
