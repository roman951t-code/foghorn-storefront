export type CartProduct = {
	// Unique cart line identifier (cartItem.id for logged-in users, deterministic key for guests)
	lineId: string;
	productId: string;
	variantId: string | null;
	availableStock?: number | null;
	sku?: string | null;
	variantLabel?: string | null;
	basePrice: number;
	discountPrice: number | null;
	name: string;
	quantity: number;
	imageUrl: string | null;
	fullSlug: string;
};

export type CartData = {
	items: CartProduct[];
	message?: string;
};
