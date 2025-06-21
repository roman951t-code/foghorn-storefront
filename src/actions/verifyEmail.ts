'use server';

import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export async function verifyEmailAction(token: string) {
	if (!token) {
		throw new Error('Missing token');
	}

	try {
		const payload = jwt.verify(token, process.env.EMAIL_SECRET!) as {
			userId: string;
			email: string;
		};

		await prisma.user.update({
			where: { id: payload.userId },
			data: { emailVerified: new Date() },
		});

		redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/verified`);
	} catch (err) {
		throw new Error('Invalid or expired token');
	}
}
