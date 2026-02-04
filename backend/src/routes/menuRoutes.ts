import express from 'express';
import {
  getAllMenu,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getAllMenu)
  .post(restrictTo('admin', 'manager'), createMenu);

router.route('/:id')
  .get(getMenu)
  .patch(restrictTo('admin', 'manager'), updateMenu)
  .delete(restrictTo('admin', 'manager'), deleteMenu);

export default router;
