# Universal Documentation: Online Store (Next.js Storefront + AdminJS Admin Panel)

> Purpose: This document provides a thorough, structured, and agent-friendly description of **both**:
>
> 1. the **customer-facing storefront** (Next.js App Router runtime)
> 2. the **AdminJS admin panel** (separate Express runtime)
>
> It focuses on: features, architecture, technologies, folder structure, runtime model, security, caching/revalidation, and payments lifecycle.

---

## 1) Executive Summary

This repository contains a production-focused ecommerce system implemented as:

- **Storefront (Next.js App Router)** deployed to Vercel.
- **AdminJS admin panel (AdminJS + Express)** running as a **separate Node/Express server runtime**, intended to be deployed independently.

### Key runtime relationship

- Storefront generates/serves pages and exposes API routes.
- Admin panel performs data mutations via AdminJS actions (backed by Prisma).
- After successful AdminJS mutations, admin triggers **storefront cache revalidation** using storefront revalidation tags.

### Local development ports (from README)

- Storefront: `http://localhost:3000`
- AdminJS: `http://localhost:3001/admin` (default; depends on env)

---

## 2) Technologies & Dependencies

### Storefront (Next.js)

- **Next.js** (App Router): `next@16`
- **Next-intl**: i18n message loading + locale routing
- **Chakra UI**: UI framework and theme provider
- **better-auth**: session/auth handling (used via `auth.api.getSession`)
- **Prisma + PostgreSQL**: data access
- **Stripe**: checkout/session + webhook to finalize orders
- **Resend**: email (newsletter/orders emails etc—see README for operational notes)
- **Sentry**: error tracking (Next.js + server configs)
- **Cache revalidation**: Next.js `revalidateTag` through a dedicated endpoint

### Admin Panel (AdminJS)

- **AdminJS**: admin UI and resource management
- **@adminjs/express**: AdminJS on an Express server
- **@adminjs/prisma**: Prisma integration for AdminJS resources
- **express-session** + **pg session store** (Postgres-backed sessions)
- **Prisma** for reads/writes and domain logic
- **Helmet** (security headers; with fallback)
- **Rate limiting** (fixed-window, multiple endpoints)
- **Chakra theme adapter** for AdminJS UI
- **Localization/editor tooling**: custom localized editor property + after-hooks that sync translation rows

---

## 3) Repository Architecture (high-level folder map)

### Storefront (Next.js)

- `src/app/`
  - App Router routes and layouts (including `src/app/[locale]/layout.tsx`)
  - Route groups like:
    - storefront pages under `[locale]`
    - user cabinet pages under `[locale]/cabinet`
    - checkout under `[locale]/checkout`
    - products catalog under `[locale]/products`
  - API endpoints under `src/app/api/`:
    - cache revalidation: `src/app/api/cache/revalidate/route.ts`
    - payments: `src/app/api/payments/stripe/route.ts`
    - webhook: `src/app/api/payments/stripe/webhook/route.ts`
    - additional APIs: cart, products, session, CSP report, etc. (listed in `list_files` output)

- `src/proxy.ts`
  - Next middleware/proxy entry with a matcher affecting `/api/:path*` and non-static app routes

- `src/config/`
  - `env.ts` contains strong validation and normalization of required env vars.

- `src/actions/`
  - server actions used for storefront data loading and domain logic (e.g. catalog, cart hydration, storefront forms)

### AdminJS

- `src/admin/`
  - `server.mts`: Express server runtime entrypoint + security + session + rate limiting
  - `admin.mts`: AdminJS instance configuration (theme, dashboard, resources)
  - `resources/`
    - `index.mts`: resource definitions + AdminJS actions + after-hooks for localization and cache revalidation

---

## 4) Deployment / Runtime Model

### Storefront deployment target

- From `README.md`: **Vercel target is the storefront**
- AdminJS runtime (`src/admin/server.mts`) should be deployed separately.

### Storefront vs AdminJS communication

- AdminJS does not directly “call” Next rendering.
- Instead, admin triggers **Next cache tag revalidation** via:
  - `revalidateTag` endpoint in `src/app/api/cache/revalidate/route.ts`
  - AdminJS code uses `revalidateStorefrontCacheTags(...)` after successful mutations (see admin resources file)

---

## 5) Storefront Architecture (Next.js App Router)

### 5.1 Locale routing + root layout providers

**File:** `src/app/[locale]/layout.tsx`

This file is the main composition layer for:

- HTML language (`lang`) based on locale
- Chakra UI provider
- Next-intl provider
- Session provider
- Store hydration (catalog/cart context)
- Header/footer + global UI elements
- Cookie consent banner

Key aspects:

- `generateStaticParams()` returns `routing.locales.map(locale => ({ locale }))` (static locale generation).
- LayoutProviders:
  - Loads request headers and uses an `x-csp-nonce` to provide CSP nonces to Chakra provider.
  - Loads i18n client messages using `loadClientMessages(CLIENT_MESSAGE_NAMESPACES)`.
  - Calls auth session:
    - `auth.api.getSession({ headers: headersList, query: { disableCookieCache: true }})`
  - Loads catalog data and cookie banner configuration:
    - `getCatalog(locale)`
    - `getEnabledStorefrontForms(StorefrontFormPlacement.COOKIE_BANNER)`
  - Loads cart items when user is logged in:
    - `getCartItems(userId)` else empty cart

Provider composition:

- `ChakraUIProvider nonce={cspNonce}`
- `SessionProvider initialSession={session ?? null}`
- `NextIntlClientProvider messages={messages}`
- `AppStoreHydrator`:
  - supplies categories + cartData + wishListData + flags for logged in state

SEO:

- Uses `metadata` export with canonical app URL: `metadataBase: new URL(APP_URL)`

---

### 5.2 Proxy/middleware matcher

**File:** `src/proxy.ts`

Config applies to:

- `/api/:path*` (for CSRF and API-related protections)
- `'/((?!_next|.*\\..*).*)'` for all app routes except static assets and Next internals.

This indicates the project uses a centralized middleware/proxy layer.

---

### 5.3 Cache revalidation endpoint (contract)

**File:** `src/app/api/cache/revalidate/route.ts`

#### Endpoint

- `POST /api/cache/revalidate/`

#### Security

- Requires one of:
  - `x-revalidate-secret` header, OR
  - `Authorization: Bearer <secret>`
- Secrets accepted:
  - `env.CACHE_REVALIDATE_SECRET`
  - `env.CRON_SECRET`
- Uses:
  - `includesTimingSafeSecret(expectedSecrets, providedSecret)` (timing-safe comparison)
- Validates secret format:
  - regex `^[A-Za-z0-9._~-]{24,256}$`

#### Payload

- Must be JSON with `{ tags: string[] }`
- Normalization:
  - trims tags
  - removes duplicates
- Limits:
  - `MAX_TAGS_PER_REQUEST = 64`
  - each request is capped, tags are revalidated using `revalidateTag(tag, 'default')`

#### Responses

- Success: `{ ok: true, tags, count }`
- Unauthorized: `401`
- Invalid payload: `400`
- Not configured: `503`
- Revalidation failure: `500` and optional webhook alerting (if configured)

#### Operational alerting

- If `CACHE_REVALIDATE_ALERT_WEBHOOK_URL` is set, it sends a webhook on errors.

---

### 5.4 Payments: Stripe checkout session creation

**File:** `src/app/api/payments/stripe/route.ts`

#### Endpoint

- `POST /api/payments/stripe`

#### Preconditions

- Stripe must be configured (`stripe` instance exists from `src/lib/stripe`).
- CSRF/origin checks:
  - uses `isSameOriginRequest(req, req.nextUrl.origin)` OR `isSameOriginRequest(req, appOrigin)`
- Requires an authenticated user session:
  - `auth.api.getSession(...)`
  - must have `session.user.id`

#### Input validation (Zod)

- `items`: array of `{ productId, variantId (nullable), quantity }`
  - quantity > 0 and bounded (`max(99)`), products at least 1 item, max items bounded by `MAX_CHECKOUT_ITEMS=100`
- Optional:
  - `couponCode`
  - `shipmentMethod`
  - `shippingAddress` (string or structured object)
  - `locale`
  - `successUrl` / `cancelUrl` (URLs)

#### Domain checks

- Loads product and variant data from Prisma:
  - ensures product is:
    - in-stock (`product.inStock`)
    - and published within publish window:
      - `isProductPublished(product.status, product.publishStartAt, product.publishEndAt)`
- Handles default variant logic if a variantId is missing:
  - fetches variants with stock > 0, picks default variant per product

- Verifies available stock per variant:
  - if requested quantity > variant stock -> returns invalid items for that line item

#### Pricing & discounts

- Computes effective price per variant using:
  - `getEffectiveVariantDiscountPrice(...)`
- Stripe line items are built with:
  - `price_data.unit_amount = Math.round(effectivePrice * 100)` (cents)
  - `product_data.name` with localized name
  - variant attribute label concatenation when available

#### Coupon integration model

- Coupon preview:
  - calls `getCouponDiscountPreview(rawCouponCode, subtotalCurrency)`
- Stripe reusable coupon mapping:
  - constructs deterministic Stripe coupon IDs with prefix `appc_` using SHA256 digest of:
    - couponId, discountType, discountValue, currency, revision
- If coupon exists, it reuses existing; otherwise creates coupon.
- Coupon applied as:
  - `discounts: [{ coupon: stripeCouponId }]`

#### Redirect safety

- Uses `resolveSafeRedirectUrl` with fallback paths:
  - success fallback: `/cabinet/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`
  - cancel fallback: `/checkout?cancelled=1`

#### Response

- JSON with:
  - `{ sessionId: checkoutSession.id, url: checkoutSession.url }`

#### Error handling

- On server errors, returns error code
- Tracks 5xx via `recordApi5xxEvent` for configured operational visibility

---

### 5.5 Payments: Stripe webhook to finalize orders

**File:** `src/app/api/payments/stripe/webhook/route.ts`

#### Endpoint

- `POST /api/payments/stripe/webhook`

#### Preconditions / Security

- Stripe must be configured
- `env.STRIPE_WEBHOOK_SECRET` must exist
- Verifies:
  - `stripe-signature` header
  - signature using `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)`

#### Handled event types

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

#### Order finalization

- Calls:
  - `finalizeStripeOrderAsSystem(session.id)`
- On failure:
  - records operational errors via:
    - `recordApi5xxEvent`
    - `recordStripeWebhookFailure`

#### Response

- `{ received: true }` on success

---

## 6) Admin Panel Architecture (AdminJS + Express)

### 6.1 AdminJS server runtime entrypoint

**File:** `src/admin/server.mts`

This file is the operational core for AdminJS:

#### Environment & security gating

Before starting, it enforces presence of:

- `ADMINJS_EMAIL`
- `ADMINJS_PASSWORD`
- `ADMINJS_SESSION_SECRET`
- `ADMINJS_COOKIE_PASSWORD` (or explicit cookie password derivation rules)
- `DATABASE_URL`

In production, it validates:

- `ADMINJS_PASSWORD` strong secret:
  - min length 12, not in weak secret set
- `ADMINJS_SESSION_SECRET` strong secret:
  - min length 24
- `ADMINJS_COOKIE_PASSWORD` must be set and differ from session secret
- readonly password constraints if set
- warns on missing IP allowlist

#### Admin roles

Authentication returns one of:

- `admin` role: exact match on admin credential
- `readonly` role: exact match on readonly credential

Optional production hardening:

- `ADMINJS_REQUIRE_ACTIVE_USER`:
  - checks user profile `user.adminStatus === 'ACTIVE'` via Prisma

#### Session storage

- Uses `express-session` configured with:
  - Postgres-backed store: `createAdminSessionStore`
  - session table: configurable `ADMINJS_SESSION_TABLE` (default `admin_session`)
  - TTL and cleanup intervals from env:
    - `ADMINJS_SESSION_TTL_SECONDS`
    - `ADMINJS_SESSION_CLEANUP_INTERVAL_SECONDS`

Cookie properties:

- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'strict'`
- `name`: `__Host-adminjs` in production (more secure cookie prefix)

#### Security middlewares

- Helmet security headers middleware:
  - uses `helmet({...})` with CSP disabled (custom CSP middleware used separately)
- Admin-specific CSP:
  - configurable mode: `ADMIN_CSP_MODE` = `off` | `report-only` | `enforce`
  - sets `Content-Security-Policy` or `Report-Only` headers

Fallback security headers:

- X-Frame-Options DENY
- X-Content-Type-Options nosniff
- Referrer-Policy no-referrer
- Permissions-Policy for camera/mic/geolocation
- HSTS in production

#### Rate limiting

Two distinct fixed-window limiters:

- `/admin-thumb` endpoint thumbnails
  - max buckets and retry-after behavior
- Admin API calls under `/api/*`
  - read rate limit: `ADMIN_API_READ_RATE_LIMIT_PER_MINUTE`
  - mutation rate limit: `ADMIN_API_MUTATION_RATE_LIMIT_PER_MINUTE`
  - bucket key uses normalized IP and read/mutation intent

#### Thumbnail proxy safety

- Express endpoint:
  - `GET /admin-thumb`
- Enforces:
  - admin session required (cookie session)
  - IP allowlisting in addition to session if configured
  - limits request rate
- Verifies target URL is safe to fetch:
  - allowlisted hosts:
    - store host
    - cloudinary + image hosts
    - additional hosts from env
- Uses `verifyServerFetchUrl(...)` to prevent SSRF-like private access

#### Mutation/origin gating (Admin API)

For `/api/*` requests:

- Verifies origin/referer header to allow mutation origins (server-side intent gating)
- If missing/invalid origin: returns 403 with JSON notice

#### Readonly enforcement

For admin API mutations:

- If current admin session role is `readonly`:
  - blocks mutating intents
  - exceptions:
    - certain safe POST actions are allowed (`lowStockAlerts`)

#### Startup behavior

- In non-production:
  - `admin.watch()` enabled
- Uses `AdminJSExpress.buildAuthenticatedRouter(...)` to create authenticated admin router.

#### Health check

- `GET /healthz` returns JSON with service=admin

---

### 6.2 AdminJS instance configuration

**File:** `src/admin/admin.mts`

Key configuration points:

- `rootPath`: `process.env.ADMINJS_ROOT_PATH ?? '/admin'`
- Admin UI:
  - assets:
    - scripts include `/adminjs-readonly.js`
  - theme:
    - uses `chakraTheme` and `availableThemes: [chakraTheme]`
- Dashboard:
  - custom dashboard component + metrics handler:
    - `dashboardComponent` and `dashboardMetrics`
- i18n:
  - available languages: `['en', 'ua']`
  - translations are loaded from `./config/locale.mts`
  - `localeDetection: true`
- Resources:
  - loaded from `src/admin/resources/index.mts`
- Prisma adapter:
  - registers adapter for AdminJS:
    - `AdminJS.registerAdapter({ Database, Resource: CaseInsensitiveProductPrismaResource })`

---

### 6.3 Admin resources and after-hooks (including localization + cache revalidation)

**File:** `src/admin/resources/index.mts`

This is a large but central configuration that defines:

- AdminJS resource list
- resource property visibility rules (hidden/readOnly/disabled)
- actions (new/edit/show/list plus custom actions)
- lifecycle hooks:
  - before hooks (payload mapping, localization payload normalization)
  - after hooks (sync translations; sync gallery; revalidate storefront tags)

#### Resource coverage (from the file)

The admin panel defines resources for:

- **Catalog / Products**
  - Product (with rich actions: publish/archive/duplicate/schedule-discount/schedule-publish, variants, CSV import/export, gallery sync, metadata editor)
  - ProductCategory
  - ProductImage
  - Brand
  - Attribute / AttributeSet / AttributeSetItem / AttributeValue
- **Sales / Orders**
  - Order
  - OrderItem (read-only)
  - OrderDiscount
  - Actions for:
    - mark paid/shipped/delivered (guarded)
    - cancel order
    - status transitions
    - process return
    - set fulfillment
    - packing slips & shipping labels
    - export orders CSV
- **Marketing / Content**
  - Promotion
  - Banner
  - Page
  - StorefrontForm
  - Coupon
- **Customers**
  - User (read-only but with admin-facing fields like adminStatus and admin notes)
  - Review
  - NewsletterSubscription

#### Localization editor design

The admin resources implement a localization editor for certain resources (notably Product, ProductCategory, Banner, Page):

- Uses definitions from `constants/localization-runtime.mjs`
- Creates “virtual input fields” for each locale + editor components
- On save:
  - `localizedBeforeHook`:
    - collects localized payload from request payload
    - validates required translation fields for default locale
  - `localizedAfterHook`:
    - syncs translation tables via Prisma upsert/deleteMany
    - sets completeness fields (e.g. translation completeness)

#### Cache revalidation model (admin → storefront)

The admin file includes:

- tag constants like:
  - `products`, `product-by-slug`, `product-categories`, `pages`, `promo-cards`, etc.
- helper `withCacheRevalidationAfter(...)`:
  - runs after successful POST mutations
  - resolves cache tags based on record IDs/payload values/context
  - calls storefront revalidation:
    - `revalidateStorefrontCacheTags(tags)`

This gives a deterministic and tag-based invalidation system.

---

## 7) Environment Variables (reference, grouped)

### Storefront env validation

**File:** `src/config/env.ts`

This file validates and normalizes many runtime-critical values including:

- `NODE_ENV` = development/test/production
- `DATABASE_URL`
- `RESEND_API_KEY`
- `BETTER_AUTH_SECRET` (optional in non-prod but required in production)
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_CURRENCY` (3-letter ISO code)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Auth/session/encryption:
  - `ENCRYPTION_KEY` required in production
- Cache revalidation secrets:
  - `CACHE_REVALIDATE_SECRET` required in production
  - `CRON_SECRET` required in production
- Rate limiting and ops:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - optional alert webhook URLs
- Sentry DSNs:
  - `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, plus sampling envs

Production warnings include:

- EMAIL_FROM must not be `@resend.dev`

### Admin env validation

**File:** `src/admin/server.mts`

Required in production (and required generally at runtime by the server):

- `ADMINJS_EMAIL`
- `ADMINJS_PASSWORD`
- `ADMINJS_SESSION_SECRET`
- `ADMINJS_COOKIE_PASSWORD` (must be set and differ from session secret)
- `DATABASE_URL`

Optional admin-related operational envs:

- `ADMINJS_ROOT_PATH`
- `ADMINJS_PORT` / `PORT`
- `ADMINJS_READONLY_EMAIL`, `ADMINJS_READONLY_PASSWORD`
- `ADMINJS_ALLOWED_IPS` (IP allowlisting)
- `ADMIN_THUMBNAIL_APP_URL`, `ADMIN_THUMBNAIL_ALLOWED_HOSTS`, `ADMIN_THUMBNAIL_ALLOW_ANY_HOST`
- `ADMIN_CSP_MODE`
- multiple rate-limit controls:
  - `ADMIN_API_READ_RATE_LIMIT_PER_MINUTE`
  - `ADMIN_API_MUTATION_RATE_LIMIT_PER_MINUTE`
  - `ADMIN_THUMBNAIL_RATE_LIMIT_PER_MINUTE`
- session TTL/cleanup:
  - `ADMINJS_SESSION_TTL_SECONDS`
  - `ADMINJS_SESSION_CLEANUP_INTERVAL_SECONDS`

---

## 8) End-to-End Flows (what to know for debugging & onboarding)

### 8.1 Storefront page render bootstrap

1. Next route resolves locale and loads `[locale]/layout.tsx`
2. LayoutProviders loads:
   - session (via better-auth)
   - catalog (via `getCatalog(locale)`)
   - enabled cookie banner forms
   - cart items (user-specific)
3. UI providers wrap the app:
   - Chakra UI, Next-intl, SessionProvider, AppStoreHydrator

### 8.2 Admin mutation → storefront refresh

1. AdminJS receives authenticated mutation request
2. After hook runs in `src/admin/resources/index.mts`:
   - resolves product/category/page/promo tags
   - calls `revalidateStorefrontCacheTags(tags)`
3. Storefront endpoint `/api/cache/revalidate/` validates secret + tags
4. Next cache is invalidated by tag

### 8.3 Stripe checkout → order finalization

1. Client requests `POST /api/payments/stripe` with items + shipping + optional coupon
2. Server validates:
   - auth session
   - product publish windows + stock
   - builds Stripe checkout session
3. Stripe completes payment and calls webhook:
   - verifies signature with `STRIPE_WEBHOOK_SECRET`
4. Webhook calls `finalizeStripeOrderAsSystem(session.id)`

---

## 9) Project Operational Notes & Best Practices

### AdminJS security posture

- Strong secret validation is enforced in production.
- Readonly role is actively enforced at the API level:
  - readonly can view but cannot mutate (except whitelisted safe actions).

### Cache invalidation

- Always use tag-based revalidation:
  - admin after-hooks should revalidate storefront tags for the minimal set of affected entities.
- Cache tags have explicit naming conventions (see tag constants in admin resources file).

### Payments

- Stripe coupon IDs are deterministic and reusable (revisioned).
- Shipping address validation is strict:
  - missing required fields returns `shipping-address-required`.

---

## 10) How to Run Locally (from README)

- Storefront:
  - `npm run dev`
- AdminJS:
  - `npm run admin:dev`

---

## 11) File References (quick index)

### Storefront

- `src/app/[locale]/layout.tsx` — root providers, session bootstrap, catalog/cart hydration, UI layout
- `src/proxy.ts` — middleware/proxy matcher behavior
- `src/config/env.ts` — storefront env validation schema
- `src/app/api/cache/revalidate/route.ts` — revalidation endpoint contract and security
- `src/app/api/payments/stripe/route.ts` — Stripe checkout session creation
- `src/app/api/payments/stripe/webhook/route.ts` — Stripe webhook verification and order finalize

### AdminJS

- `src/admin/server.mts` — Express server runtime with security/session/rate-limits/origin gating/thumb proxy
- `src/admin/admin.mts` — AdminJS instance config: theme, dashboard, i18n, rootPath, resources
- `src/admin/resources/index.mts` — resources definitions + localization hooks + cache revalidation after-mutations

---

## 12) Suggested Extensions (how agents/humans can add capabilities)

### Add a new admin resource

1. Implement Prisma model integration (Prisma schema already exists; ensure modelMap entries exist).
2. Add resource block in `src/admin/resources/index.mts`
3. Define:
   - navigation grouping
   - list/filter/show/edit properties
   - actions with optional guards and custom components
4. Add after-hooks:
   - call `withCacheRevalidationAfter(...)` when mutations should invalidate storefront caches

### Add a new storefront cache tag

1. Extend tag constants in admin resources file
2. Ensure admin mutations revalidate those tags
3. Verify tags used by storefront `revalidateTag(tag, 'default')` calls align with Next cache strategy

### Add new Stripe webhook event

1. Update switch statement in `src/app/api/payments/stripe/webhook/route.ts`
2. Implement finalize handler logic similarly to:
   - `finalizeStripeOrderAsSystem(session.id)`
3. Add operational logging via existing ops monitoring helpers

---

_End of document._
