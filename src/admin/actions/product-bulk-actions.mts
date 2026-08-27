import type { ActionHandler, BulkActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';
import { resolveInventoryAdminEmail, resolveInventoryReason } from './inventory-adjustment-actions.mts';
import { recalculateProductSortPrices } from '../lib/product-sort-price.mts';

type CategoryOption = { id: string; label: string };
type BrandOption = { id: string; label: string };
type LocalizedCategoryMeta = { name: string; slug: string };

const getRecordIds = (records: Array<{ param: (key: string) => unknown }>): string[] =>
	records.map((r) => r.param('id')).filter((id): id is string => typeof id === 'string' && id.length > 0);

const getMethod = (req: unknown) => String((req as { method?: unknown }).method ?? 'get').toLowerCase();
const normalizeSlugPart = (value: unknown) =>
	String(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/^\/+|\/+$/g, '');

const parseCsvTags = (value: unknown): string[] => {
	if (typeof value !== 'string') return [];
	return value
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)
		.map((t) => t.toLowerCase());
};

const roundToCentsString = (value: number) => (Math.round(value * 100) / 100).toFixed(2);

export const bulkSetCategory: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);

	const categories = await prisma.productCategory.findMany({
		where: { parentId: { not: null } },
		orderBy: [{ parent: { name: 'asc' } }, { name: 'asc' }],
		select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } },
	});

	const options: CategoryOption[] = categories.map((c) => ({
		id: c.id,
		label: `${c.parent?.name ?? '-'} / ${c.name}`,
	}));

	if (method === 'get') {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			payload: { options },
		};
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const categoryId = payload.categoryId;
	if (typeof categoryId !== 'string' || categoryId.trim() === '') {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-invalid', type: 'error' },
			payload: { options },
		};
	}

	const selected = categories.find((c) => c.id === categoryId) ?? null;
	if (!selected || !selected.parent) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-category-invalid', type: 'error' },
			payload: { options },
		};
	}

	const ids = getRecordIds(records);
	if (!ids.length) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'bulk-no-records', type: 'error' },
			payload: { options },
		};
	}

	const products = await prisma.product.findMany({
		where: { id: { in: ids } },
		select: { id: true, slug: true },
	});

	const categoryTranslations = await prisma.productCategoryTranslation.findMany({
		where: { categoryId: { in: [selected.id, selected.parent.id] } },
		select: { categoryId: true, locale: true, name: true, slug: true },
	});

	const parentByLocale = new Map<string, LocalizedCategoryMeta>();
	const subcategoryByLocale = new Map<string, LocalizedCategoryMeta>();
	for (const translation of categoryTranslations) {
		const meta: LocalizedCategoryMeta = {
			name: translation.name,
			slug:
				normalizeSlugPart(translation.slug) ||
				(translation.categoryId === selected.parent.id ? selected.parent.slug : selected.slug),
		};
		if (translation.categoryId === selected.parent.id) {
			parentByLocale.set(translation.locale, meta);
		} else if (translation.categoryId === selected.id) {
			subcategoryByLocale.set(translation.locale, meta);
		}
	}

	const productTranslations = await prisma.productTranslation.findMany({
		where: { productId: { in: ids } },
		select: { id: true, productId: true, locale: true, slug: true },
	});

	const productSlugById = new Map(products.map((product) => [product.id, normalizeSlugPart(product.slug)]));

	try {
		const productUpdates = products.map((product) => {
			const productSlug = normalizeSlugPart(product.slug);
			return prisma.product.update({
				where: { id: product.id },
				data: {
					categoryId: selected.id,
					categoryName: selected.parent!.name,
					subcategoryName: selected.name,
					fullSlug: `${selected.parent!.slug}/${selected.slug}/${productSlug}`,
				},
			});
		});

		const translationUpdates = productTranslations
			.map((translation) => {
				const productSlug = productSlugById.get(translation.productId);
				if (!productSlug) return null;

				const parentMeta = parentByLocale.get(translation.locale);
				const subcategoryMeta = subcategoryByLocale.get(translation.locale);

				const localizedParentName = parentMeta?.name ?? selected.parent!.name;
				const localizedSubcategoryName = subcategoryMeta?.name ?? selected.name;
				const localizedParentSlug = parentMeta?.slug ?? selected.parent!.slug;
				const localizedSubcategorySlug = subcategoryMeta?.slug ?? selected.slug;
				const localizedLeafSlug = normalizeSlugPart(translation.slug) || productSlug;

				return prisma.productTranslation.update({
					where: { id: translation.id },
					data: {
						categoryName: localizedParentName,
						subcategoryName: localizedSubcategoryName,
						fullSlug: `${localizedParentSlug}/${localizedSubcategorySlug}/${localizedLeafSlug}`,
					},
				});
			})
			.filter((query): query is ReturnType<typeof prisma.productTranslation.update> => Boolean(query));

		await prisma.$transaction([...productUpdates, ...translationUpdates]);

		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
			payload: { options },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
			payload: { options },
		};
	}
};

export const bulkSetBrand: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
	const options: BrandOption[] = brands.map((b) => ({ id: b.id, label: b.name }));

	if (method === 'get') {
		return { records: records.map((r) => r.toJSON(currentAdmin)), payload: { options } };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const brandId = payload.brandId;
	if (typeof brandId !== 'string' || brandId.trim() === '') {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-invalid', type: 'error' },
			payload: { options },
		};
	}

	const ids = getRecordIds(records);
	if (!ids.length) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'bulk-no-records', type: 'error' },
			payload: { options },
		};
	}

	try {
		await prisma.product.updateMany({ where: { id: { in: ids } }, data: { brandId } });
		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
			payload: { options },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
			payload: { options },
		};
	}
};

export const bulkEditTags: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	if (method === 'get') {
		return { records: records.map((r) => r.toJSON(currentAdmin)) };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const mode = payload.mode;
	const tags = parseCsvTags(payload.tags);
	if ((mode !== 'add' && mode !== 'remove' && mode !== 'replace') || tags.length === 0) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-invalid', type: 'error' },
		};
	}

	const ids = getRecordIds(records);
	if (!ids.length) {
		return { records: records.map((r) => r.toJSON(currentAdmin)), notice: { message: 'bulk-no-records', type: 'error' } };
	}

	const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } });

	const tagSet = new Set(tags);
	const uniq = (arr: string[]) => Array.from(new Set(arr));

	try {
		await prisma.$transaction(
			products.map((p) => {
				const current = (p.tags ?? []).map((t) => String(t));
				const next =
					mode === 'add'
						? uniq([...current, ...tags])
						: mode === 'remove'
							? current.filter((t) => !tagSet.has(t))
							: uniq(tags);
				return prisma.product.update({ where: { id: p.id }, data: { tags: next } });
			})
		);
		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
		};
	}
};

export const bulkAdjustPrice: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	if (method === 'get') {
		return { records: records.map((r) => r.toJSON(currentAdmin)) };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const direction = payload.direction;
	const kind = payload.kind;
	const valueRaw = payload.value;
	const applyToDiscount = String(payload.applyToDiscount ?? 'false') === 'true';

	const value = typeof valueRaw === 'number' ? valueRaw : typeof valueRaw === 'string' ? Number(valueRaw) : NaN;
	if ((direction !== 'increase' && direction !== 'decrease') || (kind !== 'percent' && kind !== 'fixed') || !Number.isFinite(value) || value <= 0) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-invalid', type: 'error' },
		};
	}

	const ids = getRecordIds(records);
	if (!ids.length) {
		return { records: records.map((r) => r.toJSON(currentAdmin)), notice: { message: 'bulk-no-records', type: 'error' } };
	}

	const products = await prisma.product.findMany({
		where: { id: { in: ids } },
		select: { id: true, basePrice: true, discountPrice: true },
	});

	const sign = direction === 'increase' ? 1 : -1;
	const multiplier = kind === 'percent' ? 1 + sign * (value / 100) : null;
	const delta = kind === 'fixed' ? sign * value : null;

	try {
		await prisma.$transaction(
			products.map((p) => {
				const base = Number(p.basePrice ?? 0);
				const nextBaseRaw = multiplier != null ? base * multiplier : base + (delta ?? 0);
				const nextBase = Math.max(0.01, nextBaseRaw);

				let nextDiscount: string | null = p.discountPrice != null ? roundToCentsString(Number(p.discountPrice)) : null;
				if (applyToDiscount && p.discountPrice != null) {
					const currentDiscount = Number(p.discountPrice);
					const nextDiscountRaw = multiplier != null ? currentDiscount * multiplier : currentDiscount + (delta ?? 0);
					const safeDiscount = Math.max(0.01, nextDiscountRaw);
					const capped = safeDiscount >= nextBase ? nextBase - 0.01 : safeDiscount;
					nextDiscount = capped > 0 ? roundToCentsString(capped) : null;
				}

				return prisma.product.update({
					where: { id: p.id },
					data: {
						basePrice: roundToCentsString(nextBase),
						discountPrice: nextDiscount,
					},
				});
			})
		);
		try {
			await recalculateProductSortPrices(prisma, ids);
		} catch (error) {
			console.error('[admin-cache] Failed to recalculate product sort prices', error);
		}
		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
		};
	}
};

export const bulkAdjustStock: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	if (method === 'get') {
		return { records: records.map((r) => r.toJSON(currentAdmin)) };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const mode = payload.mode;
	const valueRaw = payload.value;
	const syncInStock = String(payload.syncInStock ?? 'false') === 'true';
	const reasonRaw = payload.reason;

	const value = typeof valueRaw === 'number' ? valueRaw : typeof valueRaw === 'string' ? Number(valueRaw) : NaN;
	const isValidValue = Number.isFinite(value) && Number.isInteger(value);
	if (
		(mode !== 'set' && mode !== 'increase' && mode !== 'decrease') ||
		!isValidValue ||
		value < 0 ||
		(mode !== 'set' && value <= 0)
	) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-invalid', type: 'error' },
		};
	}

	const reasonFallback =
		mode === 'set'
			? 'Bulk stock set'
			: mode === 'increase'
				? 'Bulk stock increase'
				: 'Bulk stock decrease';
	const reason = resolveInventoryReason(reasonRaw, reasonFallback);

	const ids = getRecordIds(records);
	if (!ids.length) {
		return { records: records.map((r) => r.toJSON(currentAdmin)), notice: { message: 'bulk-no-records', type: 'error' } };
	}

	const products = await prisma.product.findMany({
		where: { id: { in: ids } },
		select: { id: true, stock: true, inStock: true },
	});

	const normalizedValue = Math.trunc(value);
	const adminEmail = resolveInventoryAdminEmail(currentAdmin);

	try {
		const operations = products.flatMap((p) => {
			const currentStock = Number(p.stock ?? 0);
			const nextStock =
				mode === 'set'
					? normalizedValue
					: mode === 'increase'
						? currentStock + normalizedValue
						: Math.max(0, currentStock - normalizedValue);
			const data: { stock: number; inStock?: boolean } = {
				stock: Math.trunc(nextStock),
			};
			if (syncInStock) {
				data.inStock = nextStock > 0;
			}
			return [
				prisma.product.update({ where: { id: p.id }, data }),
				prisma.inventoryAdjustment.create({
					data: {
						productId: p.id,
						source: 'BULK_ADJUST',
						reason,
						previousStock: Math.trunc(currentStock),
						nextStock: Math.trunc(nextStock),
						delta: Math.trunc(nextStock) - Math.trunc(currentStock),
						adminEmail,
					},
				}),
			];
		});
		await prisma.$transaction(operations);
		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
		};
	}
};

export const bulkToggleInStock: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	if (method === 'get') {
		return { records: records.map((r) => r.toJSON(currentAdmin)) };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const mode = payload.mode;
	const setValue = payload.value;

	const ids = getRecordIds(records);
	if (!ids.length) {
		return { records: records.map((r) => r.toJSON(currentAdmin)), notice: { message: 'bulk-no-records', type: 'error' } };
	}

	try {
		if (mode === 'set') {
			const next = String(setValue ?? 'false') === 'true';
			await prisma.product.updateMany({ where: { id: { in: ids } }, data: { inStock: next } });
		} else {
			const current = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, inStock: true } });
			await prisma.$transaction(
				current.map((p) => prisma.product.update({ where: { id: p.id }, data: { inStock: !p.inStock } }))
			);
		}
		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((r) => r!.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-updated', type: 'success', options: { count: ids.length } },
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-bulk-failed', type: 'error' },
		};
	}
};
