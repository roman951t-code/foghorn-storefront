import type { PrismaClient } from '@prisma/client';
import type { ResourceOptions } from 'adminjs';
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
import { attachUserListKpis, userKpis } from '../actions/user-kpi-actions.mts';
import { updateUserAdminMeta } from '../actions/user-admin-actions.mts';
import { revokeSession, userSessions } from '../actions/user-session-actions.mts';
import { userSegments } from '../actions/user-segmentation-actions.mts';
import { userRelatedData } from '../actions/user-related-actions.mts';
import { reviewProductSummary } from '../actions/review-actions.mts';
import { duplicateBanner } from '../actions/banner-actions.mts';
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
	userShowComponent,
	userSegmentsComponent,
	orderStatusActionComponent,
	reviewShowComponent,
} from '../config/components.mts';
import { modelMap } from '../config/model-map.mts';
import { disabled, hidden, readOnly, readOnlyActions } from '../config/property-options.mts';

const mapAttributeSetItemPayload = async (request: any) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, any>;
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

const mapCouponPayload = async (request: any) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, any>;
	const promotionId = next.promotionId;
	if (typeof promotionId === 'string' && promotionId.trim()) {
		if (!next.promotion) next.promotion = promotionId;
		delete next.promotionId;
	}
	return { ...request, payload: next };
};

const mapOrderDiscountPayload = async (request: any) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, any>;
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

const mapProductImagePayload = async (request: any) => {
	const payload = request?.payload ?? {};
	if (!payload || typeof payload !== 'object') return request;
	const next = { ...payload } as Record<string, any>;
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

const withProductGallerySyncErrorNotice = (response: any) => ({
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

const resolveProductIdForGallerySync = (response: any, context: any): string | null => {
	const fromResponse = response?.record?.params?.id;
	if (typeof fromResponse === 'string' && fromResponse.trim()) return fromResponse;
	const fromContext = context?.record?.param?.('id');
	if (typeof fromContext === 'string' && fromContext.trim()) return fromContext;
	return null;
};

const hydrateProductGalleryField = async (response: any, request: any, context: any) => {
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
		const galleryUrlList = images.map((image) => image.url).filter(Boolean);
		const galleryUrls = galleryUrlList.join('\n');
		const persistedPrimaryImageUrl = normalizeGalleryUrl(response?.record?.params?.imageUrl);
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

const syncProductGalleryAfterHook = async (response: any, request: any, context: any) => {
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

const productEditAfterHook = async (response: any, request: any, context: any) => {
	const withAudit = await productAuditAfterHook(response, request, context);
	const withHydratedGalleryField = await hydrateProductGalleryField(withAudit, request, context);
	return syncProductGalleryAfterHook(withHydratedGalleryField, request, context);
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
				},
				metaTitle: { isVisible: { list: false, filter: false, show: true, edit: true } },
				metaDescription: { isVisible: { list: false, filter: false, show: true, edit: true } },
				canonicalUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
				openGraphImage: { isVisible: { list: false, filter: false, show: true, edit: true } },
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
			},
			actions: {
				delete: { isAccessible: false, isVisible: false },
				bulkDelete: { isAccessible: false, isVisible: false },
				list: {
					actionType: 'resource',
					component: productListComponent,
				},
				bulkSetCategory: {
					actionType: 'bulk',
					icon: 'Tag',
					guard: 'product-bulk-set-category',
					component: productBulkSetCategoryActionComponent,
					handler: bulkSetCategory,
				},
				bulkSetBrand: {
					actionType: 'bulk',
					icon: 'Tag',
					guard: 'product-bulk-set-brand',
					component: productBulkSetBrandActionComponent,
					handler: bulkSetBrand,
				},
				bulkEditTags: {
					actionType: 'bulk',
					icon: 'Edit',
					guard: 'product-bulk-edit-tags',
					component: productBulkEditTagsActionComponent,
					handler: bulkEditTags,
				},
				bulkAdjustPrice: {
					actionType: 'bulk',
					icon: 'DollarSign',
					guard: 'product-bulk-adjust-price',
					component: productBulkAdjustPriceActionComponent,
					handler: bulkAdjustPrice,
				},
				bulkAdjustStock: {
					actionType: 'bulk',
					icon: 'Package',
					guard: 'product-bulk-adjust-stock',
					component: productBulkAdjustStockActionComponent,
					handler: bulkAdjustStock,
				},
				bulkToggleInStock: {
					actionType: 'bulk',
					icon: 'Package',
					guard: 'product-bulk-toggle-instock',
					component: productBulkToggleInStockActionComponent,
					handler: bulkToggleInStock,
				},
				bulkSeoTemplate: {
					actionType: 'bulk',
					icon: 'Search',
					component: productBulkSeoTemplateActionComponent,
					handler: bulkSeoTemplateHandler,
				},
				new: {
					before: validateProductNewEdit,
					after: syncProductGalleryAfterHook,
					component: productNewComponent,
				},
				edit: {
					before: async (request: any, context: any) => {
						await captureProductAuditBeforeHook(request, context);
						return validateProductNewEdit(request, context);
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
					handler: productVariantMatrix,
				},
				importProductsCsv: {
					actionType: 'resource',
					icon: 'Upload',
					component: productCsvImportExportActionComponent,
					handler: importProductsCsv,
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
					handler: publishProduct,
					component: false,
				},
				archiveProduct: {
					actionType: 'record',
					icon: 'Archive',
					guard: 'archive-product',
					isVisible: ({ record }: { record?: any }) =>
						String(record?.param('status') ?? 'DRAFT') !== 'ARCHIVED',
					handler: archiveProduct,
					component: false,
				},
				duplicateProduct: {
					actionType: 'record',
					icon: 'Copy',
					guard: 'duplicate-product',
					handler: duplicateProduct,
					component: false,
				},
				scheduleDiscount: {
					actionType: 'record',
					icon: 'Calendar',
					guard: 'schedule-discount',
					handler: scheduleDiscount,
					component: productScheduleDiscountActionComponent,
				},
				schedulePublish: {
					actionType: 'record',
					icon: 'Calendar',
					guard: 'schedule-publish',
					handler: schedulePublish,
					component: productSchedulePublishActionComponent,
				},
				deleteProduct: {
					actionType: 'record',
					icon: 'Trash',
					guard: 'delete-product',
					handler: deleteProduct,
					component: false,
				},
			},
		},
	},
	{
		resource: { model: modelMap.ProductCategory, client: prisma },
		options: {
			navigation: 'Catalog',
			properties: {
				id: hidden,
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
						!isOrderStatus(record, 'CANCELLED'),
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
					handler: bulkMarkShipped,
					component: false,
				},
				bulkMarkDelivered: {
					actionType: 'bulk',
					icon: 'CheckCircle',
					guard: 'bulk-mark-delivered',
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
		listProperties: ['title', 'placement', 'isActive', 'startsAt', 'endsAt', 'updatedAt'],
		filterProperties: ['title', 'placement', 'isActive', 'startsAt', 'endsAt'],
		properties: {
			id: hidden,
			imageUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			createdAt: readOnly,
			updatedAt: readOnly,
		},
		actions: {
			duplicateBanner: {
				actionType: 'record',
				icon: 'Copy',
				guard: 'duplicate-banner',
				handler: duplicateBanner,
				component: false,
			},
		},
	}),
	maybeResource(modelMap.Page, {
		navigation: 'Content',
		listProperties: ['title', 'type', 'status', 'publishedAt', 'updatedAt'],
		filterProperties: ['title', 'type', 'status', 'publishedAt'],
		properties: {
			id: hidden,
			content: { isVisible: { list: false, filter: false, show: true, edit: true } },
			excerpt: { isVisible: { list: false, filter: false, show: true, edit: true } },
			coverImageUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			metaTitle: { isVisible: { list: false, filter: false, show: true, edit: true } },
			metaDescription: { isVisible: { list: false, filter: false, show: true, edit: true } },
			canonicalUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
			createdAt: readOnly,
			updatedAt: readOnly,
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
				image: {
					isVisible: { list: false, filter: false, show: true, edit: false },
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
