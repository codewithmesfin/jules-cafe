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
router.use(restrictTo('saas_admin'));
router.get('/invoices', getBusinessInvoices);
router.get('/pending-payments', getPendingPayments);
router.patch('/:id/toggle-status', toggleBusinessStatus);
router.post('/verify-payment', verifyPayment);

// Admin only routes
router.use(restrictTo('saas_admin', 'admin'));
router.post('/', addBusiness);

router.route('/')
  .get(getAllBusinesses);

router.route('/:id')
  .get(getBusiness)
  .patch(updateBusiness)
  .delete(deleteBusiness);

export default router;
