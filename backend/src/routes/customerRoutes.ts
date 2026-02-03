import express from 'express';
import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .patch(updateCustomer)
  .delete(deleteCustomer);

export default router;
