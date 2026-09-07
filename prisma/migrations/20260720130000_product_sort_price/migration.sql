-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sortPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Best-effort backfill for existing rows so nothing sorts as "free" before
-- the app-level recompute (seed script / admin save / next order / the daily
-- window-revalidation cron — see src/utils/productEffectivePrice.ts) catches
-- up. Deliberately approximate: it covers the product-level base/discount
-- price correctly but not the "cheapest in-stock variant" cascade, since that
-- business logic already lives in TypeScript and re-deriving it here would
-- create a second copy that could drift. Rows with variants keep basePrice
-- as their placeholder until the next app-level recompute — this repo's
-- build already reseeds the whole catalog on every deploy
-- (docs/cicd-pipeline.md §5), so in practice that's within the same deploy.
UPDATE "Product" SET "sortPrice" = "basePrice";

UPDATE "Product"
SET "sortPrice" = "discountPrice"
WHERE "discountPrice" IS NOT NULL
  AND "discountPrice" > 0
  AND "discountPrice" < "basePrice"
  AND "discountStartAt" IS NULL
  AND "discountEndAt" IS NULL;

UPDATE "Product"
SET "sortPrice" = "discountPrice"
WHERE "discountPrice" IS NOT NULL
  AND "discountPrice" > 0
  AND "discountPrice" < "basePrice"
  AND "discountStartAt" IS NOT NULL
  AND "discountEndAt" IS NOT NULL
  AND now() >= "discountStartAt"
  AND now() < "discountEndAt";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_inStock_sortPrice_idx" ON "Product"("inStock", "sortPrice");
