import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return NextResponse.json(null);
	}

	const dbUser = await prisma.user.findUnique({
		where: {
			id: session.user.id,
		},
		select: {
			phoneNumber: true,
			phoneNumberVerified: true,
			lastName: true,
			middleName: true,
			notificationMethod: true,
		},
	});
	console.log('dbUser', dbUser);
	if (!dbUser) return NextResponse.json(null);

	const enrichedSession = {
		...session,
		user: {
			...session.user,
			...dbUser,
		},
	};

	return NextResponse.json(enrichedSession);
}
