export type StripeRouteErrorDetails = { statusCode?: number; code?: string; message?: string };

export const asErrorDetails = (error: unknown): StripeRouteErrorDetails => {
	if (typeof error !== 'object' || error === null) return {};
	const candidate = error as Record<string, unknown>;
	const statusCode = typeof candidate.statusCode === 'number' ? candidate.statusCode : undefined;
	const code = typeof candidate.code === 'string' ? candidate.code : undefined;
	const message = typeof candidate.message === 'string' ? candidate.message : undefined;
	return {
		...(statusCode === undefined ? {} : { statusCode }),
		...(code === undefined ? {} : { code }),
		...(message === undefined ? {} : { message }),
	};
};

export function resolveSafeRedirectUrl(
	value: unknown,
	{ origin, fallbackPath }: { origin: string; fallbackPath: string }
): string {
	const fallback = new URL(fallbackPath, origin).toString();
	if (typeof value !== 'string') return fallback;

	const candidate = value.trim();
	if (!candidate) return fallback;
	if (candidate.length > 2048) return fallback;

	try {
		const url = new URL(candidate, origin);
		return url.origin === origin ? url.toString() : fallback;
	} catch {
		return fallback;
	}
}
