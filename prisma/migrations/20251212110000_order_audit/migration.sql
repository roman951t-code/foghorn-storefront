-- CreateEnum
CREATE TYPE "public"."OrderAuditType" AS ENUM ('STATUS_CHANGE', 'NOTE');

-- CreateTable
CREATE TABLE "public"."OrderAuditEntry" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "public"."OrderAuditType" NOT NULL,
    "fromStatus" "public"."OrderStatus",
    "toStatus" "public"."OrderStatus",
    "note" TEXT,
    "adminEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderAuditEntry_orderId_createdAt_idx" ON "public"."OrderAuditEntry"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."OrderAuditEntry" ADD CONSTRAINT "OrderAuditEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
