// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/config/env';

const connectionString = env.DATABASE_URL;

// pg v8+ treats sslmode=require as verify-full (strict chain verification).
// Supabase's pooler endpoints use a certificate chain that fails strict verification.
// Parse the host to distinguish local/CI connections (no SSL) from remote ones.
const dbUrl = new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://'));
const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbUrl.hostname);
const ssl = isLocalDb ? false : { rejectUnauthorized: false };

const adapter = new PrismaPg({ connectionString, ssl });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
