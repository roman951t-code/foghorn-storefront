-- Backfill null notification methods before making the column required.
UPDATE "user"
SET "notificationMethod" = 'email'
WHERE "notificationMethod" IS NULL;

ALTER TABLE "user"
ALTER COLUMN "notificationMethod" SET NOT NULL;
