import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is required for AdminJS Prisma client');
}

// Detect local connections (localhost, Docker CI service named 'postgres', loopback)
const dbHost = new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://')).hostname;
const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbHost);

// Strip ?sslmode from the URL before passing to pg.
// pg v8 parses sslmode=require as 'verify-full' (strict certificate chain) and
// applies it during TLS handshake independently of the Pool ssl option.
const urlWithoutSslMode = connectionString
	.replace(/\?sslmode=[^&]*&/, '?')
	.replace(/\?sslmode=[^&]*$/, '')
	.replace(/&sslmode=[^&]*/g, '');

const pool = new Pool({
	connectionString: urlWithoutSslMode,
	ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { adminPrisma?: PrismaClient };

export const prisma = globalForPrisma.adminPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.adminPrisma = prisma;
