import AdminJS, {
	ComponentLoader,
	type ActionHandler,
	type PropertyOptions,
	type RecordActionResponse,
} from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database, Resource } from '@adminjs/prisma';
import type { OrderStatus } from '@prisma/client';
import { prisma } from './prisma.mts';
import { enAdminLocale } from './locales/en.mts';
import { ukAdminLocale } from './locales/uk.mts';

AdminJS.registerAdapter({ Database, Resource });

const hidden: PropertyOptions = { isVisible: false };
const readOnly: PropertyOptions = { isVisible: { edit: false } };
const disabled: PropertyOptions = { isDisabled: true };
const readOnlyActions = {
	new: { isAccessible: false },
	edit: { isAccessible: false },
	delete: { isAccessible: false },
	bulkDelete: { isAccessible: false },
};

const rootPath = process.env.ADMINJS_ROOT_PATH ?? '/admin';
const adminDir = path.dirname(fileURLToPath(import.meta.url));
const componentLoader = new ComponentLoader();
const orderStatusActionComponent = componentLoader.add(
	'OrderStatusAction',
	path.join(adminDir, 'components', 'OrderStatusAction'),
);

type PrismaRuntimeModel = { fields: unknown[]; [key: string]: unknown };
type PrismaRuntimeDataModel = { models: Record<string, PrismaRuntimeModel> };
const runtimeDataModel = (prisma as { _runtimeDataModel?: PrismaRuntimeDataModel })
	._runtimeDataModel;
if (!runtimeDataModel) {
	throw new Error('Prisma runtime data model is not available for AdminJS');
}
const modelMap = Object.fromEntries(
	Object.entries(runtimeDataModel.models).map(([name, model]) => [name, { name, ...model }]),
) as Record<string, PrismaRuntimeModel & { name: string }>;

const canSetStatus =
	(allowed: OrderStatus[]) =>
	(context: { record?: { param: (name: string) => unknown } }) => {
		const status = context.record?.param('status') as OrderStatus | undefined;
		return status ? allowed.includes(status) : false;
	};

const makeStatusAction = (
	next: OrderStatus,
): ActionHandler<RecordActionResponse> => {
	return async (_req, _res, context) => {
		const { record, resource, currentAdmin } = context;
		if (!record || !resource) {
			throw new Error('Missing record context');
		}
		const orderId = record.param('id') as string;
		await prisma.order.update({
			where: { id: orderId },
			data: { status: next },
		});
		const updated = await resource.findOne(orderId);
		return {
			record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'status-updated', type: 'success', options: { status: next } },
		};
	};
};

const setStatus: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const requested = payload.status as OrderStatus | undefined;
	const method = (req as { method?: string }).method ?? 'get';
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	if (method.toLowerCase() === 'get' || !requested) {
		return {
			record: record.toJSON(currentAdmin),
		};
	}
	const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
	if (!validStatuses.includes(requested)) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'invalid-status', type: 'error' },
		};
	}
	return makeStatusAction(requested)(req, _res, context);
};

const deleteOrder: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}
	const orderId = record.param('id') as string;
	await prisma.orderItem.deleteMany({ where: { orderId } });
	await prisma.order.delete({ where: { id: orderId } });
	return {
		record: record.toJSON(currentAdmin),
		notice: { message: 'order-deleted', type: 'success' },
	};
};

const admin = new AdminJS({
	rootPath,
	componentLoader,
	locale: {
		language: 'en',
		availableLanguages: ['en', 'uk'],
		translations: {
			en: enAdminLocale,
			uk: ukAdminLocale,
		},
	},
	branding: {
		favicon: '/favicon.svg',
	},
	resources: [
		{
			resource: { model: modelMap.Product, client: prisma },
			options: {
				navigation: 'Catalog',
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
				properties: {
					id: hidden,
					userId: {
						isVisible: { list: false, filter: true, show: true, edit: false },
					},
					total: disabled,
					items: disabled,
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
					setStatus: {
						actionType: 'record',
						icon: 'ChevronDown',
						guard: 'move-next-status',
						component: orderStatusActionComponent,
						handler: setStatus,
					},
				},
			},
		},
		{
			resource: { model: modelMap.OrderItem, client: prisma },
			options: {
				navigation: 'Sales',
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
	],
});

export default admin;
