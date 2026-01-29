'use client';

import { createBoundedStore } from './createBoundedStore';
import { addToCart } from '@/actions/cart/addToCart';
import { clearCart } from '@/actions/cart/clearCart';
import { mergeCartData } from '@/actions/cart/mergeCartData';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import { updateCartItemQuantity } from '@/actions/cart/updateCartItemQuantity';
import type { CartData, CartProduct } from '@/types/cart';
import type { Product, SubcategoryProduct } from '@/types/product';

const LOCAL_STORAGE_KEY = 'guest_cart';

const guestLineId = (productId: string, variantId: string | null) =>
	`${productId}:${variantId ?? ''}`;

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

function uniqueProductIds(items: CartProduct[]) {
	return Array.from(new Set(items.map((i) => i.productId)));
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
	handleAddItem: (
		product: SubcategoryProduct | Product,
		opts?: { variantId?: string | null }
	) => Promise<{ success: boolean }>;
	handleRemoveItem: (productId: string) => Promise<{ success: boolean }>;
	handleRemoveLine: (lineId: string) => Promise<{ success: boolean }>;
	handleClearCart: () => Promise<{ success: boolean }>;
	handleUpdateQuantity: (lineId: string, quantity: number) => Promise<{ success: boolean }>;
};

export const useCartStore = createBoundedStore<CartStore>((set, get) => ({
	cartData: { items: [] },
	productIds: [],
	isLoggedIn: false,
	setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setCartData: (data) => set({ cartData: data, productIds: uniqueProductIds(data.items) }),
	setCartItems: (items) => set({ cartData: { ...get().cartData, items }, productIds: uniqueProductIds(items) }),
	setProductIds: (ids) => set({ productIds: ids }),
	hydrateGuestCart: () => {
		const guest = loadGuestCart();
		set({ cartData: { ...get().cartData, items: guest }, productIds: uniqueProductIds(guest) });
	},
	setInitialData: (data, ids) => {
		const productIds = ids?.length ? ids : uniqueProductIds(data.items);
		set({ cartData: data, productIds });
	},
	mergeGuestIntoServer: async () => {
		const local = loadGuestCart();
		if (local.length === 0) return;

		set({ cartData: { ...get().cartData, items: local }, productIds: uniqueProductIds(local) });

		await mergeCartData(
			local.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity }))
		);
		localStorage.removeItem(LOCAL_STORAGE_KEY);

		const fresh = await fetchCartFromApi();
		if (fresh?.success) {
			set({ cartData: { items: fresh.items }, productIds: uniqueProductIds(fresh.items) });
		}
	},
	handleAddItem: async (product, opts) => {
		if (!product) return { success: false };

		const productId = product.id;
		const chosenVariantId =
			opts?.variantId ??
			('defaultVariant' in product ? product.defaultVariant?.id ?? null : null);

		const selectedVariant =
			('variants' in product && Array.isArray(product.variants) && chosenVariantId
				? product.variants.find((v) => v.id === chosenVariantId)
				: null) ?? null;

		const fallbackVariant =
			'variants' in product && Array.isArray(product.variants)
				? (product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null)
				: null;

		const effectiveVariantId =
			chosenVariantId ?? ('defaultVariant' in product ? product.defaultVariant?.id ?? null : null) ?? fallbackVariant?.id ?? null;

		const defaultVariant =
			'defaultVariant' in product ? product.defaultVariant ?? null : null;

		const unitBasePrice = (() => {
			if (defaultVariant?.id && defaultVariant.id === effectiveVariantId) return defaultVariant.price;
			if (selectedVariant?.id && selectedVariant.id === effectiveVariantId) return selectedVariant.price;
			if (fallbackVariant?.id && fallbackVariant.id === effectiveVariantId) return fallbackVariant.price;
			return product.basePrice ?? 0;
		})();

		const chosenSku =
			(defaultVariant?.id === effectiveVariantId ? defaultVariant?.sku : null) ??
			(selectedVariant?.id === effectiveVariantId ? selectedVariant?.sku : null) ??
			(fallbackVariant?.id === effectiveVariantId ? fallbackVariant?.sku : null) ??
			null;

		const chosenLabel =
			(defaultVariant?.id === effectiveVariantId ? defaultVariant?.label : null) ??
			(selectedVariant?.id === effectiveVariantId
				? selectedVariant.attributes
						?.map((a: any) => [a.name, a.value, a.unit].filter(Boolean).join(' '))
						.join(' / ')
				: null) ??
			(fallbackVariant?.id === effectiveVariantId
				? fallbackVariant.attributes
						?.map((a: any) => [a.name, a.value, a.unit].filter(Boolean).join(' '))
						.join(' / ')
				: null) ??
			null;

		const discountAmount =
			product.discountPrice != null && product.basePrice != null
				? Math.max(0, product.basePrice - product.discountPrice)
				: 0;
		const unitDiscountPrice =
			discountAmount > 0 ? Math.max(0, unitBasePrice - discountAmount) : null;

		const cartProduct: CartProduct = {
			lineId: guestLineId(productId, effectiveVariantId),
			productId,
			variantId: effectiveVariantId,
			sku: chosenSku,
			variantLabel: chosenLabel,
			basePrice: unitBasePrice,
			discountPrice: unitDiscountPrice,
			imageUrl: product.imageUrl!,
			name: product.name!,
			quantity: 1,
			fullSlug: product.fullSlug!,
		};

		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;
			const prevIds = get().productIds;

			set((state) => {
				const existing = state.cartData.items.find(
					(i) => i.productId === cartProduct.productId && i.variantId === cartProduct.variantId
				);
				const items = existing
					? state.cartData.items.map((i) =>
							i.lineId === existing.lineId ? { ...i, quantity: i.quantity + 1 } : i
						)
					: [...state.cartData.items, cartProduct];

				return { cartData: { ...state.cartData, items }, productIds: uniqueProductIds(items) };
			});

			const res = await addToCart({ productId, variantId: effectiveVariantId });

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems }, productIds: prevIds });
				return { success: false };
			}

			// If server created/updated a different cartItem.id, fetch fresh lines.
			const fresh = await fetchCartFromApi();
			if (fresh?.success) {
				set({ cartData: { items: fresh.items }, productIds: uniqueProductIds(fresh.items) });
			}

			return { success: true };
		} else {
			set((state) => {
				const existing = state.cartData.items.find(
					(i) => i.productId === cartProduct.productId && i.variantId === cartProduct.variantId
				);
				const updated = existing
					? state.cartData.items.map((i) =>
							i.lineId === existing.lineId ? { ...i, quantity: i.quantity + 1 } : i
						)
					: [...state.cartData.items, cartProduct];
				saveGuestCart(updated);
				return { cartData: { ...state.cartData, items: updated }, productIds: uniqueProductIds(updated) };
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
					items: state.cartData.items.filter((item) => item.productId !== productId),
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
				const updated = state.cartData.items.filter((item) => item.productId !== productId);
				saveGuestCart(updated);
				return {
					cartData: { ...state.cartData, items: updated },
					productIds: state.productIds.filter((id) => id !== productId),
				};
			});
			return { success: true };
		}
	},
	handleRemoveLine: async (lineId) => {
		if (!lineId) return { success: false };

		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;
			const prevIds = get().productIds;

			set((state) => {
				const updated = state.cartData.items.filter((item) => item.lineId !== lineId);
				return { cartData: { ...state.cartData, items: updated }, productIds: uniqueProductIds(updated) };
			});

			const res = await removeFromCart({ cartItemId: lineId });
			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems }, productIds: prevIds });
				return { success: false };
			}

			return { success: true };
		}

		set((state) => {
			const updated = state.cartData.items.filter((item) => item.lineId !== lineId);
			saveGuestCart(updated);
			return { cartData: { ...state.cartData, items: updated }, productIds: uniqueProductIds(updated) };
		});
		return { success: true };
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
	handleUpdateQuantity: async (lineId, quantity) => {
		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;

			set((state) => ({
				cartData: {
					...state.cartData,
					items: state.cartData.items.map((item) =>
						item.lineId === lineId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
					),
				},
			}));

			const res = await updateCartItemQuantity({ cartItemId: lineId, quantity });

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems } });
				return { success: false };
			}
			return { success: true };
		} else {
			set((state) => {
				const updated = state.cartData.items.map((item) =>
					item.lineId === lineId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
				);
				saveGuestCart(updated);
				return { cartData: { ...state.cartData, items: updated }, productIds: uniqueProductIds(updated) };
			});
			return { success: true };
		}
	},
}));
