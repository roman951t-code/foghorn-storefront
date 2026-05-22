import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jsonNoStore } from '@/lib/response';
import type { Review } from '@/types/product';

const MAX_RECENTLY_VIEWED = 32;
const ParamsSchema = z.object({
	productId: z.string().min(1).max(128),
});

type RouteContext = {
	params: Promise<{ productId: string }>;
};

export async function POST(_: Request, context: RouteContext) {
	const parsedParams = ParamsSchema.safeParse(await context.params);
	if (!parsedParams.success) {
		return jsonNoStore({ success: false, ownReview: null }, { status: 400 });
	}

	try {
		const session = await auth.api.getSession({ headers: await headers() });
		const userId = session?.user?.id;
		if (!userId) {
			return jsonNoStore({ success: true, ownReview: null }, { status: 200 });
		}

		const { productId } = parsedParams.data;
		const ownReviewPromise = prisma.review.findUnique({
			where: { userId_productId: { userId, productId } },
			select: {
				id: true,
				rating: true,
				comment: true,
				advantages: true,
				disadvantages: true,
				createdAt: true,
				user: { select: { name: true, lastName: true } },
			},
		});

		const trackViewPromise = prisma.$transaction(async (tx) => {
			await tx.recentlyViewed.upsert({
				where: { userId_productId: { userId, productId } },
				create: { userId, productId },
				update: { updatedAt: new Date() },
			});

			const extraEntries = await tx.recentlyViewed.findMany({
				where: { userId },
				orderBy: { updatedAt: 'desc' },
				skip: MAX_RECENTLY_VIEWED,
				select: { id: true },
			});

			if (extraEntries.length) {
				await tx.recentlyViewed.deleteMany({
					where: { id: { in: extraEntries.map((entry) => entry.id) } },
				});
			}
		});

		const [ownReview] = await Promise.all([ownReviewPromise, trackViewPromise]);
		const responseReview: Review | null = ownReview
			? {
					id: ownReview.id,
					rating: ownReview.rating,
					comment: ownReview.comment,
					advantages: ownReview.advantages,
					disadvantages: ownReview.disadvantages,
					createdAt: ownReview.createdAt,
					isMine: true,
					user: {
						name: ownReview.user.name,
						lastName: ownReview.user.lastName,
					},
				}
			: null;

		return jsonNoStore({ success: true, ownReview: responseReview }, { status: 200 });
	} catch {
		return jsonNoStore({ success: false, ownReview: null }, { status: 500 });
	}
}
