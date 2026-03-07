import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import stripe from '../config/stripe';
import prisma from '../config/db';

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    if (user.role === 'PREMIUM') {
      res.status(400).json({ success: false, message: "You are already a Premium member!" });
      return;
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', 
      customer_email: user.email,
      line_items:[
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Resume AI Premium Upgrade',
              description: 'Unlock detailed AI feedback and unlimited resume scans.',
            },
            unit_amount: 999, 
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: user.id,
      },
    });
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 9.99,
        currency: 'USD',
        status: 'PENDING',
        stripeSessionId: session.id, 
      }
    });
    res.status(200).json({
      success: true,
      url: session.url, 
    });

  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ success: false, message: "Could not create payment session" });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, message: "Session ID is required" });
      return;
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      res.status(400).json({ success: false, message: "Payment has not been completed yet." });
      return;
    }
    const userId = session.metadata?.userId;

    if (!userId) {
      res.status(404).json({ success: false, message: "User ID not found in session metadata" });
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PREMIUM' },
    });
    await prisma.payment.updateMany({
      where: { stripeSessionId: sessionId },
      data: { status: 'COMPLETED' },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified! You are now a PREMIUM user.",
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};