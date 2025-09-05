'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { addToCart } from '@/actions/cart/addToCart';
import { removeFromCart } from '@/actions/cart/removeFromCart';
import { updateCartItemQuantity } from '@/actions/cart/updateCartItemQuantity';
import { clearCart } from '@/actions/cart/clearCart';
import { CartContextType, CartProduct, CartProviderProps } from '@/types/cart';
import { SubcategoryProduct } from '@/types/product';
import { useSession } from './SessionProvider';
import { mergeCartData } from '@/actions/cart/mergeCartData';

export const CartContext = createContext<CartContextType | null>(null);

const LOCAL_STORAGE_KEY = 'guest_cart';

function saveGuestCart(items: CartProduct[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
	}
}
function loadGuestCart(): CartProduct[] {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				return [];
			}
		}
	}
	return [];
}

async function fetchCartFromApi() {
	const res = await fetch('/api/cart', { cache: 'no-store' });
	if (!res.ok) return { success: false, items: [] };
	return res.json();
}

export function CartProvider({ children, cartData, cartProductIds }: CartProviderProps) {
	const { session } = useSession();
	const isLoggedIn = !!session?.user;

	const [cartItemsState, setCartItemsState] = useState<CartProduct[]>(cartData.items ?? []);
	const [productIdsState, setProductIdsState] = useState<string[]>(
		cartProductIds?.success ? (cartProductIds.productIds ?? []) : []
	);

	const isMergingRef = useRef(false);
	const prevLoggedInRef = useRef<boolean>(isLoggedIn);
	const fetchSeqRef = useRef(0);

	const setFromServer = useCallback((items: CartProduct[]) => {
		setCartItemsState(items);
		setProductIdsState(items.map((i) => i.id));
	}, []);

	const mergeLocalIntoServerAndRefresh = useCallback(async () => {
		const local = loadGuestCart();
		if (local.length === 0) return;

		isMergingRef.current = true;
		setFromServer(local);

		await mergeCartData(local.map(({ id, quantity }) => ({ id, quantity })));

		localStorage.removeItem(LOCAL_STORAGE_KEY);

		const mySeq = ++fetchSeqRef.current;
		const fresh = await fetchCartFromApi();
		if (mySeq === fetchSeqRef.current && fresh.success) setFromServer(fresh.items);

		isMergingRef.current = false;
	}, [setFromServer]);

	useEffect(() => {
		if (!isLoggedIn) return;
		const url = new URL(window.location.href);
		const authType = url.searchParams.get('auth');
		if (authType === 'google') {
			(async () => {
				await mergeLocalIntoServerAndRefresh();
				url.searchParams.delete('auth');
				window.history.replaceState(
					{},
					'',
					url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
				);
			})();
		}
	}, [isLoggedIn, mergeLocalIntoServerAndRefresh]);

	useEffect(() => {
		if (!isLoggedIn) {
			const guestCart = loadGuestCart();
			setCartItemsState(guestCart);
			setProductIdsState(guestCart.map((item) => item.id));
		}
	}, [isLoggedIn]);

	useEffect(() => {
		const wasLoggedIn = prevLoggedInRef.current;
		const nowLoggedIn = isLoggedIn;

		const syncOnLogin = async () => {
			const url = new URL(window.location.href);
			const isGoogle = url.searchParams.get('auth') === 'google';

			if (!isGoogle) {
				const local = loadGuestCart();
				if (local.length > 0) {
					isMergingRef.current = true;
					setFromServer(local);
					await mergeCartData(local.map(({ id, quantity }) => ({ id, quantity })));
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					isMergingRef.current = false;
				}
			}

			if (!isMergingRef.current) {
				const mySeq = ++fetchSeqRef.current;
				const fresh = await fetchCartFromApi();
				if (mySeq === fetchSeqRef.current && fresh.success) setFromServer(fresh.items);
			}
		};

		const onLogout = () => {
			const guestCart = loadGuestCart();
			setFromServer(guestCart);
		};

		if (!wasLoggedIn && nowLoggedIn) {
			syncOnLogin();
		} else if (wasLoggedIn && !nowLoggedIn) {
			onLogout();
		}

		prevLoggedInRef.current = nowLoggedIn;
	}, [isLoggedIn, setFromServer]);

	const handleAddItem = async (product: SubcategoryProduct): Promise<{ success: boolean }> => {
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

		if (isLoggedIn) {
			setCartItemsState((prev) => [...prev, cartProduct]);
			setProductIdsState((prev) => [...prev, product.id]);

			const res = await addToCart(product.id);

			if (!res.success) {
				setCartItemsState((prev) => prev.filter((item) => item.id !== cartProduct.id));
				setProductIdsState((prev) => prev.filter((id) => id !== product.id));
				return { success: false };
			}
			return { success: true };
		} else {
			setCartItemsState((prev) => {
				const updated = [...prev, cartProduct];
				saveGuestCart(updated);
				return updated;
			});
			setProductIdsState((prev) => [...prev, product.id]);
			return { success: true };
		}
	};

	const handleRemoveItem = async (productId: string): Promise<{ success: boolean }> => {
		if (isLoggedIn) {
			const prevItems = cartItemsState;
			const prevIds = productIdsState;

			setCartItemsState((prev) => prev.filter((item) => item.id !== productId));
			setProductIdsState((prev) => prev.filter((id) => id !== productId));

			const res = await removeFromCart({ productId });

			if (!res.success || res.guest) {
				setCartItemsState(prevItems);
				setProductIdsState(prevIds);
				return { success: false };
			}
			return { success: true };
		} else {
			setCartItemsState((prev) => {
				const updated = prev.filter((item) => item.id !== productId);
				saveGuestCart(updated);
				return updated;
			});
			setProductIdsState((prev) => prev.filter((id) => id !== productId));
			return { success: true };
		}
	};

	const handleClearCart = async (): Promise<{ success: boolean }> => {
		if (isLoggedIn) {
			const prevItems = cartItemsState;
			const prevIds = productIdsState;

			setCartItemsState([]);
			setProductIdsState([]);

			const res = await clearCart();

			if (!res.success) {
				setCartItemsState(prevItems);
				setProductIdsState(prevIds);
				return { success: false };
			}
			return { success: true };
		} else {
			setCartItemsState([]);
			setProductIdsState([]);
			saveGuestCart([]);
			return { success: true };
		}
	};

	const handleUpdateQuantity = async (
		productId: string,
		quantity: number
	): Promise<{ success: boolean }> => {
		if (isLoggedIn) {
			const prevItems = cartItemsState;

			setCartItemsState((prev) =>
				prev.map((item) =>
					item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
				)
			);

			const res = await updateCartItemQuantity({ productId, quantity });

			if (!res.success || (res as any).guest) {
				setCartItemsState(prevItems);
				return { success: false };
			}
			return { success: true };
		} else {
			setCartItemsState((prev) => {
				const updated = prev.map((item) =>
					item.id === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity)) } : item
				);
				saveGuestCart(updated);
				return updated;
			});
			return { success: true };
		}
	};

	return (
		<CartContext.Provider
			value={{
				cartData: { ...cartData, items: cartItemsState },
				productIds: productIdsState,
				handleAddItem,
				handleRemoveItem,
				handleClearCart,
				handleUpdateQuantity,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const cartCtx = useContext(CartContext);
	if (!cartCtx) throw new Error('useCart must be used within a CartProvider');
	return cartCtx;
}
