import 'server-only';

import { env } from '@/config/env';

const hasUpstashConfig = !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
const REQUEST_TIMEOUT_MS = 1_200;
const KEY_PREFIX = 'better-auth:rl:';
// Purely a Redis housekeeping bound, not part of the actual rate-limit
// logic: better-auth computes whether a request is limited itself, by
// comparing `now - lastRequest` against the per-path window it already
// resolved (10s-60s for everything it ships with) — it never passes that
// window down to a custom storage's set(), so there's nothing to derive a
// tighter TTL from here. This just keeps stale entries from lingering.
const STORAGE_TTL_SECONDS = 3600;

type BetterAuthRateLimitData = { key: string; count: number; lastRequest: number };

async function upstashPipeline(commands: unknown[][]): Promise<{ result: unknown }[] | null> {
	if (!hasUpstashConfig) return null;

	const abortController = new AbortController();
	const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(commands),
			signal: abortController.signal,
		});
		if (!response.ok) return null;
		return await response.json();
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

// Distributed backing store for better-auth's *own* internal rate limiter —
// the one that gates sign-in/sign-up/OTP-send/OTP-verify/password-reset via
// its built-in getDefaultSpecialRules(), independent of and in addition to
// this app's own app-level limiters in rateLimit.ts (which only guard the
// send/create side of these flows before better-auth's handler even runs).
// Without this, better-auth falls back to a plain in-memory Map, which is
// per-process — on Vercel's serverless model that resets on every cold
// start and isn't shared across concurrent instances, so the verify-side
// brute-force ceiling (e.g. OTP guessing) is far weaker in production than
// the configured limits suggest.
//
// Deliberately a plain get/set pair backed by Upstash, not a reuse of
// checkRateLimit's atomic INCR counter from rateLimit.ts: better-auth owns
// the count/lastRequest bookkeeping and the shouldRateLimit() decision
// itself, and only needs somewhere shared to persist that state — trying to
// route its decision through the app's own INCR-based limiter would mean
// reimplementing shouldRateLimit's semantics twice and risking the two
// disagreeing.
//
// Fails open (returns null / no-ops) if Upstash is unreachable — unlike
// checkRateLimit's fail-closed behavior for high-risk keys, a Redis blip
// here should degrade to "rate limiting reverts to per-instance," not
// "no one can sign in or verify an OTP."
export const betterAuthRateLimitStorage = {
	async get(key: string): Promise<BetterAuthRateLimitData | null> {
		const result = await upstashPipeline([['GET', `${KEY_PREFIX}${key}`]]);
		const raw = result?.[0]?.result;
		if (typeof raw !== 'string') return null;
		try {
			return JSON.parse(raw) as BetterAuthRateLimitData;
		} catch {
			return null;
		}
	},
	async set(key: string, value: BetterAuthRateLimitData): Promise<void> {
		await upstashPipeline([
			['SET', `${KEY_PREFIX}${key}`, JSON.stringify(value), 'EX', STORAGE_TTL_SECONDS],
		]);
	},
};
