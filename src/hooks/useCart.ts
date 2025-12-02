'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCart() {
	const cartData = useCartStore((state) => state.cartData);
	const productIds = useCartStore((state) => state.productIds);
	const handleAddItem = useCartStore((state) => state.handleAddItem);
	const handleRemoveItem = useCartStore((state) => state.handleRemoveItem);
	const handleClearCart = useCartStore((state) => state.handleClearCart);
	const handleUpdateQuantity = useCartStore((state) => state.handleUpdateQuantity);

	return useMemo(
		() => ({
			cartData,
			productIds,
			handleAddItem,
			handleRemoveItem,
			handleClearCart,
			handleUpdateQuantity,
		}),
		[cartData, productIds, handleAddItem, handleRemoveItem, handleClearCart, handleUpdateQuantity]
	);
}
