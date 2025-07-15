'use server';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAccountSchemas } from 'formValidationSchemas/accountSchema';

type SchemaName = 'nameSchema' | 'emailSchema' | 'phoneSchema' | 'addressSchema';

export async function editAccountAction(
	prevState: unknown,
	formData: { schemaName: SchemaName; email: string }
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = (await getAccountSchemas())[formData.schemaName];
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { message: t('userNotFound') };
		}

		return;
	} catch (error: any) {
		return {
			message: t('editNameFail'),
		};
	}
}
