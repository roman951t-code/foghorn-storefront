# Online Store

Production-focused Next.js storefront with a separate AdminJS runtime.

The Vercel deployment target in this repo is the storefront. The AdminJS runtime in
`src/admin/server.mts` is a separate Express server and should be deployed separately.

## Stack

- `next@16` (App Router)
- `prisma` + PostgreSQL
- `better-auth`
- `stripe`
- `resend`
- `adminjs` (separate Express server)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env` / `.env.local`.

3. Run database migrations and generate Prisma client:

```bash
npm run db:migrate:dev
```

4. Start storefront:

```bash
npm run dev
```

5. Start admin panel (separate terminal):

```bash
npm run admin:dev
```

Storefront runs on `http://localhost:3000`, AdminJS runs on `http://localhost:3001/admin` by default.

## Production Runtime

Build and run storefront:

```bash
npm run build
npm run start
```

Run admin panel in production mode:

```bash
npm run admin:start
```

## Vercel Deployment

- Storefront deployment guide: `docs/deployment/vercel-storefront.md`
- Full production roadmap: `docs/deployment/production-roadmap.md`
- Use Node.js `20.9+` (`package.json` engines and `.nvmrc` are included)
- `vercel.json` includes the scheduled cache-boundary cron for published pages, scheduled promos, and product schedule windows
- AdminJS is not part of the storefront Vercel deployment target in this repo

## Critical Environment Variables

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` (recommended canonical app URL; Vercel preview/prod fallbacks can be derived from Vercel system envs)
- `RESEND_API_KEY`
- `EMAIL_FROM` (required in production, must use your verified sender domain)
- `ENCRYPTION_KEY` (required in production, 64-char hex)
- `CACHE_REVALIDATE_SECRET` (required in production)
- `CRON_SECRET` (required in production; used by `vercel.json` cron auth)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (required in production for distributed rate limiting)
- Stripe (if enabled): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Email Deliverability Note

`EMAIL_FROM` must not use `@resend.dev` in production.  
Use a verified sending domain in Resend and ensure SPF/DKIM/DMARC are configured.

## Local Hardened Profile

- Revalidate secret is required in all environments (`CACHE_REVALIDATE_SECRET` or `CRON_SECRET`).
- `LOCAL_HARDENED_PROFILE` (default: `true` in development) enables broader middleware API rate limits.
- `DEV_CSP_MODE` controls CSP in development:
  - `off` (default)
  - `report-only`
  - `enforce`

## Useful Scripts

- `npm run lint` - Type-check only (`tsc --noEmit`)
- `npm run db:migrate:dev` - Local migration + Prisma generate
- `npm run db:migrate:deploy` - Deploy migrations
- `npm run db:seed` - Seed database
- `npm run perf:load` - Load test script
- `npm run cache:revalidate:windows` - Cache window revalidation script
