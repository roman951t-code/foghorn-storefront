'use server';

import 'server-only';

import { getEmailSignInSchema } from 'validationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { buildUserRestrictionMessage, isRestrictedUserAdminStatus } from '@/lib/userAdminStatus';

export async function loginEmailAction(
	_: unknown,
	formData: unknown,
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getEmailSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const email = validatedFormData.data.email.trim().toLowerCase();
	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: {
			adminStatus: true,
			adminNotes: true,
		},
	});

	if (existingUser && isRestrictedUserAdminStatus(existingUser.adminStatus)) {
		return {
			success: false,
			message: buildUserRestrictionMessage({
				status: existingUser.adminStatus,
				notes: existingUser.adminNotes,
				accountSuspended: validationT('accountSuspended'),
				accountBlocked: validationT('accountBlocked'),
				formatReason: (reason) => validationT('accountStatusReason', { reason }),
			}),
		};
	}

	return { success: true };
}
