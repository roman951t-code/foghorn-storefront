import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { getTranslations } from 'next-intl/server';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { prisma } from './prisma';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { APP_URL, env } from '@/config/env';
import { sendPhoneOtpCode } from '@/lib/phoneOtp';
import { isRestrictedUserAdminStatus } from '@/lib/userAdminStatus';

const PHONE_AUTH_TEMP_EMAIL_PATTERN = /^\d+@mail$/i;

const isPhoneAuthTempEmail = (email: string | null | undefined): email is string =>
	typeof email === 'string' && PHONE_AUTH_TEMP_EMAIL_PATTERN.test(email.trim());

const sanitizeSessionEmail = (email: string | null | undefined): string | null => {
	if (typeof email !== 'string') return null;
	const trimmed = email.trim();
	if (!trimmed || isPhoneAuthTempEmail(trimmed)) return null;
	return trimmed;
};

const resolveDefaultNotificationMethod = (path: string | undefined) =>
	path?.includes('/phone-number/verify') ? 'phone' : 'email';

export const auth = betterAuth({
	baseURL: APP_URL,
	emailVerification: {
		// Signup is OTP-verified in our custom flow before signUpEmail is called.
		// Keep Better Auth from sending another verification message on sign-up.
		sendOnSignUp: false,
	},
	user: {
		changeEmail: {
			enabled: true,
		},
		deleteUser: {
			enabled: false,
		},
	},
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	databaseHooks: {
		user: {
			create: {
				async before(user, context) {
					if (user.notificationMethod === 'email' || user.notificationMethod === 'phone') return;
					return {
						data: {
							...user,
							notificationMethod: resolveDefaultNotificationMethod(context?.path),
						},
					};
				},
			},
		},
		session: {
			create: {
				async before(session) {
					const userId = typeof session.userId === 'string' ? session.userId : null;
					if (!userId) return;

					const user = await prisma.user.findUnique({
						where: { id: userId },
						select: { adminStatus: true },
					});

					if (!user || !isRestrictedUserAdminStatus(user.adminStatus)) return;
					return false;
				},
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		// Keep revocations effective immediately across storefront and server actions.
		cookieCache: {
			enabled: false,
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
			sendResetPassword: async ({ user, url }) => {
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
				callbackOnVerification: async ({ user, phoneNumber }) => {
					const expectedTempEmail = `${phoneNumber.replace(/\D/g, '')}@mail`;
					if (user.email?.trim().toLowerCase() !== expectedTempEmail) return;
					await prisma.user.update({
						where: { id: user.id },
						data: {
							email: null,
							emailVerified: false,
						},
					});
				},
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
				const isEmailSignUpRequest = requestPath.includes('/sign-up/email');
				const isEmailSignInRequest = requestPath.includes('/sign-in/email');

				if (type === 'email-verification' && isEmailSignUpRequest) {
					return;
				}

				// Our storefront signup flow verifies email with a custom OTP before account creation.
				// Suppress Better Auth verification OTP on email/password sign-in to avoid redundant emails.
				if (type === 'email-verification' && isEmailSignInRequest) {
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
			const sessionEmail = sanitizeSessionEmail(user.email);

			const dbUserPromise = prisma.user.findUnique({
				where: {
					id: user.id,
				},
				select: {
					phoneNumber: true,
					phoneNumberVerified: true,
					lastName: true,
					middleName: true,
					notificationMethod: true,
					shippingCountry: true,
					shippingRegion: true,
					shippingCity: true,
					shippingPostalCode: true,
					shippingAddressLine1: true,
					shippingAddressLine2: true,
				},
			});

			const socialAccountPromise = prisma.account.findFirst({
				where: { userId: user.id, providerId: 'google' },
				select: { id: true },
			});

			const newsletterSubscriptionPromise = sessionEmail
				? prisma.newsletterSubscription.findFirst({
						where: {
							email: {
								equals: sessionEmail,
								mode: 'insensitive',
							},
						},
						select: { id: true },
					})
				: Promise.resolve(null);

			const [dbUser, socialAccount, newsletterSubscription] = await Promise.all([
				dbUserPromise,
				socialAccountPromise,
				newsletterSubscriptionPromise,
			]);

			return {
				user: {
					...user,
					email: sessionEmail,
					...dbUser,
					subscribed: Boolean(newsletterSubscription),
					isGoogleUser: !!socialAccount,
				},
				session,
			};
		}),
		nextCookies(),
	],
});
