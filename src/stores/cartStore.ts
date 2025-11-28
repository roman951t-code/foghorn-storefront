'use client';

import { createBoundedStore } from './createBoundedStore';
import { addToCart } from '@/actions/cart/addToCart';
import { clearCart } from '@/actions/cart/clearCart';
import { mergeCartData } from '@/actions/cart/mergeCartData';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import { updateCartItemQuantity } from '@/actions/cart/updateCartItemQuantity';
import type { CartData, CartProduct } from '@/types/cart';
import type { SubcategoryProduct } from '@/types/product';

const LOCAL_STORAGE_KEY = 'guest_cart';

function saveGuestCart(items: CartProduct[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
	}
}

function loadGuestCart(): CartProduct[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored) as CartProduct[];
	} catch {
		return [];
	}
}

type CartApiResponse = { success: boolean; items: CartProduct[]; guest?: boolean };

async function fetchCartFromApi(): Promise<CartApiResponse> {
	const res = await fetch('/api/cart', { cache: 'no-store' });
	if (!res.ok) return { success: false, items: [] };
	return res.json();
}

type CartStore = {
	cartData: CartData;
	productIds: string[];
	isLoggedIn: boolean;
	setIsLoggedIn: (loggedIn: boolean) => void;
	setCartData: (data: CartData) => void;
	setCartItems: (items: CartProduct[]) => void;
	setProductIds: (ids: string[]) => void;
	hydrateGuestCart: () => void;
	setInitialData: (data: CartData, ids: string[]) => void;
	mergeGuestIntoServer: () => Promise<void>;
	handleAddItem: (product: SubcategoryProduct) => Promise<{ success: boolean }>;
	handleRemoveItem: (productId: string) => Promise<{ success: boolean }>;
	handleClearCart: () => Promise<{ success: boolean }>;
	handleUpdateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean }>;
};

export const useCartStore = createBoundedStore<CartStore>((set, get) => ({
	cartData: { items: [] },
	productIds: [],
	isLoggedIn: false,
	setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setCartData: (data) => set({ cartData: data, productIds: data.items.map((i) => i.id) }),
	setCartItems: (items) => set({ cartData: { ...get().cartData, items }, productIds: items.map((i) => i.id) }),
	setProductIds: (ids) => set({ productIds: ids }),
	hydrateGuestCart: () => {
		const guest = loadGuestCart();
		set({ cartData: { ...get().cartData, items: guest }, productIds: guest.map((i) => i.id) });
	},
	setInitialData: (data, ids) => {
		const productIds = ids?.length ? ids : data.items.map((i) => i.id);
		set({ cartData: data, productIds });
	},
	mergeGuestIntoServer: async () => {
		const local = loadGuestCart();
		if (local.length === 0) return;

		set({ cartData: { ...get().cartData, items: local }, productIds: local.map((i) => i.id) });

		await mergeCartData(local.map(({ id, quantity }) => ({ id, quantity })));
		localStorage.removeItem(LOCAL_STORAGE_KEY);

		const fresh = await fetchCartFromApi();
		if (fresh?.success) {
			set({ cartData: { items: fresh.items }, productIds: fresh.items.map((i: CartProduct) => i.id) });
		}
	},
	handleAddItem: async (product) => {
		if (!product) return { success: false };

		const cartProduct: CartProduct = {
			basePrice: product.basePrice!,
			discountPrice: product.discountPrice!,
			id: product.id,
			imageUrl: product.imageUrl!,
			name: product.name!,
			quantity: 1,
			fullSlug: product.fullSlug!,
		};

		if (get().isLoggedIn) {
			set((state) => ({
				cartData: { ...state.cartData, items: [...state.cartData.items, cartProduct] },
				productIds: [...state.productIds, product.id],
			}));

			const res = await addToCart(product.id);

			if (!res.success) {
				set((state) => ({
					cartData: {
						...state.cartData,
						items: state.cartData.items.filter((item) => item.id !== cartProduct.id),
					},
					productIds: state.productIds.filter((id) => id !== product.id),
				}));
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = [...state.cartData.items, cartProduct];
				saveGuestCart(updated);
				return { cartData: { ...state.cartData, items: updated }, productIds: [...state.productIds, product.id] };
			});
			return { success: true };
		}
	},
	handleRemoveItem: async (productId) => {
		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;
			const prevIds = get().productIds;

			set((state) => ({
				cartData: {
					...state.cartData,
					items: state.cartData.items.filter((item) => item.id !== productId),
				},
				productIds: state.productIds.filter((id) => id !== productId),
			}));

			const res = await removeFromCart({ productId });

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems }, productIds: prevIds });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = state.cartData.items.filter((item) => item.id !== productId);
				saveGuestCart(updated);
				return { cartData: { ...state.cartData, items: updated }, productIds: state.productIds.filter((id) => id !== productId) };
			});
			return { success: true };
		}
	},
	handleClearCart: async () => {
		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;
			const prevIds = get().productIds;

			set({ cartData: { ...get().cartData, items: [] }, productIds: [] });

			const res = await clearCart();

			if (!res.success) {
				set({ cartData: { ...get().cartData, items: prevItems }, productIds: prevIds });
				return { success: false };
			}
			return { success: true };
		} else {
			set({ cartData: { ...get().cartData, items: [] }, productIds: [] });
			saveGuestCart([]);
			return { success: true };
		}
	},
	handleUpdateQuantity: async (productId, quantity) => {
		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;

			set((state) => ({
				cartData: {
					...state.cartData,
					items: state.cartData.items.map((item) =>
						item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
					),
				},
			}));

			const res = await updateCartItemQuantity({ productId, quantity });

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems } });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = state.cartData.items.map((item) =>
					item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
				);
				saveGuestCart(updated);
				return { cartData: { ...state.cartData, items: updated }, productIds: state.productIds };
			});
			return { success: true };
		}
	},
}));
