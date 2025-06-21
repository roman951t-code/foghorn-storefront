'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resetPasswordAction(email: string) {
	if (!email) throw new Error('Email is required');

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) throw new Error('User not found');

	const tempPassword = randomBytes(4).toString('hex');
	const hashed = await bcrypt.hash(tempPassword, 10);

	await prisma.user.update({
		where: { email },
		data: { password: hashed },
	});

	await resend.emails.send({
		from: 'Acme <onboarding@resend.dev>',
		to: [email],
		subject: 'Your Temporary Password',
		text: `Your temporary password is: ${tempPassword}`,
	});
}
