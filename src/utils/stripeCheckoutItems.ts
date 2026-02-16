import type Stripe from 'stripe';

export type StripeCheckoutOrderItemPayload = {
	productId: string;
	variantId: string | null;
	quantity: number;
};

const normalizeMetadataString = (value: unknown, maxLen: number) => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.length > maxLen) return trimmed.slice(0, maxLen);
	return trimmed;
};

export const parseLegacyStripeCheckoutItemsMetadata = (
	rawItemsMetadata: unknown
): StripeCheckoutOrderItemPayload[] => {
	if (typeof rawItemsMetadata !== 'string') return [];

	try {
		const parsed = JSON.parse(rawItemsMetadata);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((item) => ({
				productId: String(item?.productId ?? '').trim(),
				variantId: item?.variantId ? String(item.variantId).trim() : null,
				quantity: Math.max(1, Math.floor(item?.quantity ?? 1)),
			}))
			.filter((item) => item.productId);
	} catch {
		return [];
	}
};

export const parseStripeCheckoutLineItemMetadata = (
	lineItems: Stripe.LineItem[]
): StripeCheckoutOrderItemPayload[] =>
	lineItems
		.map((lineItem) => {
			const productId = normalizeMetadataString(lineItem.metadata?.appProductId, 128);
			if (!productId) return null;

			const variantId = normalizeMetadataString(lineItem.metadata?.appVariantId, 128);
			const quantity = Math.max(1, Math.floor(lineItem.quantity ?? 1));

			return {
				productId,
				variantId,
				quantity,
			};
		})
		.filter((item): item is StripeCheckoutOrderItemPayload => item !== null);

export const listStripeCheckoutSessionLineItems = async ({
	stripeClient,
	sessionId,
	limit = 100,
}: {
	stripeClient: Stripe | null;
	sessionId: string;
	limit?: number;
}): Promise<Stripe.LineItem[]> => {
	if (!stripeClient) return [];

	const allLineItems: Stripe.LineItem[] = [];
	let startingAfter: string | undefined;

	while (true) {
		const page = await stripeClient.checkout.sessions.listLineItems(sessionId, {
			limit,
			...(startingAfter ? { starting_after: startingAfter } : {}),
		});

		if (!page.data.length) break;
		allLineItems.push(...page.data);

		if (!page.has_more) break;
		const lastId = page.data[page.data.length - 1]?.id;
		if (!lastId) break;
		startingAfter = lastId;
	}

	return allLineItems;
};
