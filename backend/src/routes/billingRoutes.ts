import { Router } from 'express';
import { protect } from '../middleware/auth';
import { restrictTo } from '../middleware/auth';
import {
  getCurrentSubscription,
  createSubscription,
  getInvoices,
  getInvoice,
  submitPayment,
  getPayments,
  getBankAccountInfo,
  calculatePrice,
  cancelSubscription,
  autoCreateSubscription,
  runBillingChecks,
  renewSubscription
} from '../controllers/billingController';

const router = Router();

// All routes require authentication
router.use(protect);

// Subscription routes
router.get('/subscription', getCurrentSubscription);
router.post('/subscription', createSubscription);
router.post('/subscription/auto', autoCreateSubscription);
router.post('/subscription/:id/renew', renewSubscription);
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

// Scheduler routes (for cron jobs)
router.post('/scheduler/run-checks', restrictTo('saas_admin'), runBillingChecks);

export default router;
