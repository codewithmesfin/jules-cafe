import express from 'express';
import {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllRecipes)
  .post(restrictTo('admin', 'manager'), createRecipe);

router.route('/:id')
  .get(getRecipe)
  .patch(restrictTo('admin', 'manager'), updateRecipe)
  .delete(restrictTo('admin', 'manager'), deleteRecipe);

export default router;
