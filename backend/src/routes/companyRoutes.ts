import express from 'express';
import { 
  setupCompany, 
  getMyCompany, 
  updateCompany,
  getCompanyBranches,
  createBranch,
  getCompanyStats,
  deleteCompany
} from '../controllers/companyController';
import { protect, authorizeTenantOwner, requireOnboardingComplete } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Setup company (only for onboarding admins)
router.post('/setup', setupCompany);

// Get company details (doesn't require onboarding completion)
router.get('/me', getMyCompany);

// Get company statistics (doesn't require onboarding completion)
router.get('/stats', getCompanyStats);

// Update company (owner only, requires onboarding)
router.put('/', authorizeTenantOwner, requireOnboardingComplete, updateCompany);

// Delete company (owner only, requires onboarding)
router.delete('/', authorizeTenantOwner, requireOnboardingComplete, deleteCompany);

// Branch management (requires onboarding)
router.get('/branches', requireOnboardingComplete, getCompanyBranches);
router.post('/branches', authorizeTenantOwner, requireOnboardingComplete, createBranch);

export default router;
