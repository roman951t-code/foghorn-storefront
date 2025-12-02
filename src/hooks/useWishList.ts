'use client';

import { useMemo } from 'react';
import { useWishListStore } from '@/stores/wishListStore';

export function useWishList() {
	const items = useWishListStore((state) => state.items);
	const ids = useWishListStore((state) => state.ids);
	const handleWishAdd = useWishListStore((state) => state.handleWishAdd);
	const handleWishRemove = useWishListStore((state) => state.handleWishRemove);
	const handleClear = useWishListStore((state) => state.handleClear);

	return useMemo(
		() => ({ items, ids, handleWishAdd, handleWishRemove, handleClear }),
		[items, ids, handleWishAdd, handleWishRemove, handleClear]
	);
}
