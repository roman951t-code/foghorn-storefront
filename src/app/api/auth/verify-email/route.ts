import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const token = searchParams.get('token');

	if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

	try {
		const payload = jwt.verify(token, process.env.EMAIL_SECRET!) as {
			userId: string;
			email: string;
		};

		await prisma.user.update({
			where: { id: payload.userId },
			data: { emailVerified: new Date() },
		});

		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/verified`);
	} catch (err) {
		return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
	}
}
