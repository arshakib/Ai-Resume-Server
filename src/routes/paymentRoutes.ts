import { Router } from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/paymentController';
import { protectRoute } from '../middleware/authMiddleware';

const router = Router();
router.post('/create-checkout-session', protectRoute, createCheckoutSession);
router.post('/verify-session', protectRoute, verifyPayment);

export default router;