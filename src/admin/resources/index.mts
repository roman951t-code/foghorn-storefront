import type { PrismaClient } from '@prisma/client';
import type {
	ActionContext,
	ActionHandler,
	ActionRequest,
	ActionResponse,
	After,
	ResourceOptions,
} from 'adminjs';
import { ValidationError } from 'adminjs';
import { prisma } from '../prisma.mts';
import { archiveProduct, duplicateProduct, publishProduct } from '../actions/product-actions.mts';
import { productVariantMatrix } from '../actions/product-variant-actions.mts';
import { scheduleDiscount } from '../actions/product-discount-actions.mts';
import { schedulePublish } from '../actions/product-publish-schedule-actions.mts';
import { deleteProduct } from '../actions/product-delete-actions.mts';
import { productKpis } from '../actions/product-kpi-actions.mts';
import { lowStockAlerts } from '../actions/product-low-stock-actions.mts';
import { productRelatedData } from '../actions/product-related-actions.mts';
import { exportProductsCsv, importProductsCsv } from '../actions/product-csv-actions.mts';
import { inventoryAdjustmentHistory } from '../actions/inventory-adjustment-actions.mts';
import {
	bulkAdjustPrice,
	bulkAdjustStock,
	bulkEditTags,
	bulkSetBrand,
	bulkSetCategory,
	bulkToggleInStock,
} from '../actions/product-bulk-actions.mts';
import { bulkSeoTemplate as bulkSeoTemplateHandler } from '../actions/product-seo-template-actions.mts';
import {
	bulkMarkDelivered,
	bulkMarkShipped,
	cancelOrder,
	deleteOrder,
	markDelivered,
	markPaid,
	markShipped,
	processReturn,
	setStatus,
} from '../actions/order-actions.mts';
import { financialBreakdown } from '../actions/order-financial-actions.mts';
import { orderItemsSummary } from '../actions/order-items-actions.mts';
import { auditTimeline } from '../actions/order-audit-actions.mts';
import { exportOrdersCsv } from '../actions/order-csv-actions.mts';
import { syncOrderTotalsAfterDiscountChange } from '../actions/order-discount-actions.mts';
import {
	captureProductAuditBeforeHook,
	productActivityTimeline,
	productAuditAfterHook,
} from '../actions/product-activity-actions.mts';
import { setFulfillment } from '../actions/order-fulfillment-actions.mts';
import { bulkPackingSlips, packingSlip } from '../actions/order-packing-slip-actions.mts';
import { bulkShippingLabels, shippingLabel } from '../actions/order-shipping-label-actions.mts';
import { attachUserListKpis, userKpis } from '../actions/user-kpi-actions.mts';
import { deleteUser } from '../actions/user-delete-actions.mts';
import { updateUserAdminMeta } from '../actions/user-admin-actions.mts';
import { revokeSession, userSessions } from '../actions/user-session-actions.mts';
import { userSegments } from '../actions/user-segmentation-actions.mts';
import { userRelatedData } from '../actions/user-related-actions.mts';
import { reviewProductSummary } from '../actions/review-actions.mts';
import { syncProductReviewAggregates } from '../lib/review-aggregates.mts';
import { duplicateBanner } from '../actions/banner-actions.mts';
import { revalidateStorefrontCacheTags } from '../actions/revalidate-cache-tags.mts';
import {
	PRODUCT_GALLERY_PRIMARY_URL_CONTEXT_KEY,
	PRODUCT_GALLERY_URLS_CONTEXT_KEY,
	validateProductNewEdit,
} from '../validation/product-admin-validation.mts';
import {
	cancelOrderActionComponent,
	orderAuditTimelineActionComponent,
	orderFulfillmentActionComponent,
	orderPackingSlipActionComponent,
	orderReturnActionComponent,
	orderBulkPackingSlipActionComponent,
	orderShippingLabelActionComponent,
	orderBulkShippingLabelActionComponent,
	orderCsvExportActionComponent,
	orderShowComponent,
	orderTotalListComponent,
	orderTotalRangeFilterComponent,
	selectFilterWithPlaceholderComponent,
	productScheduleDiscountActionComponent,
	productSchedulePublishActionComponent,
	productNameListComponent,
	productListComponent,
	orderListComponent,
	productShowComponent,
	productVariantMatrixComponent,
	productCsvImportExportActionComponent,
	productGalleryEditComponent,
	productTagsEditComponent,
	productNewComponent,
	productEditComponent,
	productActivityTimelineComponent,
	productBulkSetCategoryActionComponent,
	productBulkSetBrandActionComponent,
	productBulkEditTagsActionComponent,
	productBulkAdjustPriceActionComponent,
	productBulkAdjustStockActionComponent,
	productBulkToggleInStockActionComponent,
	productBulkSeoTemplateActionComponent,
	localizedTranslationsEditorComponent,
	userShowComponent,
	userSegmentsComponent,
	orderStatusActionComponent,
	reviewShowComponent,
} from '../config/components.mts';
import { modelMap } from '../config/model-map.mts';
import { disabled, hidden, readOnly, readOnlyActions } from '../config/property-options.mts';
import {
	type AdminTranslationLocale,
	type LocalizedResourceId,
	type LocalizedResourceDefinition,
} from '../constants/localization';
import * as localizationRuntime from '../constants/localization-runtime.mjs';

const ADMIN_TRANSLATION_LOCALES =
	localizationRuntime.ADMIN_TRANSLATION_LOCALES as readonly AdminTranslationLocale[];
const ADMIN_DEFAULT_TRANSLATION_LOCALE =
	localizationRuntime.ADMIN_DEFAULT_TRANSLATION_LOCALE as AdminTranslationLocale;
const LOCALIZED_RESOURCE_DEFINITIONS =
	localizationRuntime.LOCALIZED_RESOURCE_DEFINITIONS as Record<
		LocalizedResourceId,
		LocalizedResourceDefinition
	>;
const buildTranslationInputPath = (locale: AdminTranslationLocale, fieldKey: string) =>
	localizationRuntime.buildTranslationInputPath(locale, fieldKey);

type AdminRecordLike = {
	id?: unknown;
	params?: Record<string, unknown>;
	param?: (key: string) => unknown;
	[key: string]: unknown;
};
type AdminRequestLike = ActionRequest;
type AdminResponseLike = ActionResponse;
type AdminContextLike = ActionContext;

const mapAttributeSetItemPayload = async (request: AdminRequestLike) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, unknown>;
	const mapIdToReference = (idKey: string, relationKey: string) => {
		const idValue = next[idKey];
		if (typeof idValue === 'string' && idValue.trim()) {
			if (!next[relationKey]) {
				next[relationKey] = idValue;
			}
			delete next[idKey];
		}
	};
	mapIdToReference('attributeSetId', 'attributeSet');
	mapIdToReference('attributeId', 'attribute');
	if (next.sortOrder !== undefined) {
		const parsed = Number(next.sortOrder);
		next.sortOrder = Number.isFinite(parsed) ? parsed : 0;
	}
	return { ...request, payload: next };
};

const mapCouponPayload = async (request: AdminRequestLike) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, unknown>;
	const promotionId = next.promotionId;
	if (typeof promotionId === 'string' && promotionId.trim()) {
		if (!next.promotion) next.promotion = promotionId;
		delete next.promotionId;
	}
	return { ...request, payload: next };
};

const mapOrderDiscountPayload = async (request: AdminRequestLike) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, unknown>;
	const mapIdToReference = (idKey: string, relationKey: string) => {
		const idValue = next[idKey];
		if (typeof idValue === 'string' && idValue.trim()) {
			if (!next[relationKey]) {
				next[relationKey] = idValue;
			}
			delete next[idKey];
		}
	};
	mapIdToReference('orderId', 'order');
	mapIdToReference('promotionId', 'promotion');
	mapIdToReference('couponId', 'coupon');
	return { ...request, payload: next };
};

const mapProductImagePayload = async (request: AdminRequestLike) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, unknown>;
	const mapIdToReference = (idKey: string, relationKey: string) => {
		const idValue = next[idKey];
		if (typeof idValue === 'string' && idValue.trim()) {
			if (!next[relationKey]) {
				next[relationKey] = idValue;
			}
			delete next[idKey];
		}
	};
	mapIdToReference('productId', 'product');
	if (typeof next.sortOrder === 'string') {
		const parsed = Number(next.sortOrder);
		next.sortOrder = Number.isFinite(parsed) ? parsed : 0;
	}
	return { ...request, payload: next };
};

const withProductGallerySyncErrorNotice = (response: AdminResponseLike): AdminResponseLike => ({
	...response,
	notice: { message: 'product-gallery-sync-failed', type: 'error' },
});

const normalizeGalleryUrl = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized || null;
};

const normalizeGalleryUrls = (value: unknown): string[] | null => {
	if (!Array.isArray(value)) return null;
	const normalized = value
		.map((item) => normalizeGalleryUrl(item))
		.filter((item): item is string => Boolean(item));
	return Array.from(new Set(normalized));
};

const resolveProductIdForGallerySync = (
	response: AdminResponseLike,
	context: AdminContextLike
): string | null => {
	const fromResponse = response?.record?.params?.id;
	if (typeof fromResponse === 'string' && fromResponse.trim()) return fromResponse;
	const fromContext = context?.record?.param?.('id');
	if (typeof fromContext === 'string' && fromContext.trim()) return fromContext;
	return null;
};

const hydrateProductGalleryField = async (
	response: AdminResponseLike,
	request: AdminRequestLike,
	context: AdminContextLike
) => {
	const method = String(request?.method ?? 'get').toLowerCase();
	if (method !== 'get') return response;

	const recordId = context?.record?.param?.('id');
	if (typeof recordId !== 'string' || !recordId.trim()) return response;

	try {
		const images = await prisma.productImage.findMany({
			where: { productId: recordId },
			select: { url: true, sortOrder: true, createdAt: true },
			orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
		});
		const persistedPrimaryImageUrl = normalizeGalleryUrl(response?.record?.params?.imageUrl);
		const galleryUrlList = images.map((image) => image.url).filter(Boolean);
		if (galleryUrlList.length === 0 && persistedPrimaryImageUrl) {
			galleryUrlList.push(persistedPrimaryImageUrl);
		}
		const galleryUrls = galleryUrlList.join('\n');
		const primaryGalleryUrl =
			persistedPrimaryImageUrl && galleryUrlList.includes(persistedPrimaryImageUrl)
				? persistedPrimaryImageUrl
				: galleryUrlList[0] ?? null;
		if (response?.record && typeof response.record === 'object') {
			response.record.params = {
				...(response.record.params ?? {}),
				galleryUrls,
				primaryGalleryUrl: primaryGalleryUrl ?? '',
			};
		}
	} catch {
		// never block form rendering on gallery read errors
	}

	return response;
};

const syncProductGalleryAfterHook = async (
	response: AdminResponseLike,
	request: AdminRequestLike,
	context: AdminContextLike
) => {
	const method = String(request?.method ?? 'get').toLowerCase();
	if (method !== 'post') return response;
	if (response?.notice?.type === 'error') return response;

	const galleryUrlsFromContext = normalizeGalleryUrls(context?.[PRODUCT_GALLERY_URLS_CONTEXT_KEY]);
	const hasGalleryUrlsUpdate = galleryUrlsFromContext !== null;
	const rawPrimaryGalleryUrl = context?.[PRODUCT_GALLERY_PRIMARY_URL_CONTEXT_KEY];
	const hasPrimaryGalleryUrlUpdate = rawPrimaryGalleryUrl !== undefined;
	if (!hasGalleryUrlsUpdate && !hasPrimaryGalleryUrlUpdate) return response;

	const productId = resolveProductIdForGallerySync(response, context);
	if (!productId) return response;

	try {
		const baseGalleryUrls = hasGalleryUrlsUpdate
			? (galleryUrlsFromContext ?? [])
			: (
					await prisma.productImage.findMany({
						where: { productId },
						select: { url: true, sortOrder: true, createdAt: true },
						orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
					})
				)
					.map((image) => image.url)
					.filter((url) => Boolean(url));
		const nextPrimaryCandidate = normalizeGalleryUrl(rawPrimaryGalleryUrl);
		const primaryImageUrl =
			nextPrimaryCandidate && baseGalleryUrls.includes(nextPrimaryCandidate)
				? nextPrimaryCandidate
				: baseGalleryUrls[0] ?? null;
		const orderedGalleryUrls = primaryImageUrl
			? [primaryImageUrl, ...baseGalleryUrls.filter((url) => url !== primaryImageUrl)]
			: baseGalleryUrls;

		await prisma.$transaction(async (tx) => {
			await tx.productImage.deleteMany({ where: { productId } });
			if (orderedGalleryUrls.length > 0) {
				await tx.productImage.createMany({
					data: orderedGalleryUrls.map((url, index) => ({
						productId,
						url,
						sortOrder: index,
					})),
				});
			}
			await tx.product.update({
				where: { id: productId },
				data: { imageUrl: primaryImageUrl },
			});
		});
		return response;
	} catch {
		return withProductGallerySyncErrorNotice(response);
	}
};

const productEditAfterHook = async (
	response: AdminResponseLike,
	request: AdminRequestLike,
	context: AdminContextLike
) => {
	const withAudit = (await productAuditAfterHook(response, request, context)) as ActionResponse;
	const withHydratedGalleryField = await hydrateProductGalleryField(withAudit, request, context);
	const withGallerySynced = await syncProductGalleryAfterHook(
		withHydratedGalleryField,
		request,
		context
	);
	return localizedAfterHook(withGallerySynced, request, context);
};

type AdminResource = {
	resource: { model: unknown; client: PrismaClient };
	options: ResourceOptions;
};

const buildResource = (model: unknown, options: ResourceOptions): AdminResource => ({
	resource: { model, client: prisma },
	options,
});

const maybeResource = (model: unknown, options: ResourceOptions): AdminResource | null =>
	model ? buildResource(model, options) : null;

const isOrderStatus = (record: { param: (key: string) => unknown } | undefined, status: string) =>
	String(record?.param('status') ?? '') === status;

const LOCALIZED_TRANSLATIONS_CONTEXT_KEY = '__localizedTranslationsPayload';

const getRequestMethod = (request: AdminRequestLike) => String(request?.method ?? 'get').toLowerCase();

const normalizeLocalizedValue = (value: unknown): string | null | undefined => {
	if (value === undefined) return undefined;
	if (value == null) return null;
	if (typeof value !== 'string') return String(value);
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const getLocalizedResourceDefinition = (
	resourceId: string
): LocalizedResourceDefinition | null => {
	if (resourceId === 'Product') return LOCALIZED_RESOURCE_DEFINITIONS.Product;
	if (resourceId === 'ProductCategory') return LOCALIZED_RESOURCE_DEFINITIONS.ProductCategory;
	if (resourceId === 'Banner') return LOCALIZED_RESOURCE_DEFINITIONS.Banner;
	if (resourceId === 'Page') return LOCALIZED_RESOURCE_DEFINITIONS.Page;
	return null;
};

type LocaleFieldPatch = Record<string, string | null | undefined>;
type LocalizedPayloadByLocale = Partial<Record<AdminTranslationLocale, LocaleFieldPatch>>;

const collectLocalizedPayload = (
	payload: Record<string, unknown>,
	baseParams: Record<string, unknown>,
	definition: LocalizedResourceDefinition
) => {
	const nextPayload: Record<string, unknown> = { ...payload };
	const localizedByLocale: LocalizedPayloadByLocale = {};
	const propertyErrors: Record<string, { message: string; type: string }> = {};

	for (const locale of ADMIN_TRANSLATION_LOCALES) {
		const localePatch: LocaleFieldPatch = {};
		for (const field of definition.fields) {
			const path = buildTranslationInputPath(locale, field.key);
			const payloadValue = normalizeLocalizedValue(payload[path]);
			const existingVirtual = normalizeLocalizedValue(baseParams[path]);
			const existingBase = normalizeLocalizedValue(baseParams[field.baseField]);
			const resolvedValue =
				payloadValue !== undefined
					? payloadValue
					: existingVirtual !== undefined
						? existingVirtual
						: existingBase;

			if (locale === ADMIN_DEFAULT_TRANSLATION_LOCALE && field.requiredInDefaultLocale) {
				if (!resolvedValue) {
					propertyErrors[path] = {
						message: 'translation-validation-default-required',
						type: 'validation',
					};
				}
			}

			if (locale === ADMIN_DEFAULT_TRANSLATION_LOCALE) {
				localePatch[field.key] = resolvedValue;
				if (resolvedValue !== undefined) {
					nextPayload[field.baseField] = resolvedValue;
				}
			} else {
				localePatch[field.key] =
					payloadValue !== undefined || existingVirtual !== undefined
						? resolvedValue
						: undefined;
			}

			delete nextPayload[path];
		}
		localizedByLocale[locale] = localePatch;
	}

	delete nextPayload[definition.editorProperty];

	return { nextPayload, localizedByLocale, propertyErrors };
};

const getResponseRecordId = (response: AdminResponseLike, context: AdminContextLike): string | null => {
	const fromResponse = response?.record?.params?.id;
	if (typeof fromResponse === 'string' && fromResponse.trim()) return fromResponse;
	const fromContext = context?.record?.param?.('id');
	if (typeof fromContext === 'string' && fromContext.trim()) return fromContext;
	return null;
};

const getRecordId = (record: AdminRecordLike | undefined): string | null => {
	const id = record?.id ?? record?.params?.id;
	return typeof id === 'string' && id.trim() ? id : null;
};

type CacheRevalidationArgs = {
	response: AdminResponseLike;
	request: AdminRequestLike;
	context: AdminContextLike;
};

type CacheTagsResolver = (
	args: CacheRevalidationArgs
) => Array<string | null | undefined> | Promise<Array<string | null | undefined>>;

type CacheRevalidationGuard = (args: CacheRevalidationArgs) => boolean;

const PRODUCT_CACHE_REVALIDATE_TAGS = [
	'products',
	'product-by-slug',
	'product-categories',
	'product-filters',
	'product-catalog',
] as const;
const PRODUCT_CATEGORY_CACHE_REVALIDATE_TAGS = [
	'product-categories',
	'product-catalog',
	'products',
] as const;

const PAGE_CACHE_TAG = 'pages';
const PROMO_CACHE_TAG = 'promo-cards';
const STOREFRONT_FORMS_CACHE_TAG = 'storefront-forms';

const normalizeCacheValue = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const addNormalizedValue = (set: Set<string>, value: unknown) => {
	if (Array.isArray(value)) {
		value.forEach((entry) => addNormalizedValue(set, entry));
		return;
	}
	const normalized = normalizeCacheValue(value);
	if (normalized) {
		set.add(normalized);
	}
};

const addRecordValueByKey = (set: Set<string>, record: AdminRecordLike | undefined, key: string) => {
	if (!record) return;
	if (typeof record?.param === 'function') {
		addNormalizedValue(set, record.param(key));
	}
	addNormalizedValue(set, record?.params?.[key]);
	addNormalizedValue(set, record?.[key]);
};

const collectMutationFieldValues = (
	key: string,
	args: CacheRevalidationArgs,
	options: { includeRequestPayload?: boolean } = {}
) => {
	const values = new Set<string>();
	addRecordValueByKey(values, args.response?.record as unknown as AdminRecordLike, key);
	if (Array.isArray(args.response?.records)) {
		args.response.records.forEach((record) =>
			addRecordValueByKey(values, record as unknown as AdminRecordLike, key)
		);
	}
	addRecordValueByKey(values, args.context?.record as unknown as AdminRecordLike, key);
	if (Array.isArray(args.context?.records)) {
		args.context.records.forEach((record) =>
			addRecordValueByKey(values, record as unknown as AdminRecordLike, key)
		);
	}
	if (options.includeRequestPayload) {
		addNormalizedValue(values, args.request?.payload?.[key]);
	}
	return Array.from(values);
};

const getProductTagById = (productId: string) => `product:${productId}`;

const getProductMutationTags = (args: CacheRevalidationArgs) => {
	const productIds = collectMutationFieldValues('id', args);
	return [...PRODUCT_CACHE_REVALIDATE_TAGS, ...productIds.map(getProductTagById)];
};

const getReviewMutationTags = (args: CacheRevalidationArgs) => {
	const productIds = collectMutationFieldValues('productId', args, {
		includeRequestPayload: true,
	});
	return [...PRODUCT_CACHE_REVALIDATE_TAGS, ...productIds.map(getProductTagById)];
};

const getProductCategoryMutationTags = () => [...PRODUCT_CATEGORY_CACHE_REVALIDATE_TAGS];

const getPageMutationTags = (args: CacheRevalidationArgs) => {
	const slugs = collectMutationFieldValues('slug', args, { includeRequestPayload: true });
	return [PAGE_CACHE_TAG, ...slugs.map((slug) => `page:${slug}`)];
};

const getBannerMutationTags = () => [PROMO_CACHE_TAG];

const getStorefrontFormMutationTags = (args: CacheRevalidationArgs) => {
	const placements = collectMutationFieldValues('placement', args, { includeRequestPayload: true });
	return [
		STOREFRONT_FORMS_CACHE_TAG,
		...placements.map((placement) => `${STOREFRONT_FORMS_CACHE_TAG}:${placement}`),
	];
};

const shouldRevalidateForSuccessfulPost = ({ request, response }: CacheRevalidationArgs) =>
	getRequestMethod(request) === 'post' && response?.notice?.type !== 'error';

const runStorefrontTagRevalidation = async (
	resolveTags: CacheTagsResolver,
	args: CacheRevalidationArgs
) => {
	try {
		const tags = await resolveTags(args);
		await revalidateStorefrontCacheTags(tags);
	} catch (error) {
		console.error('[admin-cache] Failed to resolve revalidation tags', error);
	}
};

const withCacheRevalidationAfter = <T extends ActionResponse>(
	afterHook: After<T>,
	resolveTags: CacheTagsResolver,
	shouldRevalidate?: CacheRevalidationGuard
) => {
	return async (response: T, request: ActionRequest, context: ActionContext): Promise<T> => {
		const nextResponse = await afterHook(response, request, context);
		const args: CacheRevalidationArgs = {
			response: nextResponse as ActionResponse,
			request,
			context,
		};
		if (!shouldRevalidateForSuccessfulPost(args)) return nextResponse;
		if (shouldRevalidate && !shouldRevalidate(args)) return nextResponse;
		await runStorefrontTagRevalidation(resolveTags, args);
		return nextResponse;
	};
};

const syncReviewAggregatesAfter = async (
	response: AdminResponseLike,
	request: AdminRequestLike,
	context: AdminContextLike
) => {
	const args: CacheRevalidationArgs = { response, request, context };
	if (!shouldRevalidateForSuccessfulPost(args)) return response;

	const productIds = collectMutationFieldValues('productId', args, {
		includeRequestPayload: true,
	});
	if (productIds.length === 0) return response;

	try {
		await syncProductReviewAggregates(prisma, productIds);
	} catch (error) {
		console.error('[admin-review] Failed to sync review aggregates', error);
	}

	return response;
};

const reviewMutationAfterHook = withCacheRevalidationAfter(
	syncReviewAggregatesAfter,
	getReviewMutationTags
);

const withCacheRevalidationHandler = <T extends ActionResponse>(
	handler: ActionHandler<T>,
	resolveTags: CacheTagsResolver,
	shouldRevalidate?: CacheRevalidationGuard
) => {
	return async (request: ActionRequest, response: unknown, context: ActionContext): Promise<T> => {
		const nextResponse = await handler(request, response, context);
		const args: CacheRevalidationArgs = {
			response: nextResponse as ActionResponse,
			request,
			context,
		};
		if (!shouldRevalidateForSuccessfulPost(args)) return nextResponse;
		if (shouldRevalidate && !shouldRevalidate(args)) return nextResponse;
		await runStorefrontTagRevalidation(resolveTags, args);
		return nextResponse;
	};
};

const shouldRevalidateSeoTemplateApply = ({ request }: CacheRevalidationArgs) =>
	String(request?.payload?.mode ?? '').toLowerCase() === 'apply';

const shouldRevalidateImportCsvApply = ({ request }: CacheRevalidationArgs) =>
	String(request?.payload?.dryRun ?? 'false').toLowerCase() !== 'true';

const readLocalizedRows = async (
	resourceId: LocalizedResourceId,
	recordIds: string[]
) => {
	if (recordIds.length === 0) {
		return [] as Array<Record<string, string | null>>;
	}

	if (resourceId === 'Product') {
		return prisma.productTranslation.findMany({
			where: { productId: { in: recordIds }, locale: { in: [...ADMIN_TRANSLATION_LOCALES] } },
			select: {
				productId: true,
				locale: true,
				name: true,
				description: true,
				guarantee: true,
				metaTitle: true,
				metaDescription: true,
			},
		});
	}
	if (resourceId === 'ProductCategory') {
		return prisma.productCategoryTranslation.findMany({
			where: { categoryId: { in: recordIds }, locale: { in: [...ADMIN_TRANSLATION_LOCALES] } },
			select: {
				categoryId: true,
				locale: true,
				name: true,
			},
		});
	}
	if (resourceId === 'Banner') {
		return prisma.bannerTranslation.findMany({
			where: { bannerId: { in: recordIds }, locale: { in: [...ADMIN_TRANSLATION_LOCALES] } },
			select: {
				bannerId: true,
				locale: true,
				title: true,
				subtitle: true,
				linkLabel: true,
			},
		});
	}
	return prisma.pageTranslation.findMany({
		where: { pageId: { in: recordIds }, locale: { in: [...ADMIN_TRANSLATION_LOCALES] } },
		select: {
			pageId: true,
			locale: true,
			title: true,
			excerpt: true,
			content: true,
			metaTitle: true,
			metaDescription: true,
		},
	});
};

const mapRowEntityId = (resourceId: LocalizedResourceId, row: Record<string, unknown>): string => {
	if (resourceId === 'Product') return String(row.productId ?? '');
	if (resourceId === 'ProductCategory') return String(row.categoryId ?? '');
	if (resourceId === 'Banner') return String(row.bannerId ?? '');
	return String(row.pageId ?? '');
};

const formatTranslationCompleteness = (
	definition: LocalizedResourceDefinition,
	recordParams: Record<string, unknown>,
	rowsByLocale: Map<string, Record<string, unknown>>
) => {
	const states = ADMIN_TRANSLATION_LOCALES.map((locale) => {
		const row = rowsByLocale.get(locale);
		const primaryField = definition.primaryFieldKey;
		const primaryFromTranslation = normalizeLocalizedValue(row?.[primaryField]);
		const primaryFromBase = normalizeLocalizedValue(
			recordParams[definition.fields.find((field) => field.key === primaryField)?.baseField ?? primaryField]
		);
		const isComplete =
			locale === ADMIN_DEFAULT_TRANSLATION_LOCALE
				? Boolean(primaryFromTranslation ?? primaryFromBase)
				: Boolean(primaryFromTranslation);
		return `${locale.toUpperCase()}: ${isComplete ? 'ok' : 'missing'}`;
	});

	return states.join(' | ');
};

const applyLocalizationToRecord = (
	resourceId: LocalizedResourceId,
	record: AdminRecordLike,
	definition: LocalizedResourceDefinition,
	rows: Array<Record<string, unknown>>
) => {
	const recordId = getRecordId(record);
	if (!recordId) return;
	const recordRows = rows.filter((row) => mapRowEntityId(resourceId, row) === recordId);
	const rowsByLocale = new Map(
		recordRows.map((row) => [String(row.locale), row] as [string, Record<string, unknown>])
	);
	const nextParams = { ...(record.params ?? {}) } as Record<string, unknown>;

	for (const locale of ADMIN_TRANSLATION_LOCALES) {
		const row = rowsByLocale.get(locale);
		for (const field of definition.fields) {
			const path = buildTranslationInputPath(locale, field.key);
			const fallbackBaseValue =
				locale === ADMIN_DEFAULT_TRANSLATION_LOCALE
					? normalizeLocalizedValue(nextParams[field.baseField]) ?? ''
					: '';
			const value = normalizeLocalizedValue(row?.[field.key]);
			nextParams[path] = value ?? fallbackBaseValue;
		}
	}

	nextParams[definition.completenessProperty] = formatTranslationCompleteness(
		definition,
		nextParams,
		rowsByLocale
	);
	record.params = nextParams;
};

const syncLocalizedTranslationsAfterSave = async (
	resourceId: LocalizedResourceId,
	recordId: string,
	definition: LocalizedResourceDefinition,
	patchByLocale: LocalizedPayloadByLocale
) => {
	const primaryField = definition.primaryFieldKey;

	const runForProduct = async (locale: AdminTranslationLocale, data: Record<string, unknown>) => {
		const primaryValue = normalizeLocalizedValue(data[primaryField]);
		if (locale !== ADMIN_DEFAULT_TRANSLATION_LOCALE && !primaryValue) {
			await prisma.productTranslation.deleteMany({
				where: { productId: recordId, locale },
			});
			return;
		}

		await prisma.productTranslation.upsert({
			where: {
				productId_locale: {
					productId: recordId,
					locale,
				},
			},
			update: data as any,
			create: {
				productId: recordId,
				locale,
				...data,
			} as any,
		});
	};

	const runForCategory = async (locale: AdminTranslationLocale, data: Record<string, unknown>) => {
		const primaryValue = normalizeLocalizedValue(data[primaryField]);
		if (locale !== ADMIN_DEFAULT_TRANSLATION_LOCALE && !primaryValue) {
			await prisma.productCategoryTranslation.deleteMany({
				where: { categoryId: recordId, locale },
			});
			return;
		}

		await prisma.productCategoryTranslation.upsert({
			where: {
				categoryId_locale: {
					categoryId: recordId,
					locale,
				},
			},
			update: data as any,
			create: {
				categoryId: recordId,
				locale,
				...data,
			} as any,
		});
	};

	const runForBanner = async (locale: AdminTranslationLocale, data: Record<string, unknown>) => {
		const primaryValue = normalizeLocalizedValue(data[primaryField]);
		if (locale !== ADMIN_DEFAULT_TRANSLATION_LOCALE && !primaryValue) {
			await prisma.bannerTranslation.deleteMany({
				where: { bannerId: recordId, locale },
			});
			return;
		}

		await prisma.bannerTranslation.upsert({
			where: {
				bannerId_locale: {
					bannerId: recordId,
					locale,
				},
			},
			update: data as any,
			create: {
				bannerId: recordId,
				locale,
				...data,
			} as any,
		});
	};

	const runForPage = async (locale: AdminTranslationLocale, data: Record<string, unknown>) => {
		const primaryValue = normalizeLocalizedValue(data[primaryField]);
		if (locale !== ADMIN_DEFAULT_TRANSLATION_LOCALE && !primaryValue) {
			await prisma.pageTranslation.deleteMany({
				where: { pageId: recordId, locale },
			});
			return;
		}

		await prisma.pageTranslation.upsert({
			where: {
				pageId_locale: {
					pageId: recordId,
					locale,
				},
			},
			update: data as any,
			create: {
				pageId: recordId,
				locale,
				...data,
			} as any,
		});
	};

	for (const locale of ADMIN_TRANSLATION_LOCALES) {
		const localePatch = patchByLocale[locale] ?? {};
		const data: Record<string, unknown> = {};
		for (const field of definition.fields) {
			const value = localePatch[field.key];
			if (value !== undefined) {
				data[field.key] = value;
			}
		}

		if (Object.keys(data).length === 0) continue;

		if (resourceId === 'Product') {
			await runForProduct(locale, data);
		} else if (resourceId === 'ProductCategory') {
			await runForCategory(locale, data);
		} else if (resourceId === 'Banner') {
			await runForBanner(locale, data);
		} else {
			await runForPage(locale, data);
		}
	}
};

const localizedBeforeHook = async (
	request: AdminRequestLike,
	context: AdminContextLike,
	resourceId: LocalizedResourceId
) => {
	const method = getRequestMethod(request);
	if (method !== 'post') return request;

	const payload = (request?.payload ?? {}) as Record<string, unknown>;
		const baseParams = (context.record?.params ?? {}) as Record<string, unknown>;
	const definition = getLocalizedResourceDefinition(resourceId);
	if (!definition) return request;

	const { nextPayload, localizedByLocale, propertyErrors } = collectLocalizedPayload(
		payload,
		baseParams,
		definition
	);

		if (Object.keys(propertyErrors).length > 0) {
			throw new ValidationError(propertyErrors, {
				message: 'translation-validation-error',
				type: 'validationError',
			});
		}

	(context as Record<string, unknown>)[LOCALIZED_TRANSLATIONS_CONTEXT_KEY] = {
		resourceId,
		localizedByLocale,
	};

	return {
		...request,
		payload: nextPayload,
	};
};

const localizedAfterHook = async (
	response: AdminResponseLike,
	request: AdminRequestLike,
	context: AdminContextLike
) => {
	const resourceId = String(context?.resource?._decorated?.id?.() ?? context?.resource?.id ?? '');
	const definition = getLocalizedResourceDefinition(resourceId);
	if (!definition) return response;
	const typedResourceId = definition.resourceId;
	const method = getRequestMethod(request);

	if (method === 'post' && response?.notice?.type !== 'error') {
		const recordId = getResponseRecordId(response, context);
		const localizedPayload = (
			context?.[LOCALIZED_TRANSLATIONS_CONTEXT_KEY] as
				| { resourceId: LocalizedResourceId; localizedByLocale: LocalizedPayloadByLocale }
				| undefined
		)?.localizedByLocale;

		if (recordId && localizedPayload) {
			await syncLocalizedTranslationsAfterSave(
				typedResourceId,
				recordId,
				definition,
				localizedPayload
			);
		}

		const args: CacheRevalidationArgs = { response, request, context };
		if (typedResourceId === 'Product') {
			await runStorefrontTagRevalidation(getProductMutationTags, args);
		} else if (typedResourceId === 'ProductCategory') {
			await runStorefrontTagRevalidation(getProductCategoryMutationTags, args);
		} else if (typedResourceId === 'Page') {
			await runStorefrontTagRevalidation(getPageMutationTags, args);
		} else if (typedResourceId === 'Banner') {
			await runStorefrontTagRevalidation(getBannerMutationTags, args);
		}
	}

	if (response?.record) {
		const recordId = getRecordId(response.record as unknown as AdminRecordLike);
		if (recordId) {
			const rows = await readLocalizedRows(typedResourceId, [recordId]);
			applyLocalizationToRecord(
				typedResourceId,
				response.record as unknown as AdminRecordLike,
				definition,
				rows
			);
		}
	}

	if (Array.isArray(response?.records) && response.records.length > 0) {
		const recordIds = response.records
			.map((record) => getRecordId(record as unknown as AdminRecordLike))
			.filter((id: string | null): id is string => Boolean(id));
		if (recordIds.length > 0) {
			const rows = await readLocalizedRows(typedResourceId, recordIds);
			response.records.forEach((record) => {
				applyLocalizationToRecord(
					typedResourceId,
					record as unknown as AdminRecordLike,
					definition,
					rows
				);
			});
		}
	}

	return response;
};

const buildLocalizedHiddenProperties = (definition: LocalizedResourceDefinition) =>
	Object.fromEntries(
		ADMIN_TRANSLATION_LOCALES.flatMap((locale) =>
			definition.fields.map((field) => [
				buildTranslationInputPath(locale, field.key),
				{ isVisible: false },
			])
		)
	);

const buildLocalizedEditorProperty = (definition: LocalizedResourceDefinition) => ({
	isVisible: { list: false, filter: false, show: false, edit: true },
	components: { edit: localizedTranslationsEditorComponent },
	custom: {
		defaultLocale: ADMIN_DEFAULT_TRANSLATION_LOCALE,
		locales: [...ADMIN_TRANSLATION_LOCALES],
		fields: definition.fields.map((field) => ({
			key: field.key,
			label: field.label,
			input: field.input,
			requiredInDefaultLocale: Boolean(field.requiredInDefaultLocale),
		})),
		title: definition.editorTitle,
	},
});

export const resources = [
	{
		resource: { model: modelMap.Product, client: prisma },
		options: {
			navigation: 'Catalog',
			sort: {
				sortBy: 'updatedAt',
				direction: 'desc',
			},
				listProperties: [
					'name',
					'productCode',
					'status',
					'basePrice',
					'discountPrice',
					'currency',
					'stock',
					'inStock',
					'brand',
					'category',
					'translationCompleteness',
					'updatedAt',
				],
			filterProperties: [
				'name',
				'productCode',
				'status',
				'brand',
				'category',
				'currency',
				'inStock',
				'stock',
				'basePrice',
				'discountPrice',
				'discountStartAt',
				'discountEndAt',
				'publishStartAt',
				'publishEndAt',
				'tags',
				'updatedAt',
			],
				properties: {
					id: hidden,
					name: {
						components: { list: productNameListComponent },
						isTitle: true,
						isVisible: { list: true, filter: true, show: true, edit: false },
					},
					description: { isVisible: { list: false, filter: false, show: true, edit: false } },
					guarantee: { isVisible: { list: false, filter: false, show: true, edit: false } },
					metaTitle: { isVisible: { list: false, filter: false, show: true, edit: false } },
					metaDescription: { isVisible: { list: false, filter: false, show: true, edit: false } },
					canonicalUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
					openGraphImage: { isVisible: { list: false, filter: false, show: true, edit: true } },
					categoryName: { isVisible: { list: false, filter: false, show: true, edit: false } },
					subcategoryName: { isVisible: { list: false, filter: false, show: true, edit: false } },
					translationCompleteness: { isVisible: { list: true, filter: false, show: true, edit: false } },
					localizedContentEditor: buildLocalizedEditorProperty(
						LOCALIZED_RESOURCE_DEFINITIONS.Product
					),
					basePrice: { type: 'currency' },
					discountPrice: { type: 'currency' },
				currency: {
					isRequired: true,
					availableValues: [{ value: 'USD', label: 'USD' }],
				},
				discountStartAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
				discountEndAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
				publishStartAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
				publishEndAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
				imageUrl: { isVisible: { list: false, filter: false, show: true, edit: false } },
				primaryGalleryUrl: { isVisible: { list: false, filter: false, show: false, edit: false } },
				galleryUrls: {
					components: { edit: productGalleryEditComponent },
					isVisible: { list: false, filter: false, show: false, edit: true },
					description: 'product-hint-galleryUrls',
				},
				averageRating: { isVisible: { edit: false } },
				reviewCount: { isVisible: { edit: false } },
				fullSlug: { isVisible: { edit: false } },
				tags: {
					components: { edit: productTagsEditComponent },
				},
				status: {
					isVisible: { list: true, filter: true, show: true, edit: false },
					availableValues: [
						{ value: 'DRAFT', label: 'Draft' },
						{ value: 'ACTIVE', label: 'Active' },
						{ value: 'ARCHIVED', label: 'Archived' },
					],
					components: { filter: selectFilterWithPlaceholderComponent },
				},
					createdAt: readOnly,
					updatedAt: readOnly,
					...buildLocalizedHiddenProperties(LOCALIZED_RESOURCE_DEFINITIONS.Product),
				},
				actions: {
					delete: { isAccessible: false, isVisible: false },
					bulkDelete: { isAccessible: false, isVisible: false },
					list: {
						actionType: 'resource',
						component: productListComponent,
						after: localizedAfterHook,
					},
				bulkSetCategory: {
					actionType: 'bulk',
					icon: 'Tag',
					guard: 'product-bulk-set-category',
					component: productBulkSetCategoryActionComponent,
					handler: withCacheRevalidationHandler(bulkSetCategory, getProductMutationTags),
				},
				bulkSetBrand: {
					actionType: 'bulk',
					icon: 'Tag',
					guard: 'product-bulk-set-brand',
					component: productBulkSetBrandActionComponent,
					handler: withCacheRevalidationHandler(bulkSetBrand, getProductMutationTags),
				},
				bulkEditTags: {
					actionType: 'bulk',
					icon: 'Edit',
					guard: 'product-bulk-edit-tags',
					component: productBulkEditTagsActionComponent,
					handler: withCacheRevalidationHandler(bulkEditTags, getProductMutationTags),
				},
				bulkAdjustPrice: {
					actionType: 'bulk',
					icon: 'DollarSign',
					guard: 'product-bulk-adjust-price',
					component: productBulkAdjustPriceActionComponent,
					handler: withCacheRevalidationHandler(bulkAdjustPrice, getProductMutationTags),
				},
				bulkAdjustStock: {
					actionType: 'bulk',
					icon: 'Package',
					guard: 'product-bulk-adjust-stock',
					component: productBulkAdjustStockActionComponent,
					handler: withCacheRevalidationHandler(bulkAdjustStock, getProductMutationTags),
				},
				bulkToggleInStock: {
					actionType: 'bulk',
					icon: 'Package',
					guard: 'product-bulk-toggle-instock',
					component: productBulkToggleInStockActionComponent,
					handler: withCacheRevalidationHandler(bulkToggleInStock, getProductMutationTags),
				},
				bulkSeoTemplate: {
					actionType: 'bulk',
					icon: 'Search',
					component: productBulkSeoTemplateActionComponent,
					handler: withCacheRevalidationHandler(
						bulkSeoTemplateHandler,
						getProductMutationTags,
						shouldRevalidateSeoTemplateApply
					),
				},
					new: {
						before: async (request: any, context: any) => {
							const withLocalization = await localizedBeforeHook(request, context, 'Product');
							return validateProductNewEdit(withLocalization, context);
						},
						after: async (response: any, request: any, context: any) => {
							const withGallery = await syncProductGalleryAfterHook(response, request, context);
							return localizedAfterHook(withGallery, request, context);
						},
						component: productNewComponent,
					},
					edit: {
						before: async (request: any, context: any) => {
							await captureProductAuditBeforeHook(request, context);
							const withLocalization = await localizedBeforeHook(request, context, 'Product');
							return validateProductNewEdit(withLocalization, context);
						},
						after: productEditAfterHook,
						component: productEditComponent,
				},
				show: {
					actionType: 'record',
					component: productShowComponent,
						custom: {
							previewBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
						},
						after: localizedAfterHook,
					},
				activityTimeline: {
					actionType: 'record',
					icon: 'Activity',
					component: productActivityTimelineComponent,
					handler: productActivityTimeline,
				},
				variantMatrix: {
					actionType: 'record',
					icon: 'Grid',
					component: productVariantMatrixComponent,
					handler: withCacheRevalidationHandler(productVariantMatrix, getProductMutationTags),
				},
				importProductsCsv: {
					actionType: 'resource',
					icon: 'Upload',
					component: productCsvImportExportActionComponent,
					handler: withCacheRevalidationHandler(
						importProductsCsv,
						getProductMutationTags,
						shouldRevalidateImportCsvApply
					),
				},
				exportProductsCsv: {
					actionType: 'resource',
					isVisible: false,
					component: false,
					handler: exportProductsCsv,
				},
				productKpis: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: productKpis,
				},
				lowStockAlerts: {
					actionType: 'resource',
					isVisible: false,
					component: false,
					handler: lowStockAlerts,
				},
				productRelatedData: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: productRelatedData,
				},
				inventoryAdjustments: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: inventoryAdjustmentHistory,
				},
				publishProduct: {
					actionType: 'record',
					icon: 'CheckCircle',
					guard: 'publish-product',
					isVisible: ({ record }: { record?: any }) =>
						String(record?.param('status') ?? 'DRAFT') !== 'ACTIVE',
					handler: withCacheRevalidationHandler(publishProduct, getProductMutationTags),
					component: false,
				},
				archiveProduct: {
					actionType: 'record',
					icon: 'Archive',
					guard: 'archive-product',
					isVisible: ({ record }: { record?: any }) =>
						String(record?.param('status') ?? 'DRAFT') !== 'ARCHIVED',
					handler: withCacheRevalidationHandler(archiveProduct, getProductMutationTags),
					component: false,
				},
				duplicateProduct: {
					actionType: 'record',
					icon: 'Copy',
					guard: 'duplicate-product',
					handler: withCacheRevalidationHandler(duplicateProduct, getProductMutationTags),
					component: false,
				},
				scheduleDiscount: {
					actionType: 'record',
					icon: 'Calendar',
					guard: 'schedule-discount',
					handler: withCacheRevalidationHandler(scheduleDiscount, getProductMutationTags),
					component: productScheduleDiscountActionComponent,
				},
				schedulePublish: {
					actionType: 'record',
					icon: 'Calendar',
					guard: 'schedule-publish',
					handler: withCacheRevalidationHandler(schedulePublish, getProductMutationTags),
					component: productSchedulePublishActionComponent,
				},
				deleteProduct: {
					actionType: 'record',
					icon: 'Trash',
					guard: 'delete-product',
					handler: withCacheRevalidationHandler(deleteProduct, getProductMutationTags),
					component: false,
				},
			},
		},
	},
	{
		resource: { model: modelMap.ProductCategory, client: prisma },
		options: {
			navigation: 'Catalog',
			listProperties: ['name', 'slug', 'parent', 'translationCompleteness', 'id'],
			filterProperties: ['name', 'slug', 'parent'],
			properties: {
				id: hidden,
				name: { isVisible: { list: true, filter: true, show: true, edit: false } },
				translationCompleteness: { isVisible: { list: true, filter: false, show: true, edit: false } },
				localizedContentEditor: buildLocalizedEditorProperty(
					LOCALIZED_RESOURCE_DEFINITIONS.ProductCategory
				),
				...buildLocalizedHiddenProperties(LOCALIZED_RESOURCE_DEFINITIONS.ProductCategory),
			},
			actions: {
				new: {
					before: async (request: any, context: any) =>
						localizedBeforeHook(request, context, 'ProductCategory'),
					after: localizedAfterHook,
				},
				edit: {
					before: async (request: any, context: any) =>
						localizedBeforeHook(request, context, 'ProductCategory'),
					after: localizedAfterHook,
				},
				show: {
					after: localizedAfterHook,
				},
				list: {
					after: localizedAfterHook,
				},
				delete: {
					after: withCacheRevalidationAfter(
						async (response: any) => response,
						getProductCategoryMutationTags
					),
				},
				bulkDelete: {
					after: withCacheRevalidationAfter(
						async (response: any) => response,
						getProductCategoryMutationTags
					),
				},
			},
		},
	},
	maybeResource(modelMap.ProductImage, {
		navigation: null,
		sort: { sortBy: 'sortOrder', direction: 'asc' },
		listProperties: ['product', 'sortOrder', 'url', 'altText', 'createdAt'],
		filterProperties: ['product', 'url', 'sortOrder', 'createdAt'],
		properties: {
			id: hidden,
			product: { isVisible: { list: true, filter: true, show: true, edit: true } },
			productId: { isVisible: { list: false, filter: false, show: true, edit: false } },
			createdAt: readOnly,
			updatedAt: readOnly,
		},
		actions: {
			new: { before: mapProductImagePayload },
			edit: { before: mapProductImagePayload },
		},
	}),
	{
		resource: { model: modelMap.Brand, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
			},
		},
	},
	{
		resource: { model: modelMap.ProductAttribute, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
			},
		},
	},
	{
		resource: { model: modelMap.ProductAttributeSet, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
			},
		},
	},
	{
		resource: { model: modelMap.ProductAttributeSetItem, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
				attributeSetId: hidden,
				attributeId: hidden,
			},
			actions: {
				new: { before: mapAttributeSetItemPayload },
				edit: { before: mapAttributeSetItemPayload },
			},
		},
	},
	{
		resource: { model: modelMap.ProductAttributeValue, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
			},
		},
	},
	{
		resource: { model: modelMap.Order, client: prisma },
		options: {
			navigation: 'Sales',
			listProperties: [
				'createdAt',
				'customerName',
				'status',
				'total',
				'paymentMethod',
				'shipmentMethod',
			],
			sort: {
				sortBy: 'createdAt',
				direction: 'desc',
			},
			filterProperties: [
				'status',
				'createdAt',
				'total',
				'paymentMethod',
				'shipmentMethod',
				'shippingAddress',
				'shippingAddressLine1',
				'shippingAddressLine2',
				'shippingCity',
				'shippingRegion',
				'shippingPostalCode',
				'shippingCountry',
				'contactEmail',
				'contactPhone',
				'customerName',
			],
			properties: {
				id: hidden,
				userId: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				customerName: {
					isVisible: { list: true, filter: true, show: true, edit: false },
				},
				total: {
					...readOnly,
					components: {
						list: orderTotalListComponent,
						show: orderTotalListComponent,
						filter: orderTotalRangeFilterComponent,
					},
				},
				items: {
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				discounts: hidden,
				auditEntries: hidden,
				carrier: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				trackingNumber: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				paymentMethod: {
					...readOnly,
					availableValues: [
						{ value: 'paypal', label: 'paypal' },
						{ value: 'cod', label: 'cod' },
						{ value: 'card', label: 'card' },
					],
					components: { filter: selectFilterWithPlaceholderComponent },
				},
				shipmentMethod: {
					...readOnly,
					availableValues: [
						{ value: 'nova-poshta', label: 'nova-poshta' },
						{ value: 'ukrposhta', label: 'ukrposhta' },
						{ value: 'meest', label: 'meest' },
					],
					components: { filter: selectFilterWithPlaceholderComponent },
				},
				shippingAddress: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingAddressLine1: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingAddressLine2: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingCity: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingRegion: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingPostalCode: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				shippingCountry: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				status: {
					components: { filter: selectFilterWithPlaceholderComponent },
				},
				refundAmount: {
					type: 'currency',
					components: { show: orderTotalListComponent },
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				refundReason: {
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				refundedAt: {
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				stripeSessionId: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				contactName: readOnly,
				contactLastName: readOnly,
				contactMiddleName: readOnly,
				contactEmail: readOnly,
				contactPhone: readOnly,
				createdAt: readOnly,
				updatedAt: readOnly,
			},
			actions: {
				new: { isAccessible: false },
				edit: { isAccessible: false },
				bulkDelete: { isAccessible: false },
				list: {
					actionType: 'resource',
					component: orderListComponent,
				},
				show: {
					actionType: 'record',
					component: orderShowComponent,
				},
				financialBreakdown: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: financialBreakdown,
				},
				orderItems: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: orderItemsSummary,
				},
				markPaid: {
					actionType: 'record',
					icon: 'CreditCard',
					guard: 'mark-paid',
					isVisible: ({ record }: { record?: { param: (key: string) => unknown } }) =>
						isOrderStatus(record, 'PENDING'),
					handler: markPaid,
					component: false,
				},
				markShipped: {
					actionType: 'record',
					icon: 'Truck',
					guard: 'mark-shipped',
					isVisible: ({ record }: { record?: { param: (key: string) => unknown } }) =>
						isOrderStatus(record, 'PAID'),
					handler: markShipped,
					component: false,
				},
				markDelivered: {
					actionType: 'record',
					icon: 'CheckCircle',
					guard: 'mark-delivered',
					isVisible: ({ record }: { record?: { param: (key: string) => unknown } }) =>
						isOrderStatus(record, 'SHIPPED'),
					handler: markDelivered,
					component: false,
				},
				cancelOrder: {
					actionType: 'record',
					icon: 'XCircle',
					guard: 'cancel-order',
					isVisible: true,
					component: cancelOrderActionComponent,
					handler: cancelOrder,
				},
				setStatus: {
					actionType: 'record',
					icon: 'ChevronRight',
					guard: 'move-next-status',
					component: orderStatusActionComponent,
					handler: setStatus,
				},
				processReturn: {
					actionType: 'record',
					icon: 'RotateCcw',
					guard: 'process-return',
					isVisible: ({ record }: { record?: { param: (key: string) => unknown } }) =>
						isOrderStatus(record, 'DELIVERED'),
					component: orderReturnActionComponent,
					handler: processReturn,
				},
				auditTimeline: {
					actionType: 'record',
					icon: 'Activity',
					component: orderAuditTimelineActionComponent,
					handler: auditTimeline,
				},
				setFulfillment: {
					actionType: 'record',
					icon: 'Package',
					guard: 'update-fulfillment',
					component: orderFulfillmentActionComponent,
					handler: setFulfillment,
				},
				packingSlip: {
					actionType: 'record',
					icon: 'Printer',
					component: orderPackingSlipActionComponent,
					handler: packingSlip,
				},
				bulkPackingSlips: {
					actionType: 'bulk',
					icon: 'Printer',
					guard: 'bulk-packing-slips',
					component: orderBulkPackingSlipActionComponent,
					handler: bulkPackingSlips,
				},
				shippingLabel: {
					actionType: 'record',
					icon: 'Truck',
					component: orderShippingLabelActionComponent,
					handler: shippingLabel,
				},
				bulkShippingLabels: {
					actionType: 'bulk',
					icon: 'Truck',
					guard: 'bulk-shipping-labels',
					component: orderBulkShippingLabelActionComponent,
					handler: bulkShippingLabels,
				},
				exportOrdersCsv: {
					actionType: 'resource',
					icon: 'Download',
					component: orderCsvExportActionComponent,
					handler: exportOrdersCsv,
				},
				bulkMarkShipped: {
					actionType: 'bulk',
					icon: 'Truck',
					guard: 'bulk-mark-shipped',
					isVisible: ({ records }: { records?: { param: (key: string) => unknown }[] }) =>
						(records ?? []).some((record) => isOrderStatus(record, 'PAID')),
					handler: bulkMarkShipped,
					component: false,
				},
				bulkMarkDelivered: {
					actionType: 'bulk',
					icon: 'CheckCircle',
					guard: 'bulk-mark-delivered',
					isVisible: ({ records }: { records?: { param: (key: string) => unknown }[] }) =>
						(records ?? []).some((record) => isOrderStatus(record, 'SHIPPED')),
					handler: bulkMarkDelivered,
					component: false,
				},
				delete: { isAccessible: false, isVisible: false },
				deleteOrder: {
					actionType: 'record',
					icon: 'Trash',
					guard: 'delete-order-items',
					handler: deleteOrder,
					component: false,
				},
			},
		},
	},
	maybeResource(modelMap.Promotion, {
		navigation: 'Marketing',
		listProperties: [
			'name',
			'discountType',
			'discountValue',
			'isActive',
			'startsAt',
			'endsAt',
			'createdAt',
		],
		filterProperties: ['name', 'discountType', 'isActive', 'startsAt', 'endsAt'],
		properties: {
			id: hidden,
			name: {
				description: 'promotion-hint-name',
				custom: { tooltipDirection: 'right' },
			},
			description: {
				description: 'promotion-hint-description',
				custom: { tooltipDirection: 'right' },
			},
			discountType: {
				availableValues: [
					{ value: 'PERCENT', label: 'Percent' },
					{ value: 'FIXED', label: 'Fixed amount' },
				],
				description: 'promotion-hint-discount-type',
				custom: { tooltipDirection: 'right' },
			},
			discountValue: {
				type: 'number',
				props: { step: 0.01 },
				description: 'promotion-hint-discount-value',
				custom: { tooltipDirection: 'right' },
			},
			startsAt: {
				description: 'promotion-hint-starts-at',
				custom: { tooltipDirection: 'right' },
			},
			endsAt: {
				description: 'promotion-hint-ends-at',
				custom: { tooltipDirection: 'right' },
			},
			minOrderTotal: {
				type: 'currency',
				description: 'promotion-hint-min-order-total',
				custom: { tooltipDirection: 'right' },
			},
			isActive: {
				description: 'promotion-hint-is-active',
				custom: { tooltipDirection: 'right' },
			},
			createdAt: readOnly,
			updatedAt: readOnly,
		},
	}),
	maybeResource(modelMap.Banner, {
		navigation: 'Content',
		listProperties: [
			'title',
			'placement',
			'isActive',
			'startsAt',
			'endsAt',
			'translationCompleteness',
			'updatedAt',
		],
		filterProperties: ['title', 'placement', 'isActive', 'startsAt', 'endsAt'],
		properties: {
			id: hidden,
			title: { isVisible: { list: true, filter: true, show: true, edit: false } },
			subtitle: { isVisible: { list: false, filter: false, show: true, edit: false } },
			linkLabel: { isVisible: { list: false, filter: false, show: true, edit: false } },
			imageUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			translationCompleteness: { isVisible: { list: true, filter: false, show: true, edit: false } },
			localizedContentEditor: buildLocalizedEditorProperty(
				LOCALIZED_RESOURCE_DEFINITIONS.Banner
			),
			createdAt: readOnly,
			updatedAt: readOnly,
			...buildLocalizedHiddenProperties(LOCALIZED_RESOURCE_DEFINITIONS.Banner),
		},
		actions: {
			duplicateBanner: {
				actionType: 'record',
				icon: 'Copy',
				guard: 'duplicate-banner',
				handler: withCacheRevalidationHandler(duplicateBanner, getBannerMutationTags),
				component: false,
			},
			new: {
				before: async (request: any, context: any) =>
					localizedBeforeHook(request, context, 'Banner'),
				after: localizedAfterHook,
			},
			edit: {
				before: async (request: any, context: any) =>
					localizedBeforeHook(request, context, 'Banner'),
				after: localizedAfterHook,
			},
			show: {
				after: localizedAfterHook,
			},
			list: {
				after: localizedAfterHook,
			},
			delete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getBannerMutationTags
				),
			},
			bulkDelete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getBannerMutationTags
				),
			},
		},
	}),
	maybeResource(modelMap.Page, {
		navigation: 'Content',
		listProperties: [
			'title',
			'type',
			'status',
			'publishedAt',
			'translationCompleteness',
			'updatedAt',
		],
		filterProperties: ['title', 'type', 'status', 'publishedAt'],
		properties: {
			id: hidden,
			title: { isVisible: { list: true, filter: true, show: true, edit: false } },
			content: { isVisible: { list: false, filter: false, show: true, edit: false } },
			excerpt: { isVisible: { list: false, filter: false, show: true, edit: false } },
			coverImageUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			metaTitle: { isVisible: { list: false, filter: false, show: true, edit: false } },
			metaDescription: { isVisible: { list: false, filter: false, show: true, edit: false } },
			canonicalUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			translationCompleteness: { isVisible: { list: true, filter: false, show: true, edit: false } },
			localizedContentEditor: buildLocalizedEditorProperty(
				LOCALIZED_RESOURCE_DEFINITIONS.Page
			),
			createdAt: readOnly,
			updatedAt: readOnly,
			...buildLocalizedHiddenProperties(LOCALIZED_RESOURCE_DEFINITIONS.Page),
		},
		actions: {
			new: {
				before: async (request: any, context: any) =>
					localizedBeforeHook(request, context, 'Page'),
				after: localizedAfterHook,
			},
			edit: {
				before: async (request: any, context: any) =>
					localizedBeforeHook(request, context, 'Page'),
				after: localizedAfterHook,
			},
			show: {
				after: localizedAfterHook,
			},
			list: {
				after: localizedAfterHook,
			},
			delete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getPageMutationTags
				),
			},
			bulkDelete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getPageMutationTags
				),
			},
		},
	}),
	maybeResource(modelMap.StorefrontForm, {
		navigation: 'Content',
		listProperties: ['key', 'placement', 'enabled', 'required', 'sortOrder', 'updatedAt'],
		filterProperties: ['key', 'placement', 'enabled', 'required'],
		properties: {
			id: hidden,
			description: { isVisible: { list: false, filter: false, show: true, edit: true } },
			body: { isVisible: { list: false, filter: false, show: true, edit: true } },
			checkboxLabel: { isVisible: { list: false, filter: false, show: true, edit: true } },
			createdAt: readOnly,
			updatedAt: readOnly,
		},
		actions: {
			new: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getStorefrontFormMutationTags
				),
			},
			edit: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getStorefrontFormMutationTags
				),
			},
			delete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getStorefrontFormMutationTags
				),
			},
			bulkDelete: {
				after: withCacheRevalidationAfter(
					async (response: any) => response,
					getStorefrontFormMutationTags
				),
			},
		},
	}),
	maybeResource(modelMap.Coupon, {
		navigation: 'Marketing',
		listProperties: [
			'code',
			'promotion',
			'isActive',
			'maxRedemptions',
			'redemptionCount',
			'startsAt',
			'endsAt',
			'createdAt',
		],
		filterProperties: ['code', 'promotion', 'isActive', 'startsAt', 'endsAt'],
		properties: {
			id: hidden,
			code: {
				description: 'coupon-hint-code',
				custom: { tooltipDirection: 'right' },
			},
			promotionId: {
				isVisible: { list: false, filter: false, show: true, edit: false },
				description: 'coupon-hint-promotion',
				custom: { tooltipDirection: 'right' },
			},
			promotion: {
				isVisible: { list: true, filter: true, show: true, edit: true },
				description: 'coupon-hint-promotion',
				custom: { tooltipDirection: 'right' },
			},
			maxRedemptions: {
				description: 'coupon-hint-max-redemptions',
				custom: { tooltipDirection: 'right' },
			},
			redemptionCount: {
				isVisible: { list: true, filter: false, show: true, edit: false },
				description: 'coupon-hint-redemption-count',
				custom: { tooltipDirection: 'right' },
			},
			startsAt: {
				description: 'coupon-hint-starts-at',
				custom: { tooltipDirection: 'right' },
			},
			endsAt: {
				description: 'coupon-hint-ends-at',
				custom: { tooltipDirection: 'right' },
			},
			isActive: {
				description: 'coupon-hint-is-active',
				custom: { tooltipDirection: 'right' },
			},
			createdAt: readOnly,
			updatedAt: readOnly,
		},
		actions: {
			new: { before: mapCouponPayload },
			edit: { before: mapCouponPayload },
		},
	}),
	maybeResource(modelMap.OrderDiscount, {
		navigation: 'Sales',
		listProperties: ['orderId', 'label', 'code', 'amount', 'createdAt'],
		filterProperties: ['orderId', 'promotion', 'coupon', 'createdAt'],
		properties: {
			id: hidden,
			label: {
				description: 'order-discount-hint-label',
			},
			code: {
				description: 'order-discount-hint-code',
			},
			amount: {
				type: 'currency',
				description: 'order-discount-hint-amount',
			},
			orderId: {
				isVisible: { list: true, filter: true, show: true, edit: true },
				description: 'order-discount-hint-order',
			},
			promotionId: {
				isVisible: { list: false, filter: false, show: true, edit: false },
				description: 'order-discount-hint-promotion',
			},
			couponId: {
				isVisible: { list: false, filter: false, show: true, edit: false },
				description: 'order-discount-hint-coupon',
			},
			promotion: {
				isVisible: { list: false, filter: true, show: true, edit: true },
				description: 'order-discount-hint-promotion',
			},
			coupon: {
				isVisible: { list: false, filter: true, show: true, edit: true },
				description: 'order-discount-hint-coupon',
			},
			createdAt: readOnly,
		},
		actions: {
			new: { before: mapOrderDiscountPayload, after: syncOrderTotalsAfterDiscountChange },
			edit: { before: mapOrderDiscountPayload, after: syncOrderTotalsAfterDiscountChange },
			delete: { after: syncOrderTotalsAfterDiscountChange },
		},
	}),
	{
		resource: { model: modelMap.OrderItem, client: prisma },
		options: {
			navigation: null,
			properties: {
				id: hidden,
				orderId: disabled,
				productId: disabled,
				quantity: disabled,
				price: {
					...disabled,
					type: 'currency',
					props: { intlConfig: { locale: 'uk-UA', currency: 'USD' } },
				},
				unitPrice: {
					...disabled,
					type: 'currency',
					props: { intlConfig: { locale: 'uk-UA', currency: 'USD' } },
				},
			},
			actions: readOnlyActions,
		},
	},
	{
		resource: { model: modelMap.User, client: prisma },
		options: {
			navigation: 'Customers',
			sort: {
				sortBy: 'createdAt',
				direction: 'desc',
			},
			listProperties: [
				'name',
				'email',
				'lifetimeValue',
				'lastOrderDate',
				'adminStatus',
				'phoneNumber',
				'emailVerified',
				'phoneNumberVerified',
				'subscribed',
				'createdAt',
			],
			filterProperties: [
				'email',
				'phoneNumber',
				'adminStatus',
				'emailVerified',
				'phoneNumberVerified',
				'subscribed',
			],
			properties: {
				id: hidden,
				image: hidden,
				adminStatus: {
					isVisible: { list: true, filter: true, show: true, edit: false },
					availableValues: [
						{ value: 'ACTIVE', label: 'Active' },
						{ value: 'SUSPENDED', label: 'Suspended' },
						{ value: 'BLOCKED', label: 'Blocked' },
					],
					components: { filter: selectFilterWithPlaceholderComponent },
				},
				adminNotes: {
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				lifetimeValue: {
					type: 'currency',
					props: { intlConfig: { locale: 'uk-UA', currency: 'USD' } },
					isVisible: { list: true, filter: false, show: false, edit: false },
				},
				lastOrderDate: {
					type: 'datetime',
					isVisible: { list: true, filter: false, show: false, edit: false },
				},
				email: disabled,
				emailVerified: disabled,
				phoneNumber: disabled,
				phoneNumberVerified: disabled,
				subscribed: disabled,
				createdAt: readOnly,
				updatedAt: readOnly,
			},
			actions: {
				...readOnlyActions,
				list: {
					after: attachUserListKpis,
				},
				userSegments: {
					actionType: 'resource',
					icon: 'Filter',
					component: userSegmentsComponent,
					handler: userSegments,
				},
				deleteUser: {
					actionType: 'record',
					icon: 'Trash',
					guard: 'delete-user',
					handler: deleteUser,
					component: false,
				},
				show: {
					actionType: 'record',
					component: userShowComponent,
				},
				userKpis: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: userKpis,
				},
				userRelatedData: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: userRelatedData,
				},
				userSessions: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: userSessions,
				},
				revokeSession: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: revokeSession,
				},
				updateUserAdminMeta: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: updateUserAdminMeta,
				},
			},
		},
	},
	{
		resource: { model: modelMap.Review, client: prisma },
		options: {
			navigation: 'Customers',
			properties: {
				id: hidden,
				createdAt: readOnly,
			},
			actions: {
				new: {
					after: reviewMutationAfterHook,
				},
				edit: {
					after: reviewMutationAfterHook,
				},
				delete: {
					after: reviewMutationAfterHook,
				},
				bulkDelete: {
					after: reviewMutationAfterHook,
				},
				show: {
					actionType: 'record',
					component: reviewShowComponent,
				},
				reviewProduct: {
					actionType: 'record',
					isVisible: false,
					component: false,
					handler: reviewProductSummary,
				},
			},
		},
	},
	{
		resource: { model: modelMap.NewsletterSubscription, client: prisma },
		options: {
			navigation: 'Customers',
			sort: {
				sortBy: 'createdAt',
				direction: 'desc',
			},
			listProperties: ['email', 'createdAt'],
			filterProperties: ['email', 'createdAt'],
			properties: {
				id: hidden,
				email: { isTitle: true },
				createdAt: readOnly,
			},
		},
	},
].filter(Boolean) as AdminResource[];
