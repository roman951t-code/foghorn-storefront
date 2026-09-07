// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '@/config/env';

const connectionString = env.DATABASE_URL;

// Detect local connections (localhost, Docker CI service named 'postgres', loopback)
const dbHost = new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://')).hostname;
const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbHost);

// Strip ?sslmode from the URL before passing to pg.
// pg v8 parses sslmode=require as 'verify-full' (strict certificate chain) and
// applies it during TLS handshake independently of the Pool ssl option.
// Removing it lets our explicit ssl Pool option below be the sole SSL configuration.
const urlWithoutSslMode = connectionString
  .replace(/\?sslmode=[^&]*&/, '?') // sslmode is first of several params
  .replace(/\?sslmode=[^&]*$/, '')  // sslmode is the only param
  .replace(/&sslmode=[^&]*/g, ''); // sslmode is not the first param

// pg.Pool doesn't understand Prisma's own `connection_limit` URL param (that's
// only honored when Prisma parses the connection string itself, not when a
// driver adapter hands pg a Pool directly) — left unread, pg defaults to
// `max: 10`. Reading `connection_limit` here makes the pool actually obey the
// budget the connection string declares, rather than silently using pg's
// default.
//
// MAX_SAFE_POOL_SIZE is a hard ceiling on top of that, independent of
// whatever the URL says: every concurrent Vercel serverless instance opens
// its own Pool, so the real constraint isn't "how many connections does one
// instance want" but "instances-in-flight × per-instance max" against
// Supabase's pooler-side client cap (Supavisor — even in transaction mode —
// rejects new clients past its configured limit with DriverAdapterError:
// (EMAXCONN) max client connections reached). Raising connection_limit in
// the env var to fix in-request query serialization (multiple Promise.all
// calls sharing one connection) is correct, but a value that's safe for one
// instance can still blow the aggregate budget once traffic spins up enough
// concurrent instances — this happened in production going from
// connection_limit=1 to =10. Clamping here keeps future env var bumps from
// silently reintroducing that failure mode.
const MAX_SAFE_POOL_SIZE = 5;
const connectionLimitParam = Number(
  new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://')).searchParams.get(
    'connection_limit',
  ),
);
const poolMax =
  Number.isInteger(connectionLimitParam) && connectionLimitParam > 0
    ? Math.min(connectionLimitParam, MAX_SAFE_POOL_SIZE)
    : 3;

const pool = new Pool({
  connectionString: urlWithoutSslMode,
  // Remote (Supabase): keep traffic encrypted but skip certificate chain verification.
  // The self-signed cert in Supabase's pooler chain fails pg v8 strict verification.
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: poolMax,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
