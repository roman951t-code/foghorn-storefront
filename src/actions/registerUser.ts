'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/emailVerification';

export async function registerUserAction(email: string, password: string) {
	if (!email || !password) {
		throw new Error('Missing email or password');
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		throw new Error('User already exists');
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			emailVerified: null,
		},
	});

	await sendVerificationEmail(email, user.id);

	return { message: 'User created. Please check your email to verify your account.' };
}
