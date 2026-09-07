-- Keep Product.stock / Product.inStock consistent with ProductVariant stock totals.

CREATE OR REPLACE FUNCTION "public"."recompute_product_inventory_from_variants"(p_product_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
	total_stock INTEGER;
BEGIN
	IF p_product_id IS NULL THEN
		RETURN;
	END IF;

	SELECT COALESCE(SUM(v.stock), 0)::int
	INTO total_stock
	FROM "ProductVariant" v
	WHERE v."productId" = p_product_id;

	UPDATE "Product" p
	SET stock = total_stock,
		"inStock" = (total_stock > 0)
	WHERE p.id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."sync_product_inventory_from_variant_mutation"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM "public"."recompute_product_inventory_from_variants"(COALESCE(NEW."productId", OLD."productId"));

	IF TG_OP = 'UPDATE' AND OLD."productId" IS DISTINCT FROM NEW."productId" THEN
		PERFORM "public"."recompute_product_inventory_from_variants"(OLD."productId");
	END IF;

	RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS "product_variant_sync_product_inventory" ON "ProductVariant";

CREATE TRIGGER "product_variant_sync_product_inventory"
AFTER INSERT OR UPDATE OR DELETE ON "ProductVariant"
FOR EACH ROW
EXECUTE FUNCTION "public"."sync_product_inventory_from_variant_mutation"();

-- Block manual stock drift for products that have variants.
CREATE OR REPLACE FUNCTION "public"."enforce_product_inventory_for_variant_products"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	total_stock INTEGER;
BEGIN
	IF EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId" = NEW.id LIMIT 1) THEN
		SELECT COALESCE(SUM(v.stock), 0)::int
		INTO total_stock
		FROM "ProductVariant" v
		WHERE v."productId" = NEW.id;

		NEW.stock := total_stock;
		NEW."inStock" := (total_stock > 0);
	END IF;

	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "product_enforce_variant_inventory" ON "Product";

CREATE TRIGGER "product_enforce_variant_inventory"
BEFORE UPDATE OF stock, "inStock" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION "public"."enforce_product_inventory_for_variant_products"();

-- One-time backfill for all current products that have variants.
WITH variant_totals AS (
	SELECT
		"productId",
		COALESCE(SUM(stock), 0)::int AS total_stock
	FROM "ProductVariant"
	GROUP BY "productId"
)
UPDATE "Product" p
SET stock = vt.total_stock,
	"inStock" = (vt.total_stock > 0)
FROM variant_totals vt
WHERE p.id = vt."productId"
	AND (
		p.stock IS DISTINCT FROM vt.total_stock
		OR p."inStock" IS DISTINCT FROM (vt.total_stock > 0)
	);
