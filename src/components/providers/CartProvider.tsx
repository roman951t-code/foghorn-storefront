'use client';

import React, { createContext, useContext, useState } from 'react';
import { addToCart } from '@/actions/cart/addToCart';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import { updateCartItemQuantity } from '@/actions/cart/updateCartItemQuantity';
import { CartContextType, CartProduct, CartProviderProps } from '@/types/cart';
import { Product } from '@/types/product';
import { clearCart } from '@/actions/cart/clearCart';

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, cartData, cartProductIds }: CartProviderProps) {
	const [cartItemsState, setCartItemsState] = useState<CartProduct[]>(cartData.items ?? []);
	const [productIdsState, setProductIdsState] = useState<string[]>(
		cartProductIds?.success ? (cartProductIds.productIds ?? []) : []
	);

	const handleAddItem = async (product: Product): Promise<{ success: boolean }> => {
		if (!product) return { success: false };

		const cartProduct: CartProduct = {
			basePrice: product.basePrice,
			discountPrice: product.discountPrice,
			id: product.id,
			imageUrl: product.imageUrl,
			name: product.name,
			quantity: 1,
			fullSlug: product.fullSlug,
		};

		setCartItemsState((prev) => [...prev, cartProduct]);
		setProductIdsState((prev) => [...prev, product.id]);

		const res = await addToCart(product.id);

		if (!res.success) {
			setCartItemsState((prev) => prev.filter((item) => item.id !== cartProduct.id));
			setProductIdsState((prev) => prev.filter((id) => id !== product.id));
			return { success: false };
		}

		return { success: true };
	};

	const handleRemoveItem = async (productId: string): Promise<{ success: boolean }> => {
		const prevItems = cartItemsState;
		const prevIds = productIdsState;

		setCartItemsState((prev) => prev.filter((item) => item.id !== productId));
		setProductIdsState((prev) => prev.filter((id) => id !== productId));

		const res = await removeFromCart({ productId });

		if (!res.success || res.guest) {
			setCartItemsState(prevItems);
			setProductIdsState(prevIds);
			return { success: false };
		}

		return { success: true };
	};

	const handleClearCart = async (): Promise<{ success: boolean }> => {
		const prevItems = cartItemsState;
		const prevIds = productIdsState;

		setCartItemsState([]);
		setProductIdsState([]);

		const res = await clearCart();

		if (!res.success) {
			setCartItemsState(prevItems);
			setProductIdsState(prevIds);
			return { success: false };
		}

		return { success: true };
	};

	const handleUpdateQuantity = async (
		productId: string,
		quantity: number
	): Promise<{ success: boolean }> => {
		const prevItems = cartItemsState;

		setCartItemsState((prev) =>
			prev.map((item) =>
				item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
			)
		);

		const res = await updateCartItemQuantity({ productId, quantity });

		if (!res.success || (res as any).guest) {
			setCartItemsState(prevItems);
			return { success: false };
		}

		return { success: true };
	};

	return (
		<CartContext.Provider
			value={{
				cartData: { ...cartData, items: cartItemsState },
				productIds: productIdsState,
				handleAddItem,
				handleRemoveItem,
				handleClearCart,
				handleUpdateQuantity,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const cartCtx = useContext(CartContext);
	if (!cartCtx) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return cartCtx;
}
