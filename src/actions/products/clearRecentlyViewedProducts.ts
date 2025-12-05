'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function clearRecentlyViewedProducts() {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false };
	}

	try {
		await prisma.recentlyViewed.deleteMany({
			where: { userId },
		});

		return { success: true };
	} catch (error) {
		console.error('Failed to clear recently viewed products', error);
		return { success: false };
	}
}
