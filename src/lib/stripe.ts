import Stripe from 'stripe';
import { env } from '@/config/env';

const secretKey = env.STRIPE_SECRET_KEY;

export const stripe =
	secretKey && secretKey !== ''
		? new Stripe(secretKey)
		: null;
