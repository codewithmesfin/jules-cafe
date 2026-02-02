import express from 'express';
import { setupCompany, getMyCompany } from '../controllers/companyController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/setup', protect, setupCompany);
router.get('/me', protect, getMyCompany);

export default router;
