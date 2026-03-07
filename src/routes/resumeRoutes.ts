import { Router } from 'express';
import { analyzeResume, getPremiumTemplates } from '../controllers/resumeController';
import { authorizeRoles, protectRoute } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { analyzeResumeSchema } from '../schemas/resumeSchema';

const router = Router();
router.post('/analyze', protectRoute, validate(analyzeResumeSchema), analyzeResume);
router.get(
  '/premium-templates', 
  protectRoute, 
  authorizeRoles('PREMIUM', 'ADMIN'), 
  getPremiumTemplates
);

export default router;