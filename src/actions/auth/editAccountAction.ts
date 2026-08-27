'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAccountSchemas, NameSchemaData } from 'validationSchemas/accountSchema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import {
	getMissingRequiredShippingAddressFields,
	normalizeShippingAddress,
	SHIPPING_ADDRESS_FIELD_LIMITS,
	type ShippingAddressFormValue,
} from '@/utils/shippingAddress';

const EDIT_NAME_ERROR_KEY = 'editNameFail';

export async function editNameAction(
	_: unknown,
	formData: NameSchemaData & { email: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const schema = (await getAccountSchemas()).nameSchema;

	const validatedFormData = schema.safeParse({
		name: formData.name,
		lastName: formData.lastName,
		middleName: formData.middleName,
	});

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { name, lastName, middleName } = validatedFormData.data;

	try {
		await prisma.user.update({
			where: { id: userId },
			data: { name, lastName, middleName },
		});

		return { success: true };
	} catch (error: unknown) {
		Sentry.captureException(error, { tags: { authAction: 'edit-name' } });
		return { success: false, message: validationT(EDIT_NAME_ERROR_KEY) };
	}
}

const shippingAddressSchema = z.object({
	country: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.country),
	region: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.region),
	city: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.city),
	postalCode: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.postalCode),
	addressLine1: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1),
	addressLine2: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine2),
});

export async function editShippingAddressAction(
	_: unknown,
	formData: ShippingAddressFormValue
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const validatedFormData = shippingAddressSchema.safeParse(formData);
	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const normalized = normalizeShippingAddress(validatedFormData.data);
	if (getMissingRequiredShippingAddressFields(normalized).length > 0) {
		return { success: false, message: validationT('shippingAddressRequired') };
	}

	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				shippingCountry: normalized.country,
				shippingRegion: normalized.region,
				shippingCity: normalized.city,
				shippingPostalCode: normalized.postalCode,
				shippingAddressLine1: normalized.addressLine1,
				shippingAddressLine2: normalized.addressLine2,
			},
		});

		return { success: true };
	} catch (error) {
		Sentry.captureException(error, { tags: { authAction: 'edit-address' } });
		return { success: false, message: validationT('editAddressFail') };
	}
}
