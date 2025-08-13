'use client';

import React, { createContext, startTransition, useContext, useState } from 'react';
import { addToCart } from '@/actions/cart/addToCart';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import type { Product } from '@/types/product';
import { CartContextType } from '@/types/cart';

type CartProviderProps = {
	children: React.ReactNode;
	cartItems: { success?: boolean; items?: Product[]; guest?: boolean };
	cartProcuctIds: { success?: boolean; productIds?: string[]; guest?: boolean };
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, cartItems, cartProcuctIds }: CartProviderProps) {
	// Initialize state once from props
	const [cartItemsState, setCartItemsState] = useState<Product[]>(
		cartItems?.success ? (cartItems.items ?? []) : []
	);
	const [productIdsState, setProductIdsState] = useState<string[]>(
		cartProcuctIds?.success ? (cartProcuctIds.productIds ?? []) : []
	);

	const handleAddItem = async (product: Product) => {
		const cartProduct = {
			basePrice: product.basePrice,
			category: product.category.parent.slug,
			discountPrice: product.discountPrice,
			id: product.id,
			imageUrl: product.imageUrl,
			name: product.name,
			quantity: 1,
			slug: product.slug,
			subcategory: product.category.slug,
			tags: product?.tags || [],
		};
		// Optimistically update
		startTransition(() => {
			setCartItemsState((prev) => [...prev, cartProduct]);
			setProductIdsState((prev) => [...prev, product.id]);
		});

		const res = await addToCart(product.id);

		console.log('res', res);

		// Rollback if failed
		if (!res.success) {
			startTransition(() => {
				setCartItemsState((prev) => prev.filter((item) => item.id !== product.id));
				setProductIdsState((prev) => prev.filter((id) => id !== product.id));
			});
		}
	};

	const handleRemoveItem = async (productId: string) => {
		const prevItems = cartItemsState;
		const prevIds = productIdsState;

		// Optimistically remove
		startTransition(() => {
			setCartItemsState((prev) => prev.filter((item) => item.id !== productId));
			setProductIdsState((prev) => prev.filter((id) => id !== productId));
		});

		const res = await removeFromCart({ productId });

		// Rollback if failed
		if (!res.success || res.guest) {
			startTransition(() => {
				setCartItemsState(prevItems);
				setProductIdsState(prevIds);
			});
		}
	};

	const totalItems = cartItemsState.length;

	return (
		<CartContext.Provider
			value={{
				cartItems: cartItemsState,
				productIds: productIdsState,
				totalItems,
				handleAddItem,
				handleRemoveItem,
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
