'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import type { CartProduct } from '@/types/cart';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

const MAX_GUEST_CART_ITEMS = 100;
const MAX_ITEM_QUANTITY = 99;

type GuestCartItemInput = {
	productId: string;
	variantId?: string | null;
	quantity: number;
};

const guestLineId = (productId: string, variantId: string | null) =>
	`${productId}:${variantId ?? ''}`;

const normalizeQuantity = (value: unknown) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) return 1;
	return Math.max(1, Math.min(MAX_ITEM_QUANTITY, Math.floor(numeric)));
};

const normalizeItems = (items: GuestCartItemInput[]) => {
	const merged = new Map<string, GuestCartItemInput>();
	for (const item of items) {
		const productId = typeof item.productId === 'string' ? item.productId.trim() : '';
		if (!productId) continue;
		const variantId =
			typeof item.variantId === 'string' && item.variantId.trim() ? item.variantId.trim() : null;
		const key = guestLineId(productId, variantId);
		const existing = merged.get(key);
		const quantity = normalizeQuantity(item.quantity);
		merged.set(key, {
			productId,
			variantId,
			quantity: existing ? normalizeQuantity(existing.quantity + quantity) : quantity,
		});
		if (merged.size >= MAX_GUEST_CART_ITEMS) break;
	}
	return Array.from(merged.values());
};

export async function hydrateGuestCartItems(items: GuestCartItemInput[]): Promise<CartProduct[]> {
	const normalizedItems = normalizeItems(Array.isArray(items) ? items : []);
	if (normalizedItems.length === 0) return [];

	const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));
	const variantIds = Array.from(
		new Set(
			normalizedItems.map((item) => item.variantId).filter((id): id is string => Boolean(id)),
		),
	);

	const [products, variants] = await Promise.all([
		prisma.product.findMany({
			where: { id: { in: productIds }, AND: [getPublishedProductWhere()] },
			select: {
				id: true,
				name: true,
				fullSlug: true,
				imageUrl: true,
				stock: true,
				basePrice: true,
				discountPrice: true,
				discountStartAt: true,
				discountEndAt: true,
				productImages: {
					select: { url: true, sortOrder: true, createdAt: true },
					orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
					take: 1,
				},
			},
		}),
		variantIds.length
			? prisma.productVariant.findMany({
					where: { id: { in: variantIds } },
					select: {
						id: true,
						productId: true,
						sku: true,
						price: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						stock: true,
						attributes: {
							select: {
								attribute: { select: { name: true, unit: true } },
								value: true,
							},
							orderBy: { attribute: { name: 'asc' } },
						},
					},
				})
			: Promise.resolve([]),
	]);

	const productById = new Map(products.map((product) => [product.id, product]));
	const variantById = new Map(variants.map((variant) => [variant.id, variant]));
	const hydrated: CartProduct[] = [];

	for (const item of normalizedItems) {
		const product = productById.get(item.productId);
		if (!product) continue;
		const variant = item.variantId ? variantById.get(item.variantId) : null;
		if (item.variantId && variant?.productId !== product.id) continue;

		const productBasePrice = product.basePrice?.toNumber?.() ?? Number(product.basePrice ?? 0);
		const variantBasePrice = variant?.price?.toNumber?.() ?? productBasePrice;
		const discountPrice = variant
			? getEffectiveVariantDiscountPrice({
					variantBasePrice,
					variantDiscountPrice: variant.discountPrice?.toNumber?.() ?? null,
					variantDiscountStartAt: variant.discountStartAt ?? null,
					variantDiscountEndAt: variant.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: product.discountPrice?.toNumber?.() ?? null,
					productDiscountStartAt: product.discountStartAt ?? null,
					productDiscountEndAt: product.discountEndAt ?? null,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					product.discountPrice?.toNumber?.() ?? null,
					product.discountStartAt ?? null,
					product.discountEndAt ?? null,
				);
		const variantLabel = variant?.attributes?.length
			? variant.attributes
					.map((attributeValue) => {
						const name = attributeValue.attribute.name?.trim?.() ?? '';
						const valueWithUnit = [attributeValue.value, attributeValue.attribute.unit]
							.filter(Boolean)
							.join(' ')
							.trim();
						if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
						return name || valueWithUnit;
					})
					.join(' / ')
			: null;
		const stock = variant?.stock ?? product.stock ?? null;
		const stockCap =
			typeof stock === 'number' && Number.isFinite(stock) ? Math.max(0, stock) : null;
		const quantity =
			stockCap == null ? item.quantity : Math.min(Math.max(1, stockCap), item.quantity);

		hydrated.push({
			lineId: guestLineId(product.id, variant?.id ?? null),
			productId: product.id,
			variantId: variant?.id ?? null,
			availableStock: stockCap,
			sku: variant?.sku ?? null,
			variantLabel,
			basePrice: variantBasePrice,
			discountPrice,
			name: product.name,
			quantity,
			imageUrl: resolveProductPrimaryImageFromGallery(
				product.imageUrl,
				product.productImages.map((image) => image.url),
			),
			fullSlug: product.fullSlug,
		});
	}

	return hydrated;
}
