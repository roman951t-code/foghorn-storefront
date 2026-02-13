# Online Store

Production-focused Next.js storefront with a separate AdminJS runtime.

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

## Critical Environment Variables

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` (required in production, must be `https://` for non-localhost)
- `RESEND_API_KEY`
- `EMAIL_FROM` (required in production, must use your verified sender domain)
- `ENCRYPTION_KEY` (required in production, 64-char hex)
- `CACHE_REVALIDATE_SECRET` (required in production)
- Stripe (if enabled): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Email Deliverability Note

`EMAIL_FROM` must not use `@resend.dev` in production.  
Use a verified sending domain in Resend and ensure SPF/DKIM/DMARC are configured.

## Useful Scripts

- `npm run lint` - Type-check only (`tsc --noEmit`)
- `npm run db:migrate:dev` - Local migration + Prisma generate
- `npm run db:migrate:deploy` - Deploy migrations
- `npm run db:seed` - Seed database
- `npm run perf:load` - Load test script
- `npm run cache:revalidate:windows` - Cache window revalidation script
