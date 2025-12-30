import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { getTranslations } from 'next-intl/server';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { prisma } from './prisma';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { APP_URL, env } from '@/config/env';

export const auth = betterAuth({
	baseURL: APP_URL,
	user: {
		changeEmail: {
			enabled: true,
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
				secure: env.NODE_ENV === 'production',
			},
	},
	advanced: {
		useSecureCookies: env.NODE_ENV === 'production',
		defaultCookieAttributes: {
			sameSite: 'lax',
			secure: env.NODE_ENV === 'production',
			httpOnly: true,
			path: '/',
		},
	},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url, token }, request) => {
				const [authT, emailsT] = await Promise.all([
					getTranslations('auth'),
					getTranslations('emails'),
				]);

				const recipientName = user?.name || user.email || emailsT('defaultRecipient');
				const emailContent = renderEmailTemplate({
					subject: authT('resetPass'),
					title: authT('resetPass'),
					salutation: `${emailsT('greeting')} ${recipientName},`,
					intro: [emailsT('resetPassIntro')],
					cta: { label: authT('resetPassAction'), url },
					outro: [emailsT('ignoreIfNotYou'), emailsT('help')],
					footer: emailsT('signature'),
					brandName: emailsT('brandName'),
				});

				await resendClient.emails.send({
					from: DEFAULT_FROM,
					to: [user.email],
					subject: emailContent.subject,
					html: emailContent.html,
					text: emailContent.text,
				});
			},
		},
	socialProviders: {
		google: {
			prompt: 'select_account',
			clientId: env.GOOGLE_CLIENT_ID as string,
			clientSecret: env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [
		phoneNumber({
			sendOTP: () => {},
			signUpOnVerification: {
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber.replace(/\D/g, '')}@mail`;
				},
				getTempName: (phoneNumber) => {
					return phoneNumber;
				},
			},
		}),
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				const [authT, emailsT] = await Promise.all([
					getTranslations('auth'),
					getTranslations('emails'),
				]);

				if (type === 'sign-in') {
					return;
				}

				const isEmailVerification = type === 'email-verification';
				const subject = isEmailVerification ? authT('verifyEmail') : authT('resetPass');
				const intro = isEmailVerification ? emailsT('otpVerifyIntro') : emailsT('otpResetIntro');
				const recipientName = email || emailsT('defaultRecipient');

				const emailContent = renderEmailTemplate({
					subject,
					title: subject,
					salutation: `${emailsT('greeting')} ${recipientName},`,
					intro: [intro],
					detailRows: [{ label: emailsT('otpCodeLabel'), value: otp }],
					outro: [emailsT('otpExpires'), emailsT('ignoreIfNotYou')],
					footer: emailsT('signature'),
					brandName: emailsT('brandName'),
				});

				await resendClient.emails.send({
					from: DEFAULT_FROM,
					to: [email],
					subject: emailContent.subject,
					html: emailContent.html,
					text: emailContent.text,
				});
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
					subscribed: true,
				},
			});

			const socialAccount = await prisma.account.findFirst({
				where: { userId: user.id, providerId: 'google' },
				select: { id: true },
			});

			return {
				user: {
					...user,
					...dbUser,
					isGoogleUser: !!socialAccount,
				},
				session,
			};
		}),
		nextCookies(),
	],
});
