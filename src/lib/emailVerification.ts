import { Resend } from 'resend';
import { EmailTemplate } from '@/components/auth/EmailTemplate';
import jwt from 'jsonwebtoken';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, userId: string) {
	const token = jwt.sign({ userId, email }, process.env.EMAIL_SECRET!, {
		expiresIn: '1d',
	});

	const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

	await resend.emails.send({
		from: 'Acme <onboarding@resend.dev>',
		to: [email],
		subject: 'Confirm your email',
		react: EmailTemplate({ verificationLink: confirmationUrl }),
	});
}
