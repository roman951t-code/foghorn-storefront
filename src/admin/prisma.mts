import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createAdminPgPool } from './utils/create-pg-pool.mts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is required for AdminJS Prisma client');
}

const pool = createAdminPgPool(connectionString);
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { adminPrisma?: PrismaClient };

export const prisma = globalForPrisma.adminPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.adminPrisma = prisma;
