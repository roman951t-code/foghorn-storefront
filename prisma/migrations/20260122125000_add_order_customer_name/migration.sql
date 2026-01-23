-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerName" TEXT;

-- Backfill
UPDATE "Order"
SET "customerName" = CASE
  WHEN "contactLastName" IS NOT NULL
    AND POSITION(LOWER("contactLastName") IN LOWER(COALESCE("contactName", ''))) > 0
    THEN NULLIF(TRIM("contactName"), '')
  ELSE NULLIF(TRIM(CONCAT_WS(' ', "contactName", "contactLastName")), '')
END
WHERE "customerName" IS NULL;
