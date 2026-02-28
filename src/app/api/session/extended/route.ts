import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { jsonNoStore } from '@/lib/response';

export async function GET() {
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
				id: user.id,
				email: user.email,
				name: user.name,
				phoneNumber: user.phoneNumber,
				phoneNumberVerified: user.phoneNumberVerified,
				lastName: user.lastName,
				middleName: user.middleName,
				notificationMethod: user.notificationMethod,
				emailVerified: user.emailVerified,
				subscribed: Boolean(newsletterSubscription),
				shippingCountry: (user as any).shippingCountry ?? null,
				shippingRegion: (user as any).shippingRegion ?? null,
				shippingCity: (user as any).shippingCity ?? null,
				shippingPostalCode: (user as any).shippingPostalCode ?? null,
				shippingAddressLine1: (user as any).shippingAddressLine1 ?? null,
				shippingAddressLine2: (user as any).shippingAddressLine2 ?? null,
				isGoogleUser: !!socialAccount,
			},
		});
	} catch (error) {
		return jsonNoStore({ error: 'Failed to fetch session' }, { status: 500 });
	}
}
