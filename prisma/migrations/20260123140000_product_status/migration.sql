-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- Keep existing products visible on storefront/admin lists.
UPDATE "public"."Product" SET "status" = 'ACTIVE' WHERE "status" = 'DRAFT';

