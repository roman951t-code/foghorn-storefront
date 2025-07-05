'use server';

import { authClient } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { getTranslations } from 'next-intl/server';

export async function registerPhoneAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const authSchema = await getEmailSignUpSchema();
	const validatedFormData = authSchema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email, firstName, lastName, password } = validatedFormData.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return { message: t('userExists') };
		}

		const user = await prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				hashedPassword,
				emailVerified: false,
			},
		});

		if (!user) return { message: t('userRegisterFail') };

		await prisma.account.create({
			data: {
				userId: user.id,
				type: 'credentials',
				provider: 'credentials',
				providerAccountId: email,
			},
		});

		await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
	} catch (e) {
		return { message: t('userRegisterFail') };
	}
}
