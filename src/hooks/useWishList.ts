'use client';

import { useMemo } from 'react';
import { useWishListStore } from '@/stores/wishListStore';

export function useWishList() {
	const items = useWishListStore((state) => state.items);
	const ids = useWishListStore((state) => state.ids);
	const isHydrated = useWishListStore((state) => state.isHydrated);
	const handleWishAdd = useWishListStore((state) => state.handleWishAdd);
	const handleWishRemove = useWishListStore((state) => state.handleWishRemove);
	const handleClear = useWishListStore((state) => state.handleClear);

	return useMemo(
		() => ({ items, ids, isHydrated, handleWishAdd, handleWishRemove, handleClear }),
		[items, ids, isHydrated, handleWishAdd, handleWishRemove, handleClear]
	);
}

// Same rationale as useCart.ts's useIsProductInCart/useCartActions: `ids` is
// a new array reference on every wishlist mutation, so reading it via
// useWishList() re-renders on any product's wishlist change, not just this
// one. Selecting just the boolean lets useSyncExternalStore bail out via
// Object.is when an unrelated product's membership changes.
export function useIsProductInWishlist(productId: string) {
	return useWishListStore((state) => state.ids.includes(productId));
}

export function useWishListActions() {
	const handleWishAdd = useWishListStore((state) => state.handleWishAdd);
	const handleWishRemove = useWishListStore((state) => state.handleWishRemove);

	return useMemo(() => ({ handleWishAdd, handleWishRemove }), [handleWishAdd, handleWishRemove]);
}
