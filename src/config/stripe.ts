import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is missing in .env!");
}
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export default stripe;