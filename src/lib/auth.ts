import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
			secure: process.env.NODE_ENV === 'production',
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},

	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }, request) => {
			const t = await getTranslations('Auth');

			await resend.emails.send({
				from: 'Acme <onboarding@resend.dev>',
				to: [user.email],
				subject: t('verifyEmail'),
				text: `${t('clickToVerifyEmail')}: ${url}`,
			});
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

				const t = await getTranslations('Auth');

				const subject = subjectMap[type] || 'Your OTP Code';

				await resend.emails.send({
					from: 'Acme <onboarding@resend.dev>',
					to: [email],
					subject,
					html: `<p>${t('emailOtpText')} <strong>${otp}</strong></p>`,
				});
			},
		}),
		nextCookies(),
	], // make sure this is the last plugin in the array
});
