'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { CatalogCategory, SubcategoryProduct } from '@/types/product';
import type { CartData } from '@/types/cart';
import { useCatalogStore } from '@/stores/catalogStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishListStore } from '@/stores/wishListStore';
import { useSession } from './SessionProvider';

type Props = {
	categories: CatalogCategory[];
	cartData: CartData;
	cartProductIds: { success?: boolean; productIds?: string[] };
	wishListData: SubcategoryProduct[];
	wishListIds: { success?: boolean; productIds: string[] };
	isLoggedIn: boolean;
	children?: ReactNode;
};

export function AppStoreHydrator({
	categories,
	cartData,
	cartProductIds,
	wishListData,
	wishListIds,
	isLoggedIn,
	children,
}: Props) {
	const setCategories = useCatalogStore((state) => state.setCategories);

	const setCartInitial = useCartStore((state) => state.setInitialData);
	const setCartLoggedIn = useCartStore((state) => state.setIsLoggedIn);
	const hydrateGuestCart = useCartStore((state) => state.hydrateGuestCart);
	const mergeGuestCart = useCartStore((state) => state.mergeGuestIntoServer);

	const setWishInitial = useWishListStore((state) => state.setInitialData);
	const setWishLoggedIn = useWishListStore((state) => state.setIsLoggedIn);
	const hydrateGuestWish = useWishListStore((state) => state.hydrateGuestWishlist);
	const mergeGuestWish = useWishListStore((state) => state.mergeGuestWishlistIntoServer);

	const prevLoggedInRef = useRef<boolean | null>(null);
	const { session } = useSession();
	const currentUserId = session?.user?.id ?? null;
	const prevUserIdRef = useRef<string | null>(currentUserId);

	// Catalog
	useEffect(() => {
		setCategories(categories);
	}, [categories, setCategories]);

	// Cart init + login flag
	useLayoutEffect(() => {
		const ids = cartProductIds?.success ? cartProductIds.productIds ?? [] : [];
		setCartInitial(cartData, ids);
	}, [cartData, cartProductIds, setCartInitial]);

	useLayoutEffect(() => {
		setCartLoggedIn(isLoggedIn);
	}, [isLoggedIn, setCartLoggedIn]);

	// Wishlist init + login flag
	useLayoutEffect(() => {
		const ids = wishListIds?.success ? wishListIds.productIds ?? [] : [];
		setWishInitial(wishListData, ids);
	}, [setWishInitial, wishListData, wishListIds]);

	useLayoutEffect(() => {
		setWishLoggedIn(isLoggedIn);
	}, [isLoggedIn, setWishLoggedIn]);

	// Handle Google auth merge
	useEffect(() => {
		if (!isLoggedIn) return;
		const url = new URL(window.location.href);
		if (url.searchParams.get('auth') === 'google') {
			(async () => {
				await Promise.all([mergeGuestCart(), mergeGuestWish()]);
				url.searchParams.delete('auth');
				window.history.replaceState(
					{},
					'',
					url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
				);
			})();
		}
	}, [isLoggedIn, mergeGuestCart, mergeGuestWish]);

	// Login/logout transitions
	useEffect(() => {
		const wasLogged = prevLoggedInRef.current;

		// Initial mount: hydrate guest carts if user starts unauthenticated.
		if (wasLogged === null) {
			if (!isLoggedIn) {
				hydrateGuestCart();
				hydrateGuestWish();
			}
			prevLoggedInRef.current = isLoggedIn;
			return;
		}

		if (!wasLogged && isLoggedIn) {
			mergeGuestCart();
			mergeGuestWish();
		} else if (wasLogged && !isLoggedIn) {
			hydrateGuestCart();
			hydrateGuestWish();
		}

		prevLoggedInRef.current = isLoggedIn;
	}, [hydrateGuestCart, hydrateGuestWish, isLoggedIn, mergeGuestCart, mergeGuestWish]);

	// Handle user switching: fetch fresh cart/wishlist per user
	useEffect(() => {
		const prevUserId = prevUserIdRef.current;

		const fetchServerCart = async () => {
			try {
				const res = await fetch('/api/cart', { cache: 'no-store' });
				if (!res.ok) return;
				const data = await res.json();
				if (data?.success && Array.isArray(data.items)) {
					setCartInitial({ items: data.items }, data.items.map((item: any) => item.id));
				}
			} catch {
				// noop
			}
		};

		if (currentUserId && currentUserId !== prevUserId) {
			setCartLoggedIn(true);
			setWishLoggedIn(true);
			fetchServerCart();
		}

		if (!currentUserId && prevUserId) {
			setCartLoggedIn(false);
			setWishLoggedIn(false);
			hydrateGuestCart();
			hydrateGuestWish();
		}

		prevUserIdRef.current = currentUserId;
	}, [
		currentUserId,
		hydrateGuestCart,
		hydrateGuestWish,
		setCartInitial,
		setCartLoggedIn,
		setWishLoggedIn,
		mergeGuestCart,
	]);

	return <>{children}</>;
}
