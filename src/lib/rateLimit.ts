type RateLimitResult =
	| { allowed: true }
	| { allowed: false; retryAfterSeconds: number };

type RateLimitState = { resetAt: number; count: number };

const buckets = new Map<string, RateLimitState>();

export function checkRateLimit({
	key,
	limit,
	windowMs,
}: {
	key: string;
	limit: number;
	windowMs: number;
}): RateLimitResult {
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

export function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
	return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
