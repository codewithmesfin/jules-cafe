import express from 'express';
import {
  getAllIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredientController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllIngredients)
  .post(restrictTo('admin', 'manager'), createIngredient);

router.route('/:id')
  .get(getIngredient)
  .patch(restrictTo('admin', 'manager'), updateIngredient)
  .delete(restrictTo('admin', 'manager'), deleteIngredient);

export default router;
