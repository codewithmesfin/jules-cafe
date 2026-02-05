import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getCurrentSubscription,
  createSubscription,
  getInvoices,
  getInvoice,
  submitPayment,
  getPayments,
  getBankAccountInfo,
  calculatePrice,
  cancelSubscription
} from '../controllers/billingController';

const router = Router();

// All routes require authentication
router.use(protect);

// Subscription routes
router.get('/subscription', getCurrentSubscription);
router.post('/subscription', createSubscription);
router.delete('/subscription/:id', cancelSubscription);

// Invoice routes
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);

// Payment routes
router.post('/payments', submitPayment);
router.get('/payments', getPayments);

// Utility routes
router.get('/bank-accounts', getBankAccountInfo);
router.get('/calculate-price', calculatePrice);

export default router;
