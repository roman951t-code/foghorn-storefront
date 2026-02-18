'use client';

import { createBoundedStore } from './createBoundedStore';
import { mergeWishListData } from '@/actions/wishlist/mergeWishListData';
import { addToWishList } from '@/actions/wishlist/addToWishList';
import { removeFromWishList } from '@/actions/wishlist/removeFromWishList';
import { clearWishlist } from '@/actions/wishlist/clearWishList';
import type { SubcategoryProduct } from '@/types/product';

const LOCAL_STORAGE_KEY = 'guest_wishlist';

function uniqueWishlistItems(items: SubcategoryProduct[]) {
	const seen = new Set<string>();
	const unique: SubcategoryProduct[] = [];
	for (const item of items) {
		const id = item?.id;
		if (!id || seen.has(id)) continue;
		seen.add(id);
		unique.push(item);
	}
	return unique;
}

function uniqueWishlistIds(ids: string[]) {
	return Array.from(new Set(ids.filter(Boolean)));
}

function saveGuestWishlist(items: SubcategoryProduct[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(uniqueWishlistItems(items)));
	}
}

function loadGuestWishlist(): SubcategoryProduct[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!stored) return [];
	try {
		const parsed = JSON.parse(stored) as (SubcategoryProduct | null)[];
		return uniqueWishlistItems(parsed.filter((p): p is SubcategoryProduct => p !== null));
	} catch {
		return [];
	}
}

async function fetchWishDataFromApi() {
	const res = await fetch('/api/products/wishlist', { cache: 'no-store' });
	if (!res.ok) return { success: false, items: [] };
	return res.json();
}

type WishListStore = {
	items: SubcategoryProduct[];
	ids: string[];
	isLoggedIn: boolean;
	isHydrated: boolean;
	setIsLoggedIn: (loggedIn: boolean) => void;
	setIsHydrated: (hydrated: boolean) => void;
	setItems: (items: SubcategoryProduct[]) => void;
	setIds: (ids: string[]) => void;
	setInitialData: (items: SubcategoryProduct[], ids: string[]) => void;
	hydrateGuestWishlist: () => void;
	mergeGuestWishlistIntoServer: () => Promise<void>;
	handleWishAdd: (product: SubcategoryProduct) => Promise<{ success: boolean }>;
	handleWishRemove: (productId: string) => Promise<{ success: boolean }>;
	handleClear: () => Promise<{ success: boolean }>;
};

export const useWishListStore = createBoundedStore<WishListStore>((set, get) => ({
	items: [],
	ids: [],
	isLoggedIn: false,
	isHydrated: false,
	setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setIsHydrated: (hydrated) => set({ isHydrated: hydrated }),
	setItems: (items) => {
		const nextItems = uniqueWishlistItems(items);
		set({ items: nextItems, ids: nextItems.map((p) => p.id), isHydrated: true });
	},
	setIds: (ids) => set({ ids: uniqueWishlistIds(ids), isHydrated: true }),
	setInitialData: (items, ids) => {
		const nextItems = uniqueWishlistItems(items);
		const nextIds = uniqueWishlistIds(ids?.length ? ids : nextItems.map((p) => p.id));
		set({ items: nextItems, ids: nextIds, isHydrated: true });
	},
	hydrateGuestWishlist: () => {
		const guest = loadGuestWishlist();
		set({ items: guest, ids: guest.map((p) => p.id), isHydrated: true });
	},
	mergeGuestWishlistIntoServer: async () => {
		const local = loadGuestWishlist();
		if (local.length === 0) return;

		set({ items: local, ids: local.map((p) => p.id), isHydrated: true });

		try {
			const merged = await mergeWishListData(local.map(({ id }) => ({ id })));
			if (!merged?.success) return;

			localStorage.removeItem(LOCAL_STORAGE_KEY);

			const fresh = await fetchWishDataFromApi();
			if (fresh?.success && Array.isArray(fresh.items)) {
				const nextItems = uniqueWishlistItems(fresh.items as SubcategoryProduct[]);
				set({
					items: nextItems,
					ids: nextItems.map((p) => p.id),
					isHydrated: true,
				});
			}
		} catch {
			// Keep local cache when merge fails unexpectedly.
		}
	},
	handleWishAdd: async (product) => {
		if (!product) return { success: false };

		if (get().isLoggedIn) {
			const prevItems = get().items;
			const prevIds = get().ids;

			set((state) => {
				if (state.ids.includes(product.id)) {
					return { items: state.items, ids: state.ids, isHydrated: true };
				}
				return {
					items: [...state.items, product],
					ids: [...state.ids, product.id],
					isHydrated: true,
				};
			});

			const res = await addToWishList(product.id);

			if (!res.success) {
				set({ items: prevItems, ids: prevIds, isHydrated: true });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				if (state.ids.includes(product.id)) {
					return { items: state.items, ids: state.ids, isHydrated: true };
				}
				const updated = [...state.items, product];
				saveGuestWishlist(updated);
				return { items: updated, ids: [...state.ids, product.id], isHydrated: true };
			});
			return { success: true };
		}
	},
	handleWishRemove: async (productId) => {
		if (get().isLoggedIn) {
			const prevItems = get().items;
			const prevIds = get().ids;

			set((state) => ({
				items: state.items.filter((p) => p.id !== productId),
				ids: state.ids.filter((id) => id !== productId),
				isHydrated: true,
			}));

			const res = await removeFromWishList(productId);
			if (!res.success) {
				set({ items: prevItems, ids: prevIds, isHydrated: true });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = state.items.filter((p) => p.id !== productId);
				saveGuestWishlist(updated);
				return { items: updated, ids: state.ids.filter((id) => id !== productId), isHydrated: true };
			});
			return { success: true };
		}
	},
	handleClear: async () => {
		if (get().isLoggedIn) {
			const prevItems = get().items;
			const prevIds = get().ids;

			set({ items: [], ids: [], isHydrated: true });

			const res = await clearWishlist();
			if (!res.success) {
				set({ items: prevItems, ids: prevIds, isHydrated: true });
				return { success: false };
			}
			return { success: true };
		} else {
			set({ items: [], ids: [], isHydrated: true });
			saveGuestWishlist([]);
			return { success: true };
		}
	},
}));
