import { prisma } from '../prisma.mts';
import { archiveProduct, duplicateProduct, publishProduct } from '../actions/product-actions.mts';
import { scheduleDiscount } from '../actions/product-discount-actions.mts';
import { deleteProduct } from '../actions/product-delete-actions.mts';
import {
	bulkAdjustPrice,
	bulkEditTags,
	bulkSetBrand,
	bulkSetCategory,
	bulkToggleInStock,
} from '../actions/product-bulk-actions.mts';
import {
	bulkMarkDelivered,
	bulkMarkShipped,
	cancelOrder,
	deleteOrder,
	markDelivered,
	markPaid,
	markShipped,
	setStatus,
} from '../actions/order-actions.mts';
import { financialBreakdown } from '../actions/order-financial-actions.mts';
import { auditTimeline } from '../actions/order-audit-actions.mts';
import { setFulfillment } from '../actions/order-fulfillment-actions.mts';
import { packingSlip } from '../actions/order-packing-slip-actions.mts';
import { userKpis } from '../actions/user-kpi-actions.mts';
import { updateUserAdminMeta } from '../actions/user-admin-actions.mts';
import { userSegments } from '../actions/user-segmentation-actions.mts';
import { userRelatedData } from '../actions/user-related-actions.mts';
import { validateProductNewEdit } from '../validation/product-admin-validation.mts';
import {
	cancelOrderActionComponent,
	orderAuditTimelineActionComponent,
	orderFulfillmentActionComponent,
	orderPackingSlipActionComponent,
	orderShowComponent,
	orderTotalListComponent,
	orderTotalRangeFilterComponent,
	selectFilterWithPlaceholderComponent,
	productScheduleDiscountActionComponent,
	productNameListComponent,
	productListComponent,
	productShowComponent,
	productBulkSetCategoryActionComponent,
	productBulkSetBrandActionComponent,
	productBulkEditTagsActionComponent,
	productBulkAdjustPriceActionComponent,
	productBulkToggleInStockActionComponent,
	userShowComponent,
	userSegmentsComponent,
	orderStatusActionComponent,
} from '../config/components.mts';
import { modelMap } from '../config/model-map.mts';
import { disabled, hidden, readOnly, readOnlyActions } from '../config/property-options.mts';

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
				'status',
				'basePrice',
				'discountPrice',
				'stock',
				'inStock',
				'brand',
				'category',
				'updatedAt',
				'imageUrl',
			],
			filterProperties: ['name', 'status', 'brand', 'category', 'inStock', 'stock', 'basePrice', 'discountPrice', 'imageUrl', 'updatedAt'],
			properties: {
				id: hidden,
				name: {
					components: { list: productNameListComponent },
				},
				basePrice: { type: 'currency' },
				discountPrice: { type: 'currency' },
				discountStartAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
				discountEndAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
				imageUrl: { isVisible: { list: false, filter: false, show: true, edit: true } },
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
				bulkToggleInStock: {
					actionType: 'bulk',
					icon: 'Package',
					guard: 'product-bulk-toggle-instock',
					component: productBulkToggleInStockActionComponent,
					handler: bulkToggleInStock,
				},
				new: { before: validateProductNewEdit },
				edit: { before: validateProductNewEdit },
				show: {
					actionType: 'record',
					component: productShowComponent,
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
			listProperties: ['createdAt', 'customerName', 'status', 'total', 'paymentMethod', 'shipmentMethod'],
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
				status: {
					components: { filter: selectFilterWithPlaceholderComponent },
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
				markPaid: {
					actionType: 'record',
					icon: 'CreditCard',
					guard: 'mark-paid',
					handler: markPaid,
					component: false,
				},
				markShipped: {
					actionType: 'record',
					icon: 'Truck',
					guard: 'mark-shipped',
					handler: markShipped,
					component: false,
				},
				markDelivered: {
					actionType: 'record',
					icon: 'CheckCircle',
					guard: 'mark-delivered',
					handler: markDelivered,
					component: false,
				},
				cancelOrder: {
					actionType: 'record',
					icon: 'XCircle',
					guard: 'cancel-order',
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
					props: { intlConfig: { locale: 'uk-UA', currency: 'UAH' } },
				},
				unitPrice: {
					...disabled,
					type: 'currency',
					props: { intlConfig: { locale: 'uk-UA', currency: 'UAH' } },
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
		},
	},
	{
		resource: { model: modelMap.NewsletterSubscription, client: prisma },
		options: {
			navigation: 'Customers',
			properties: {
				id: hidden,
				createdAt: readOnly,
			},
		},
	},
];
