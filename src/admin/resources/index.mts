import { prisma } from '../prisma.mts';
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
import { cancelOrderActionComponent, orderStatusActionComponent } from '../config/components.mts';
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
			filterProperties: ['name', 'brand', 'category', 'inStock', 'stock', 'basePrice'],
			properties: {
				id: hidden,
				basePrice: { type: 'currency' },
				discountPrice: { type: 'currency' },
				createdAt: readOnly,
				updatedAt: readOnly,
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
			listProperties: ['createdAt', 'status', 'total', 'userId'],
			sort: {
				sortBy: 'createdAt',
				direction: 'desc',
			},
			filterProperties: ['status', 'createdAt', 'userId', 'total', 'contactEmail'],
			properties: {
				id: hidden,
				userId: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				total: readOnly,
				items: {
					isVisible: { list: false, filter: false, show: true, edit: false },
				},
				paymentMethod: disabled,
				shipmentMethod: disabled,
				stripeSessionId: {
					isVisible: { list: false, filter: true, show: true, edit: false },
				},
				contactName: disabled,
				contactLastName: disabled,
				contactMiddleName: disabled,
				contactEmail: disabled,
				contactPhone: disabled,
				createdAt: readOnly,
				updatedAt: readOnly,
			},
			actions: {
				...readOnlyActions,
				delete: {
					isAccessible: true,
					guard: 'delete-order-items',
					handler: deleteOrder,
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
					icon: 'ChevronDown',
					guard: 'move-next-status',
					component: orderStatusActionComponent,
					handler: setStatus,
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
				price: disabled,
				unitPrice: disabled,
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
			filterProperties: ['email', 'phoneNumber', 'emailVerified', 'phoneNumberVerified', 'subscribed'],
			properties: {
				id: hidden,
				email: disabled,
				emailVerified: disabled,
				phoneNumber: disabled,
				phoneNumberVerified: disabled,
				subscribed: disabled,
				createdAt: readOnly,
				updatedAt: readOnly,
			},
			actions: readOnlyActions,
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
