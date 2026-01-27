import type { ActionHandler, ActionResponse } from 'adminjs';
import { Prisma, type ProductCurrency, type ProductStatus } from '@prisma/client';
import { prisma } from '../prisma.mts';

type CsvRowResult = {
	row: number;
	status: 'created' | 'updated' | 'skipped' | 'error';
	message?: string;
};

const toSlugPart = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

const parseCsv = (input: string): string[][] => {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let inQuotes = false;
	for (let i = 0; i < input.length; i += 1) {
		const char = input[i];
		const next = input[i + 1];
		if (char === '"') {
			if (inQuotes && next === '"') {
				cell += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}
		if (char === ',' && !inQuotes) {
			row.push(cell);
			cell = '';
			continue;
		}
		if ((char === '\n' || char === '\r') && !inQuotes) {
			if (char === '\r' && next === '\n') i += 1;
			row.push(cell);
			cell = '';
			const hasContent = row.some((entry) => entry.trim() !== '');
			if (hasContent) rows.push(row);
			row = [];
			continue;
		}
		cell += char;
	}
	row.push(cell);
	if (row.some((entry) => entry.trim() !== '')) rows.push(row);
	return rows;
};

const toNumber = (value: string | undefined) => {
	if (!value) return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

const toBoolean = (value: string | undefined) => {
	if (!value) return null;
	const normalized = value.trim().toLowerCase();
	if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
	if (['false', '0', 'no', 'n'].includes(normalized)) return false;
	return null;
};

const parseTags = (value: string | undefined) => {
	if (!value) return [];
	const separator = value.includes('|') ? '|' : ',';
	return Array.from(
		new Set(
			value
				.split(separator)
				.map((tag) => tag.trim())
				.filter(Boolean)
				.map((tag) => tag.toLowerCase())
		)
	);
};

const buildCsv = (rows: string[][]) => rows.map((row) => row.map((cell) => {
	const needsQuotes = /[",\n\r]/.test(cell);
	const escaped = cell.replace(/"/g, '""');
	return needsQuotes ? `"${escaped}"` : escaped;
}).join(',')).join('\n');

const PRODUCT_HEADERS = [
	'id',
	'name',
	'slug',
	'status',
	'basePrice',
	'discountPrice',
	'currency',
	'stock',
	'inStock',
	'productCode',
	'brandId',
	'categoryId',
	'categoryName',
	'subcategoryName',
	'fullSlug',
	'imageUrl',
	'tags',
	'metaTitle',
	'metaDescription',
	'canonicalUrl',
	'openGraphImage',
];

export const exportProductsCsv: ActionHandler<ActionResponse> = async (_req, _res, _context) => {
	const products = await prisma.product.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			basePrice: true,
			discountPrice: true,
			currency: true,
			stock: true,
			inStock: true,
			productCode: true,
			brandId: true,
			categoryId: true,
			categoryName: true,
			subcategoryName: true,
			fullSlug: true,
			imageUrl: true,
			tags: true,
			metaTitle: true,
			metaDescription: true,
			canonicalUrl: true,
			openGraphImage: true,
		},
		orderBy: { updatedAt: 'desc' },
	});

	const rows: string[][] = [PRODUCT_HEADERS];
	for (const product of products) {
		rows.push([
			product.id,
			product.name ?? '',
			product.slug ?? '',
			product.status ?? '',
			product.basePrice?.toNumber?.() != null ? String(product.basePrice.toNumber()) : '',
			product.discountPrice?.toNumber?.() != null ? String(product.discountPrice.toNumber()) : '',
			product.currency ?? '',
			product.stock != null ? String(product.stock) : '',
			product.inStock != null ? String(product.inStock) : '',
			product.productCode ?? '',
			product.brandId ?? '',
			product.categoryId ?? '',
			product.categoryName ?? '',
			product.subcategoryName ?? '',
			product.fullSlug ?? '',
			product.imageUrl ?? '',
			product.tags?.length ? product.tags.join('|') : '',
			product.metaTitle ?? '',
			product.metaDescription ?? '',
			product.canonicalUrl ?? '',
			product.openGraphImage ?? '',
		]);
	}

	return {
		payload: {
			csv: buildCsv(rows),
			filename: `products-${new Date().toISOString().slice(0, 10)}.csv`,
		},
	};
};

export const importProductsCsv: ActionHandler<ActionResponse> = async (req, _res, _context) => {
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const csvRaw = typeof payload.csv === 'string' ? payload.csv : '';
	const dryRun = String(payload.dryRun ?? 'false') === 'true';

	if (!csvRaw.trim()) {
		return {
			notice: { message: 'product-csv-empty', type: 'error' },
		};
	}

	const rows = parseCsv(csvRaw);
	if (rows.length < 2) {
		return {
			notice: { message: 'product-csv-no-rows', type: 'error' },
		};
	}

	const headers = rows[0].map((header) => header.trim());
	const headerIndex = new Map(headers.map((header, idx) => [header, idx]));
	const results: CsvRowResult[] = [];

	const seenSlugs = new Set<string>();
	const slugValues = rows
		.slice(1)
		.map((row) => row[headerIndex.get('slug') ?? -1])
		.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

	const existingBySlug = slugValues.length
		? await prisma.product.findMany({
				where: { slug: { in: slugValues } },
				select: { id: true, slug: true },
			})
		: [];
	const existingSlugMap = new Map(existingBySlug.map((p) => [p.slug, p.id]));

	for (let i = 1; i < rows.length; i += 1) {
		const row = rows[i];
		const get = (key: string) => {
			const idx = headerIndex.get(key);
			if (idx === undefined) return undefined;
			return row[idx]?.trim() ?? '';
		};

		const id = get('id') || undefined;
		const slug = get('slug') || undefined;
		const name = get('name') || undefined;
		const categoryId = get('categoryId') || undefined;
		const brandId = get('brandId') || undefined;

		if (slug && seenSlugs.has(slug)) {
			results.push({ row: i + 1, status: 'error', message: 'product-csv-duplicate-slug' });
			continue;
		}
		if (slug) seenSlugs.add(slug);

		let existingId: string | undefined;
		if (id) existingId = id;
		else if (slug && existingSlugMap.has(slug)) existingId = existingSlugMap.get(slug);

		const isCreate = !existingId;
		const basePrice = toNumber(get('basePrice'));
		const discountPrice = toNumber(get('discountPrice'));
		const stock = toNumber(get('stock'));
		const inStock = toBoolean(get('inStock'));
		const currency = get('currency')?.toUpperCase() || undefined;
		const productCode = get('productCode') || undefined;
		const categoryName = get('categoryName') || undefined;
		const subcategoryName = get('subcategoryName') || undefined;
		const fullSlug = get('fullSlug');
		const tags = parseTags(get('tags'));

		const errors: string[] = [];
		if (isCreate) {
			if (!name) errors.push('product-csv-missing-name');
			if (!slug) errors.push('product-csv-missing-slug');
			if (!categoryId) errors.push('product-csv-missing-category');
			if (!brandId) errors.push('product-csv-missing-brand');
			if (!productCode) errors.push('product-csv-missing-productCode');
			if (!categoryName) errors.push('product-csv-missing-categoryName');
			if (!subcategoryName) errors.push('product-csv-missing-subcategoryName');
			if (basePrice == null || basePrice <= 0) errors.push('product-csv-invalid-basePrice');
			if (stock == null || !Number.isInteger(stock) || stock < 0) errors.push('product-csv-invalid-stock');
			if (!currency) errors.push('product-csv-missing-currency');
		}
		if (basePrice != null && basePrice <= 0) errors.push('product-csv-invalid-basePrice');
		if (discountPrice != null && basePrice != null && discountPrice >= basePrice) {
			errors.push('product-csv-invalid-discountPrice');
		}
		if (stock != null && (!Number.isInteger(stock) || stock < 0)) errors.push('product-csv-invalid-stock');
		if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('product-csv-invalid-slug');
		if (slug && isCreate && existingSlugMap.has(slug)) errors.push('product-csv-slug-exists');

		if (errors.length > 0) {
			results.push({ row: i + 1, status: 'error', message: errors.join(',') });
			continue;
		}

		if (dryRun) {
			results.push({ row: i + 1, status: isCreate ? 'created' : 'updated' });
			continue;
		}

		const fullSlugValue =
			fullSlug ||
			(slug && categoryName && subcategoryName
				? `${toSlugPart(categoryName)}/${toSlugPart(subcategoryName)}/${toSlugPart(slug)}`
				: undefined);
		const statusValue = (get('status')?.toUpperCase() as ProductStatus | undefined) ?? undefined;
		const currencyValue = (currency as ProductCurrency | undefined) ?? undefined;

		try {
			if (existingId) {
				const updateData: Prisma.ProductUncheckedUpdateInput = {
					name,
					slug,
					status: statusValue,
					basePrice: basePrice != null ? new Prisma.Decimal(basePrice) : undefined,
					discountPrice: discountPrice != null ? new Prisma.Decimal(discountPrice) : undefined,
					currency: currencyValue,
					stock: stock != null ? Math.trunc(stock) : undefined,
					inStock: inStock ?? undefined,
					productCode,
					brandId,
					categoryId,
					categoryName,
					subcategoryName,
					fullSlug: fullSlugValue,
					imageUrl: get('imageUrl') || undefined,
					tags: tags.length ? tags : undefined,
					metaTitle: get('metaTitle') || undefined,
					metaDescription: get('metaDescription') || undefined,
					canonicalUrl: get('canonicalUrl') || undefined,
					openGraphImage: get('openGraphImage') || undefined,
				};
				Object.keys(updateData).forEach((key) => {
					if (updateData[key as keyof Prisma.ProductUncheckedUpdateInput] === undefined) {
						delete updateData[key as keyof Prisma.ProductUncheckedUpdateInput];
					}
				});
				await prisma.product.update({ where: { id: existingId }, data: updateData });
				results.push({ row: i + 1, status: 'updated' });
			} else {
				const createData: Prisma.ProductUncheckedCreateInput = {
					name: name!,
					slug: slug!,
					status: statusValue,
					basePrice: new Prisma.Decimal(basePrice!),
					discountPrice: discountPrice != null ? new Prisma.Decimal(discountPrice) : undefined,
					currency: currencyValue,
					stock: Math.trunc(stock!),
					inStock: inStock ?? true,
					productCode: productCode!,
					brandId: brandId!,
					categoryId: categoryId!,
					categoryName: categoryName!,
					subcategoryName: subcategoryName!,
					fullSlug: fullSlugValue!,
					imageUrl: get('imageUrl') || undefined,
					tags,
					metaTitle: get('metaTitle') || undefined,
					metaDescription: get('metaDescription') || undefined,
					canonicalUrl: get('canonicalUrl') || undefined,
					openGraphImage: get('openGraphImage') || undefined,
				};
				await prisma.product.create({ data: createData });
				results.push({ row: i + 1, status: 'created' });
			}
		} catch {
			results.push({ row: i + 1, status: 'error', message: 'product-csv-save-failed' });
		}
	}

	const createdCount = results.filter((r) => r.status === 'created').length;
	const updatedCount = results.filter((r) => r.status === 'updated').length;
	const errorCount = results.filter((r) => r.status === 'error').length;

	return {
		notice: {
			message: dryRun ? 'product-csv-dry-run-complete' : 'product-csv-import-complete',
			type: errorCount > 0 ? 'warning' : 'success',
			options: { created: createdCount, updated: updatedCount, errors: errorCount },
		},
		payload: {
			results,
			created: createdCount,
			updated: updatedCount,
			errors: errorCount,
			dryRun,
		},
	};
};
