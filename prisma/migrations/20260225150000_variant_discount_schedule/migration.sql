-- Add per-variant discount schedule fields.
ALTER TABLE "ProductVariant"
ADD COLUMN "discountPrice" DECIMAL(10,2),
ADD COLUMN "discountStartAt" TIMESTAMP(3),
ADD COLUMN "discountEndAt" TIMESTAMP(3);

CREATE INDEX "ProductVariant_discountStartAt_discountEndAt_idx"
ON "ProductVariant"("discountStartAt", "discountEndAt");
