import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';
import { syncProductReviewAggregates } from '../lib/review-aggregates.mts';
import { revalidateStorefrontCacheTags } from './revalidate-cache-tags.mts';

const PRODUCT_LIST_CACHE_TAG = 'products';
const PRODUCT_DETAIL_CACHE_TAG = 'product-by-slug';
const productCacheTagById = (productId: string) => `product:${productId}`;

const normalizeEmail = (value: unknown) =>
	typeof value === 'string' ? value.trim().toLowerCase() : '';

export const deleteUser: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin, h } = context;
	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();

	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	// AdminJS immediate custom actions are commonly executed via GET.
	// Accept GET/POST/DELETE to keep the action functional across UI entry points.
	if (method !== 'get' && method !== 'post' && method !== 'delete') {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'user-delete-method-not-allowed', type: 'error' },
		};
	}

	const userId = record.param('id') as string;
	const recordEmail = normalizeEmail(record.param('email'));
	const currentAdminEmail = normalizeEmail((currentAdmin as { email?: string } | undefined)?.email);

	if (recordEmail && currentAdminEmail && recordEmail === currentAdminEmail) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'user-delete-self-blocked', type: 'error' },
		};
	}

	const resourceId = typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;

	try {
		let affectedReviewProductIds: string[] = [];

		await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, phoneNumber: true },
			});

			if (!user) {
				throw new Error('user-not-found');
			}

			const reviewProductIds = await tx.review.findMany({
				where: { userId },
				select: { productId: true },
				distinct: ['productId'],
			});
			affectedReviewProductIds = reviewProductIds.map((review) => review.productId);

			const [orderIds, cartIds] = await Promise.all([
				tx.order.findMany({ where: { userId }, select: { id: true } }),
				tx.cart.findMany({ where: { userId }, select: { id: true } }),
			]);

			if (orderIds.length > 0) {
				await tx.orderItem.deleteMany({
					where: { orderId: { in: orderIds.map((order) => order.id) } },
				});
			}

			if (cartIds.length > 0) {
				await tx.cartItem.deleteMany({
					where: { cartId: { in: cartIds.map((cart) => cart.id) } },
				});
			}

			await tx.cart.deleteMany({ where: { userId } });
			await tx.emailVerificationCode.deleteMany({ where: { userId } });

			if (user.email) {
				await Promise.all([
					tx.emailRegistrationCode.deleteMany({ where: { email: user.email } }),
					tx.newsletterSubscription.deleteMany({ where: { email: user.email } }),
				]);
			}

			if (user.phoneNumber) {
				await tx.verification.deleteMany({ where: { identifier: user.phoneNumber } });
			}

			await Promise.all([
				tx.session.deleteMany({ where: { userId } }),
				tx.account.deleteMany({ where: { userId } }),
			]);

			await tx.user.delete({ where: { id: userId } });

			if (affectedReviewProductIds.length > 0) {
				await syncProductReviewAggregates(tx, affectedReviewProductIds);
			}
		});

		if (affectedReviewProductIds.length > 0) {
			await revalidateStorefrontCacheTags([
				PRODUCT_LIST_CACHE_TAG,
				PRODUCT_DETAIL_CACHE_TAG,
				...affectedReviewProductIds.map(productCacheTagById),
			]);
		}

		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'user-deleted', type: 'success' },
			redirectUrl: h.resourceUrl({ resourceId }),
		};
	} catch (error) {
		const message = error instanceof Error && error.message === 'user-not-found' ? 'user-not-found' : 'user-delete-failed';
		return {
			record: record.toJSON(currentAdmin),
			notice: { message, type: 'error' },
		};
	}
};
