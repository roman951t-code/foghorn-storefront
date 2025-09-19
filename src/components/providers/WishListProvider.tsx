'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { mergeWishListData } from '@/actions/wishlist/mergeWishListData';
import { addToWishList } from '@/actions/wishlist/addToWishList';
import { removeFromWishList } from '@/actions/wishlist/removeFromWishList';
import { clearWishlist } from '@/actions/wishlist/clearWishList';
import { SubcategoryProduct } from '@/types/product';
import { useSession } from './SessionProvider';

export type WishListContextType = {
	items: SubcategoryProduct[];
	ids: string[];
	handleWishAdd: (product: SubcategoryProduct) => Promise<{ success: boolean }>;
	handleWishRemove: (productId: string) => Promise<{ success: boolean }>;
	handleClear: () => Promise<{ success: boolean }>;
};

export const WishListContext = createContext<WishListContextType | null>(null);

const LOCAL_STORAGE_KEY = 'guest_wishlist';

function saveGuestWishlist(items: SubcategoryProduct[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
	}
}

function loadGuestWishlist(): SubcategoryProduct[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!stored) return [];
	try {
		const parsed = JSON.parse(stored) as (SubcategoryProduct | null)[];
		return parsed.filter((p): p is SubcategoryProduct => p !== null);
	} catch {
		return [];
	}
}

async function fetchWishDataFromApi() {
	const res = await fetch('/api/products/wishlist', { cache: 'no-store' });
	if (!res.ok) return { success: false, items: [] };
	return res.json();
}

type WishListProviderProps = {
	children: React.ReactNode;
	wishListData?: SubcategoryProduct[];
	wishListIds: { success?: boolean; productIds: string[] };
};

export function WishListProvider({
	children,
	wishListData = [],
	wishListIds,
}: WishListProviderProps) {
	const { session } = useSession();
	const isLoggedIn = !!session?.user;

	const [items, setItems] = useState<SubcategoryProduct[]>(wishListData);
	const [ids, setIds] = useState<string[]>(
		wishListIds?.success ? (wishListIds.productIds ?? []) : []
	);

	const isMergingRef = useRef(false);
	const prevLoggedInRef = useRef(isLoggedIn);

	const setFromServer = useCallback((list: (SubcategoryProduct | null)[]) => {
		const filtered = list.filter((p): p is SubcategoryProduct => p !== null);
		setItems(filtered);
		setIds(filtered?.map((p) => p.id));
	}, []);

	const mergeLocalIntoServer = useCallback(async () => {
		const local = loadGuestWishlist();
		if (local.length === 0) return;

		isMergingRef.current = true;
		setFromServer(local);

		await mergeWishListData(local.map(({ id }) => ({ id })));
		localStorage.removeItem(LOCAL_STORAGE_KEY);

		const fresh = await fetchWishDataFromApi();
		if (fresh?.products) setFromServer(fresh.products);
		isMergingRef.current = false;
	}, [setFromServer]);

	useEffect(() => {
		if (!isLoggedIn) return;
		const url = new URL(window.location.href);
		if (url.searchParams.get('auth') === 'google') {
			(async () => {
				await mergeLocalIntoServer();
				url.searchParams.delete('auth');
				window.history.replaceState(
					{},
					'',
					url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
				);
			})();
		}
	}, [isLoggedIn, mergeLocalIntoServer]);

	useEffect(() => {
		const wasLoggedIn = prevLoggedInRef.current;
		const nowLoggedIn = isLoggedIn;

		const syncOnLogin = async () => {
			const url = new URL(window.location.href);
			const isGoogle = url.searchParams.get('auth') === 'google';

			if (!isGoogle) {
				const local = loadGuestWishlist();
				if (local.length > 0) {
					isMergingRef.current = true;
					setFromServer(local);
					await mergeWishListData(local.map(({ id }) => ({ id })));
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					isMergingRef.current = false;
				}
			}

			if (!isMergingRef.current) {
				const fresh = await fetchWishDataFromApi();
				if (fresh?.products) setFromServer(fresh.products);
			}
		};

		const onLogout = () => {
			setFromServer(loadGuestWishlist());
		};

		if (!wasLoggedIn && nowLoggedIn) {
			syncOnLogin();
		} else if (wasLoggedIn && !nowLoggedIn) {
			onLogout();
		}

		prevLoggedInRef.current = nowLoggedIn;
	}, [isLoggedIn, setFromServer]);

	const handleWishAdd = async (product: SubcategoryProduct): Promise<{ success: boolean }> => {
		if (!product) return { success: false };

		if (isLoggedIn) {
			setItems((prev) => [...prev, product]);
			setIds((prev) => [...prev, product.id]);

			const res = await addToWishList(product.id);

			if (!res.success) {
				setItems((prev) => prev.filter((p) => p.id !== product.id));
				setIds((prev) => prev.filter((id) => id !== product.id));
				return { success: false };
			}
			return { success: true };
		} else {
			setItems((prev) => {
				const updated = [...prev, product];
				saveGuestWishlist(updated);
				return updated;
			});
			setIds((prev) => [...prev, product.id]);
			return { success: true };
		}
	};

	const handleWishRemove = async (productId: string) => {
		if (isLoggedIn) {
			const prevItems = items;
			const prevIds = ids;

			setItems((prev) => prev.filter((p) => p.id !== productId));
			setIds((prev) => prev.filter((id) => id !== productId));

			const res = await removeFromWishList(productId);
			if (!res.success) {
				setItems(prevItems);
				setIds(prevIds);
				return { success: false };
			}
			return { success: true };
		} else {
			setItems((prev) => {
				const updated = prev.filter((p) => p.id !== productId);
				saveGuestWishlist(updated);
				return updated;
			});
			setIds((prev) => prev.filter((id) => id !== productId));
			return { success: true };
		}
	};

	const handleClear = async () => {
		if (isLoggedIn) {
			const prevItems = items;
			const prevIds = ids;

			setItems([]);
			setIds([]);

			const res = await clearWishlist();
			if (!res.success) {
				setItems(prevItems);
				setIds(prevIds);
				return { success: false };
			}
			return { success: true };
		} else {
			setItems([]);
			setIds([]);
			saveGuestWishlist([]);
			return { success: true };
		}
	};

	return (
		<WishListContext.Provider value={{ items, ids, handleWishAdd, handleWishRemove, handleClear }}>
			{children}
		</WishListContext.Provider>
	);
}

export function useWishList(): WishListContextType {
	const ctx = useContext(WishListContext);
	if (!ctx) throw new Error('useWishList must be used within WishListProvider');
	return ctx;
}
