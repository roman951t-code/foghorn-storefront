-- Enable trigram indexes for ILIKE/contains searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Product query pattern indexes (category/tag/availability/schedule windows).
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX IF NOT EXISTS "Product_inStock_name_idx" ON "Product"("inStock", "name");
CREATE INDEX IF NOT EXISTS "Product_status_publishStartAt_publishEndAt_idx"
ON "Product"("status", "publishStartAt", "publishEndAt");
CREATE INDEX IF NOT EXISTS "Product_categoryId_status_inStock_idx"
ON "Product"("categoryId", "status", "inStock");
CREATE INDEX IF NOT EXISTS "Product_brandId_status_inStock_idx"
ON "Product"("brandId", "status", "inStock");
CREATE INDEX IF NOT EXISTS "Product_publishStartAt_publishEndAt_idx"
ON "Product"("publishStartAt", "publishEndAt");
CREATE INDEX IF NOT EXISTS "Product_discountStartAt_discountEndAt_idx"
ON "Product"("discountStartAt", "discountEndAt");
CREATE INDEX IF NOT EXISTS "Product_tags_idx" ON "Product" USING GIN ("tags");

-- Search indexes for contains/ILIKE lookups.
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "ProductTranslation_name_trgm_idx"
ON "ProductTranslation" USING GIN ("name" gin_trgm_ops);
