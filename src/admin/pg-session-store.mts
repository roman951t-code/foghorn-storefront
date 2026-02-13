import session, { type SessionData } from 'express-session';
import { Pool } from 'pg';

const TABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const DEFAULT_SESSION_TABLE = 'admin_session';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_CLEANUP_INTERVAL_SECONDS = 60 * 15;

const globalForSessionStore = global as unknown as {
	adminSessionStorePool?: Pool;
};

const toPositiveInt = (value: number | undefined, fallback: number) =>
	typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;

const quoteIdentifier = (value: string) => `"${value}"`;

const normalizeTableName = (raw: string | undefined) => {
	const tableName = raw?.trim() || DEFAULT_SESSION_TABLE;
	if (!TABLE_NAME_PATTERN.test(tableName)) {
		throw new Error(
			`ADMINJS_SESSION_TABLE must match ${TABLE_NAME_PATTERN.source}; received "${tableName}"`
		);
	}
	return tableName;
};

const getOrCreatePool = (connectionString: string) => {
	if (process.env.NODE_ENV !== 'production' && globalForSessionStore.adminSessionStorePool) {
		return globalForSessionStore.adminSessionStorePool;
	}

	const pool = new Pool({ connectionString });
	if (process.env.NODE_ENV !== 'production') {
		globalForSessionStore.adminSessionStorePool = pool;
	}
	return pool;
};

class PgSessionStore extends session.Store {
	private readonly pool: Pool;
	private readonly tableNameSql: string;
	private readonly defaultTtlMs: number;
	private readonly ensureTablePromise: Promise<void>;

	constructor(
		pool: Pool,
		tableName: string,
		defaultTtlSeconds: number,
		cleanupIntervalSeconds: number
	) {
		super();
		this.pool = pool;
		this.tableNameSql = quoteIdentifier(tableName);
		this.defaultTtlMs = defaultTtlSeconds * 1000;
		this.ensureTablePromise = this.ensureTable();

		if (cleanupIntervalSeconds > 0) {
			const cleanupTimer = setInterval(() => {
				void this.pruneExpired();
			}, cleanupIntervalSeconds * 1000);
			cleanupTimer.unref();
		}
	}

	private async ensureTable() {
		await this.pool.query(
			`CREATE TABLE IF NOT EXISTS ${this.tableNameSql} (
				sid VARCHAR PRIMARY KEY,
				sess JSON NOT NULL,
				expire TIMESTAMPTZ NOT NULL
			)`
		);
		await this.pool.query(
			`CREATE INDEX IF NOT EXISTS ${quoteIdentifier(
				`${this.tableNameSql.replace(/"/g, '')}_expire_idx`
			)} ON ${this.tableNameSql} (expire)`
		);
	}

	private resolveExpiryDate(sess: SessionData) {
		const expires = sess.cookie?.expires;
		if (expires) {
			const expiresDate = new Date(expires);
			if (!Number.isNaN(expiresDate.getTime())) {
				return expiresDate;
			}
		}

		const maxAge = sess.cookie?.maxAge;
		if (typeof maxAge === 'number' && Number.isFinite(maxAge) && maxAge > 0) {
			return new Date(Date.now() + maxAge);
		}

		return new Date(Date.now() + this.defaultTtlMs);
	}

	private async pruneExpired() {
		try {
			await this.ensureTablePromise;
			await this.pool.query(`DELETE FROM ${this.tableNameSql} WHERE expire < NOW()`);
		} catch (error) {
			console.error('[admin-session] Failed to prune expired sessions', error);
		}
	}

	override get(
		sid: string,
		callback: (error: unknown, session?: SessionData | null) => void
	): void {
		void (async () => {
			await this.ensureTablePromise;
			const result = await this.pool.query<{ sess: unknown }>(
				`SELECT sess FROM ${this.tableNameSql} WHERE sid = $1 AND expire > NOW()`,
				[sid]
			);
			if (result.rowCount === 0) {
				callback(null, null);
				return;
			}
			const rawSession = result.rows[0]?.sess;
			if (typeof rawSession === 'string') {
				callback(null, JSON.parse(rawSession) as SessionData);
				return;
			}
			callback(null, rawSession as SessionData);
		})().catch((error) => callback(error));
	}

	override set(
		sid: string,
		sess: SessionData,
		callback: (error?: unknown) => void = () => {}
	): void {
		void (async () => {
			await this.ensureTablePromise;
			const expiresAt = this.resolveExpiryDate(sess);
			await this.pool.query(
				`INSERT INTO ${this.tableNameSql} (sid, sess, expire)
				VALUES ($1, $2::json, $3)
				ON CONFLICT (sid) DO UPDATE
				SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`,
				[sid, JSON.stringify(sess), expiresAt]
			);
			callback();
		})().catch((error) => callback(error));
	}

	override touch(
		sid: string,
		sess: SessionData,
		callback: (error?: unknown) => void = () => {}
	): void {
		void (async () => {
			await this.ensureTablePromise;
			const expiresAt = this.resolveExpiryDate(sess);
			await this.pool.query(
				`UPDATE ${this.tableNameSql}
				SET sess = $2::json, expire = $3
				WHERE sid = $1`,
				[sid, JSON.stringify(sess), expiresAt]
			);
			callback();
		})().catch((error) => callback(error));
	}

	override destroy(sid: string, callback: (error?: unknown) => void = () => {}): void {
		void (async () => {
			await this.ensureTablePromise;
			await this.pool.query(`DELETE FROM ${this.tableNameSql} WHERE sid = $1`, [sid]);
			callback();
		})().catch((error) => callback(error));
	}
}

export const createAdminSessionStore = ({
	connectionString,
	tableName,
	defaultTtlSeconds,
	cleanupIntervalSeconds,
}: {
	connectionString: string;
	tableName?: string;
	defaultTtlSeconds?: number;
	cleanupIntervalSeconds?: number;
}) => {
	const normalizedTableName = normalizeTableName(tableName);
	const ttlSeconds = toPositiveInt(defaultTtlSeconds, DEFAULT_TTL_SECONDS);
	const cleanupSeconds = toPositiveInt(
		cleanupIntervalSeconds,
		DEFAULT_CLEANUP_INTERVAL_SECONDS
	);
	const pool = getOrCreatePool(connectionString);
	return new PgSessionStore(pool, normalizedTableName, ttlSeconds, cleanupSeconds);
};
