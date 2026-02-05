import express from 'express';
import {
  createStaff,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getSaasAdmins,
  toggleUserStatus,
  setUserStatus,
} from '../controllers/userController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/staff', restrictTo('admin', 'manager'), createStaff);

// SaaS Admin routes
router.get('/saas-admins', restrictTo('saas_admin'), getSaasAdmins);
router.patch('/:id/toggle-status', restrictTo('saas_admin'), toggleUserStatus);
router.patch('/:id/set-status', restrictTo('saas_admin'), setUserStatus);

router.route('/')
  .get(restrictTo('admin', 'manager', 'cashier', 'saas_admin'), getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo('admin', 'saas_admin'), deleteUser);

export default router;
