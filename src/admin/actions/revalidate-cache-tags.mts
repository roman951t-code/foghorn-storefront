const LOCAL_STORE_URL = 'http://localhost:3000';
const REVALIDATE_PATH = '/api/cache/revalidate';
const MAX_ALERT_BODY_LENGTH = 1000;
const isProduction = process.env.NODE_ENV === 'production';
const isLocalHardenedProfileEnabled =
	process.env.NODE_ENV === 'development' &&
	!['0', 'false', 'no', 'off'].includes(
		(typeof process.env.LOCAL_HARDENED_PROFILE === 'string'
			? process.env.LOCAL_HARDENED_PROFILE
			: ''
		)
			.trim()
			.toLowerCase()
	);
const logDevRevalidateFailures = process.env.ADMIN_CACHE_REVALIDATE_VERBOSE === 'true';

const normalizeTag = (tag: unknown): string | null => {
	if (typeof tag !== 'string') return null;
	const trimmed = tag.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const truncate = (value: string, limit: number) =>
	value.length > limit ? `${value.slice(0, Math.max(0, limit - 3))}...` : value;

const toErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message;
	return String(error);
};

const logAdminCacheEvent = (
	level: 'info' | 'warn' | 'error',
	event: string,
	payload: Record<string, unknown>
) => {
	const entry = {
		source: 'admin-cache-revalidate',
		event,
		level,
		timestamp: new Date().toISOString(),
		...payload,
	};

	if (level === 'error') {
		console.error(entry);
		return;
	}
	if (level === 'warn') {
		console.warn(entry);
		return;
	}
	console.info(entry);
};

const sendRevalidateAlert = async (event: string, payload: Record<string, unknown>) => {
	const webhookUrl = process.env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL;
	if (!webhookUrl) return;

	try {
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				source: 'admin-cache-revalidate',
				event,
				severity: 'error',
				timestamp: new Date().toISOString(),
				payload,
			}),
		});

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			logAdminCacheEvent('warn', 'alert-webhook-non-ok', {
				status: response.status,
				body: truncate(body, MAX_ALERT_BODY_LENGTH),
			});
		}
	} catch (error) {
		logAdminCacheEvent('warn', 'alert-webhook-failed', {
			error: toErrorMessage(error),
		});
	}
};

const resolveStoreAppUrl = () => {
	const raw = process.env.NEXT_PUBLIC_APP_URL;
	if (typeof raw === 'string' && raw.trim()) {
		return raw;
	}
	return LOCAL_STORE_URL;
};

const buildRevalidateEndpointHint = () => {
	const base = resolveStoreAppUrl().trim().replace(/\/+$/, '');
	return `${base}${REVALIDATE_PATH}`;
};

export const revalidateStorefrontCacheTags = async (tags: Array<string | null | undefined>) => {
	const normalizedTags = Array.from(
		new Set(tags.map(normalizeTag).filter((tag): tag is string => Boolean(tag)))
	);
	if (normalizedTags.length === 0) return;
	const startedAt = Date.now();

	const secret =
		typeof process.env.CACHE_REVALIDATE_SECRET === 'string' &&
		process.env.CACHE_REVALIDATE_SECRET.trim()
			? process.env.CACHE_REVALIDATE_SECRET.trim()
			: typeof process.env.CRON_SECRET === 'string' && process.env.CRON_SECRET.trim()
				? process.env.CRON_SECRET.trim()
				: null;
	if (!secret && (isProduction || isLocalHardenedProfileEnabled)) {
		const details = {
			reason: 'missing-secret',
			tagCount: normalizedTags.length,
			tagsSample: normalizedTags.slice(0, 20),
		};
		if (isProduction) {
			logAdminCacheEvent('error', 'revalidate-skipped', details);
			await sendRevalidateAlert('revalidate-skipped', details);
		} else if (logDevRevalidateFailures) {
			logAdminCacheEvent('info', 'revalidate-skipped', details);
		}
		return;
	}

	try {
		const endpoint = new URL(REVALIDATE_PATH, resolveStoreAppUrl());
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				...(secret ? { 'x-revalidate-secret': secret } : {}),
			},
			body: JSON.stringify({ tags: normalizedTags }),
		});

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			const details = {
				endpoint: endpoint.toString(),
				status: response.status,
				durationMs: Date.now() - startedAt,
				tagCount: normalizedTags.length,
				tags: normalizedTags,
				body: truncate(body, MAX_ALERT_BODY_LENGTH),
			};
			if (isProduction) {
				logAdminCacheEvent('error', 'revalidate-request-failed', details);
				await sendRevalidateAlert('revalidate-request-failed', details);
			} else if (logDevRevalidateFailures) {
				logAdminCacheEvent('info', 'revalidate-request-failed', details);
			}
			return;
		}

		logAdminCacheEvent('info', 'revalidate-request-succeeded', {
			status: response.status,
			durationMs: Date.now() - startedAt,
			tagCount: normalizedTags.length,
		});
	} catch (error) {
		const details = {
			endpoint: buildRevalidateEndpointHint(),
			durationMs: Date.now() - startedAt,
			tagCount: normalizedTags.length,
			tags: normalizedTags,
			error: toErrorMessage(error),
			hint: isProduction
				? undefined
				: 'Ensure storefront Next.js app is running at NEXT_PUBLIC_APP_URL before admin mutations',
		};
		if (isProduction) {
			logAdminCacheEvent('error', 'revalidate-request-threw', details);
			await sendRevalidateAlert('revalidate-request-threw', details);
		} else if (logDevRevalidateFailures) {
			logAdminCacheEvent('info', 'revalidate-request-threw', details);
		}
	}
};
