import type { ReactNode } from 'react';
import type { Product, SubcategoryProduct } from './product';

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

export type CartContextType = {
	cartData: CartData;
	productIds: string[];
	handleClearCart: () => void;
	handleUpdateQuantity: (lineId: string, quantity: number) => Promise<{ success: boolean }>;
	handleAddItem: (
		product: SubcategoryProduct | Product,
		opts?: { variantId?: string | null }
	) => Promise<{ success: boolean }>;
	handleRemoveItem: (productId: string) => Promise<{ success: boolean }>;
	handleRemoveLine: (lineId: string) => Promise<{ success: boolean }>;
};

export type CartProviderProps = {
	children: ReactNode;
	cartData: CartData;
	cartProductIds: { success?: boolean; productIds?: string[] };
};
