-- Enforce stable SKU uniqueness for idempotent product imports.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "Product"
		GROUP BY "productCode"
		HAVING COUNT(*) > 1
	) THEN
		RAISE EXCEPTION 'Cannot enforce Product.productCode uniqueness: duplicate productCode values already exist.';
	END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_productCode_key" ON "Product"("productCode");
