'use client';

import { createBoundedStore } from './createBoundedStore';
import { mergeWishListData } from '@/actions/wishlist/mergeWishListData';
import { addToWishList } from '@/actions/wishlist/addToWishList';
import { removeFromWishList } from '@/actions/wishlist/removeFromWishList';
import { clearWishlist } from '@/actions/wishlist/clearWishList';
import type { SubcategoryProduct } from '@/types/product';

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

type WishListStore = {
	items: SubcategoryProduct[];
	ids: string[];
	isLoggedIn: boolean;
	setIsLoggedIn: (loggedIn: boolean) => void;
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
	setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setItems: (items) => set({ items, ids: items.map((p) => p.id) }),
	setIds: (ids) => set({ ids }),
	setInitialData: (items, ids) => set({ items, ids: ids?.length ? ids : items.map((p) => p.id) }),
	hydrateGuestWishlist: () => {
		const guest = loadGuestWishlist();
		set({ items: guest, ids: guest.map((p) => p.id) });
	},
	mergeGuestWishlistIntoServer: async () => {
		const local = loadGuestWishlist();
		if (local.length === 0) return;

		set({ items: local, ids: local.map((p) => p.id) });

		await mergeWishListData(local.map(({ id }) => ({ id })));
		localStorage.removeItem(LOCAL_STORAGE_KEY);

		const fresh = await fetchWishDataFromApi();
		if (fresh?.products) set({ items: fresh.products, ids: fresh.products.map((p: SubcategoryProduct) => p.id) });
	},
	handleWishAdd: async (product) => {
		if (!product) return { success: false };

		if (get().isLoggedIn) {
			set((state) => ({ items: [...state.items, product], ids: [...state.ids, product.id] }));

			const res = await addToWishList(product.id);

			if (!res.success) {
				set((state) => ({
					items: state.items.filter((p) => p.id !== product.id),
					ids: state.ids.filter((id) => id !== product.id),
				}));
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = [...state.items, product];
				saveGuestWishlist(updated);
				return { items: updated, ids: [...state.ids, product.id] };
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
			}));

			const res = await removeFromWishList(productId);
			if (!res.success) {
				set({ items: prevItems, ids: prevIds });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = state.items.filter((p) => p.id !== productId);
				saveGuestWishlist(updated);
				return { items: updated, ids: state.ids.filter((id) => id !== productId) };
			});
			return { success: true };
		}
	},
	handleClear: async () => {
		if (get().isLoggedIn) {
			const prevItems = get().items;
			const prevIds = get().ids;

			set({ items: [], ids: [] });

			const res = await clearWishlist();
			if (!res.success) {
				set({ items: prevItems, ids: prevIds });
				return { success: false };
			}
			return { success: true };
		} else {
			set({ items: [], ids: [] });
			saveGuestWishlist([]);
			return { success: true };
		}
	},
}));
