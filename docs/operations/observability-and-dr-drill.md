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

## Error tracking and request logs

Sentry is configured for the storefront and the standalone admin runtime:

- Storefront browser/client: `src/instrumentation-client.ts`
- Storefront server/edge: `src/instrumentation.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- AdminJS Express runtime: `src/admin/observability.mts`

Sentry is inactive unless a DSN is configured. Use `NEXT_PUBLIC_SENTRY_DSN` for browser events, `SENTRY_DSN` for storefront server/edge events, and `ADMIN_SENTRY_DSN` for the admin runtime if you want a separate Sentry project.

Set `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` in CI/Vercel when you want production source maps uploaded. Without `SENTRY_AUTH_TOKEN`, builds still work but source map upload is disabled.

The admin server uses Pino/Pino HTTP for structured JSON request logs. Set `ADMIN_LOG_LEVEL=info` in production and use the hosting provider's log drain or log explorer to retain and query those logs.

Health endpoints for uptime checks:

- Storefront: `GET /api/health`
- Admin: `GET /healthz`

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
- Unhandled storefront and admin exceptions via Sentry when DSNs are configured
- Admin HTTP status codes, response times, and request IDs via Pino logs

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
