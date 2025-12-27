import { env } from '@/config/env';

type RateLimitResult =
	| { allowed: true }
	| { allowed: false; retryAfterSeconds: number };

type RateLimitState = { resetAt: number; count: number };
type HeadersLike = Request | Headers;

const buckets = new Map<string, RateLimitState>();

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

export function getClientIp(source: HeadersLike): string {
	const forwardedFor = readHeader(source, 'x-forwarded-for');
	if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
	const realIp = readHeader(source, 'x-real-ip');
	if (realIp) return realIp.trim();
	const cfConnectingIp = readHeader(source, 'cf-connecting-ip');
	if (cfConnectingIp) return cfConnectingIp.trim();
	return 'unknown';
}

async function upstashIncrement(key: string, windowMs: number) {
	if (!hasUpstashConfig) return null;

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
}: {
	key: string;
	limit: number;
	windowMs: number;
}): Promise<RateLimitResult> {
	try {
		const upstash = await upstashIncrement(key, windowMs);
		if (upstash) {
			const retryAfterSeconds = Math.max(1, Math.ceil(upstash.ttlMs / 1000));
			if (upstash.count > limit) {
				return { allowed: false, retryAfterSeconds };
			}
			return { allowed: true };
		}
	} catch {
		// fall back to in-memory limiter
	}

	// Fallback: in-memory with TTL cleanup on access
	const now = Date.now();
	const existing = buckets.get(key);

	if (!existing || now >= existing.resetAt) {
		buckets.set(key, { resetAt: now + windowMs, count: 1 });
		return { allowed: true };
	}

	if (existing.count >= limit) {
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
		};
	}

	existing.count += 1;
	return { allowed: true };
}
