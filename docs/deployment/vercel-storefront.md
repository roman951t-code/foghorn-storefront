# Vercel Storefront Deployment

This repo is ready to deploy the storefront to Vercel.

The AdminJS runtime is not part of the storefront deployment target here:

- Storefront: Next.js app in this repo root
- Admin panel: standalone Express runtime in `src/admin/server.mts`

Deploy AdminJS separately on a Node host or as a separate project with its own runtime plan.

## 1. Create the Vercel project

1. Import the repo into Vercel.
2. Keep the project root at the repository root.
3. Use Node.js `20.9+`.

`package.json` and `.nvmrc` already pin the expected runtime baseline.

## 2. Configure environment variables

Start from `.env.example`.

Required for production storefront deploys:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `ENCRYPTION_KEY`
- `CACHE_REVALIDATE_SECRET`
- `CRON_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Required when Stripe checkout is enabled:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Recommended:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
- `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`
- `ALLOWED_APP_HOSTS`
- `CACHE_REVALIDATE_ALERT_WEBHOOK_URL`
- `OPS_ALERT_WEBHOOK_URL`

## 3. App URL behavior

The app now resolves its public URL in this order:

1. `NEXT_PUBLIC_APP_URL`
2. Vercel system env fallbacks for preview / production deployments
3. local fallback in development only

That means preview deployments can work without hardcoding preview domains.

For production, still set `NEXT_PUBLIC_APP_URL` to your canonical store domain.

## 4. Cron behavior

`vercel.json` contains the scheduled cache window revalidation job:

- `/api/cache/revalidate/windows?lookbackSeconds=180&limit=500`
- schedule: every minute

That route requires `CRON_SECRET`.

If you deploy on Vercel Hobby, minute-level cron is not available. In that case:

- upgrade the project to a plan that supports minute cron, or
- remove/replace the Vercel cron and trigger the same endpoint from an external scheduler

Without this scheduler, timed product publish windows, discount windows, scheduled page publishing, and promo banner windows can stay stale until another mutation revalidates cache.

## 5. Security expectations

Production storefront startup now fails fast if these are missing:

- `BETTER_AUTH_SECRET`
- `ENCRYPTION_KEY`
- `CACHE_REVALIDATE_SECRET`
- `CRON_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Additional production hardening included in the app:

- strict auth/session cookies
- CSP with nonce-based scripts
- secret-protected cache revalidation
- distributed rate limiting for high-risk routes
- trusted-host filtering for production requests
- secure response headers

## 6. Deploy checklist

1. Set all required env vars in Vercel.
2. Confirm your database is reachable from Vercel.
3. Confirm Upstash Redis credentials are valid.
4. Confirm `NEXT_PUBLIC_APP_URL` points to the correct canonical domain.
5. Confirm Stripe webhook secret is set if card payments are enabled.
6. Confirm `CRON_SECRET` is set before enabling the production deployment.
7. Run `npm run lint` before the first production deploy.

## 7. Search indexing checklist

After the canonical production deployment is live:

1. Verify that `/robots.txt` and `/sitemap.xml` return HTTP 200 on the canonical domain.
2. Add `https://shop.foghornbay.com/` as a property in Google Search Console and submit `/sitemap.xml`.
3. Add the same site in Bing Webmaster Tools (or import it from Google Search Console) and submit `/sitemap.xml`.
4. Run `npm run seo:submit-indexnow` to notify participating search engines about every URL in the live sitemap.
5. Inspect the home page, one category, and one product URL in both webmaster tools. Request indexing for the most important URLs after a major launch or migration.

## 8. After deploy

Verify:

- sign up / sign in
- cart and checkout
- Stripe checkout session creation
- webhook-driven order finalization
- cache revalidation endpoint auth
- scheduled cache window revalidation cron
- CSP report endpoint receiving only expected traffic
