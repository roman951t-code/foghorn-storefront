'use client';

import { useEffect, useMemo } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCart() {
	const cartData = useCartStore((state) => state.cartData);
	const productIds = useCartStore((state) => state.productIds);
	const isLoggedIn = useCartStore((state) => state.isLoggedIn);
	const isHydrated = useCartStore((state) => state.isHydrated);
	const hydrateGuestCart = useCartStore((state) => state.hydrateGuestCart);
	const handleAddItem = useCartStore((state) => state.handleAddItem);
	const handleRemoveItem = useCartStore((state) => state.handleRemoveItem);
	const handleRemoveLine = useCartStore((state) => state.handleRemoveLine);
	const handleClearCart = useCartStore((state) => state.handleClearCart);
	const handleUpdateQuantity = useCartStore((state) => state.handleUpdateQuantity);

	useEffect(() => {
		if (!isLoggedIn && !isHydrated) {
			void hydrateGuestCart();
		}
	}, [hydrateGuestCart, isHydrated, isLoggedIn]);

	return useMemo(
		() => ({
			cartData,
			productIds,
			isHydrated,
			handleAddItem,
			handleRemoveItem,
			handleRemoveLine,
			handleClearCart,
			handleUpdateQuantity,
		}),
		[
			cartData,
			productIds,
			isHydrated,
			handleAddItem,
			handleRemoveItem,
			handleRemoveLine,
			handleClearCart,
			handleUpdateQuantity,
		],
	);
}
