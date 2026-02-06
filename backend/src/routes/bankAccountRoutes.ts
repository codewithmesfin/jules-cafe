import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} from '../controllers/bankAccountController';

const router = Router();

// All routes require authentication and saas_admin role
router.use(protect);
router.use(restrictTo('saas_admin'));

router.get('/', getBankAccounts);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

export default router;
