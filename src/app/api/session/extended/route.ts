import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { jsonNoStore, jsonPrivateNoCache } from '@/lib/response';
import type { AppSessionUser } from '@/types/session';

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
			query: {
				disableCookieCache: true,
			},
		});

		if (!session?.user?.id) {
			return jsonPrivateNoCache(null, { status: 200 });
		}

		const { user, ...rest } = session;
		const sessionUser = user as AppSessionUser;
		const sessionEmail = typeof user.email === 'string' ? user.email.trim() : '';
		const [socialAccount, newsletterSubscription] = await Promise.all([
			prisma.account.findFirst({
				where: { userId: user.id, providerId: 'google' },
				select: { id: true },
			}),
			sessionEmail
				? prisma.newsletterSubscription.findFirst({
						where: {
							email: {
								equals: sessionEmail,
								mode: 'insensitive',
							},
						},
						select: { id: true },
					})
				: Promise.resolve(null),
		]);

		return jsonNoStore({
			...rest,
			user: {
				id: sessionUser.id,
				email: sessionUser.email,
				name: sessionUser.name,
				phoneNumber: sessionUser.phoneNumber ?? null,
				phoneNumberVerified: sessionUser.phoneNumberVerified ?? false,
				lastName: sessionUser.lastName ?? null,
				middleName: sessionUser.middleName ?? null,
				notificationMethod: sessionUser.notificationMethod ?? null,
				emailVerified: sessionUser.emailVerified ?? false,
				subscribed: Boolean(newsletterSubscription),
				shippingCountry: sessionUser.shippingCountry ?? null,
				shippingRegion: sessionUser.shippingRegion ?? null,
				shippingCity: sessionUser.shippingCity ?? null,
				shippingPostalCode: sessionUser.shippingPostalCode ?? null,
				shippingAddressLine1: sessionUser.shippingAddressLine1 ?? null,
				shippingAddressLine2: sessionUser.shippingAddressLine2 ?? null,
				isGoogleUser: !!socialAccount,
			},
		});
	} catch (error) {
		return jsonNoStore({ error: 'Failed to fetch session' }, { status: 500 });
	}
}
