import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { phoneNumber, customSession } from 'better-auth/plugins';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
				const t = await getTranslations('Auth');

				await resend.emails.send({
					from: 'Acme <onboarding@resend.dev>',
					to: [user.email],
					subject: t('verifyChangeEmail'),
					text: `${t('hiUser')} ${user?.name || ''},
${t('clickToChangeEmail')}:

${url}`,
				});
			},
		},
		deleteUser: {
			enabled: true,
		},
	},
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
		sendResetPassword: async ({ user, url, token }, request) => {
			const t = await getTranslations('Auth');

			await resend.emails.send({
				from: 'Acme <onboarding@resend.dev>',
				to: [user.email],
				subject: t('resetPass'),
				text: `${t('hiUser')} ${user?.name || ''},

${t('clickToResetPass')}:

${url}`,
			});
		},
	},
	socialProviders: {
		google: {
			prompt: 'select_account',
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
				text: `${t('hiUser')} ${user?.name || ''},

${t('clickToVerifyEmail')}:

${url}`,
			});
		},
	},
	plugins: [
		phoneNumber({
			sendOTP: ({ phoneNumber, code }, request) => {
				console.log('code', code);
			},
			signUpOnVerification: {
				getTempEmail: (phoneNumber) => {
					return '';
				},
				getTempName: (phoneNumber) => {
					return phoneNumber;
				},
			},
		}),
		customSession(async ({ user, session }) => {
			const dbUser = await prisma.user.findUnique({
				where: {
					id: user.id,
				},
				select: {
					phoneNumber: true,
					phoneNumberVerified: true,
					lastName: true,
					middleName: true,
					notificationMethod: true,
				},
			});
			return {
				user: {
					...user,
					...dbUser,
				},
				session,
			};
		}),
		nextCookies(),
	],
});
