import type { Product } from '@/types/product';

export type CartProduct = Product;

export interface CartContextType {
	cartItems: CartProduct[];
	productIds: string[];
	totalItems: number;
	handleAddItem: (product: CartProduct) => Promise<void>;
	handleRemoveItem: (productId: string) => Promise<void>;
}
