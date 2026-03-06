import { Router } from 'express';
import { analyzeResume } from '../controllers/resumeController';
import { protectRoute } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { analyzeResumeSchema } from '../schemas/resumeSchema';

const router = Router();
router.post('/analyze', protectRoute, validate(analyzeResumeSchema), analyzeResume);

export default router;