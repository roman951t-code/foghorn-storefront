'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function setNotificationMethodAction(
	_: unknown,
	formData: { notificationMethod: 'email' | 'phone' }
): Promise<{ message?: string }> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	console.log('session', session);

	if (!session?.user?.email) {
		return { message: 'Unauthorized' };
	}

	try {
		await prisma.user.update({
			where: { email: session.user.email },
			data: {
				notificationMethod: formData.notificationMethod,
			},
		});
		return { message: 'Updated successfully' };
	} catch (error) {
		return { message: 'Failed to update' };
	}
}
