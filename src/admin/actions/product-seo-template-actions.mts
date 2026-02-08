import type { ActionHandler, BulkActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

type SeoTemplatePayload = {
	mode: 'preview' | 'apply';
	metaTitleTemplate: string | null;
	metaDescriptionTemplate: string | null;
	canonicalTemplate: string | null;
	openGraphImageTemplate: string | null;
	overwriteExisting: boolean;
};

type SeoPreviewRow = {
	id: string;
	name: string;
	changedFields: string[];
	before: {
		metaTitle: string | null;
		metaDescription: string | null;
		canonicalUrl: string | null;
		openGraphImage: string | null;
	};
	after: {
		metaTitle: string | null;
		metaDescription: string | null;
		canonicalUrl: string | null;
		openGraphImage: string | null;
	};
};

type ProductSeoSnapshot = {
	id: string;
	name: string;
	productCode: string;
	slug: string;
	fullSlug: string;
	categoryName: string;
	subcategoryName: string;
	metaTitle: string | null;
	metaDescription: string | null;
	canonicalUrl: string | null;
	openGraphImage: string | null;
	brand: { name: string } | null;
};

const getMethod = (req: unknown) => String((req as { method?: unknown }).method ?? 'get').toLowerCase();

const normalizeTemplate = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const normalizeOutput = (value: string | null | undefined): string | null => {
	if (typeof value !== 'string') return null;
	const compact = value.replace(/\s+/g, ' ').trim();
	return compact.length > 0 ? compact : null;
};

const normalizeBoolean = (value: unknown) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') return value.toLowerCase() === 'true';
	return false;
};

const parsePayload = (payload: Record<string, unknown>): SeoTemplatePayload | null => {
	const modeRaw = typeof payload.mode === 'string' ? payload.mode.trim().toLowerCase() : '';
	if (modeRaw !== 'preview' && modeRaw !== 'apply') return null;

	return {
		mode: modeRaw,
		metaTitleTemplate: normalizeTemplate(payload.metaTitleTemplate),
		metaDescriptionTemplate: normalizeTemplate(payload.metaDescriptionTemplate),
		canonicalTemplate: normalizeTemplate(payload.canonicalTemplate),
		openGraphImageTemplate: normalizeTemplate(payload.openGraphImageTemplate),
		overwriteExisting: normalizeBoolean(payload.overwriteExisting),
	};
};

const renderTemplate = (template: string, product: ProductSeoSnapshot): string => {
	const data: Record<string, string> = {
		name: product.name ?? '',
		brand: product.brand?.name ?? '',
		category: product.categoryName ?? '',
		subcategory: product.subcategoryName ?? '',
		slug: product.slug ?? '',
		fullSlug: product.fullSlug ?? '',
		productCode: product.productCode ?? '',
		baseUrl: APP_URL,
		siteName: 'Online Store',
	};

	return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => data[key] ?? '');
};

const resolveNextFieldValue = ({
	current,
	template,
	product,
	overwriteExisting,
}: {
	current: string | null;
	template: string | null;
	product: ProductSeoSnapshot;
	overwriteExisting: boolean;
}) => {
	const normalizedCurrent = normalizeOutput(current);
	if (!template) {
		return {
			next: normalizedCurrent,
			changed: false,
		};
	}

	if (!overwriteExisting && normalizedCurrent) {
		return {
			next: normalizedCurrent,
			changed: false,
		};
	}

	const rendered = normalizeOutput(renderTemplate(template, product));
	return {
		next: rendered,
		changed: normalizeOutput(normalizedCurrent) !== normalizeOutput(rendered),
	};
};

const buildPreviewRows = (products: ProductSeoSnapshot[], config: SeoTemplatePayload) => {
	return products.map((product) => {
		const metaTitle = resolveNextFieldValue({
			current: product.metaTitle,
			template: config.metaTitleTemplate,
			product,
			overwriteExisting: config.overwriteExisting,
		});
		const metaDescription = resolveNextFieldValue({
			current: product.metaDescription,
			template: config.metaDescriptionTemplate,
			product,
			overwriteExisting: config.overwriteExisting,
		});
		const canonicalUrl = resolveNextFieldValue({
			current: product.canonicalUrl,
			template: config.canonicalTemplate,
			product,
			overwriteExisting: config.overwriteExisting,
		});
		const openGraphImage = resolveNextFieldValue({
			current: product.openGraphImage,
			template: config.openGraphImageTemplate,
			product,
			overwriteExisting: config.overwriteExisting,
		});

		const changedFields = [
			metaTitle.changed ? 'metaTitle' : null,
			metaDescription.changed ? 'metaDescription' : null,
			canonicalUrl.changed ? 'canonicalUrl' : null,
			openGraphImage.changed ? 'openGraphImage' : null,
		].filter(Boolean) as string[];

		return {
			id: product.id,
			name: product.name,
			changedFields,
			before: {
				metaTitle: normalizeOutput(product.metaTitle),
				metaDescription: normalizeOutput(product.metaDescription),
				canonicalUrl: normalizeOutput(product.canonicalUrl),
				openGraphImage: normalizeOutput(product.openGraphImage),
			},
			after: {
				metaTitle: metaTitle.next,
				metaDescription: metaDescription.next,
				canonicalUrl: canonicalUrl.next,
				openGraphImage: openGraphImage.next,
			},
		} satisfies SeoPreviewRow;
	});
};

export const bulkSeoTemplate: ActionHandler<BulkActionResponse> = async (req, _res, context) => {
	const { records, resource, currentAdmin } = context;
	if (!records || !resource) throw new Error('Missing record context');

	const method = getMethod(req);
	if (method === 'get') {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			payload: {
				placeholders: [
					'{name}',
					'{brand}',
					'{category}',
					'{subcategory}',
					'{slug}',
					'{fullSlug}',
					'{productCode}',
					'{baseUrl}',
					'{siteName}',
				],
				defaults: {
					metaTitleTemplate: '{name} | {category} | {siteName}',
					metaDescriptionTemplate:
						'Buy {name} in {category}. Fast delivery and official warranty.',
					canonicalTemplate: '{baseUrl}/{fullSlug}',
					openGraphImageTemplate: '',
				},
			},
		};
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const parsed = parsePayload(payload);
	if (!parsed) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-seo-template-invalid-mode', type: 'error' },
		};
	}

	const hasAnyTemplate =
		parsed.metaTitleTemplate ||
		parsed.metaDescriptionTemplate ||
		parsed.canonicalTemplate ||
		parsed.openGraphImageTemplate;

	if (!hasAnyTemplate) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-seo-template-no-template', type: 'error' },
		};
	}

	const ids = records
		.map((record) => record.param('id'))
		.filter((value): value is string => typeof value === 'string' && value.length > 0);

	if (!ids.length) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'bulk-no-records', type: 'error' },
		};
	}

	const products = await prisma.product.findMany({
		where: { id: { in: ids } },
		select: {
			id: true,
			name: true,
			productCode: true,
			slug: true,
			fullSlug: true,
			categoryName: true,
			subcategoryName: true,
			metaTitle: true,
			metaDescription: true,
			canonicalUrl: true,
			openGraphImage: true,
			brand: { select: { name: true } },
		},
		orderBy: { name: 'asc' },
	});

	const previewRows = buildPreviewRows(products as ProductSeoSnapshot[], parsed);
	const changedRows = previewRows.filter((row) => row.changedFields.length > 0);

	if (parsed.mode === 'preview') {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			payload: {
				results: previewRows,
				summary: {
					selected: products.length,
					changed: changedRows.length,
					updated: 0,
				},
			},
		};
	}

	if (!changedRows.length) {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-seo-template-no-changes', type: 'success' },
			payload: {
				results: previewRows,
				summary: {
					selected: products.length,
					changed: 0,
					updated: 0,
				},
			},
		};
	}

	try {
		await prisma.$transaction(
			changedRows.map((row) =>
				prisma.product.update({
					where: { id: row.id },
					data: {
						...(row.changedFields.includes('metaTitle') ? { metaTitle: row.after.metaTitle } : {}),
						...(row.changedFields.includes('metaDescription')
							? { metaDescription: row.after.metaDescription }
							: {}),
						...(row.changedFields.includes('canonicalUrl')
							? { canonicalUrl: row.after.canonicalUrl }
							: {}),
						...(row.changedFields.includes('openGraphImage')
							? { openGraphImage: row.after.openGraphImage }
							: {}),
					},
				})
			)
		);

		const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
		return {
			records: refreshed.filter(Boolean).map((record) => record!.toJSON(currentAdmin)),
			notice: {
				message: 'product-seo-template-updated',
				type: 'success',
				options: { count: changedRows.length },
			},
			payload: {
				results: previewRows,
				summary: {
					selected: products.length,
					changed: changedRows.length,
					updated: changedRows.length,
				},
			},
		};
	} catch {
		return {
			records: records.map((r) => r.toJSON(currentAdmin)),
			notice: { message: 'product-seo-template-failed', type: 'error' },
		};
	}
};
