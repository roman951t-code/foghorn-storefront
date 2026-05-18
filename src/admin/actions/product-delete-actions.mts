import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';
import { archiveProductAndZeroStock } from './product-unavailable-utils.mts';

const getMethod = (req: unknown) => String((req as { method?: unknown }).method ?? 'get').toLowerCase();

export const deleteProduct: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin, h } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	if (getMethod(req) !== 'post' && getMethod(req) !== 'delete') {
		return {
			record: record.toJSON(currentAdmin),
		};
	}

	const productId = record.param('id') as string;
	const resourceId = typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;

	const [orderItemsCount, wishlistCount, reviewsCount, cartItemsCount, recentlyViewedCount, attributesCount] =
		await Promise.all([
			prisma.orderItem.count({ where: { productId } }),
			prisma.wishlist.count({ where: { productId } }),
			prisma.review.count({ where: { productId } }),
			prisma.cartItem.count({ where: { productId } }),
			prisma.recentlyViewed.count({ where: { productId } }),
			prisma.productAttributeValue.count({ where: { productId } }),
		]);

	const totalRelations =
		orderItemsCount + wishlistCount + reviewsCount + cartItemsCount + recentlyViewedCount + attributesCount;

	if (totalRelations > 0) {
		try {
			await archiveProductAndZeroStock(productId);
		} catch {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'product-delete-failed', type: 'error' },
			};
		}

		const updated = await resource.findOne(productId);
		const redirectUrl = h.recordActionUrl({ resourceId, recordId: productId, actionName: 'show' });
		return {
			record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'product-archived-instead-of-delete', type: 'success' },
			redirectUrl,
		};
	}

	try {
		await prisma.product.delete({ where: { id: productId } });
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-deleted', type: 'success' },
			redirectUrl: h.resourceUrl({ resourceId }),
		};
	} catch {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-delete-failed', type: 'error' },
		};
	}
};
