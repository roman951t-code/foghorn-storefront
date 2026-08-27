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

// Selects just this one product's membership instead of the whole
// `productIds` array, so a card only re-renders when its own boolean flips —
// not on every add/remove for any other product. `productIds` is a new array
// reference on every cart mutation, so callers that read it via useCart()
// above re-render on any cart change; this narrows the useSyncExternalStore
// snapshot down to a primitive, which correctly bails out via Object.is.
export function useIsProductInCart(productId: string) {
	return useCartStore((state) => state.productIds.includes(productId));
}

// handleAddItem/handleRemoveItem are stable references (defined once in the
// store's initializer), so subscribing to just these — without cartData/
// productIds — never triggers a re-render on its own.
export function useCartActions() {
	const handleAddItem = useCartStore((state) => state.handleAddItem);
	const handleRemoveItem = useCartStore((state) => state.handleRemoveItem);

	return useMemo(() => ({ handleAddItem, handleRemoveItem }), [handleAddItem, handleRemoveItem]);
}
