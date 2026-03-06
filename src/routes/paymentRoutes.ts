import { Router } from 'express';
import { createCheckoutSession } from '../controllers/paymentController';
import { protectRoute } from '../middleware/authMiddleware';

const router = Router();
router.post('/create-checkout-session', protectRoute, createCheckoutSession);

export default router;