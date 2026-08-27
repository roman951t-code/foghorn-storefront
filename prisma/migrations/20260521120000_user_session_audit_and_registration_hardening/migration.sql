-- Add user-level security audit entries for session revocation events.
CREATE TYPE "public"."UserAuditType" AS ENUM ('SESSION_REVOKED', 'SESSIONS_REVOKED');

CREATE TABLE "public"."UserAuditEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."UserAuditType" NOT NULL,
    "note" TEXT,
    "adminEmail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuditEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserAuditEntry_userId_createdAt_idx" ON "public"."UserAuditEntry"("userId", "createdAt");

ALTER TABLE "public"."UserAuditEntry"
ADD CONSTRAINT "UserAuditEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pending email registrations now store only the OTP challenge; the password lives only in Better Auth's account hash.
ALTER TABLE "public"."EmailRegistrationCode"
DROP COLUMN IF EXISTS "name",
DROP COLUMN IF EXISTS "password";
