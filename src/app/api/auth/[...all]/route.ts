import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { toNextJsHandler } from 'better-auth/next-js';

const EMAIL_SIGN_IN_LIMIT_PER_EMAIL = 8;
const EMAIL_SIGN_IN_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_SIGN_IN_PATH_SUFFIX = '/api/auth/sign-in/email';

const authHandler = toNextJsHandler(auth.handler);

const isEmailSignInRequest = (request: Request) => {
	try {
		return new URL(request.url).pathname.endsWith(EMAIL_SIGN_IN_PATH_SUFFIX);
	} catch {
		return false;
	}
};

const getEmailFromRequest = async (request: Request) => {
	const body = await request
		.clone()
		.json()
		.catch(() => null);
	if (!body || typeof body !== 'object') return null;
	const email = (body as { email?: unknown }).email;
	if (typeof email !== 'string') return null;
	const normalized = email.trim().toLowerCase();
	return normalized || null;
};

export const GET = authHandler.GET;

export async function POST(request: Request) {
	if (isEmailSignInRequest(request)) {
		const email = await getEmailFromRequest(request);
		if (email) {
			const emailRate = await checkRateLimit({
				key: `auth:email-signin:email:${email}`,
				limit: EMAIL_SIGN_IN_LIMIT_PER_EMAIL,
				windowMs: EMAIL_SIGN_IN_WINDOW_MS,
			});

			if (!emailRate.allowed) {
				return Response.json(
					{ code: 'TOO_MANY_REQUESTS', message: 'Too many requests' },
					{
						status: emailRate.statusCode ?? 429,
						headers: {
							'Retry-After': String(emailRate.retryAfterSeconds),
							'Cache-Control': 'no-store',
						},
					},
				);
			}
		}
	}

	return authHandler.POST(request);
}
