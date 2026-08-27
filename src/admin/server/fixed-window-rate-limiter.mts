type RateLimitState = {
	count: number;
	resetAt: number;
};

type FixedWindowRateLimiterOptions = {
	windowMs: number;
	cleanupIntervalMs: number;
	maxBuckets: number;
};

export const createFixedWindowRateLimiter = ({
	windowMs,
	cleanupIntervalMs,
	maxBuckets,
}: FixedWindowRateLimiterOptions) => {
	const buckets = new Map<string, RateLimitState>();
	let cleanupTimer: ReturnType<typeof setInterval> | null = null;

	const pruneExpiredBuckets = (now = Date.now()) => {
		for (const [bucketKey, state] of buckets) {
			if (now >= state.resetAt) {
				buckets.delete(bucketKey);
			}
		}
	};

	const trimOldestBuckets = () => {
		if (buckets.size <= maxBuckets) return;
		const overflow = buckets.size - maxBuckets;
		for (let index = 0; index < overflow; index += 1) {
			const oldestKey = buckets.keys().next().value as string | undefined;
			if (!oldestKey) break;
			buckets.delete(oldestKey);
		}
	};

	const ensureCleanupLoop = () => {
		if (cleanupTimer) return;
		cleanupTimer = setInterval(() => {
			pruneExpiredBuckets();
			trimOldestBuckets();
		}, cleanupIntervalMs);
		(cleanupTimer as { unref?: () => void }).unref?.();
	};

	const check = (key: string, limit: number, overrideWindowMs = windowMs) => {
		const now = Date.now();
		pruneExpiredBuckets(now);
		trimOldestBuckets();
		const existing = buckets.get(key);

		if (!existing || now >= existing.resetAt) {
			buckets.set(key, {
				count: 1,
				resetAt: now + overrideWindowMs,
			});
			return { allowed: true as const };
		}

		if (existing.count >= limit) {
			return {
				allowed: false as const,
				retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
			};
		}

		existing.count += 1;
		return { allowed: true as const };
	};

	return { ensureCleanupLoop, check };
};
