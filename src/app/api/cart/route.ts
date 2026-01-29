import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { jsonNoStore } from '@/lib/response';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return jsonNoStore({ success: false, items: [] }, { status: 401 });
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
								basePrice: true,
								discountPrice: true,
								discountStartAt: true,
								discountEndAt: true,
							},
						},
						variant: {
							select: {
								id: true,
								sku: true,
								price: true,
								stock: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		});

		const reshapedItems =
			cart?.items.map((item) => {
				const productBasePrice = item.product.basePrice?.toNumber?.() ?? 0;
				const productDiscountPriceRaw = item.product.discountPrice?.toNumber?.() ?? null;
				const effectiveProductDiscountPrice = getEffectiveDiscountPrice(
					productBasePrice,
					productDiscountPriceRaw,
					item.product.discountStartAt ?? null,
					item.product.discountEndAt ?? null
				);
				const discountAmount =
					effectiveProductDiscountPrice != null
						? Math.max(0, productBasePrice - effectiveProductDiscountPrice)
						: 0;

				const variantBasePrice = item.variant?.price?.toNumber?.() ?? productBasePrice;
				const variantDiscountPrice =
					discountAmount > 0 ? Math.max(0, variantBasePrice - discountAmount) : null;

				const variantLabel =
					item.variant?.attributes?.length
						? item.variant.attributes
								.map((a) =>
									[a.attribute.name, a.value, a.attribute.unit].filter(Boolean).join(' ')
								)
								.join(' / ')
						: null;

				return {
					lineId: item.id,
					productId: item.product.id,
					variantId: item.variant?.id ?? item.variantId ?? null,
					sku: item.variant?.sku ?? null,
					variantLabel,
					quantity: item.quantity,
					basePrice: variantBasePrice,
					discountPrice: variantDiscountPrice,
					name: item.product.name,
					fullSlug: item.product.fullSlug,
					imageUrl: item.product.imageUrl,
				};
			}) ?? [];

		return jsonNoStore({ success: true, items: reshapedItems });
	} catch (error) {
		return jsonNoStore({ success: false, items: [] }, { status: 500 });
	}
}
