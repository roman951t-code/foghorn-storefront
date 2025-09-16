import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
			query: {
				disableCookieCache: true,
			},
		});

		if (!session?.user?.id) {
			return NextResponse.json(null, { status: 200 });
		}

		const { user, ...rest } = session;

		return NextResponse.json({
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
			},
		});
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
	}
}
