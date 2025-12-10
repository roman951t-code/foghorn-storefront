import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
	if (!stripePromise) {
		const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
		if (!publishableKey) {
			return Promise.resolve(null);
		}
		stripePromise = loadStripe(publishableKey);
	}

	return stripePromise;
};
