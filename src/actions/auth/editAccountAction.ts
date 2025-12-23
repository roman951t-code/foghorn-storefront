'use server';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAccountSchemas, NameSchemaData } from 'formValidationSchemas/accountSchema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

type SchemaName = 'nameSchema' | 'emailSchema' | 'phoneSchema' | 'addressSchema';

const errors = {
	nameSchema: 'editNameFail',
	emailSchema: 'editEmailFail',
	phoneSchema: 'editPhoneFail',
	addressSchema: '',
};

export async function editAccountAction(
	_: unknown,
	formData: { schemaName: SchemaName; email: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	const sessionEmail = session?.user?.email ?? null;

	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	const schema = (await getAccountSchemas())[formData.schemaName];
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email } = formData;
	if (sessionEmail && email !== sessionEmail) {
		return { success: false, message: t('invalidFormData') };
	}

	try {
		const existingUser = await prisma.user.findUnique({ where: { id: userId, email } });

		if (!existingUser) {
			return { success: false, message: t('userNotFound') };
		}

		return { success: true };
	} catch (error: unknown) {
		return { success: false, message: t(errors[formData.schemaName]) };
	}
}

export async function editNameAction(
	_: unknown,
	formData: NameSchemaData & { email: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	const schema = (await getAccountSchemas()).nameSchema;

	const validatedFormData = schema.safeParse({
		name: formData.name,
		lastName: formData.lastName,
		middleName: formData.middleName,
	});

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { name, lastName, middleName } = validatedFormData.data;

	try {
		await prisma.user.update({
			where: { id: userId },
			data: { name, lastName, middleName },
		});

		return { success: true };
	} catch (error: unknown) {
		return { success: false, message: t(errors.nameSchema) };
	}
}
