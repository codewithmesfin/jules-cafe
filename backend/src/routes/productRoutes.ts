import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAvailableProducts
} from '../controllers/productController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllProducts)
  .post(restrictTo('admin', 'manager'), createProduct);

router.get('/available', getAvailableProducts);

router.route('/:id')
  .get(getProduct)
  .patch(restrictTo('admin', 'manager'), updateProduct)
  .delete(restrictTo('admin', 'manager'), deleteProduct);

export default router;
