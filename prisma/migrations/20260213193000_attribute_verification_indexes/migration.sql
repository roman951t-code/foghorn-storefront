CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

CREATE INDEX IF NOT EXISTS "ProductAttributeValue_productId_idx"
ON "ProductAttributeValue"("productId");

CREATE INDEX IF NOT EXISTS "ProductAttributeValue_attributeId_value_productId_idx"
ON "ProductAttributeValue"("attributeId", "value", "productId");
