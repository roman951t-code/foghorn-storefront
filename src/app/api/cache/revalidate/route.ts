import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { env } from '@/config/env';

const MAX_TAGS_PER_REQUEST = 64;
const MAX_ALERT_BODY_LENGTH = 1000;
const REVALIDATE_SECRET_PATTERN = /^[A-Za-z0-9._~-]{24,256}$/;

const normalizeTag = (value: unknown): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const truncate = (value: string, limit: number) =>
	value.length > limit ? `${value.slice(0, Math.max(0, limit - 3))}...` : value;

const toErrorMessage = (error: unknown) => {
	if (error instanceof Error) return error.message;
	return String(error);
};

const normalizeSecret = (value: string | null) => {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const resolveProvidedRevalidateSecret = (req: Request) => {
	const fromHeader = normalizeSecret(req.headers.get('x-revalidate-secret'));
	if (fromHeader) return fromHeader;

	const authorization = normalizeSecret(req.headers.get('authorization'));
	if (!authorization) return null;
	const match = authorization.match(/^Bearer\s+(.+)$/i);
	if (!match) return null;
	return normalizeSecret(match[1] ?? null);
};

const resolveExpectedRevalidateSecrets = () =>
	Array.from(
		new Set(
			[env.CACHE_REVALIDATE_SECRET, env.CRON_SECRET]
				.map((value) => normalizeSecret(value ?? null))
				.filter((value): value is string => Boolean(value))
		)
	);

const logApiRevalidateEvent = (
	level: 'info' | 'warn' | 'error',
	event: string,
	payload: Record<string, unknown>
) => {
	const entry = {
		source: 'api-cache-revalidate',
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
	if (!env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL) return;
	try {
		const response = await fetch(env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				source: 'api-cache-revalidate',
				event,
				severity: 'error',
				timestamp: new Date().toISOString(),
				payload,
			}),
		});
		if (!response.ok) {
			const body = await response.text().catch(() => '');
			logApiRevalidateEvent('warn', 'alert-webhook-non-ok', {
				status: response.status,
				body: truncate(body, MAX_ALERT_BODY_LENGTH),
			});
		}
	} catch (error) {
		logApiRevalidateEvent('warn', 'alert-webhook-failed', {
			error: toErrorMessage(error),
		});
	}
};

export async function POST(req: Request) {
	const startedAt = Date.now();
	const requestId = crypto.randomUUID();

	const expectedSecrets = resolveExpectedRevalidateSecrets();
	if (expectedSecrets.length === 0) {
		logApiRevalidateEvent('error', 'revalidate-not-configured', { requestId });
		return NextResponse.json({ error: 'cache-revalidate-not-configured' }, { status: 503 });
	}

	const providedSecret = resolveProvidedRevalidateSecret(req);
	const hasValidSecretFormat =
		typeof providedSecret === 'string' && REVALIDATE_SECRET_PATTERN.test(providedSecret);
	if (!hasValidSecretFormat || !expectedSecrets.includes(providedSecret)) {
		logApiRevalidateEvent('warn', 'revalidate-unauthorized', { requestId });
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
	}

	let payload: unknown;
	try {
		payload = await req.json();
	} catch {
		return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
	}

	const rawTags = (payload as { tags?: unknown })?.tags;
	if (!Array.isArray(rawTags)) {
		return NextResponse.json({ error: 'invalid-tags' }, { status: 400 });
	}

	const tags = Array.from(new Set(rawTags.map(normalizeTag).filter((tag): tag is string => Boolean(tag))));
	if (tags.length === 0) {
		return NextResponse.json({ error: 'empty-tags' }, { status: 400 });
	}
	if (tags.length > MAX_TAGS_PER_REQUEST) {
		return NextResponse.json({ error: 'too-many-tags' }, { status: 400 });
	}

	try {
		await Promise.all(tags.map((tag) => revalidateTag(tag, 'default')));
		logApiRevalidateEvent('info', 'revalidate-success', {
			requestId,
			tagCount: tags.length,
			durationMs: Date.now() - startedAt,
		});
		return NextResponse.json({ ok: true, tags, count: tags.length });
	} catch (error) {
		const details = {
			requestId,
			tagCount: tags.length,
			tags,
			durationMs: Date.now() - startedAt,
			error: toErrorMessage(error),
		};
		logApiRevalidateEvent('error', 'revalidate-failed', details);
		await sendRevalidateAlert('revalidate-failed', details);
		return NextResponse.json({ error: 'revalidate-failed' }, { status: 500 });
	}
}
