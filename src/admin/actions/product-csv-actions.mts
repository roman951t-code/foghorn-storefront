import type { ActionHandler, ActionResponse } from 'adminjs';
import { Prisma, type ProductCurrency, type ProductStatus } from '@prisma/client';
import * as XLSX from 'xlsx';
import { prisma } from '../prisma.mts';
import {
	logInventoryAdjustment,
	resolveInventoryAdminEmail,
	resolveInventoryReason,
} from './inventory-adjustment-actions.mts';
import { buildCsvFromRows } from '../utils/csv.mts';
import { uploadProductImageToCloudinary } from '../utils/cloudinary.mts';

type CsvRowResult = {
	row: number;
	status: 'created' | 'updated' | 'skipped' | 'error';
	message?: string;
};

type ResolveResult<T> = { ok: true; value: T } | { ok: false; error: string };

type BrandRef = {
	id: string;
	name: string;
	slug: string;
};

type CategoryRef = {
	categoryId: string;
	parentCategoryId: string;
	categoryName: string;
	categorySlug: string;
	subcategoryName: string;
	subcategorySlug: string;
};

type CategoryLookupRow = {
	id: string;
	name: string;
	slug: string;
	parentId: string | null;
	parent: { id: string; name: string; slug: string; parentId: string | null } | null;
};

type ProductAttributeCsvValue = {
	name: string;
	unit: string | null;
	values: string[];
};

type ProductAttributeLookupRow = {
	id: string;
	name: string;
	unit: string | null;
};

const PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const PRODUCT_CSV_IMPORT_MAX_ROW_COUNT = 5000;

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

const parseSpreadsheetBase64 = (base64: string): string[][] => {
	const workbook = XLSX.read(Buffer.from(base64, 'base64'), { type: 'buffer' });
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) return [];
	const sheet = workbook.Sheets[firstSheetName];
	if (!sheet) return [];
	const rawRows = XLSX.utils.sheet_to_json(sheet, {
		header: 1,
		raw: false,
		defval: '',
	}) as unknown[][];
	return rawRows
		.map((row) => row.map((cell) => String(cell ?? '')))
		.filter((row) => row.some((entry) => entry.trim().length > 0));
};

const estimateBase64DecodedSizeBytes = (base64: string) => {
	const normalized = base64.replace(/\s+/g, '');
	if (!normalized) return 0;
	const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
	return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
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

const parseGalleryUrls = (value: string | undefined) => {
	if (!value) return [];
	const normalized = value.replace(/\r\n/g, '\n').trim();
	if (!normalized) return [];
	const splitBy = normalized.includes('|')
		? /\|/
		: normalized.includes('\n')
			? /\n/
			: normalized.includes(',')
				? /,/
				: null;
	const rawUrls = splitBy ? normalized.split(splitBy) : [normalized];
	return Array.from(
		new Set(
			rawUrls
				.map((url) => url.trim())
				.filter((url) => url.length > 0)
		)
	);
};

const normalizeCsvAttributeValue = (value: unknown): string | null => {
	if (typeof value === 'string') {
		const normalized = value.trim();
		return normalized.length > 0 ? normalized : null;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}
	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}
	return null;
};

const normalizeCsvAttributeValues = (raw: unknown): string[] => {
	if (Array.isArray(raw)) {
		return Array.from(
			new Set(raw.map((value) => normalizeCsvAttributeValue(value)).filter((value): value is string => Boolean(value)))
		);
	}

	const normalizedSingle = normalizeCsvAttributeValue(raw);
	if (normalizedSingle) return [normalizedSingle];

	if (raw && typeof raw === 'object') {
		const record = raw as Record<string, unknown>;
		if ('values' in record) {
			return normalizeCsvAttributeValues(record.values);
		}
		if ('value' in record) {
			return normalizeCsvAttributeValues(record.value);
		}
	}

	return [];
};

const serializeProductAttributesForCsv = (
	attributes: Array<{ value: string; attribute: { name: string; unit: string | null } }>
) => {
	if (!attributes.length) return '';

	const grouped = new Map<
		string,
		{ name: string; unit: string | null; values: Set<string> }
	>();

	for (const entry of attributes) {
		const name = normalizeCsvAttributeValue(entry.attribute.name);
		const value = normalizeCsvAttributeValue(entry.value);
		if (!name || !value) continue;

		const unit = normalizeCsvAttributeValue(entry.attribute.unit);
		const key = name.toLowerCase();
		const existing = grouped.get(key) ?? {
			name,
			unit: unit ?? null,
			values: new Set<string>(),
		};
		if (!existing.unit && unit) existing.unit = unit;
		existing.values.add(value);
		grouped.set(key, existing);
	}

	if (grouped.size === 0) return '';

	const payload = Array.from(grouped.values())
		.map((entry) => ({
			name: entry.name,
			unit: entry.unit,
			values: Array.from(entry.values).sort((a, b) =>
				a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
			),
		}))
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

	return JSON.stringify(payload);
};

const parseProductAttributesFromCsv = (
	rawValue: string | undefined
): ResolveResult<ProductAttributeCsvValue[]> => {
	const raw = typeof rawValue === 'string' ? rawValue.trim() : '';
	if (!raw) return { ok: true, value: [] };

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { ok: false, error: 'product-csv-invalid-attributes' };
	}

	const grouped = new Map<
		string,
		{ name: string; unit: string | null; values: Set<string> }
	>();

	const addEntry = (nameRaw: unknown, unitRaw: unknown, valuesRaw: unknown) => {
		const name = normalizeCsvAttributeValue(nameRaw);
		if (!name) return false;

		const values = normalizeCsvAttributeValues(valuesRaw);
		if (values.length === 0) return true;

		const unit = normalizeCsvAttributeValue(unitRaw);
		const key = name.toLowerCase();
		const existing = grouped.get(key) ?? {
			name,
			unit: unit ?? null,
			values: new Set<string>(),
		};
		if (!existing.unit && unit) existing.unit = unit;
		for (const value of values) existing.values.add(value);
		grouped.set(key, existing);
		return true;
	};

	if (Array.isArray(parsed)) {
		for (const item of parsed) {
			if (!item || typeof item !== 'object') {
				return { ok: false, error: 'product-csv-invalid-attributes' };
			}
			const record = item as Record<string, unknown>;
			const valuesSource = record.values ?? record.value;
			if (!addEntry(record.name, record.unit, valuesSource)) {
				return { ok: false, error: 'product-csv-invalid-attributes' };
			}
		}
	} else if (parsed && typeof parsed === 'object') {
		for (const [name, rawEntry] of Object.entries(parsed as Record<string, unknown>)) {
			if (rawEntry && typeof rawEntry === 'object' && !Array.isArray(rawEntry)) {
				const record = rawEntry as Record<string, unknown>;
				const valuesSource = record.values ?? record.value;
				if (!addEntry(name, record.unit, valuesSource)) {
					return { ok: false, error: 'product-csv-invalid-attributes' };
				}
			} else if (!addEntry(name, null, rawEntry)) {
				return { ok: false, error: 'product-csv-invalid-attributes' };
			}
		}
	} else {
		return { ok: false, error: 'product-csv-invalid-attributes' };
	}

	return {
		ok: true,
		value: Array.from(grouped.values())
			.map((entry) => ({
				name: entry.name,
				unit: entry.unit,
				values: Array.from(entry.values).sort((a, b) =>
					a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
				),
			}))
			.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
	};
};

const toOptionalText = (value: string | undefined) => {
	if (!value) return undefined;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : undefined;
};

const toOptionalSlug = (value: string | undefined) => {
	const text = toOptionalText(value);
	if (!text) return undefined;
	const slug = toSlugPart(text);
	return slug.length > 0 ? slug : undefined;
};

const titleCaseFromSlug = (slug: string) =>
	slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');

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
	'brandSlug',
	'brandName',
	'categoryId',
	'categorySlug',
	'subcategorySlug',
	'categoryName',
	'subcategoryName',
	'categoryImageUrl',
	'subcategoryImageUrl',
	'fullSlug',
	'imageUrl',
	'galleryUrls',
	'tags',
	'attributes',
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
			brand: {
				select: {
					slug: true,
					name: true,
				},
			},
			categoryId: true,
			category: {
				select: {
					slug: true,
					name: true,
					imageUrl: true,
					parent: {
						select: {
							slug: true,
							name: true,
							imageUrl: true,
						},
					},
				},
			},
			categoryName: true,
			subcategoryName: true,
			fullSlug: true,
			imageUrl: true,
			productImages: {
				select: {
					url: true,
					sortOrder: true,
					createdAt: true,
				},
				orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
			},
			attributes: {
				select: {
					value: true,
					attribute: {
						select: {
							name: true,
							unit: true,
						},
					},
				},
				orderBy: [{ attribute: { name: 'asc' } }, { value: 'asc' }],
			},
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
			product.discountPrice?.toNumber?.() != null
				? String(product.discountPrice.toNumber())
				: '',
			product.currency ?? '',
			product.stock != null ? String(product.stock) : '',
			product.inStock != null ? String(product.inStock) : '',
			product.productCode ?? '',
			product.brandId ?? '',
			product.brand?.slug ?? '',
			product.brand?.name ?? '',
			product.categoryId ?? '',
			product.category?.parent?.slug ?? '',
			product.category?.slug ?? '',
			product.categoryName ?? '',
			product.subcategoryName ?? '',
			product.category?.parent?.imageUrl ?? '',
			product.category?.imageUrl ?? '',
			product.fullSlug ?? '',
			product.imageUrl ?? '',
			product.productImages
				.map((image) => image.url)
				.filter((url) => Boolean(url) && url !== product.imageUrl)
				.join('|'),
			product.tags?.length ? product.tags.join('|') : '',
			serializeProductAttributesForCsv(product.attributes),
			product.metaTitle ?? '',
			product.metaDescription ?? '',
			product.canonicalUrl ?? '',
			product.openGraphImage ?? '',
		]);
	}

	return {
		payload: {
			csv: buildCsvFromRows(rows),
			filename: `products-${new Date().toISOString().slice(0, 10)}.csv`,
		},
	};
};

export const importProductsCsv: ActionHandler<ActionResponse> = async (req, _res, context) => {
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const csvRaw = typeof payload.csv === 'string' ? payload.csv : '';
	const spreadsheetBase64 =
		typeof payload.spreadsheetBase64 === 'string' ? payload.spreadsheetBase64 : '';
	const dryRun = String(payload.dryRun ?? 'false') === 'true';
	const adminEmail = resolveInventoryAdminEmail(context.currentAdmin);
	const importReason = resolveInventoryReason(payload.reason, 'CSV import');

	if (!csvRaw.trim() && !spreadsheetBase64.trim()) {
		return {
			notice: { message: 'product-csv-empty', type: 'error' },
		};
	}

	if (
		csvRaw.trim() &&
		Buffer.byteLength(csvRaw, 'utf8') > PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES
	) {
		return {
			notice: { message: 'product-csv-file-too-large', type: 'error' },
		};
	}

	if (
		spreadsheetBase64.trim() &&
		estimateBase64DecodedSizeBytes(spreadsheetBase64) > PRODUCT_CSV_IMPORT_MAX_FILE_SIZE_BYTES
	) {
		return {
			notice: { message: 'product-csv-file-too-large', type: 'error' },
		};
	}

	let rows: string[][] = [];
	if (csvRaw.trim()) {
		rows = parseCsv(csvRaw);
	} else {
		try {
			rows = parseSpreadsheetBase64(spreadsheetBase64);
		} catch {
			return {
				notice: { message: 'product-csv-invalid-file', type: 'error' },
			};
		}
	}
	if (rows.length < 2) {
		return {
			notice: { message: 'product-csv-no-rows', type: 'error' },
		};
	}

	if (rows.length - 1 > PRODUCT_CSV_IMPORT_MAX_ROW_COUNT) {
		return {
			notice: { message: 'product-csv-too-many-rows', type: 'error' },
		};
	}

	const headers = rows[0].map((header) => header.trim());
	const headerIndex = new Map(headers.map((header, idx) => [header, idx]));
	const hasGalleryUrlsColumn = headerIndex.has('galleryUrls');
	const hasAttributesColumn = headerIndex.has('attributes');
	const results: CsvRowResult[] = [];

	const seenSlugs = new Set<string>();
	const seenProductCodes = new Set<string>();
	const idValues = Array.from(
		new Set(
			rows
				.slice(1)
				.map((row) => row[headerIndex.get('id') ?? -1])
				.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		)
	);
	const slugValues = Array.from(
		new Set(
			rows
				.slice(1)
				.map((row) => row[headerIndex.get('slug') ?? -1])
				.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		)
	);
	const productCodeValues = Array.from(
		new Set(
			rows
				.slice(1)
				.map((row) => row[headerIndex.get('productCode') ?? -1])
				.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
		)
	);

	const existingById = idValues.length
		? await prisma.product.findMany({
				where: { id: { in: idValues } },
				select: { id: true, productCode: true, stock: true },
			})
		: [];
	const existingBySlug = slugValues.length
		? await prisma.product.findMany({
				where: { slug: { in: slugValues } },
				select: { id: true, slug: true, productCode: true, stock: true },
			})
		: [];
	const existingByProductCode = productCodeValues.length
		? await prisma.product.findMany({
				where: { productCode: { in: productCodeValues } },
				select: { id: true, productCode: true, stock: true },
			})
		: [];

	const existingIdSet = new Set(existingById.map((p) => p.id));
	const existingSlugMap = new Map(existingBySlug.map((p) => [p.slug, p.id]));
	const existingProductCodeMap = new Map(
		existingByProductCode.map((p) => [p.productCode, p.id])
	);
	const existingProductCacheById = new Map<
		string,
		{
			productCode: string | null;
			stock: number | null;
		}
	>();
	for (const product of existingById) {
		existingProductCacheById.set(product.id, {
			productCode: product.productCode,
			stock: product.stock,
		});
	}
	for (const product of existingBySlug) {
		existingProductCacheById.set(product.id, {
			productCode: product.productCode,
			stock: product.stock,
		});
	}
	for (const product of existingByProductCode) {
		existingProductCacheById.set(product.id, {
			productCode: product.productCode,
			stock: product.stock,
		});
	}
	const productCodeByIdCache = new Map<string, string | null>(
		Array.from(existingProductCacheById.entries()).map(([id, product]) => [id, product.productCode])
	);
	const existingStockById = new Map<string, number | null>(
		Array.from(existingProductCacheById.entries()).map(([id, product]) => [id, product.stock])
	);

	const getProductCodeById = async (id: string) => {
		if (productCodeByIdCache.has(id)) return productCodeByIdCache.get(id) ?? null;
		const product = await prisma.product.findUnique({
			where: { id },
			select: { productCode: true },
		});
		const productCode = product?.productCode ?? null;
		productCodeByIdCache.set(id, productCode);
		return productCode;
	};

	const uploadedCategoryImageCache = new Map<string, Promise<string | null>>();

	const uploadCategoryImage = async ({
		sourceUrl,
		entitySlug,
		assetKey,
	}: {
		sourceUrl: string;
		entitySlug: string;
		assetKey: string;
	}) => {
		const normalizedSource = sourceUrl.trim();
		if (!normalizedSource) return '';
		const cacheKey = normalizedSource;
		const cachedUpload = uploadedCategoryImageCache.get(cacheKey);
		if (cachedUpload) return cachedUpload;
		const uploadPromise = (async () => {
			const uploadResult = await uploadProductImageToCloudinary({
				sourceUrl: normalizedSource,
				productSlug: entitySlug,
				assetKey,
			});
			if (!uploadResult.ok) {
				uploadedCategoryImageCache.delete(cacheKey);
				return null;
			}
			return uploadResult.url;
		})();
		uploadedCategoryImageCache.set(cacheKey, uploadPromise);
		return uploadPromise;
	};

	const brandByIdCache = new Map<string, BrandRef | null>();
	const brandBySlugCache = new Map<string, BrandRef | null>();
	const categoryByIdCache = new Map<string, CategoryLookupRow | null>();
	const categoryBySlugCache = new Map<string, CategoryLookupRow | null>();
	const productAttributeByNameCache = new Map<string, ProductAttributeLookupRow | null>();

	const getBrandById = async (id: string) => {
		if (brandByIdCache.has(id)) return brandByIdCache.get(id) ?? null;
		const brand = await prisma.brand.findUnique({
			where: { id },
			select: { id: true, name: true, slug: true },
		});
		brandByIdCache.set(id, brand);
		if (brand) brandBySlugCache.set(brand.slug, brand);
		return brand;
	};

	const getBrandBySlug = async (slug: string) => {
		if (brandBySlugCache.has(slug)) return brandBySlugCache.get(slug) ?? null;
		const brand = await prisma.brand.findUnique({
			where: { slug },
			select: { id: true, name: true, slug: true },
		});
		brandBySlugCache.set(slug, brand);
		if (brand) brandByIdCache.set(brand.id, brand);
		return brand;
	};

	const createBrand = async (name: string, slug: string) => {
		try {
			const created = await prisma.brand.create({
				data: {
					name,
					slug,
				},
				select: { id: true, name: true, slug: true },
			});
			brandByIdCache.set(created.id, created);
			brandBySlugCache.set(created.slug, created);
			return created;
		} catch {
			const existing = await getBrandBySlug(slug);
			if (existing) return existing;
			throw new Error('product-csv-brand-create-failed');
		}
	};

	const getCategoryById = async (id: string) => {
		if (categoryByIdCache.has(id)) return categoryByIdCache.get(id) ?? null;
		const category = await prisma.productCategory.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				slug: true,
				parentId: true,
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
						parentId: true,
					},
				},
			},
		});
		categoryByIdCache.set(id, category);
		if (category) categoryBySlugCache.set(category.slug, category);
		return category;
	};

	const getCategoryBySlug = async (slug: string) => {
		if (categoryBySlugCache.has(slug)) return categoryBySlugCache.get(slug) ?? null;
		const category = await prisma.productCategory.findUnique({
			where: { slug },
			select: {
				id: true,
				name: true,
				slug: true,
				parentId: true,
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
						parentId: true,
					},
				},
			},
		});
		categoryBySlugCache.set(slug, category);
		if (category) categoryByIdCache.set(category.id, category);
		return category;
	};

	const createCategory = async ({
		name,
		slug,
		parentId,
	}: {
		name: string;
		slug: string;
		parentId: string | null;
	}) => {
		try {
			const created = await prisma.productCategory.create({
				data: {
					name,
					slug,
					parentId,
				},
				select: {
					id: true,
					name: true,
					slug: true,
					parentId: true,
					parent: {
						select: {
							id: true,
							name: true,
							slug: true,
							parentId: true,
						},
					},
				},
			});
			categoryByIdCache.set(created.id, created);
			categoryBySlugCache.set(created.slug, created);
			return created;
		} catch {
			const existing = await getCategoryBySlug(slug);
			if (existing) return existing;
			throw new Error('product-csv-category-create-failed');
		}
	};

	const getProductAttributeByName = async (name: string) => {
		const cacheKey = name.trim().toLowerCase();
		if (productAttributeByNameCache.has(cacheKey)) {
			return productAttributeByNameCache.get(cacheKey) ?? null;
		}

		const attribute = await prisma.productAttribute.findFirst({
			where: {
				name: {
					equals: name,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				name: true,
				unit: true,
			},
		});
		productAttributeByNameCache.set(cacheKey, attribute);
		return attribute;
	};

	const createProductAttribute = async (name: string, unit: string | null) => {
		try {
			const created = await prisma.productAttribute.create({
				data: {
					name,
					unit: unit ?? null,
				},
				select: {
					id: true,
					name: true,
					unit: true,
				},
			});
			productAttributeByNameCache.set(created.name.toLowerCase(), created);
			return created;
		} catch {
			const existing = await getProductAttributeByName(name);
			if (existing) return existing;
			throw new Error('product-csv-save-failed');
		}
	};

	const getOrCreateProductAttribute = async (name: string, unit: string | null) => {
		const normalizedName = name.trim();
		const normalizedUnit = unit ? unit.trim() || null : null;
		let attribute = await getProductAttributeByName(normalizedName);
		if (!attribute) {
			attribute = await createProductAttribute(normalizedName, normalizedUnit);
		}

		if (
			normalizedUnit &&
			attribute.unit !== normalizedUnit
		) {
			attribute = await prisma.productAttribute.update({
				where: { id: attribute.id },
				data: { unit: normalizedUnit },
				select: { id: true, name: true, unit: true },
			});
			productAttributeByNameCache.set(attribute.name.toLowerCase(), attribute);
		}

		return attribute;
	};

	const syncProductAttributes = async (productId: string, attributes: ProductAttributeCsvValue[]) => {
		const desiredPairs: Array<{ attributeId: string; value: string }> = [];

		for (const attributeEntry of attributes) {
			const name = normalizeCsvAttributeValue(attributeEntry.name);
			if (!name) continue;
			const values = normalizeCsvAttributeValues(attributeEntry.values);
			if (values.length === 0) continue;

			const attribute = await getOrCreateProductAttribute(name, attributeEntry.unit);
			for (const value of values) {
				desiredPairs.push({ attributeId: attribute.id, value });
			}
		}

		const uniqueDesiredPairs = Array.from(
			new Map(
				desiredPairs.map((entry) => [`${entry.attributeId}\u0000${entry.value}`, entry] as const)
			).values()
		);

		await prisma.$transaction(async (tx) => {
			const existing = await tx.productAttributeValue.findMany({
				where: { productId },
				select: { id: true, attributeId: true, value: true },
			});

			const existingSignatures = new Set(
				existing.map((entry) => `${entry.attributeId}\u0000${entry.value}`)
			);
			const desiredSignatures = new Set(
				uniqueDesiredPairs.map((entry) => `${entry.attributeId}\u0000${entry.value}`)
			);

			const toDeleteIds = existing
				.filter((entry) => !desiredSignatures.has(`${entry.attributeId}\u0000${entry.value}`))
				.map((entry) => entry.id);

			if (toDeleteIds.length > 0) {
				await tx.productAttributeValue.deleteMany({
					where: { id: { in: toDeleteIds } },
				});
			}

			const toCreate = uniqueDesiredPairs.filter(
				(entry) => !existingSignatures.has(`${entry.attributeId}\u0000${entry.value}`)
			);
			if (toCreate.length > 0) {
				await tx.productAttributeValue.createMany({
					data: toCreate.map((entry) => ({
						productId,
						attributeId: entry.attributeId,
						value: entry.value,
					})),
				});
			}
		});
	};

	const resolveBrandReference = async ({
		brandId,
		brandSlug,
		brandName,
		isCreate,
	}: {
		brandId?: string;
		brandSlug?: string;
		brandName?: string;
		isCreate: boolean;
	}): Promise<ResolveResult<BrandRef | null>> => {
		const normalizedBrandName = toOptionalText(brandName);
		const normalizedBrandSlug = toOptionalSlug(brandSlug);

		if (brandId) {
			const brand = await getBrandById(brandId);
			if (!brand) return { ok: false, error: 'product-csv-brand-not-found' };
			if (normalizedBrandSlug && normalizedBrandSlug !== brand.slug) {
				return { ok: false, error: 'product-csv-conflicting-identifiers' };
			}
			return { ok: true, value: brand };
		}

		const derivedBrandSlug = normalizedBrandSlug ?? toOptionalSlug(normalizedBrandName);
		if (!derivedBrandSlug) {
			if (isCreate) return { ok: false, error: 'product-csv-missing-brand-reference' };
			return { ok: true, value: null };
		}

		const existing = await getBrandBySlug(derivedBrandSlug);
		if (existing) return { ok: true, value: existing };

		const nextBrandName = normalizedBrandName ?? titleCaseFromSlug(derivedBrandSlug);
		if (dryRun) {
			return {
				ok: true,
				value: {
					id: `dry-run-brand:${derivedBrandSlug}`,
					name: nextBrandName,
					slug: derivedBrandSlug,
				},
			};
		}

		try {
			const created = await createBrand(nextBrandName, derivedBrandSlug);
			return { ok: true, value: created };
		} catch {
			return { ok: false, error: 'product-csv-brand-create-failed' };
		}
	};

	const resolveCategoryReference = async ({
		categoryId,
		categoryName,
		categorySlug,
		subcategoryName,
		subcategorySlug,
		isCreate,
	}: {
		categoryId?: string;
		categoryName?: string;
		categorySlug?: string;
		subcategoryName?: string;
		subcategorySlug?: string;
		isCreate: boolean;
	}): Promise<ResolveResult<CategoryRef | null>> => {
		const normalizedCategoryName = toOptionalText(categoryName);
		const normalizedSubcategoryName = toOptionalText(subcategoryName);
		const normalizedCategorySlug = toOptionalSlug(categorySlug) ?? toOptionalSlug(normalizedCategoryName);
		const normalizedSubcategorySlug =
			toOptionalSlug(subcategorySlug) ?? toOptionalSlug(normalizedSubcategoryName);

		if (categoryId) {
			const category = await getCategoryById(categoryId);
			if (category) {
				if (!category.parent || !category.parentId) {
					return { ok: false, error: 'product-csv-category-must-be-subcategory' };
				}
				if (normalizedCategorySlug && normalizedCategorySlug !== category.parent.slug) {
					return { ok: false, error: 'product-csv-conflicting-identifiers' };
				}
				if (normalizedSubcategorySlug && normalizedSubcategorySlug !== category.slug) {
					return { ok: false, error: 'product-csv-conflicting-identifiers' };
				}
				return {
					ok: true,
					value: {
						categoryId: category.id,
						parentCategoryId: category.parent.id,
						categoryName: category.parent.name,
						categorySlug: category.parent.slug,
						subcategoryName: category.name,
						subcategorySlug: category.slug,
					},
				};
			}
		}

		const existingSubcategory =
			normalizedSubcategorySlug ? await getCategoryBySlug(normalizedSubcategorySlug) : null;

		// Allow CSV rows with stale categoryId to resolve by subcategory slug when parent slug is omitted.
		if (!normalizedCategorySlug && normalizedSubcategorySlug) {
			if (existingSubcategory?.parent && existingSubcategory.parentId) {
				return {
					ok: true,
					value: {
						categoryId: existingSubcategory.id,
						parentCategoryId: existingSubcategory.parent.id,
						categoryName: existingSubcategory.parent.name,
						categorySlug: existingSubcategory.parent.slug,
						subcategoryName: existingSubcategory.name,
						subcategorySlug: existingSubcategory.slug,
					},
				};
			}
			if (existingSubcategory && !existingSubcategory.parentId) {
				return { ok: false, error: 'product-csv-subcategory-slug-conflict' };
			}
		}

		if (!normalizedCategorySlug && !normalizedSubcategorySlug) {
			if (isCreate) return { ok: false, error: 'product-csv-missing-category-reference' };
			return { ok: true, value: null };
		}
		if (!normalizedCategorySlug) return { ok: false, error: 'product-csv-missing-category-reference' };
		if (!normalizedSubcategorySlug) {
			return { ok: false, error: 'product-csv-missing-subcategory-reference' };
		}

		const parentCategoryName = normalizedCategoryName ?? titleCaseFromSlug(normalizedCategorySlug);
		const childCategoryName = normalizedSubcategoryName ?? titleCaseFromSlug(normalizedSubcategorySlug);

		const existingParent = await getCategoryBySlug(normalizedCategorySlug);
		if (existingParent && existingParent.parentId) {
			return { ok: false, error: 'product-csv-category-slug-conflict' };
		}

		let parentId = existingParent?.id ?? null;
		if (!parentId) {
			if (dryRun) {
				parentId = `dry-run-parent:${normalizedCategorySlug}`;
			} else {
				try {
					const createdParent = await createCategory({
						name: parentCategoryName,
						slug: normalizedCategorySlug,
						parentId: null,
					});
					parentId = createdParent.id;
				} catch {
					return { ok: false, error: 'product-csv-category-create-failed' };
				}
			}
		}

		if (existingSubcategory) {
			if (!existingSubcategory.parentId) {
				return { ok: false, error: 'product-csv-subcategory-slug-conflict' };
			}
			if (existingSubcategory.parentId !== parentId) {
				return { ok: false, error: 'product-csv-subcategory-slug-conflict' };
			}
			return {
				ok: true,
				value: {
					categoryId: existingSubcategory.id,
					parentCategoryId: parentId,
					categoryName: existingSubcategory.parent?.name ?? parentCategoryName,
					categorySlug: existingSubcategory.parent?.slug ?? normalizedCategorySlug,
					subcategoryName: existingSubcategory.name,
					subcategorySlug: existingSubcategory.slug,
				},
			};
		}

		if (dryRun) {
			return {
				ok: true,
				value: {
					categoryId: `dry-run-subcategory:${normalizedSubcategorySlug}`,
					parentCategoryId: parentId,
					categoryName: parentCategoryName,
					categorySlug: normalizedCategorySlug,
					subcategoryName: childCategoryName,
					subcategorySlug: normalizedSubcategorySlug,
				},
			};
		}

		let createdSubcategory: CategoryLookupRow;
		try {
			createdSubcategory = await createCategory({
				name: childCategoryName,
				slug: normalizedSubcategorySlug,
				parentId,
			});
		} catch {
			return { ok: false, error: 'product-csv-category-create-failed' };
		}
		return {
			ok: true,
			value: {
				categoryId: createdSubcategory.id,
				parentCategoryId: parentId,
				categoryName: parentCategoryName,
				categorySlug: normalizedCategorySlug,
				subcategoryName: createdSubcategory.name,
				subcategorySlug: createdSubcategory.slug,
			},
		};
	};

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
		const categoryName = get('categoryName') || undefined;
		const categorySlug = get('categorySlug') || undefined;
		const subcategoryName = get('subcategoryName') || undefined;
		const subcategorySlug = get('subcategorySlug') || undefined;
		const categoryImageUrl = get('categoryImageUrl') || undefined;
		const subcategoryImageUrl = get('subcategoryImageUrl') || undefined;
		const brandId = get('brandId') || undefined;
		const brandSlug = get('brandSlug') || undefined;
		const brandName = get('brandName') || undefined;
		const productCode = get('productCode') || undefined;

		if (slug && seenSlugs.has(slug)) {
			results.push({ row: i + 1, status: 'error', message: 'product-csv-duplicate-slug' });
			continue;
		}
		if (slug) seenSlugs.add(slug);

		if (productCode && seenProductCodes.has(productCode)) {
			results.push({
				row: i + 1,
				status: 'error',
				message: 'product-csv-duplicate-productCode',
			});
			continue;
		}
		if (productCode) seenProductCodes.add(productCode);

		const matchCandidates = new Set<string>();
		if (id && existingIdSet.has(id)) matchCandidates.add(id);
		const matchedBySlugId = slug ? existingSlugMap.get(slug) : undefined;
		if (matchedBySlugId) matchCandidates.add(matchedBySlugId);
		const matchedByProductCodeId = productCode ? existingProductCodeMap.get(productCode) : undefined;
		if (matchedByProductCodeId) matchCandidates.add(matchedByProductCodeId);

		if (matchCandidates.size > 1) {
			results.push({
				row: i + 1,
				status: 'error',
				message: 'product-csv-conflicting-identifiers',
			});
			continue;
		}

		const existingId = matchCandidates.values().next().value as string | undefined;
		const isCreate = !existingId;
		const basePrice = toNumber(get('basePrice'));
		const discountPrice = toNumber(get('discountPrice'));
		const stock = toNumber(get('stock'));
		const inStock = toBoolean(get('inStock'));
		const currency = get('currency')?.toUpperCase() || undefined;
		const fullSlug = get('fullSlug');
		const csvImageUrl = get('imageUrl') || undefined;
		const csvGalleryUrls = hasGalleryUrlsColumn ? parseGalleryUrls(get('galleryUrls')) : [];
		const tags = parseTags(get('tags'));
		const attributesRaw = hasAttributesColumn ? get('attributes') : undefined;
		const hasBrandReferenceInput = Boolean(brandId || brandSlug || brandName);
		const hasCategoryReferenceInput = Boolean(
			categoryId || categoryName || categorySlug || subcategoryName || subcategorySlug
		);

		const errors: string[] = [];
		if (isCreate) {
			if (!name) errors.push('product-csv-missing-name');
			if (!slug) errors.push('product-csv-missing-slug');
			if (!productCode) errors.push('product-csv-missing-productCode');
			if (basePrice == null || basePrice <= 0) errors.push('product-csv-invalid-basePrice');
			if (stock == null || !Number.isInteger(stock) || stock < 0) {
				errors.push('product-csv-invalid-stock');
			}
			if (!currency) errors.push('product-csv-missing-currency');
			if (!hasBrandReferenceInput) errors.push('product-csv-missing-brand-reference');
			if (!hasCategoryReferenceInput) errors.push('product-csv-missing-category-reference');
		}
		if (basePrice != null && basePrice <= 0) errors.push('product-csv-invalid-basePrice');
		if (discountPrice != null && basePrice != null && discountPrice >= basePrice) {
			errors.push('product-csv-invalid-discountPrice');
		}
		if (stock != null && (!Number.isInteger(stock) || stock < 0)) {
			errors.push('product-csv-invalid-stock');
		}
		if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
			errors.push('product-csv-invalid-slug');
		}

		if (errors.length > 0) {
			results.push({ row: i + 1, status: 'error', message: errors.join(',') });
			continue;
		}

		const parsedAttributesResult = hasAttributesColumn
			? parseProductAttributesFromCsv(attributesRaw)
			: { ok: true as const, value: [] as ProductAttributeCsvValue[] };
		if (!parsedAttributesResult.ok) {
			results.push({ row: i + 1, status: 'error', message: parsedAttributesResult.error });
			continue;
		}
		const parsedAttributes = parsedAttributesResult.value;

		let resolvedBrand: BrandRef | null = null;
		if (hasBrandReferenceInput || isCreate) {
			const brandResult = await resolveBrandReference({
				brandId,
				brandSlug,
				brandName,
				isCreate,
			});
			if (!brandResult.ok) {
				results.push({ row: i + 1, status: 'error', message: brandResult.error });
				continue;
			}
			resolvedBrand = brandResult.value;
		}

		let resolvedCategory: CategoryRef | null = null;
		if (hasCategoryReferenceInput || isCreate) {
			const categoryResult = await resolveCategoryReference({
				categoryId,
				categoryName,
				categorySlug,
				subcategoryName,
				subcategorySlug,
				isCreate,
			});
			if (!categoryResult.ok) {
				results.push({ row: i + 1, status: 'error', message: categoryResult.error });
				continue;
			}
			resolvedCategory = categoryResult.value;
		}
		if (!resolvedCategory && (categoryImageUrl || subcategoryImageUrl)) {
			results.push({ row: i + 1, status: 'error', message: 'product-csv-missing-category-reference' });
			continue;
		}

		if (dryRun) {
			results.push({ row: i + 1, status: isCreate ? 'created' : 'updated' });
			continue;
		}

		const uploadProductCode =
			productCode ?? (existingId ? (await getProductCodeById(existingId)) ?? undefined : undefined);
		const uploadedSourceUrlCache = new Map<string, Promise<string | null>>();
		const uploadImage = async (sourceUrl: string, assetKey: string) => {
			const normalizedSource = sourceUrl.trim();
			if (!normalizedSource) return '';
			const cachedUpload = uploadedSourceUrlCache.get(normalizedSource);
			if (cachedUpload) return cachedUpload;
			const uploadPromise = (async () => {
				const uploadResult = await uploadProductImageToCloudinary({
					sourceUrl: normalizedSource,
					productCode: uploadProductCode,
					productSlug: slug,
					assetKey,
				});
				if (!uploadResult.ok) {
					uploadedSourceUrlCache.delete(normalizedSource);
					return null;
				}
				return uploadResult.url;
			})();
			uploadedSourceUrlCache.set(normalizedSource, uploadPromise);
			return uploadPromise;
		};

		let persistedImageUrl = csvImageUrl;
		if (csvImageUrl) {
			const uploadedPrimaryImage = await uploadImage(csvImageUrl, 'primary');
			if (uploadedPrimaryImage == null) {
				results.push({ row: i + 1, status: 'error', message: 'product-csv-image-upload-failed' });
				continue;
			}
			persistedImageUrl = uploadedPrimaryImage;
		}

		const uploadedGalleryCandidates = await Promise.all(
			csvGalleryUrls.map((sourceUrl, galleryIndex) =>
				uploadImage(sourceUrl, `gallery-${galleryIndex + 1}`)
			)
		);
		if (uploadedGalleryCandidates.some((url) => url == null)) {
			results.push({ row: i + 1, status: 'error', message: 'product-csv-image-upload-failed' });
			continue;
		}
		const uploadedGalleryUrls = uploadedGalleryCandidates.filter(
			(url): url is string => typeof url === 'string' && url.length > 0
		);

		const shouldSyncGallery = hasGalleryUrlsColumn;
		const orderedGalleryUrls = shouldSyncGallery
			? (() => {
					const ordered: string[] = [];
					if (persistedImageUrl) ordered.push(persistedImageUrl);
					for (const galleryUrl of uploadedGalleryUrls) {
						if (!ordered.includes(galleryUrl)) {
							ordered.push(galleryUrl);
						}
					}
					return ordered;
				})()
			: [];
		if (!persistedImageUrl && orderedGalleryUrls.length > 0) {
			persistedImageUrl = orderedGalleryUrls[0];
		}

		let persistedCategoryImageUrl = categoryImageUrl;
		let persistedSubcategoryImageUrl = subcategoryImageUrl;
		if (resolvedCategory && (categoryImageUrl || subcategoryImageUrl)) {
			const [uploadedCategoryImage, uploadedSubcategoryImage] = await Promise.all([
				categoryImageUrl
					? uploadCategoryImage({
							sourceUrl: categoryImageUrl,
							entitySlug: resolvedCategory.categorySlug,
							assetKey: 'category',
						})
					: Promise.resolve<string | null>(persistedCategoryImageUrl ?? ''),
				subcategoryImageUrl
					? uploadCategoryImage({
							sourceUrl: subcategoryImageUrl,
							entitySlug: resolvedCategory.subcategorySlug,
							assetKey: 'subcategory',
						})
					: Promise.resolve<string | null>(persistedSubcategoryImageUrl ?? ''),
			]);
			if (
				(categoryImageUrl && uploadedCategoryImage == null) ||
				(subcategoryImageUrl && uploadedSubcategoryImage == null)
			) {
				results.push({ row: i + 1, status: 'error', message: 'product-csv-image-upload-failed' });
				continue;
			}
			if (categoryImageUrl) persistedCategoryImageUrl = uploadedCategoryImage ?? undefined;
			if (subcategoryImageUrl) persistedSubcategoryImageUrl = uploadedSubcategoryImage ?? undefined;
		}

		const fullSlugValue =
			fullSlug ||
			(slug && resolvedCategory
				? `${resolvedCategory.categorySlug}/${resolvedCategory.subcategorySlug}/${toSlugPart(slug)}`
				: undefined) ||
			(slug && categoryName && subcategoryName
				? `${toSlugPart(categoryName)}/${toSlugPart(subcategoryName)}/${toSlugPart(slug)}`
				: undefined);
		const statusValue = (get('status')?.toUpperCase() as ProductStatus | undefined) ?? undefined;
		const currencyValue = (currency as ProductCurrency | undefined) ?? undefined;

		try {
			if (resolvedCategory) {
				const categoryImageUpdates: Promise<unknown>[] = [];
				if (persistedCategoryImageUrl) {
					categoryImageUpdates.push(
						prisma.productCategory.update({
							where: { id: resolvedCategory.parentCategoryId },
							data: { imageUrl: persistedCategoryImageUrl },
						})
					);
				}
				if (persistedSubcategoryImageUrl) {
					categoryImageUpdates.push(
						prisma.productCategory.update({
							where: { id: resolvedCategory.categoryId },
							data: { imageUrl: persistedSubcategoryImageUrl },
						})
					);
				}
				if (categoryImageUpdates.length > 0) {
					await Promise.all(categoryImageUpdates);
				}
			}

			if (existingId) {
				const shouldLogStock = stock != null;
				const previousStock = shouldLogStock ? (existingStockById.get(existingId) ?? null) : null;
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
					brandId: resolvedBrand?.id,
					categoryId: resolvedCategory?.categoryId,
					categoryName: resolvedCategory?.categoryName,
					subcategoryName: resolvedCategory?.subcategoryName,
					fullSlug: fullSlugValue,
					imageUrl: shouldSyncGallery ? persistedImageUrl ?? null : persistedImageUrl,
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
				if (stock != null) {
					existingStockById.set(existingId, Math.trunc(stock));
				}

				if (shouldLogStock && previousStock != null && stock != null) {
					await logInventoryAdjustment({
						productId: existingId,
						previousStock: Number(previousStock ?? 0),
						nextStock: Math.trunc(stock),
						reason: importReason,
						source: 'CSV_IMPORT',
						adminEmail,
					});
				}

				if (shouldSyncGallery) {
					await prisma.$transaction(async (tx) => {
						await tx.productImage.deleteMany({ where: { productId: existingId } });
						if (orderedGalleryUrls.length > 0) {
							await tx.productImage.createMany({
								data: orderedGalleryUrls.map((url, index) => ({
									productId: existingId,
									url,
									sortOrder: index,
								})),
							});
						}
						await tx.product.update({
							where: { id: existingId },
							data: { imageUrl: persistedImageUrl ?? null },
						});
					});
				}

				if (hasAttributesColumn) {
					await syncProductAttributes(existingId, parsedAttributes);
				}

				results.push({ row: i + 1, status: 'updated' });
			} else {
				if (!resolvedBrand || !resolvedCategory || !name || !slug || !productCode) {
					results.push({ row: i + 1, status: 'error', message: 'product-csv-save-failed' });
					continue;
				}

				const createData: Prisma.ProductUncheckedCreateInput = {
					name,
					slug,
					status: statusValue,
					basePrice: new Prisma.Decimal(basePrice!),
					discountPrice: discountPrice != null ? new Prisma.Decimal(discountPrice) : undefined,
					currency: currencyValue,
					stock: Math.trunc(stock!),
					inStock: inStock ?? true,
					productCode,
					brandId: resolvedBrand.id,
					categoryId: resolvedCategory.categoryId,
					categoryName: resolvedCategory.categoryName,
					subcategoryName: resolvedCategory.subcategoryName,
					fullSlug: fullSlugValue!,
					imageUrl: persistedImageUrl,
					tags,
					metaTitle: get('metaTitle') || undefined,
					metaDescription: get('metaDescription') || undefined,
					canonicalUrl: get('canonicalUrl') || undefined,
					openGraphImage: get('openGraphImage') || undefined,
				};
				const createdProduct = await prisma.product.create({
					data: createData,
					select: { id: true },
				});
				existingStockById.set(createdProduct.id, Math.trunc(stock!));
				productCodeByIdCache.set(createdProduct.id, productCode);

				if (shouldSyncGallery) {
					await prisma.$transaction(async (tx) => {
						await tx.productImage.deleteMany({ where: { productId: createdProduct.id } });
						if (orderedGalleryUrls.length > 0) {
							await tx.productImage.createMany({
								data: orderedGalleryUrls.map((url, index) => ({
									productId: createdProduct.id,
									url,
									sortOrder: index,
								})),
							});
						}
						await tx.product.update({
							where: { id: createdProduct.id },
							data: { imageUrl: persistedImageUrl ?? null },
						});
					});
				}

				if (hasAttributesColumn) {
					await syncProductAttributes(createdProduct.id, parsedAttributes);
				}

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
