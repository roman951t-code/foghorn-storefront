import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { jsonNoStore } from '@/lib/response';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
	noStore();

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
			query: {
				disableCookieCache: true,
			},
		});

		if (!session?.user?.id) {
			return jsonNoStore(null, { status: 200 });
		}

		const { user, ...rest } = session;
		const socialAccount = await prisma.account.findFirst({
			where: { userId: user.id, providerId: 'google' },
			select: { id: true },
		});

		return jsonNoStore({
			...rest,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				phoneNumber: user.phoneNumber,
				phoneNumberVerified: user.phoneNumberVerified,
				lastName: user.lastName,
				middleName: user.middleName,
				notificationMethod: user.notificationMethod,
				emailVerified: user.emailVerified,
				subscribed: user.subscribed,
				isGoogleUser: !!socialAccount,
			},
		});
	} catch (error) {
		return jsonNoStore({ error: 'Failed to fetch session' }, { status: 500 });
	}
}
