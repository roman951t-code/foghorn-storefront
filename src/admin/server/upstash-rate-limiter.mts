const FETCH_TIMEOUT_MS = 1_200;

type UpstashRateLimitResult = { allowed: true } | { allowed: false };

const readUpstashConfig = () => {
	const restUrl = process.env.UPSTASH_REDIS_REST_URL;
	const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!restUrl || !restToken) return null;
	return { restUrl, restToken };
};

// Returns null (never blocks) when Upstash isn't configured or the request
// fails/times out — this is an opportunistic extra layer on top of the
// existing in-memory per-process checks, not a replacement, so a missing
// or unreachable Upstash must never lock out real logins.
export const checkUpstashRateLimit = async ({
	key,
	limit,
	windowSeconds,
}: {
	key: string;
	limit: number;
	windowSeconds: number;
}): Promise<UpstashRateLimitResult | null> => {
	const config = readUpstashConfig();
	if (!config) return null;

	const abortController = new AbortController();
	const timeout = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS);
	try {
		const response = await fetch(`${config.restUrl}/pipeline`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.restToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify([
				['INCR', key],
				['PEXPIRE', key, windowSeconds * 1000, 'NX'],
			]),
			signal: abortController.signal,
		});
		if (!response.ok) return null;

		const results: { result: unknown }[] = await response.json();
		const count = Number(results?.[0]?.result ?? 0);
		if (!Number.isFinite(count)) return null;

		return count > limit ? { allowed: false } : { allowed: true };
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
};
