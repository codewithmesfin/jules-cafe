import express from 'express';
import Item from '../models/Item';
import * as factory from '../utils/controllerFactory';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(factory.getAll(Item))
  .post(protect, authorize('admin', 'manager'), factory.createOne(Item));

router.route('/:id')
  .get(factory.getOne(Item))
  .put(protect, authorize('admin', 'manager'), factory.updateOne(Item))
  .delete(protect, authorize('admin'), factory.deleteOne(Item));

// Get items by type
router.get('/type/:type', async (req, res) => {
  try {
    const items = await Item.find({ 
      item_type: req.params.type,
      is_active: true 
    }).sort({ item_name: 1 });
    
    const transformedItems = items.map((doc: any) => ({
      ...doc.toObject(),
      id: doc._id.toString(),
    }));
    
    res.status(200).json(transformedItems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
