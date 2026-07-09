'use client';

import { createBoundedStore } from './createBoundedStore';
import { addToCart } from '@/actions/cart/addToCart';
import { clearCart } from '@/actions/cart/clearCart';
import { hydrateGuestCartItems } from '@/actions/cart/hydrateGuestCartItems';
import { mergeCartData } from '@/actions/cart/mergeCartData';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import { updateCartItemQuantity } from '@/actions/cart/updateCartItemQuantity';
import type { CartData, CartProduct } from '@/types/cart';
import type { Product, SubcategoryProduct } from '@/types/product';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';
import { MAX_ITEM_QUANTITY } from '@/constants/cart';

const LOCAL_STORAGE_KEY = 'guest_cart';

type GuestCartStorageItem = {
	productId: string;
	variantId: string | null;
	quantity: number;
};

const guestLineId = (productId: string, variantId: string | null) =>
	`${productId}:${variantId ?? ''}`;

function saveGuestCart(items: CartProduct[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toGuestCartStorage(items)));
	}
}

function toGuestCartStorage(items: CartProduct[]): GuestCartStorageItem[] {
	const merged = new Map<string, GuestCartStorageItem>();
	for (const item of items) {
		const productId = typeof item.productId === 'string' ? item.productId.trim() : '';
		if (!productId) continue;
		const variantId =
			typeof item.variantId === 'string' && item.variantId.trim() ? item.variantId.trim() : null;
		const quantity = Math.max(
			1,
			Math.min(MAX_ITEM_QUANTITY, Math.floor(Number(item.quantity) || 1)),
		);
		const key = guestLineId(productId, variantId);
		const existing = merged.get(key);
		merged.set(key, {
			productId,
			variantId,
			quantity: existing ? Math.min(MAX_ITEM_QUANTITY, existing.quantity + quantity) : quantity,
		});
	}
	return Array.from(merged.values());
}

function loadGuestCart(): GuestCartStorageItem[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!stored) return [];
	try {
		const parsed = JSON.parse(stored) as Partial<CartProduct & GuestCartStorageItem>[];
		if (!Array.isArray(parsed)) return [];
		return toGuestCartStorage(
			parsed.map((item) => ({
				lineId: guestLineId(String(item.productId ?? ''), item.variantId ?? null),
				productId: String(item.productId ?? ''),
				variantId: item.variantId ?? null,
				quantity: Number(item.quantity ?? 1),
				basePrice: 0,
				discountPrice: null,
				name: '',
				imageUrl: null,
				fullSlug: '',
			})),
		);
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

const normalizeStockCap = (stock: number | null | undefined): number | null => {
	if (typeof stock !== 'number' || !Number.isFinite(stock)) return null;
	return Math.max(0, Math.floor(stock));
};

const resolveQuantityCap = (stockCap: number | null) => {
	if (stockCap == null) return MAX_ITEM_QUANTITY;
	return Math.max(1, Math.min(MAX_ITEM_QUANTITY, stockCap));
};

type CartStore = {
	cartData: CartData;
	productIds: string[];
	isLoggedIn: boolean;
	isHydrated: boolean;
	isHydrating: boolean;
	setIsLoggedIn: (loggedIn: boolean) => void;
	setCartData: (data: CartData) => void;
	setCartItems: (items: CartProduct[]) => void;
	setProductIds: (ids: string[]) => void;
	hydrateGuestCart: () => Promise<void>;
	setInitialData: (data: CartData, ids: string[]) => void;
	mergeGuestIntoServer: () => Promise<void>;
	handleAddItem: (
		product: SubcategoryProduct | Product,
		opts?: { variantId?: string | null },
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
	isHydrated: false,
	isHydrating: false,
	setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
	setCartData: (data) =>
		set({ cartData: data, productIds: uniqueProductIds(data.items), isHydrated: true }),
	setCartItems: (items) =>
		set({
			cartData: { ...get().cartData, items },
			productIds: uniqueProductIds(items),
			isHydrated: true,
		}),
	setProductIds: (ids) => set({ productIds: ids }),
	hydrateGuestCart: async () => {
		if (get().isHydrating) return;

		set({ isHydrating: true });
		const guest = loadGuestCart();
		if (guest.length === 0) {
			set({
				cartData: { ...get().cartData, items: [] },
				productIds: [],
				isHydrated: true,
				isHydrating: false,
			});
			return;
		}
		try {
			const hydrated = await hydrateGuestCartItems(guest);
			set({
				cartData: { ...get().cartData, items: hydrated },
				productIds: uniqueProductIds(hydrated),
				isHydrated: true,
				isHydrating: false,
			});
			saveGuestCart(hydrated);
		} catch {
			set({
				cartData: { ...get().cartData, items: [] },
				productIds: [],
				isHydrated: true,
				isHydrating: false,
			});
		}
	},
	setInitialData: (data, ids) => {
		const productIds = ids?.length ? ids : uniqueProductIds(data.items);
		set({ cartData: data, productIds, isHydrated: true });
	},
	mergeGuestIntoServer: async () => {
		const local = loadGuestCart();
		if (local.length === 0) return;

		try {
			const merged = await mergeCartData(
				local.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
			);
			if (!merged?.success) return;

			localStorage.removeItem(LOCAL_STORAGE_KEY);

			const fresh = await fetchCartFromApi();
			if (fresh?.success) {
				set({
					cartData: { items: fresh.items },
					productIds: uniqueProductIds(fresh.items),
					isHydrated: true,
				});
			}
		} catch {
			// Keep local cache when merge fails unexpectedly.
		}
	},
	handleAddItem: async (product, opts) => {
		if (!product) return { success: false };

		const productId = product.id;
		const chosenVariantId =
			opts?.variantId ??
			('defaultVariant' in product ? (product.defaultVariant?.id ?? null) : null);

		const selectedVariant =
			('variants' in product && Array.isArray(product.variants) && chosenVariantId
				? product.variants.find((v) => v.id === chosenVariantId)
				: null) ?? null;

		const fallbackVariant =
			'variants' in product && Array.isArray(product.variants)
				? (product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null)
				: null;

		const effectiveVariantId = chosenVariantId ?? fallbackVariant?.id ?? null;

		const defaultVariant = 'defaultVariant' in product ? (product.defaultVariant ?? null) : null;

		const unitBasePrice = (() => {
			if (defaultVariant?.id && defaultVariant.id === effectiveVariantId)
				return defaultVariant.price;
			if (selectedVariant?.id && selectedVariant.id === effectiveVariantId)
				return selectedVariant.price;
			if (fallbackVariant?.id && fallbackVariant.id === effectiveVariantId)
				return fallbackVariant.price;
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
						?.map((a: any) => {
							const name = String(a.name ?? '').trim();
							const valueWithUnit = [a.value, a.unit].filter(Boolean).join(' ').trim();
							if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
							return name || valueWithUnit;
						})
						.join(' / ')
				: null) ??
			(fallbackVariant?.id === effectiveVariantId
				? fallbackVariant.attributes
						?.map((a: any) => {
							const name = String(a.name ?? '').trim();
							const valueWithUnit = [a.value, a.unit].filter(Boolean).join(' ').trim();
							if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
							return name || valueWithUnit;
						})
						.join(' / ')
				: null) ??
			null;

		const unitDiscountPrice = (() => {
			if (defaultVariant?.id === effectiveVariantId) return defaultVariant.discountPrice ?? null;
			if (selectedVariant?.id === effectiveVariantId) {
				return (selectedVariant as { discountPrice?: number | null }).discountPrice ?? null;
			}
			if (fallbackVariant?.id === effectiveVariantId) {
				return (fallbackVariant as { discountPrice?: number | null }).discountPrice ?? null;
			}
			return product.discountPrice ?? null;
		})();

		const availableStock = (() => {
			if (defaultVariant?.id === effectiveVariantId && typeof defaultVariant.stock === 'number') {
				return defaultVariant.stock;
			}
			if (selectedVariant?.id === effectiveVariantId && typeof selectedVariant.stock === 'number') {
				return selectedVariant.stock;
			}
			if (fallbackVariant?.id === effectiveVariantId && typeof fallbackVariant.stock === 'number') {
				return fallbackVariant.stock;
			}
			return null;
		})();
		const stockCap = normalizeStockCap(availableStock);
		const existingLine = get().cartData.items.find(
			(i) => i.productId === productId && i.variantId === effectiveVariantId,
		);
		const currentQty = existingLine?.quantity ?? 0;
		if (stockCap != null && currentQty >= stockCap) {
			return { success: false };
		}

		const cartProduct: CartProduct = {
			lineId: guestLineId(productId, effectiveVariantId),
			productId,
			variantId: effectiveVariantId,
			availableStock: stockCap,
			sku: chosenSku,
			variantLabel: chosenLabel,
			basePrice: unitBasePrice,
			discountPrice: unitDiscountPrice,
			imageUrl: resolveProductPrimaryImageFromGallery(
				product.imageUrl,
				'images' in product && Array.isArray(product.images) ? product.images : undefined,
			),
			name: product.name!,
			quantity: 1,
			fullSlug: product.fullSlug!,
		};

		if (get().isLoggedIn) {
			const prevItems = get().cartData.items;
			const prevIds = get().productIds;

			set((state) => {
				const existing = state.cartData.items.find(
					(i) => i.productId === cartProduct.productId && i.variantId === cartProduct.variantId,
				);
				const items = existing
					? state.cartData.items.map((i) =>
							i.lineId === existing.lineId
								? {
										...i,
										availableStock: stockCap ?? i.availableStock ?? null,
										quantity: Math.min(resolveQuantityCap(stockCap), i.quantity + 1),
									}
								: i,
						)
					: [...state.cartData.items, cartProduct];

				return { cartData: { ...state.cartData, items }, productIds: uniqueProductIds(items) };
			});

			const res = await addToCart({ productId, variantId: effectiveVariantId });

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems }, productIds: prevIds });
				return { success: false };
			}

			// Patch in the server's real cartItem id (and authoritative quantity)
			// for this line instead of refetching the whole cart — the optimistic
			// lineId above is a client-side placeholder that later remove/update-
			// quantity calls can't look up on the server.
			const serverItem = res.items?.find(
				(i) => i.productId === productId && i.variantId === effectiveVariantId,
			);
			if (serverItem) {
				set((state) => ({
					cartData: {
						...state.cartData,
						items: state.cartData.items.map((i) =>
							i.productId === productId && i.variantId === effectiveVariantId
								? { ...i, lineId: serverItem.id, quantity: serverItem.quantity }
								: i,
						),
					},
				}));
			}

			return { success: true };
		} else {
			set((state) => {
				const existing = state.cartData.items.find(
					(i) => i.productId === cartProduct.productId && i.variantId === cartProduct.variantId,
				);
				const updated = existing
					? state.cartData.items.map((i) =>
							i.lineId === existing.lineId
								? {
										...i,
										availableStock: stockCap ?? i.availableStock ?? null,
										quantity: Math.min(resolveQuantityCap(stockCap), i.quantity + 1),
									}
								: i,
						)
					: [...state.cartData.items, cartProduct];
				saveGuestCart(updated);
				return {
					cartData: { ...state.cartData, items: updated },
					productIds: uniqueProductIds(updated),
				};
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
				return {
					cartData: { ...state.cartData, items: updated },
					productIds: uniqueProductIds(updated),
				};
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
			return {
				cartData: { ...state.cartData, items: updated },
				productIds: uniqueProductIds(updated),
			};
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
		const prevItems = get().cartData.items;
		const lineItem = prevItems.find((item) => item.lineId === lineId);
		if (!lineItem) return { success: false };

		const stockCap = normalizeStockCap(lineItem.availableStock);
		const quantityCap = resolveQuantityCap(stockCap);
		const optimisticQty = Math.min(quantityCap, Math.max(1, Math.floor(Number(quantity))));

		if (get().isLoggedIn) {
			set((state) => ({
				cartData: {
					...state.cartData,
					items: state.cartData.items.map((item) =>
						item.lineId === lineId ? { ...item, quantity: optimisticQty } : item,
					),
				},
			}));

			const res = await updateCartItemQuantity({
				cartItemId: lineId,
				quantity: optimisticQty,
			});

			if (!res.success || res.guest) {
				set({ cartData: { ...get().cartData, items: prevItems } });
				return { success: false };
			}

			const appliedQty =
				'quantity' in res && typeof res.quantity === 'number' && Number.isFinite(res.quantity)
					? Math.min(quantityCap, Math.max(1, Math.floor(res.quantity)))
					: optimisticQty;

			if (appliedQty !== optimisticQty) {
				set((state) => ({
					cartData: {
						...state.cartData,
						items: state.cartData.items.map((item) =>
							item.lineId === lineId ? { ...item, quantity: appliedQty } : item,
						),
					},
				}));
			}
			return { success: true };
		}

		set((state) => {
			const updated = state.cartData.items.map((item) => {
				if (item.lineId !== lineId) return item;
				const currentStockCap = normalizeStockCap(item.availableStock);
				const currentQuantityCap = resolveQuantityCap(currentStockCap);
				return {
					...item,
					quantity: Math.min(currentQuantityCap, Math.max(1, Math.floor(Number(quantity)))),
				};
			});
			saveGuestCart(updated);
			return {
				cartData: { ...state.cartData, items: updated },
				productIds: uniqueProductIds(updated),
			};
		});
		return { success: true };
	},
}));
