import { Pool } from 'pg';

const PRISMA_ONLY_PARAMS = new Set(['pgbouncer', 'connection_limit', 'connect_timeout', 'socket_timeout']);

const stripParams = (url: string, keys: Set<string>): string => {
	try {
		const parsed = new URL(url);
		let changed = false;
		for (const key of keys) {
			if (parsed.searchParams.has(key)) {
				parsed.searchParams.delete(key);
				changed = true;
			}
		}
		if (!changed) return url;
		// Remove trailing '?' when all params were stripped
		const result = parsed.toString();
		return result.endsWith('?') ? result.slice(0, -1) : result;
	} catch {
		return url;
	}
};

/**
 * Creates a pg.Pool safe for Supabase (and other TLS-terminating proxies):
 * - Strips sslmode from the URL (pg v8 enforces verify-full for sslmode=require,
 *   rejecting Supabase's self-signed pooler cert chain)
 * - Strips Prisma-only URL params (pgbouncer, connection_limit, etc.) that confuse pg
 * - Uses explicit ssl:{rejectUnauthorized:false} for non-local hosts
 * - Sets a 10-second connection timeout so failures are visible immediately
 *   instead of hanging for 60+ seconds (TCP default)
 */
export const createAdminPgPool = (connectionString: string): Pool => {
	const dbHost = new URL(
		connectionString.replace(/^postgres(ql)?:\/\//, 'https://'),
	).hostname;
	const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbHost);

	const cleaned = stripParams(
		connectionString
			.replace(/\?sslmode=[^&]*&/, '?')
			.replace(/\?sslmode=[^&]*$/, '')
			.replace(/&sslmode=[^&]*/g, ''),
		PRISMA_ONLY_PARAMS,
	);

	return new Pool({
		connectionString: cleaned,
		ssl: isLocalDb ? false : { rejectUnauthorized: false },
		connectionTimeoutMillis: 10_000,
	});
};
