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
  deleteBusiness
} from '../controllers/businessController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/setup', setupBusiness);
router.get('/me', getMyBusiness);
router.get('/my-businesses', getMyBusinesses);
router.post('/switch', switchBusiness);

// Admin only routes
router.use(restrictTo('saas_admin', 'admin'));
router.post('/', addBusiness);

// SaaS Admin only routes
router.use(restrictTo('saas_admin'));
router.route('/')
  .get(getAllBusinesses);

router.route('/:id')
  .get(getBusiness)
  .patch(updateBusiness)
  .delete(deleteBusiness);

export default router;
