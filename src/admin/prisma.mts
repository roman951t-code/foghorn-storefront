import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is required for AdminJS Prisma client');
}

// pg v8+ treats sslmode=require as verify-full (strict chain verification).
// Supabase's pooler endpoints use a certificate chain that fails strict verification.
const dbUrl = new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://'));
const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbUrl.hostname);
const ssl = isLocalDb ? false : { rejectUnauthorized: false };

const adapter = new PrismaPg({ connectionString, ssl });

const globalForPrisma = global as unknown as { adminPrisma?: PrismaClient };

export const prisma = globalForPrisma.adminPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.adminPrisma = prisma;
