import express from 'express';
import Item from '../models/Item';
import * as factory from '../utils/controllerFactory';
import { protect, authorize, requireOnboardingComplete, AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const router = express.Router();

// Apply protect and onboarding check to all routes
router.use(protect);
router.use(requireOnboardingComplete);

router.route('/')
  .get(factory.getAll(Item))
  .post(authorize('admin', 'manager'), factory.createOne(Item));

router.route('/:id')
  .get(factory.getOne(Item))
  .put(authorize('admin', 'manager'), factory.updateOne(Item))
  .delete(authorize('admin'), factory.deleteOne(Item));

// Get items by type with tenant isolation
router.get('/type/:type', catchAsync(async (req: AuthRequest, res: any, next: any) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Only customers can access items without company restriction (for public menu)
  // Staff/admin/manager need company isolation
  const query: any = { 
    item_type: req.params.type,
    is_active: true 
  };

  // Apply tenant isolation for non-customer users
  if (req.user.role !== 'customer' && req.user.company_id) {
    query.company_id = req.user.company_id;
  }

  const items = await Item.find(query).sort({ item_name: 1 });
  
  const transformedItems = items.map((doc: any) => ({
    ...doc.toObject(),
    id: doc._id.toString(),
  }));
  
  res.status(200).json(transformedItems);
}));

export default router;
