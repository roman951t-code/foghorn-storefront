import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { jsonNoStore } from '@/lib/response';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
	noStore();

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
							},
						},
					},
				},
			},
		});

		const reshapedItems =
			cart?.items.map((item) => {
				const basePrice = item.product.basePrice?.toNumber?.() ?? 0;
				const discountPrice = item.product.discountPrice?.toNumber?.() ?? null;

				return {
					...item.product,
					quantity: item.quantity,
					basePrice,
					discountPrice,
				};
			}) ?? [];

		return jsonNoStore({ success: true, items: reshapedItems });
	} catch (error) {
		return jsonNoStore({ success: false, items: [] }, { status: 500 });
	}
}
