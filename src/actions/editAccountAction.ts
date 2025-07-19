'use server';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAccountSchemas, NameSchemaData } from 'formValidationSchemas/accountSchema';

type SchemaName = 'nameSchema' | 'emailSchema' | 'phoneSchema' | 'addressSchema';

const errors = {
	nameSchema: 'editNameFail',
	emailSchema: 'editEmailFail',
	phoneSchema: '',
	addressSchema: '',
};

export async function editAccountAction(
	_: unknown,
	formData: { schemaName: SchemaName; email: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = (await getAccountSchemas())[formData.schemaName];
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { success: false, message: t('userNotFound') };
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, message: t(errors[formData.schemaName]) };
	}
}

export async function editNameAction(
	_: unknown,
	formData: NameSchemaData & { email: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = (await getAccountSchemas())['nameSchema'];

	const validatedFormData = schema.safeParse({
		name: formData.name,
		lastName: formData.lastName,
		middleName: formData.middleName,
	});

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email } = formData;
	const { name, lastName, middleName } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { success: false, message: t('userNotFound') };
		}

		await prisma.user.update({
			where: { email },
			data: { name, lastName, middleName },
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: t('userLoginFail') };
	}
}
