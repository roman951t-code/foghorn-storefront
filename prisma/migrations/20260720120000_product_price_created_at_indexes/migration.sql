-- Backs the price-range filters (basePrice/discountPrice) and the
-- orderBy=new sort (createdAt) used by the subcategory/search/tag product
-- fetchers, none of which had a matching index.
CREATE INDEX IF NOT EXISTS "Product_basePrice_idx" ON "Product"("basePrice");

CREATE INDEX IF NOT EXISTS "Product_discountPrice_idx" ON "Product"("discountPrice");

CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
