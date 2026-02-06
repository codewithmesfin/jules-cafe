import express from 'express';
import {
  setupBusiness,
  getMyBusiness,
  getMyBusinesses,
  switchBusiness,
  addBusiness,
  getAllBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessInvoices,
  getPendingPayments,
  toggleBusinessStatus,
  verifyPayment
} from '../controllers/businessController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/setup', setupBusiness);
router.get('/me', getMyBusiness);
router.get('/my-businesses', getMyBusinesses);
router.post('/switch', switchBusiness);

// SaaS Admin only routes
router.get('/invoices', restrictTo('saas_admin'), getBusinessInvoices);
router.get('/pending-payments', restrictTo('saas_admin'), getPendingPayments);
router.patch('/:id/toggle-status', restrictTo('saas_admin'), toggleBusinessStatus);
router.post('/verify-payment', restrictTo('saas_admin'), verifyPayment);

// Admin only routes
router.post('/', restrictTo('saas_admin', 'admin'), addBusiness);

router.route('/')
  .get(restrictTo('saas_admin', 'admin'), getAllBusinesses);

router.route('/:id')
  .get(getBusiness)
  .patch(restrictTo('saas_admin', 'admin'), updateBusiness)
  .delete(restrictTo('saas_admin', 'admin'), deleteBusiness);

export default router;
