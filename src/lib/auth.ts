import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},

	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const subjectMap = {
					'sign-in': 'Your sign-in code',
					'email-verification': 'Verify your email',
					'password-reset': 'Reset your password',
				};

				const subject = subjectMap[type] || 'Your OTP Code';

				await resend.emails.send({
					from: 'Acme <onboarding@resend.dev>',
					to: [email],
					subject,
					html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
				});
			},
		}),
		nextCookies(),
	], // make sure this is the last plugin in the array
});
