'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getEmailSchema } from '@/schemas/emailSchema';
import { signIn } from 'next-auth/react';
import { getTranslations } from 'next-intl/server';

export async function registerEmailAction(
	prevState: unknown,
	formData: FormData
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	// check if formData is a FormData type

	if (!(formData instanceof FormData)) {
		return { message: t('invalidFormData') };
	}

	// convert formData to a plain object
	const formDataEntries = Object.fromEntries(formData.entries());

	// validation
	const authSchema = await getEmailSchema();
	const validatedFormData = authSchema.safeParse(formDataEntries);
	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email, password } = validatedFormData.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return { message: t('userExists') };
		}

		await prisma.user.create({
			data: {
				email,
				hashedPassword,
				emailVerified: null,
			},
		});

		// Skip email verification in dev
		// await sendVerificationEmail(email, user.id);
	} catch {
		return { message: t('useRegisterFail') };
	}

	signIn('email-credentials', {
		email,
		password,
		redirect: false,
	});
}
