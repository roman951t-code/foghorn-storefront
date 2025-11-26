import type { ReactNode } from 'react';
import { SubcategoryProduct } from './product';

export type CartProduct = {
	basePrice: number;
	discountPrice: number | null;
	name: string;
	id: string;
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
	handleUpdateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean }>;
	handleAddItem: (product: SubcategoryProduct) => Promise<{ success: boolean }>;
	handleRemoveItem: (productId: string) => Promise<{ success: boolean }>;
};

export type CartProviderProps = {
	children: ReactNode;
	cartData: CartData;
	cartProductIds: { success?: boolean; productIds?: string[] };
};
