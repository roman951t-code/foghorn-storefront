-- CreateEnum
CREATE TYPE "UserAdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN "vip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."user" ADD COLUMN "adminStatus" "UserAdminStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "public"."user" ADD COLUMN "adminNotes" TEXT;

