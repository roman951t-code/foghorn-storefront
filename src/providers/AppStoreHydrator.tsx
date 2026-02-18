'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { CatalogCategory, SubcategoryProduct } from '@/types/product';
import type { CartData } from '@/types/cart';
import { useCatalogStore } from '@/stores/catalogStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishListStore } from '@/stores/wishListStore';
import { useOptionalSession } from '@/providers/SessionProvider';

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
	const sessionContext = useOptionalSession();
	const session = sessionContext?.session;
	const currentUserId = session?.user?.id ?? null;
	const resolvedIsLoggedIn = sessionContext ? !!currentUserId : isLoggedIn;
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
		setCartLoggedIn(resolvedIsLoggedIn);
	}, [resolvedIsLoggedIn, setCartLoggedIn]);

	// Wishlist init + login flag
	useLayoutEffect(() => {
		const ids = wishListIds?.success ? wishListIds.productIds ?? [] : [];
		setWishInitial(wishListData, ids);
	}, [setWishInitial, wishListData, wishListIds]);

	useLayoutEffect(() => {
		setWishLoggedIn(resolvedIsLoggedIn);
	}, [resolvedIsLoggedIn, setWishLoggedIn]);

	// Drop the Google auth marker from callback URLs after successful sign-in.
	useEffect(() => {
		if (!resolvedIsLoggedIn) return;
		const url = new URL(window.location.href);
		if (url.searchParams.get('auth') === 'google') {
			url.searchParams.delete('auth');
			window.history.replaceState(
				{},
				'',
				url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
			);
		}
	}, [resolvedIsLoggedIn]);

	// Login/logout transitions
	useEffect(() => {
		const wasLogged = prevLoggedInRef.current;

		// Initial mount: hydrate guest carts if user starts unauthenticated.
		if (wasLogged === null) {
			if (!resolvedIsLoggedIn) {
				hydrateGuestCart();
				hydrateGuestWish();
			} else {
				mergeGuestCart();
				mergeGuestWish();
			}
			prevLoggedInRef.current = resolvedIsLoggedIn;
			return;
		}

		if (!wasLogged && resolvedIsLoggedIn) {
			mergeGuestCart();
			mergeGuestWish();
		} else if (wasLogged && !resolvedIsLoggedIn) {
			hydrateGuestCart();
			hydrateGuestWish();
		}

		prevLoggedInRef.current = resolvedIsLoggedIn;
	}, [hydrateGuestCart, hydrateGuestWish, mergeGuestCart, mergeGuestWish, resolvedIsLoggedIn]);

	// Handle user switching: fetch fresh cart/wishlist per user
	useEffect(() => {
		const prevUserId = prevUserIdRef.current;

		const fetchServerCart = async () => {
			try {
				const res = await fetch('/api/cart', { cache: 'no-store' });
				if (!res.ok) return;
				const data = await res.json();
				if (data?.success && Array.isArray(data.items)) {
					setCartInitial({ items: data.items }, data.items.map((item: any) => item.productId));
				}
			} catch {
				// noop
			}
		};
		const fetchServerWish = async () => {
			try {
				const res = await fetch('/api/products/wishlist', { cache: 'no-store' });
				if (!res.ok) return;
				const data = await res.json();
				if (data?.success && Array.isArray(data.items)) {
					setWishInitial(data.items, data.items.map((item: any) => item.id));
				}
			} catch {
				// noop
			}
		};

		if (currentUserId && currentUserId !== prevUserId) {
			setCartLoggedIn(true);
			setWishLoggedIn(true);
			fetchServerCart();
			fetchServerWish();
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
		setWishInitial,
		setWishLoggedIn,
	]);

	return <>{children}</>;
}
