export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/emailVerification';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
		}

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json({ error: 'User already exists' }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user with emailVerified: null
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				emailVerified: null,
			},
		});

		// Send verification email
		await sendVerificationEmail(email, user.id);

		return NextResponse.json({
			message: 'User created. Please check your email to verify your account.',
		});
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}
}
