import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';
import { archiveProductAndZeroStock } from './product-unavailable-utils.mts';

type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

const makeUniqueCopySlug = async (baseSlug: string) => {
	const normalized = baseSlug.trim();
	const base = normalized === '' ? 'product' : normalized;
	const initial = `${base}-copy`;
	let candidate = initial;
	let counter = 2;
	while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
		candidate = `${initial}-${counter}`;
		counter += 1;
	}
	return candidate;
};

const replaceSlugInFullSlug = (fullSlug: string, nextSlug: string) => {
	const idx = fullSlug.lastIndexOf('/');
	if (idx === -1) return nextSlug;
	return `${fullSlug.slice(0, idx)}/${nextSlug}`;
};

export const publishProduct: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	const productId = record.param('id') as string;
	const currentStatus = record.param('status') as ProductStatus | undefined;
	if (currentStatus === 'ACTIVE') {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-already-active', type: 'info' },
		};
	}
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: {
			id: true,
			imageUrl: true,
			productImages: {
				select: { url: true, sortOrder: true, createdAt: true },
				orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
				take: 1,
			},
		},
	});
	if (!product) {
		return { record: record.toJSON(currentAdmin), notice: { message: 'product-not-found', type: 'error' } };
	}
	const primaryImageUrl = product.productImages[0]?.url ?? product.imageUrl ?? null;
	if (!primaryImageUrl) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-publish-image-required', type: 'error' },
		};
	}
	await prisma.product.update({
		where: { id: productId },
		data: { status: 'ACTIVE', imageUrl: primaryImageUrl },
	});
	const updated = await resource.findOne(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'product-published', type: 'success' },
	};
};

export const archiveProduct: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	const productId = record.param('id') as string;
	const currentStatus = record.param('status') as ProductStatus | undefined;
	await archiveProductAndZeroStock(productId);
	const updated = await resource.findOne(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: {
			message: currentStatus === 'ARCHIVED' ? 'product-already-archived' : 'product-archived',
			type: currentStatus === 'ARCHIVED' ? 'info' : 'success',
		},
	};
};

export const duplicateProduct: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, resource, currentAdmin, h } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	const resourceId = typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;
	const productId = record.param('id') as string;

	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: {
			id: true,
			name: true,
			description: true,
			metaTitle: true,
			metaDescription: true,
			canonicalUrl: true,
			openGraphImage: true,
			slug: true,
			fullSlug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			productCode: true,
			stock: true,
			inStock: true,
			brandId: true,
			categoryId: true,
			categoryName: true,
			subcategoryName: true,
			tags: true,
			attributes: { select: { attributeId: true, value: true } },
		},
	});

	if (!product) {
		return { record: record.toJSON(currentAdmin), notice: { message: 'product-not-found', type: 'error' } };
	}

	const nextSlug = await makeUniqueCopySlug(product.slug);
	const nextFullSlug = replaceSlugInFullSlug(product.fullSlug, nextSlug);

	try {
		const created = await prisma.product.create({
			data: {
				name: `${product.name} (Copy)`,
				description: product.description,
				metaTitle: product.metaTitle,
				metaDescription: product.metaDescription,
				canonicalUrl: product.canonicalUrl,
				openGraphImage: product.openGraphImage,
				slug: nextSlug,
				fullSlug: nextFullSlug,
				imageUrl: product.imageUrl,
				basePrice: product.basePrice,
				discountPrice: product.discountPrice,
				productCode: product.productCode,
				stock: product.stock,
				inStock: product.inStock,
				brandId: product.brandId,
				categoryId: product.categoryId,
				categoryName: product.categoryName,
				subcategoryName: product.subcategoryName,
				tags: product.tags,
				status: 'DRAFT',
				attributes: {
					create: product.attributes.map((attr) => ({
						attributeId: attr.attributeId,
						value: attr.value,
					})),
				},
			},
		});

		const createdRecord = await resource.findOne(created.id);
		const redirectUrl = h.recordActionUrl({ resourceId, recordId: created.id, actionName: 'show' });
		return {
			record: createdRecord ? createdRecord.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'product-duplicated', type: 'success' },
			redirectUrl,
		};
	} catch {
		return { record: record.toJSON(currentAdmin), notice: { message: 'product-duplicate-failed', type: 'error' } };
	}
};
