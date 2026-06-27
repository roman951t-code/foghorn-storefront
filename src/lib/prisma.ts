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

const pool = new Pool({
  connectionString: urlWithoutSslMode,
  // Remote (Supabase): keep traffic encrypted but skip certificate chain verification.
  // The self-signed cert in Supabase's pooler chain fails pg v8 strict verification.
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
