import { env } from '@/config/env';

type LogLevel = 'info' | 'warn' | 'error';
type AlertSeverity = 'warning' | 'error' | 'critical';

type SpikeState = {
	count: number;
	windowStartedAt: number;
	lastAlertAt: number;
};

const DEFAULT_ALERT_WEBHOOK_URL =
	env.OPS_ALERT_WEBHOOK_URL ?? env.CACHE_REVALIDATE_ALERT_WEBHOOK_URL ?? null;
const SPIKE_BUCKETS = new Map<string, SpikeState>();
const SPIKE_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const SPIKE_BUCKET_MAX_ENTRIES = 5_000;
const ALERT_COOLDOWN_MS = 5 * 60_000;
const MAX_ALERT_BODY_LENGTH = 1200;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function truncate(value: string, limit: number) {
	return value.length > limit ? `${value.slice(0, Math.max(0, limit - 3))}...` : value;
}

function toErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	return String(error);
}

function cleanupSpikeBuckets(now = Date.now()) {
	for (const [bucketKey, state] of SPIKE_BUCKETS) {
		if (now - state.windowStartedAt > 30 * 60_000) {
			SPIKE_BUCKETS.delete(bucketKey);
		}
	}
}

function trimSpikeBuckets(maxEntries: number) {
	if (SPIKE_BUCKETS.size <= maxEntries) return;
	const overflow = SPIKE_BUCKETS.size - maxEntries;
	for (let i = 0; i < overflow; i += 1) {
		const oldestKey = SPIKE_BUCKETS.keys().next().value as string | undefined;
		if (!oldestKey) break;
		SPIKE_BUCKETS.delete(oldestKey);
	}
}

function ensureCleanupLoop() {
	if (cleanupTimer) return;
	cleanupTimer = setInterval(() => {
		cleanupSpikeBuckets();
		trimSpikeBuckets(SPIKE_BUCKET_MAX_ENTRIES);
	}, SPIKE_BUCKET_CLEANUP_INTERVAL_MS);
	(cleanupTimer as { unref?: () => void }).unref?.();
}

function logOperationalEvent(level: LogLevel, event: string, payload: Record<string, unknown>) {
	const entry = {
		source: 'ops-monitoring',
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
}

async function sendOperationalAlert(
	event: string,
	severity: AlertSeverity,
	payload: Record<string, unknown>
) {
	if (!DEFAULT_ALERT_WEBHOOK_URL) return;
	try {
		const response = await fetch(DEFAULT_ALERT_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				source: 'ops-monitoring',
				event,
				severity,
				timestamp: new Date().toISOString(),
				payload,
			}),
		});

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			logOperationalEvent('warn', 'alert-webhook-non-ok', {
				event,
				severity,
				status: response.status,
				body: truncate(body, MAX_ALERT_BODY_LENGTH),
			});
		}
	} catch (error) {
		logOperationalEvent('warn', 'alert-webhook-failed', {
			event,
			severity,
			error: toErrorMessage(error),
		});
	}
}

function trackSpike({
	bucketKey,
	threshold,
	windowMs,
	alertEvent,
	severity,
	alertPayload,
}: {
	bucketKey: string;
	threshold: number;
	windowMs: number;
	alertEvent: string;
	severity: AlertSeverity;
	alertPayload: Record<string, unknown>;
}) {
	ensureCleanupLoop();
	const now = Date.now();
	cleanupSpikeBuckets(now);
	trimSpikeBuckets(SPIKE_BUCKET_MAX_ENTRIES);

	const existing = SPIKE_BUCKETS.get(bucketKey);
	const state: SpikeState =
		!existing || now - existing.windowStartedAt >= windowMs
			? { count: 1, windowStartedAt: now, lastAlertAt: 0 }
			: { ...existing, count: existing.count + 1 };

	SPIKE_BUCKETS.set(bucketKey, state);

	const hasReachedThreshold = state.count >= threshold;
	const isInCooldown = state.lastAlertAt > 0 && now - state.lastAlertAt < ALERT_COOLDOWN_MS;
	if (!hasReachedThreshold || isInCooldown) return;

	state.lastAlertAt = now;
	SPIKE_BUCKETS.set(bucketKey, state);

	const details = {
		...alertPayload,
		bucketKey,
		threshold,
		windowMs,
		countInWindow: state.count,
		cooldownMs: ALERT_COOLDOWN_MS,
	};
	logOperationalEvent('warn', alertEvent, details);
	void sendOperationalAlert(alertEvent, severity, details);
}

function normalizeRateLimitKey(key: string) {
	const segments = key.split(':').filter(Boolean);
	if (segments.length === 0) return key;
	if (segments[0] === 'proxy' && segments.length >= 2) {
		return `${segments[0]}:${segments[1]}`;
	}

	const markerIndex = segments.findIndex((part) =>
		['ip', 'email', 'phone', 'user', 'verify'].includes(part)
	);
	if (markerIndex >= 0) {
		return segments.slice(0, markerIndex + 1).join(':');
	}

	return segments.slice(0, Math.min(3, segments.length)).join(':');
}

export function recordApi5xxEvent({
	route,
	statusCode,
	error,
	requestId,
}: {
	route: string;
	statusCode: number;
	error?: string | null;
	requestId?: string;
}) {
	const payload = { route, statusCode, error: error ?? null, requestId: requestId ?? null };
	logOperationalEvent('error', 'api-5xx', payload);
	trackSpike({
		bucketKey: `api-5xx:${route}`,
		threshold: 8,
		windowMs: 5 * 60_000,
		alertEvent: 'api-5xx-spike',
		severity: 'error',
		alertPayload: payload,
	});
}

export function recordRateLimitBlockEvent({
	key,
	statusCode,
	retryAfterSeconds,
	reason,
}: {
	key: string;
	statusCode: 429 | 503;
	retryAfterSeconds: number;
	reason: 'rate_limited' | 'backend_unavailable';
}) {
	const bucket = normalizeRateLimitKey(key);
	const payload = { bucket, statusCode, retryAfterSeconds, reason };
	logOperationalEvent('warn', 'rate-limit-blocked', payload);
	trackSpike({
		bucketKey: `rate-limit:${bucket}`,
		threshold: 20,
		windowMs: 5 * 60_000,
		alertEvent: 'rate-limit-spike',
		severity: 'warning',
		alertPayload: payload,
	});
}

export function recordStripeWebhookFailure({
	stage,
	error,
	eventType,
	sessionId,
}: {
	stage: 'not-configured' | 'finalize-failed' | 'handler-exception';
	error: string;
	eventType?: string;
	sessionId?: string;
}) {
	const payload = {
		stage,
		error,
		eventType: eventType ?? null,
		sessionId: sessionId ?? null,
	};
	logOperationalEvent('error', 'stripe-webhook-failure', payload);
	trackSpike({
		bucketKey: 'stripe-webhook-failure',
		threshold: 3,
		windowMs: 10 * 60_000,
		alertEvent: 'stripe-webhook-failure-spike',
		severity: 'critical',
		alertPayload: payload,
	});
}
