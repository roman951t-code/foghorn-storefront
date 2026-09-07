# Production Deployment Roadmap

This project has two production applications:

- Storefront: Next.js app in the repository root
- Admin panel: separate AdminJS + Express runtime in `src/admin/server.mts`

They should be deployed as two separate services, but they should share one production PostgreSQL database and one production Redis instance.

## Recommended stack

This is the simplest production stack for your current codebase:

- Git hosting: GitHub
- Storefront hosting: Vercel
- Admin hosting: Render Web Service
- Shared database: Neon PostgreSQL
- Shared rate-limiting Redis: Upstash Redis
- Email: Resend
- Payments: Stripe
- Phone OTP: Twilio
- DNS: Cloudflare or your domain registrar DNS

Why this stack fits your app:

- Vercel is the best fit for the Next.js storefront
- Render is a simple fit for the separate long-running Express admin server
- Neon works well with Prisma and Vercel
- Upstash fits your production rate-limiting setup
- Resend, Stripe, and Twilio already match your codebase

If you prefer one host for the admin other than Render, Railway is the main alternative. Keep the storefront on Vercel.

## Core deployment rule

Use this rule for the whole project:

1. One production storefront deployment
2. One production admin deployment
3. One shared production database
4. One shared production Redis instance
5. One migration runner only

The fifth rule is important. Because the storefront and admin share the same schema, database migrations must run once per release, not once per service.

For a newcomer, the safest first setup is:

- Run `npm run db:migrate:deploy` manually before each production release
- Do not run migrations automatically from both Vercel and Render

Later, when you are comfortable, you can move migrations into CI.

## Environment model

Create these environments from the start:

1. Local
2. Staging
3. Production

Do not let staging share the production database.

Recommended database layout:

- `store-staging` database for staging storefront and staging admin
- `store-production` database for production storefront and production admin

Recommended domain layout:

- `store.example.com` for the storefront
- `admin.example.com` for the admin panel

## Shared preparation roadmap

Do these steps before deploying either app.

### Step 1. Put the code in GitHub

1. Push the repo to GitHub.
2. Protect the `main` branch if possible.
3. Treat `main` as production-ready code only.

Recommended habit:

- feature branches for work
- pull request review before merge
- Vercel previews for storefront changes

### Step 2. Buy and plan your domains

1. Buy one root domain if you do not have one.
2. Decide the storefront domain.
3. Decide the admin subdomain.

Example:

- storefront: `store.example.com`
- admin: `admin.example.com`

Do not expose the admin panel on the same domain path as the storefront in production.

### Step 3. Create a secret inventory

Create a secure note in a password manager and store:

- database credentials
- Redis credentials
- `BETTER_AUTH_SECRET`
- `ENCRYPTION_KEY`
- `CACHE_REVALIDATE_SECRET`
- `CRON_SECRET`
- Stripe keys
- Resend key
- Twilio credentials
- admin credentials
- `ADMINJS_SESSION_SECRET`
- `ADMINJS_COOKIE_PASSWORD`

Use long random values for every secret. Do not reuse one secret for multiple purposes.

### Step 4. Provision the shared PostgreSQL database

Recommended: Neon PostgreSQL.

1. Create one Neon project for this online store.
2. Pick the region closest to your customers and your app hosting.
3. Create one production database.
4. Create one staging database or staging branch.
5. Turn on backups.
6. Copy the connection strings.

Best practice for shared database access:

- storefront gets its own production `DATABASE_URL`
- admin gets its own production `DATABASE_URL`
- both point to the same production database

Even if both users have similar permissions at first, separate credentials make rotation and incident response easier.

### Step 5. Provision shared Redis

Recommended: Upstash Redis.

1. Create one production Redis database.
2. Create one staging Redis database.
3. Keep the Redis region close to the app region.
4. Save `UPSTASH_REDIS_REST_URL`.
5. Save `UPSTASH_REDIS_REST_TOKEN`.

Your storefront uses Redis-backed rate limiting in production, so this should be treated as required infrastructure.

### Step 6. Set up email

Recommended: Resend.

1. Create a Resend account.
2. Add your sending domain.
3. Complete SPF, DKIM, and any required DNS records.
4. Use a real production sender such as `orders@store.example.com`.
5. Save `RESEND_API_KEY`.
6. Save `EMAIL_FROM`.

Do not launch production with `@resend.dev` senders.

### Step 7. Set up payments

Recommended: Stripe.

1. Create the production Stripe account.
2. Set the live API keys.
3. Plan the webhook destination as the storefront URL:
   `https://store.example.com/api/payments/stripe/webhook`
4. Save `STRIPE_SECRET_KEY`.
5. Save `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
6. Save `STRIPE_WEBHOOK_SECRET` after creating the webhook endpoint.

### Step 8. Set up phone OTP

Your current production phone OTP flow sends SMS through Twilio Programmable Messaging.

1. Create the Twilio account.
2. Buy or configure the sending phone number.
3. Save `TWILIO_ACCOUNT_SID`.
4. Save `TWILIO_AUTH_TOKEN`.
5. Save `TWILIO_FROM_PHONE`.

Later improvement:

- If phone auth becomes high-risk or high-volume, consider moving from custom SMS OTP sending to Twilio Verify. It is purpose-built for verification flows.

### Step 9. Decide the migration process

For the first production launch, use this exact process:

1. Merge code to `main`.
2. Run `npm run lint`.
3. Run `npm run db:migrate:deploy` once against the production database.
4. Deploy the storefront.
5. Deploy the admin.

Do not configure both deployments to run `prisma migrate deploy` automatically.

## Roadmap A: Storefront production deployment

This is the recommended production host for the storefront.

### Step 1. Create the Vercel project

1. Import the GitHub repository into Vercel.
2. Keep the project root at the repository root.
3. Use the default Next.js framework detection.
4. Confirm Node.js `20.9+`.

### Step 2. Add storefront production environment variables

Start from `.env.example`.

Required for production:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_SECRET`
- `ENCRYPTION_KEY`
- `CACHE_REVALIDATE_SECRET`
- `CRON_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `EMAIL_FROM`

If Stripe is enabled:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

If phone OTP is enabled:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

Recommended additional values:

- `ALLOWED_APP_HOSTS`
- `CACHE_REVALIDATE_ALERT_WEBHOOK_URL`
- `OPS_ALERT_WEBHOOK_URL`

### Step 3. Connect the storefront domain

1. Add `store.example.com` as the production domain in Vercel.
2. Configure the DNS records.
3. Wait for SSL to become active.
4. Make sure `NEXT_PUBLIC_APP_URL` matches the final production domain.

### Step 4. Configure cron behavior

Your repo already contains a Vercel cron entry for scheduled cache-window revalidation.

Before launch:

1. Confirm `CRON_SECRET` is set.
2. Confirm your Vercel plan supports the cron frequency you want.
3. If not, replace the Vercel cron with an external scheduler that calls:
   `/api/cache/revalidate/windows?lookbackSeconds=180&limit=500`

### Step 5. First deployment

1. Trigger a Vercel production deploy.
2. Watch the build logs.
3. Fix any missing env variable errors before retrying.
4. After deploy, open the live storefront.

### Step 6. Post-deploy verification

Test the live storefront in this order:

1. Home page loads
2. Product listing pages load
3. Product detail page loads
4. Search works
5. Sign up works
6. Sign in works
7. Email verification works
8. Phone verification works
9. Add to cart works
10. Checkout page works
11. Stripe checkout session creation works
12. Stripe webhook finalizes the order
13. Order appears in the user account
14. Cache revalidation works after admin content changes

> **Steps 11-12 don't apply as-is today.** Checkout is intentionally demo-mode — every
> order goes through `createOrderAction` (always `PENDING`, no payment collected)
> regardless of payment method chosen; the Stripe flow described in
> `universal-app-doc.md` §8.3 exists and works but isn't wired to the checkout UI. Keep
> 11-12 here as the checklist for *if* real payment collection is ever turned on —
> until then, treat them as not applicable rather than failing.

### Step 7. Turn on operational checks

For the storefront, monitor:

- Vercel deployment logs
- Vercel function logs
- Stripe webhook delivery logs
- Resend activity
- Twilio message logs
- Upstash usage and errors
- database CPU, storage, and connections

## Roadmap B: Admin panel production deployment

This is the recommended production host for the admin runtime.

### Step 1. Create the admin hosting service

Recommended: Render Web Service.

1. Create a new Render Web Service from the same GitHub repository.
2. Use the repository root as the project root.
3. Set the build command to `npm ci && npx prisma generate`.
4. Set the start command to `npm run admin:start`.
5. Use a plan that does not sleep when idle.

The admin panel is a separate Express server, so do not deploy it as part of the Vercel storefront project.
Do not use `npm run build` as the admin build command unless you intentionally want Render to build the storefront too.

### Step 2. Add admin production environment variables

Required admin-specific values:

- `DATABASE_URL`
- `ADMINJS_EMAIL`
- `ADMINJS_PASSWORD`
- `ADMINJS_SESSION_SECRET`
- `ADMINJS_COOKIE_PASSWORD`
- `ADMINJS_PUBLIC_URL`

Recommended admin hardening values:

- `ADMINJS_READONLY_EMAIL`
- `ADMINJS_READONLY_PASSWORD`
- `ADMINJS_ALLOWED_IPS`
- `ADMINJS_ALLOWED_ORIGINS`
- `ADMINJS_REQUIRE_ACTIVE_USER=true`

Shared values that should still be set because the admin runtime uses the same repo and shared libraries:

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY` if admin-triggered emails are used

Important:

- Use the same production database as the storefront
- Do not use the storefront's session secrets for admin
- Use a different admin password from your personal email password

### Step 3. Connect the admin domain

1. Add `admin.example.com` to Render.
2. Configure DNS records.
3. Set `ADMINJS_PUBLIC_URL=https://admin.example.com/admin`.
4. Set `ADMINJS_ALLOWED_ORIGINS=https://admin.example.com,https://store.example.com`.
5. If possible, set `ADMINJS_ALLOWED_IPS` to your office or home IP addresses.

### Step 4. First admin deployment

1. Deploy the admin service.
2. Open `/admin/login`.
3. Confirm the login page loads.
4. Log in with the production admin account.
5. Confirm no client asset errors appear.
6. Confirm dashboard, products, orders, pages, and banners load.

### Step 5. Admin safety checks

Before you start daily use, verify:

1. Failed login attempts are blocked after too many retries.
2. Session cookies are secure in production.
3. Mutations from unexpected origins are rejected.
4. Product edits trigger storefront revalidation.
5. Page and banner edits trigger storefront revalidation.
6. Uploads and images still work.

### Step 6. Create safer admin access habits

Recommended habits:

1. Use one main admin account only for you.
2. Create a separate readonly account for support or content review.
3. Do not browse the admin panel on public Wi-Fi without VPN.
4. Rotate admin secrets if you ever share server access with someone else.

## Shared release process after launch

After both services are live, use this release order:

1. Merge to `main`
2. Run `npm run lint`
3. Run `npm run db:migrate:deploy` once
4. Deploy storefront
5. Smoke test storefront
6. Deploy admin if that release touched admin code
7. Smoke test admin
8. Confirm a test mutation revalidates storefront cache

If a release changes only storefront UI, you usually do not need to redeploy admin.

If a release changes database schema, deploy both services after the migration.

## Minimum viable launch order

If you want the simplest safe path, do it in exactly this order:

1. Set up Neon production database
2. Set up Upstash production Redis
3. Set up Resend production domain
4. Set up Stripe live keys and webhook
5. Set up Twilio live SMS sender
6. Add all production env vars
7. Run `npm run lint`
8. Run `npm run db:migrate:deploy`
9. Deploy storefront to Vercel
10. Verify checkout and auth
11. Deploy admin to Render
12. Verify admin login and mutations
13. Test that admin product edits appear on the storefront
14. Only then announce the launch

## Nice-to-have improvements after launch

These are not required for day one, but they are good next steps:

1. Add staging storefront and staging admin
2. Move migrations into CI
3. Add external uptime monitoring against `/api/health` and `/healthz`
4. Tune Sentry alert rules after real production traffic starts
5. Add database connection pooling if traffic grows
6. Consider Twilio Verify for stronger OTP handling
7. Add disaster recovery runbooks and restore drills
