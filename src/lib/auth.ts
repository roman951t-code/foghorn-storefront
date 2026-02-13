import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { getTranslations } from 'next-intl/server';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { prisma } from './prisma';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { APP_URL, env } from '@/config/env';
import { sendPhoneOtpCode } from '@/lib/phoneOtp';

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
				sendOTP: async ({ phoneNumber, code }) => {
					await sendPhoneOtpCode({ phoneNumber, code });
				},
				requireVerification: true,
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
			async sendVerificationOTP({ email, otp, type }, ctx) {
				const [authT, emailsT] = await Promise.all([
					getTranslations('auth'),
					getTranslations('emails'),
				]);

				if (type === 'sign-in') {
					return;
				}

				// In custom signup flow, email was already OTP-verified before signUpEmail is called.
				// Suppress Better Auth's automatic verification OTP for /sign-up/email to avoid duplicate emails.
				const requestPath = (() => {
					const rawPath = ctx?.path;
					if (typeof rawPath === 'string' && rawPath.length > 0) return rawPath;
					const requestUrl = ctx?.request?.url;
					if (!requestUrl) return '';
					try {
						return new URL(requestUrl).pathname;
					} catch {
						return '';
					}
				})();

				if (type === 'email-verification' && requestPath.startsWith('/sign-up/email')) {
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
					shippingCountry: true,
					shippingRegion: true,
					shippingCity: true,
					shippingPostalCode: true,
					shippingAddressLine1: true,
					shippingAddressLine2: true,
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
