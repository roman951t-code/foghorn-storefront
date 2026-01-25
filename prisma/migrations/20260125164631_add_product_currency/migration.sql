-- CreateEnum
CREATE TYPE "ProductCurrency" AS ENUM ('UAH', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "ProductAuditType" AS ENUM ('FIELD_CHANGE', 'NOTE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "currency" "ProductCurrency" NOT NULL DEFAULT 'UAH';

-- CreateTable
CREATE TABLE "ProductAuditEntry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "ProductAuditType" NOT NULL,
    "field" TEXT,
    "fromValue" TEXT,
    "toValue" TEXT,
    "note" TEXT,
    "adminEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAuditEntry_productId_createdAt_idx" ON "ProductAuditEntry"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProductAuditEntry" ADD CONSTRAINT "ProductAuditEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
