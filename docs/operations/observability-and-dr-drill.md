# Operational Readiness: Alerts and Backup/Restore Drill

## Centralized logs + alert channels

The app emits structured operational events from `src/lib/opsMonitoring.ts`:

- `api-5xx` and `api-5xx-spike`
- `rate-limit-blocked` and `rate-limit-spike`
- `stripe-webhook-failure` and `stripe-webhook-failure-spike`

These events are written to stdout/stderr as JSON-like objects and can be aggregated by your log platform.

Alert webhook target resolution:

1. `OPS_ALERT_WEBHOOK_URL` (preferred)
2. `CACHE_REVALIDATE_ALERT_WEBHOOK_URL` (fallback)

If no webhook URL is set, events are still logged locally/centrally via stdout.

## What is monitored right now

- 5xx spikes:
  - `POST /api/payments/stripe`
  - `POST /api/payments/stripe/webhook`
- Auth/rate-limit spikes:
  - high-risk limiter keys from `src/lib/rateLimit.ts` (auth + proxy-protected buckets)
- Stripe webhook failures:
  - not configured
  - order finalize failure
  - handler exceptions

## Backup + restore drill

Run:

```bash
npm run db:backup-restore:drill
```

The drill script:

1. Creates a backup (`pg_dump` custom format).
2. Creates a temporary restore database.
3. Restores backup into the temporary database.
4. Compares row counts for critical tables.
5. Compares aggregate `Order.total` checksum.
6. Drops temporary restore database.

Script file:

- `scripts/db-backup-restore-drill.sh`

## Pass criteria

The drill is considered **PASS** only if all conditions hold:

1. Backup command exits successfully.
2. Restore command exits successfully.
3. Row counts match between source and restored DB for:
   - `"user"`
   - `"Product"`
   - `"Order"`
   - `"OrderItem"`
   - `"Review"`
   - `"_prisma_migrations"`
4. Aggregate `SUM("Order"."total")` matches between source and restored DB.
5. Temporary restore database cleanup succeeds.

If any condition fails, the script exits non-zero.
