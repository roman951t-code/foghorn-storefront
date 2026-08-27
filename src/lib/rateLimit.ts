import { env } from '@/config/env';
import { recordRateLimitBlockEvent } from '@/lib/opsMonitoring';

type RateLimitResult =
	| { allowed: true }
	| {
			allowed: false;
			retryAfterSeconds: number;
			statusCode?: 429 | 503;
			reason?: 'rate_limited' | 'backend_unavailable';
	  };

type RateLimitState = { resetAt: number; count: number };
type HeadersLike = Request | Headers;

const buckets = new Map<string, RateLimitState>();
const BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const MAX_FALLBACK_BUCKETS = 20_000;
const HIGH_RISK_KEY_PREFIXES = [
	'auth:',
	'proxy:/api/auth:',
	'proxy:/api/cart:',
	'proxy:/api/payments/stripe:',
	'proxy:/api/payments/stripe/webhook:',
	'proxy:/api/cache/revalidate:',
	'proxy:/api/cache/revalidate/windows:',
];
const DISTRIBUTED_DEGRADED_LOG_COOLDOWN_MS = 60_000;
const DISTRIBUTED_FETCH_TIMEOUT_MS = 1_200;
const DISTRIBUTED_UNAVAILABLE_RETRY_AFTER_SECONDS = 30;
let bucketCleanupTimer: ReturnType<typeof setInterval> | null = null;
const distributedDegradedLogAt = new Map<string, number>();

const hasUpstashConfig = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

function readHeader(source: HeadersLike, name: string) {
	if ('headers' in source && source.headers instanceof Headers) {
		return source.headers.get(name);
	}
	// Request also has a headers property, but keep a defensive branch
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return source.get?.(name) ?? source.headers?.get?.(name) ?? null;
}

const IPV4_SEGMENT_REGEX = /^\d{1,3}$/;
const IPV6_HEX_REGEX = /^[0-9a-fA-F:]+$/;

function isValidIpv4(value: string) {
	const parts = value.split('.');
	if (parts.length !== 4) return false;
	return parts.every((part) => {
		if (!IPV4_SEGMENT_REGEX.test(part)) return false;
		const numeric = Number(part);
		return Number.isInteger(numeric) && numeric >= 0 && numeric <= 255;
	});
}

function isValidIpv6(value: string) {
	if (!value.includes(':')) return false;
	if (!IPV6_HEX_REGEX.test(value)) return false;
	if (value.split('::').length > 2) return false;

	const parts = value.split(':');
	let hasContentPart = false;
	for (const part of parts) {
		if (!part) continue;
		if (part.length > 4) return false;
		hasContentPart = true;
	}
	return hasContentPart;
}

function normalizeIpCandidate(raw: string | null | undefined): string | null {
	if (!raw) return null;
	let candidate = raw.trim();
	if (!candidate) return null;
	if (candidate.toLowerCase() === 'unknown') return null;

	if (candidate.toLowerCase().startsWith('for=')) {
		candidate = candidate.slice(4).trim();
	}

	// Trim enclosing quotes.
	if (candidate.startsWith('"') && candidate.endsWith('"') && candidate.length >= 2) {
		candidate = candidate.slice(1, -1).trim();
	}

	// RFC 7239 format may include brackets for IPv6 and optional port, e.g. [::1]:1234.
	if (candidate.startsWith('[')) {
		const closingBracketIndex = candidate.indexOf(']');
		if (closingBracketIndex > 0) {
			candidate = candidate.slice(1, closingBracketIndex);
		}
	}

	// Remove port from IPv4:port.
	if (candidate.includes('.') && candidate.includes(':')) {
		const lastColon = candidate.lastIndexOf(':');
		const maybePort = candidate.slice(lastColon + 1);
		if (/^\d+$/.test(maybePort)) {
			candidate = candidate.slice(0, lastColon);
		}
	}

	// Remove IPv6 zone ID, e.g. fe80::1%eth0.
	const zoneIndex = candidate.indexOf('%');
	if (zoneIndex > -1) {
		candidate = candidate.slice(0, zoneIndex);
	}

	const normalized = candidate.trim();
	if (!normalized) return null;
	if (isValidIpv4(normalized) || isValidIpv6(normalized)) {
		return normalized.toLowerCase();
	}
	return null;
}

function extractRightmostForwardedForIp(forwardedFor: string | null): string | null {
	if (!forwardedFor) return null;
	const candidates = forwardedFor
		.split(',')
		.map((part) => normalizeIpCandidate(part))
		.filter((part): part is string => Boolean(part));
	if (candidates.length === 0) return null;
	return candidates[candidates.length - 1];
}

function extractForwardedHeaderIp(forwardedHeader: string | null): string | null {
	if (!forwardedHeader) return null;
	const entries = forwardedHeader.split(',');
	const candidates: string[] = [];

	for (const entry of entries) {
		const directives = entry.split(';');
		for (const directive of directives) {
			const trimmed = directive.trim();
			if (!trimmed.toLowerCase().startsWith('for=')) continue;
			const normalized = normalizeIpCandidate(trimmed);
			if (normalized) {
				candidates.push(normalized);
			}
		}
	}

	if (candidates.length === 0) return null;
	return candidates[candidates.length - 1];
}

export function getClientIp(source: HeadersLike): string {
	// Prefer edge-set single-value headers first when available.
	const cfConnectingIp = normalizeIpCandidate(readHeader(source, 'cf-connecting-ip'));
	if (cfConnectingIp) return cfConnectingIp;

	const trueClientIp = normalizeIpCandidate(readHeader(source, 'true-client-ip'));
	if (trueClientIp) return trueClientIp;

	const realIp = normalizeIpCandidate(readHeader(source, 'x-real-ip'));
	if (realIp) return realIp;

	// Use the rightmost X-Forwarded-For hop to prevent spoofing via client-supplied first values.
	const forwardedForIp = extractRightmostForwardedForIp(readHeader(source, 'x-forwarded-for'));
	if (forwardedForIp) return forwardedForIp;

	const forwardedHeaderIp = extractForwardedHeaderIp(readHeader(source, 'forwarded'));
	if (forwardedHeaderIp) return forwardedHeaderIp;

	return 'unknown';
}

function pruneExpiredBuckets(now = Date.now()) {
	for (const [key, state] of buckets) {
		if (now >= state.resetAt) {
			buckets.delete(key);
		}
	}
}

function trimOldestBuckets(maxEntries: number) {
	if (buckets.size <= maxEntries) return;
	const overflow = buckets.size - maxEntries;
	for (let i = 0; i < overflow; i += 1) {
		const oldestKey = buckets.keys().next().value as string | undefined;
		if (!oldestKey) break;
		buckets.delete(oldestKey);
	}
}

function ensureFallbackCleanupLoop() {
	if (bucketCleanupTimer || typeof setInterval !== 'function') return;
	bucketCleanupTimer = setInterval(() => {
		pruneExpiredBuckets();
		trimOldestBuckets(MAX_FALLBACK_BUCKETS);
	}, BUCKET_CLEANUP_INTERVAL_MS);
	(bucketCleanupTimer as { unref?: () => void }).unref?.();
}

function isHighRiskRateLimitKey(key: string) {
	return HIGH_RISK_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function normalizeRateLimitKeyForLog(key: string) {
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

function reportDistributedLimiterDegraded({
	key,
	reason,
	details,
}: {
	key: string;
	reason: 'missing_config' | 'non_ok_response' | 'request_failed';
	details?: string;
}) {
	if (env.NODE_ENV !== 'production') return;
	if (!isHighRiskRateLimitKey(key)) return;

	const bucket = normalizeRateLimitKeyForLog(key);
	const now = Date.now();
	const lastLoggedAt = distributedDegradedLogAt.get(bucket) ?? 0;
	if (now - lastLoggedAt < DISTRIBUTED_DEGRADED_LOG_COOLDOWN_MS) return;

	distributedDegradedLogAt.set(bucket, now);
	console.error({
		source: 'rate-limit',
		event: 'distributed-limiter-degraded',
		level: 'error',
		timestamp: new Date().toISOString(),
		bucket,
		reason,
		details: details ?? null,
		fallback: 'in-memory-single-instance',
	});
}

function reportBlockedRateLimit(
	key: string,
	result: Extract<RateLimitResult, { allowed: false }>
) {
	if (!isHighRiskRateLimitKey(key)) return;
	const statusCode = result.statusCode ?? 429;
	const reason = result.reason ?? (statusCode === 503 ? 'backend_unavailable' : 'rate_limited');
	void recordRateLimitBlockEvent({
		key,
		statusCode,
		retryAfterSeconds: result.retryAfterSeconds,
		reason,
	});
}

async function upstashIncrement(key: string, windowMs: number) {
	if (!hasUpstashConfig) return null;

	const abortController = new AbortController();
	const timeout = setTimeout(() => abortController.abort(), DISTRIBUTED_FETCH_TIMEOUT_MS);
	const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
			'Content-Type': 'application/json',
		},
		// INCR increments the counter, PTTL returns remaining time, PEXPIRE sets TTL once.
		body: JSON.stringify([
			['INCR', key],
			['PTTL', key],
			['PEXPIRE', key, windowMs, 'NX'],
		]),
		signal: abortController.signal,
	}).finally(() => {
		clearTimeout(timeout);
	});

	if (!response.ok) {
		return null;
	}

	const results: { result: unknown }[] = await response.json();
	const count = Number(results?.[0]?.result ?? 0);
	const ttlMsRaw = Number(results?.[1]?.result ?? windowMs);
	const ttlMs = Number.isFinite(ttlMsRaw) && ttlMsRaw > 0 ? ttlMsRaw : windowMs;

	return { count, ttlMs };
}

export async function checkRateLimit({
	key,
	limit,
	windowMs,
	requireDistributedInProduction,
}: {
	key: string;
	limit: number;
	windowMs: number;
	requireDistributedInProduction?: boolean;
}): Promise<RateLimitResult> {
	const preferDistributed =
		env.NODE_ENV === 'production' &&
		(requireDistributedInProduction ?? isHighRiskRateLimitKey(key));
	const distributedUnavailableResult = (): Extract<RateLimitResult, { allowed: false }> => ({
		allowed: false,
		retryAfterSeconds: Math.max(
			1,
			Math.min(Math.ceil(windowMs / 1000), DISTRIBUTED_UNAVAILABLE_RETRY_AFTER_SECONDS)
		),
		statusCode: 503,
		reason: 'backend_unavailable',
	});

	if (preferDistributed) {
		if (!hasUpstashConfig) {
			reportDistributedLimiterDegraded({ key, reason: 'missing_config' });
			const blocked = distributedUnavailableResult();
			reportBlockedRateLimit(key, blocked);
			return blocked;
		} else {
			try {
				const upstash = await upstashIncrement(key, windowMs);
				if (upstash) {
					const retryAfterSeconds = Math.max(1, Math.ceil(upstash.ttlMs / 1000));
					if (upstash.count > limit) {
						const blocked: Extract<RateLimitResult, { allowed: false }> = {
							allowed: false,
							retryAfterSeconds,
							statusCode: 429,
							reason: 'rate_limited',
						};
						reportBlockedRateLimit(key, blocked);
						return blocked;
					}
					return { allowed: true };
				}

				reportDistributedLimiterDegraded({
					key,
					reason: 'non_ok_response',
				});
				const blocked = distributedUnavailableResult();
				reportBlockedRateLimit(key, blocked);
				return blocked;
			} catch (error) {
				reportDistributedLimiterDegraded({
					key,
					reason: 'request_failed',
					details: error instanceof Error ? error.message : String(error),
				});
				const blocked = distributedUnavailableResult();
				reportBlockedRateLimit(key, blocked);
				return blocked;
			}
		}
	}

	// Fallback: in-memory limiter for local/dev paths.
	ensureFallbackCleanupLoop();
	const now = Date.now();
	pruneExpiredBuckets(now);
	trimOldestBuckets(MAX_FALLBACK_BUCKETS);
	const existing = buckets.get(key);

	if (!existing || now >= existing.resetAt) {
		buckets.set(key, { resetAt: now + windowMs, count: 1 });
		return { allowed: true };
	}

	if (existing.count >= limit) {
		const blocked: Extract<RateLimitResult, { allowed: false }> = {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
			statusCode: 429,
			reason: 'rate_limited',
		};
		reportBlockedRateLimit(key, blocked);
		return blocked;
	}

	existing.count += 1;
	return { allowed: true };
}
