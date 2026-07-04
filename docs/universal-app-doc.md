# Universal Documentation: Online Store (Next.js Storefront + AdminJS Admin Panel)

> Purpose: This document provides a thorough, structured, and agent-friendly description of **both**:
>
> 1. the **customer-facing storefront** (Next.js App Router runtime)
> 2. the **AdminJS admin panel** (separate Express runtime)
>
> It covers: features, architecture, technologies, folder structure, runtime model, security,
> caching/revalidation, payments lifecycle, **and the full deployment/CI-CD pipeline** — including
> hard-won operational gotchas that previously cost multiple debugging rounds to discover. If you are
> an AI agent picking up this repo cold, read §4 and §13 before making any deployment-related change.
>
> Companion deep-dive: [`docs/cicd-pipeline.md`](./cicd-pipeline.md) has the exhaustive
> error-message-to-fix table and local-reproduction recipes for every pipeline/deploy failure hit so
> far. This document (§4) gives you the condensed, load-bearing version of the same knowledge plus the
> full application architecture; go to `cicd-pipeline.md` when you need maximum forensic detail.

---

## 1) Executive Summary

This repository contains a production-focused ecommerce system implemented as:

- **Storefront (Next.js App Router)** deployed to **Vercel**, sourced from the **GitHub** mirror.
- **AdminJS admin panel (AdminJS + Express)** running as a **separate Node/Express server runtime**,
  deployed to **Render**, sourced from **GitLab**, and triggered by a **GitLab CI/CD pipeline**.
- Both runtimes share **one Supabase Postgres database** via Prisma, but are otherwise fully independent
  processes with independent env vars, independent scaling, and independent deploy triggers.

### Key runtime relationship

- Storefront generates/serves pages and exposes API routes.
- Admin panel performs data mutations via AdminJS actions (backed by Prisma).
- After successful AdminJS mutations, admin triggers **storefront cache revalidation** using storefront revalidation tags.

### Local development ports (from README)

- Storefront: `http://localhost:3000`
- AdminJS: `http://localhost:3001/admin` (default; depends on env)

### The two-remote git setup (do not skip this)

```
$ git remote -v
github  https://github.com/roman951t-code/foghorn-storefront.git (fetch/push)  → watched by Vercel
origin  git@gitlab.com:foghorn_studio-group/store.git (fetch/push)             → watched by GitLab CI, which deploys Render
```

A bare `git push` only pushes to whichever remote the branch tracks (typically `github`) — it will
**not** trigger the GitLab pipeline and will **not** redeploy the admin panel. Always push both:
```bash
git push && git push origin main
```

---

## 2) Technologies & Dependencies

### Storefront (Next.js)

- **Next.js** (App Router): `next@16`, with `cacheComponents: true` in `next.config.ts` (see §4.10 for
  the `generateStaticParams` implication of this flag)
- **Next-intl**: i18n message loading + locale routing
- **Chakra UI**: UI framework and theme provider
- **better-auth**: session/auth handling (used via `auth.api.getSession`)
- **Prisma + PostgreSQL**: data access
- **Stripe**: checkout/session + webhook to finalize orders
- **Resend**: email (newsletter/orders emails etc—see README for operational notes)
- **Sentry**: error tracking (Next.js + server configs)
- **Cache revalidation**: Next.js `revalidateTag` through a dedicated endpoint

### Admin Panel (AdminJS)

- **AdminJS**: admin UI and resource management (bundles ~48 custom React components — see §4.9)
- **@adminjs/express**: AdminJS on an Express server
- **@adminjs/prisma**: Prisma integration for AdminJS resources
- **express-session** + **pg session store** (Postgres-backed sessions)
- **Prisma** for reads/writes and domain logic
- **Helmet** (security headers; with fallback)
- **Rate limiting** (fixed-window, multiple endpoints)
- **Chakra theme adapter** for AdminJS UI
- **Localization/editor tooling**: custom localized editor property + after-hooks that sync translation rows

### Shared infrastructure

- **Database**: Supabase Postgres (shared by both runtimes; see §4.9's TLS/pooler notes — connecting to
  it incorrectly from raw `pg.Pool` code is a recurring failure mode)
- **Media**: Cloudinary
- **CI/CD**: GitLab CI (`.gitlab-ci.yml`) — validates every push, gates production deploys behind a
  manual migration step, then triggers Vercel + Render deploy hooks

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
    - webhook: `src/app/api/payments/stripe/webhook/route.ts` (**note the `/payments/` segment** — a
      wrong/shortened path here was the cause of a false smoke-test failure, see §4.11)
    - additional APIs: cart, products, session, CSP report, etc. (listed in `list_files` output)

- `src/proxy.ts`
  - Next middleware/proxy entry with a matcher affecting `/api/:path*` and non-static app routes

- `src/config/`
  - `env.ts` contains strong validation and normalization of required env vars.

- `src/actions/`
  - server actions used for storefront data loading and domain logic (e.g. catalog, cart hydration, storefront forms)
  - `products/getCatalogStaticParams.ts` — feeds `generateStaticParams` for catalog pages; see §4.10 for
    why it returns placeholder params instead of an empty array

### AdminJS

- `src/admin/`
  - `server.mts`: Express server runtime entrypoint + security + session + rate limiting + startup
    diagnostics (bundle-presence check, unbuffered boot logging — added while debugging Render, see §4.9)
  - `admin.mts`: AdminJS instance configuration (theme, dashboard, resources)
  - `utils/create-pg-pool.mts`: the **only** correct way to construct a `pg.Pool` against
    `DATABASE_URL` anywhere under `src/admin/` — see §4.9
  - `resources/`
    - `index.mts`: resource definitions + AdminJS actions + after-hooks for localization and cache revalidation
  - `config/components.mts`: registers ~48 custom components with AdminJS's `ComponentLoader` — this is
    what gets bundled by Rollup (see §4.9)

### CI/CD & deployment

- `.gitlab-ci.yml` — the full pipeline definition (stages: validate → security → migrate → deploy); see §4
- `scripts/deploy-vercel.sh`, `scripts/deploy-render.sh` — one-shot deploy-hook triggers, run from GitLab CI
- `scripts/smoke-test.sh` — post-deploy live endpoint checks
- `scripts/admin-prebundle.mts` — pre-bundles AdminJS components during the Render **build** step (see §4.9)
- `docs/cicd-pipeline.md` — the exhaustive CI/CD reference (see this file's intro)
- `docs/env.admin.example`, `docs/env.storefront.example` — env var templates per runtime

---

## 4) Deployment, CI/CD & Operations

This section is the operational core of this document. It was assembled after a long iterative
debugging process (documented in full, blow-by-blow, in `docs/cicd-pipeline.md`) — every gotcha listed
here is a **real failure that happened**, not a theoretical concern.

### 4.1 Architecture at a glance

| Service | Platform | Entry point | Triggered from |
|---------|----------|--------------|-----------------|
| Storefront | Vercel | `npm run build` → `npm start` | GitHub push (Vercel watches GitHub directly) |
| Admin panel | Render | `npm run admin:start` | GitLab CI `deploy:admin` job → Render deploy hook |
| Database | Supabase (Postgres) | — | shared by both services |
| Media | Cloudinary | — | |
| Email | Resend | — | |
| Payments | Stripe | — | |
| Errors | Sentry | — | separate DSNs per service |

### 4.2 Pipeline stage/job graph

```
push to GitLab main (or open an MR)
  │
  ├─ validate (parallel, automatic — never touches production)
  │    ├─ lint-and-test   (ephemeral Postgres service; npm run lint && npm test)
  │    └─ build-check     (ephemeral Postgres service; npm run build — the EXACT command Vercel runs)
  │
  ├─ security (MR only, automatic)
  │    └─ npm-audit       (allow_failure: true — informational only)
  │
  ├─ migrate (main branch only, MANUAL CLICK REQUIRED)
  │    └─ migrate:production   (applies Prisma migrations to the real prod DB; allow_failure: false)
  │
  └─ deploy (main branch only, automatic once migrate:production succeeds)
       ├─ deploy:storefront    (needs: migrate:production) → hits Vercel deploy hook, returns immediately
       ├─ deploy:admin         (needs: migrate:production) → hits Render deploy hook, returns immediately
       └─ smoke:production     (needs: both deploys; allow_failure: true) → sleeps 90s, then curls live URLs
```

`deploy:storefront`/`deploy:admin` only trigger the deploy hook — they do **not** wait for Vercel/Render
to actually finish building. Real build logs live on the Vercel/Render dashboards, not in GitLab.

### 4.3 Running the pipeline (human)

**GitLab UI**: CI/CD → Pipelines → Run pipeline → branch `main` → Run pipeline. Once `validate` passes,
**click `migrate:production` manually** (Pipeline → Jobs) — this is the only gate before a real deploy.
Everything after that runs automatically.

**Re-deploying without a schema change**: find the existing pipeline → Jobs → re-run
`deploy:storefront` / `deploy:admin` directly (no need to re-click `migrate:production`; it's a safe
no-op even if you do).

### 4.4 First-time setup checklist

1. **Supabase**: create project, copy the connection string (Session/Transaction pooler, port 5432 or
   6543) as `DATABASE_URL`.
2. **Vercel**: import the **GitHub** repo, set all vars from `docs/env.storefront.example`. Note the
   project ID for the deploy hook.
3. **Render**: create a Web Service from the **GitLab** repo.
   - Build command: `npm run render:build` — **not** a plain `npm install`. This installs
     devDependencies (needed because `prisma`/`tsx` live there) and pre-bundles AdminJS's components
     (needed to avoid an OOM crash — full explanation in §4.9).
   - Start command: `npm run admin:start`
   - Env vars: everything in `docs/env.admin.example`, **plus** `ADMIN_JS_SKIP_BUNDLE=true` and
     `ADMIN_JS_TMP_DIR=adminjs-bundle` (both required, both easy to forget, both silently break the
     admin UI if missing — see §4.9).
4. **GitLab CI/CD variables** (Settings → CI/CD → Variables, mark Protected + Masked): `DATABASE_URL`,
   `VERCEL_DEPLOY_HOOK_URL`, `RENDER_DEPLOY_HOOK_URL`, `NEXT_PUBLIC_APP_URL`, `ADMINJS_PUBLIC_URL`.
5. Push to `main` on **both** remotes. Pipeline runs lint + test + build automatically.
6. Click **migrate:production** to apply the initial Prisma migrations.
7. `deploy:storefront` and `deploy:admin` run automatically after migrate succeeds.

### 4.5 Required GitLab CI/CD variables (reference table)

| Variable | Used by | Protected? | Notes |
|---|---|---|---|
| `DATABASE_URL` | `migrate:production` | ✅ | Real Supabase connection string. Every *other* job defines its own throwaway/placeholder `DATABASE_URL` in its own `variables:` block — this is the only job that sees the real one. |
| `VERCEL_DEPLOY_HOOK_URL` | `deploy:storefront` | ✅ | Vercel → Project → Settings → Git → Deploy Hooks |
| `RENDER_DEPLOY_HOOK_URL` | `deploy:admin` | ✅ | Render → Service → Settings → Deploy Hook |
| `NEXT_PUBLIC_APP_URL` | `smoke:production` | recommended | e.g. `https://shop.foghornbay.com` (no trailing slash) |
| `ADMINJS_PUBLIC_URL` | `smoke:production` | recommended | Bare domain or `/admin` path both work — `smoke-test.sh` follows redirects |

If `NEXT_PUBLIC_APP_URL`/`ADMINJS_PUBLIC_URL` are unset, `smoke-test.sh` exits 1 immediately with a clear
`ERROR: ... is not set.` — there's nothing else to debug if you see exactly that message.

### 4.6 Database migrations

| Command | When to use |
|---|---|
| `npm run db:migrate:dev` | Local dev — creates a new migration file and applies it |
| `npm run db:migrate:deploy` | CI / production — applies existing pending migrations only, never generates new ones |

Never run `db:migrate:dev` against a shared or production database. To create a new migration:
```bash
npm run db:migrate:dev -- --name describe_the_change
```
Commit the generated file in `prisma/migrations/` as part of your MR.

### 4.7 Rollback

- **Storefront**: Vercel → Project → Deployments → select an older deployment → "Promote to Production".
- **Admin**: Render → Service → Manual Deploy → select the previous commit.
- **Database**: Prisma does not auto-rollback. Write a forward migration that reverses the schema
  change, commit it, and run `migrate:production` again.

### 4.8 Smoke test reference

`smoke:production` hits these endpoints (`scripts/smoke-test.sh`) and expects the listed status codes.
`allow_failure: true` — a failure here is a signal to check manually, not a hard pipeline gate.

| Endpoint | Expected |
|---|---|
| `GET /` (storefront) | 200 |
| `GET /sign-in` | 200 |
| `GET /api/cache/revalidate/windows` (no auth) | 401 / 403 |
| `GET /api/payments/stripe/webhook` (no POST body) | 404 / 405 — route only exports `POST`, so Next.js auto-405s any other method |
| `GET $ADMINJS_PUBLIC_URL` | 200 (redirects are followed via `curl -L`) |

Run it manually at any time:
```bash
NEXT_PUBLIC_APP_URL=https://shop.foghornbay.com \
ADMINJS_PUBLIC_URL=https://admin.foghornbay.com/admin \
SMOKE_WAIT_SECONDS=0 \
bash scripts/smoke-test.sh
```

### 4.9 AdminJS on Render: the hardest-won operational knowledge in this repo

Six separate debugging rounds went into getting the admin panel to run correctly on Render's free tier.
Every step below is load-bearing.

**Build command must be `npm run render:build`**, which expands to
`npm install --legacy-peer-deps --include=dev && npm run admin:bundle`.

- `--include=dev` is required because Render sets `NODE_ENV=production` for the build environment, and
  npm derives `omit: ['dev']` from that automatically (its own default behavior, not Render-specific).
  `prisma` and `tsx` are devDependencies — without this flag, `postinstall` (`prisma generate`) fails
  with `sh: prisma: not found` before the build even starts bundling.
- `admin:bundle` runs [`scripts/admin-prebundle.mts`](../scripts/admin-prebundle.mts), which calls
  `admin.initialize()` **during the build step** (with `--max-old-space-size=2048` for extra heap).
  AdminJS bundles ~48 custom React components with Rollup the first time `initialize()` runs, unless
  `ADMIN_JS_SKIP_BUNDLE=true` is set — bundling that many components needs more memory than Render's
  512MB free-tier **runtime** has, and the process OOMs with `FATAL ERROR: Ineffective mark-compacts
  near heap limit`. Render's build step has more headroom, so pre-bundling there and skipping it at
  runtime avoids the crash entirely.

**`ADMIN_JS_TMP_DIR` must point at a directory with NO dot-prefixed path segment.** Currently set to
`adminjs-bundle` (not AdminJS's own default, `.adminjs`). This is the single most expensive bug in this
repo's deployment history — six rounds of "fixed" that weren't, because the actual root cause was
something nobody would guess without reading library source:

> AdminJS serves `components.bundle.js` via Express's `res.sendFile()`, which delegates to the `send`
> npm package. `send` defaults to `dotfiles: 'ignore'`, and its `containsDotFile()` check runs on
> **every segment of the resolved absolute path** — so `/.../.adminjs/bundle.js` returns a **hard 404,
> unconditionally**, even though the file exists on disk and is perfectly valid. Moving it to
> `public/.adminjs` doesn't help either — that path still contains a `.adminjs` segment.

Symptom if this regresses: the admin panel loads and login works, but the dashboard shows a generic
fallback instead of the custom one, and the browser console shows:
```
Error: Component "SelectFilterWithPlaceholder" has not been bundled, ensure it was added to your
ComponentLoader instance (the one included in AdminJS options).
```
or the UI shows *"Ви повинні заімплементувати ActionComponent для своєї дії"* (Ukrainian locale string
for the same error). **This looks like a bundling failure but isn't** — the bundle built fine; it's a
serving failure. Both the pre-bundle script and the `admin:start` runtime script must set the identical
`ADMIN_JS_TMP_DIR` value **before** importing `admin.mts` (AdminJS reads the env var once at module
load and never re-reads it).

**`ADMIN_JS_SKIP_BUNDLE` is a double-edged env var.** Render exposes one "Environment" tab to both the
build step and the runtime process. Runtime needs it `true`; the pre-bundle script needs it unset so
bundling actually happens during build. `scripts/admin-prebundle.mts` handles this by `delete`-ing it
from its own process env before calling `admin.initialize()` — don't remove that line.

**All raw `pg.Pool` construction in `src/admin/` must go through
[`createAdminPgPool()`](../src/admin/utils/create-pg-pool.mts).** It strips `sslmode=require` from the
URL (pg v8 otherwise enforces `verify-full`, rejecting Supabase's pooler cert chain, replaced with an
explicit `ssl: { rejectUnauthorized: false }`), strips Prisma-only URL params (`pgbouncer`,
`connection_limit`) that aren't valid Postgres startup parameters, and sets a 10-second
`connectionTimeoutMillis` so a bad connection fails fast instead of hanging ~60s and surfacing as an
inexplicable 502 on whatever HTTP request happened to trigger it.

Full reproduction/verification recipe for any of the above: see §4.12.

### 4.10 Why `npm run build` seeds the production database

`package.json`'s `build` script is:
```json
"build": "npx prisma db seed && next build"
```
Vercel's build command *is* `npm run build` — there's no separate arbitrary post-deploy hook available.
Seeding was folded into `build` so every push to `main` results in `shop.foghornbay.com` having fake
catalog data with zero manual steps. **This means every Vercel deploy re-runs the seed script**
(`prisma/seed.ts`, `@faker-js/faker`-based, gated by `SEED_GENERATE_CATEGORIES`/`SEED_GENERATE_PRODUCTS`
env toggles that default to `'true'`). If real customer data is ever loaded into this database, this
behavior must change — split `build` back to plain `next build` and seed manually, once.

Note `prisma migrate deploy` is deliberately **not** in this chain — it needs a direct (non-pooled)
connection and breaks against Supabase's transaction-pooler URL; migrations are applied separately via
the manual `migrate:production` CI job (§4.6).

Separately: `next.config.ts` sets `cacheComponents: true`, which requires `generateStaticParams` to
return **at least one entry** — an empty database (or an empty query result) returning `[]` throws
`EmptyGenerateStaticParamsError` at build time. `src/actions/products/getCatalogStaticParams.ts` handles
this by returning a placeholder param (e.g. `{ locale, category: '_' }`) when the real query is empty;
the placeholder route 404s cleanly at request time via `notFound()`. This is why `build-check` (§4.2)
needs its own real (if empty) migrated database rather than a dead placeholder URL — without one, both
the seed step and this placeholder logic behave differently than they would in production.

### 4.11 Error message → fix quick reference

Every row below is a real failure encountered while building this pipeline, in the order encountered.
Match the error text before doing any original investigation.

| Error text | Where | Root cause | Fix |
|---|---|---|---|
| `sh: prisma: not found` | Render build, or GitLab `build-check`/`lint-and-test` | `NODE_ENV=production` makes npm auto-omit devDependencies | Add `--include=dev` to the install command |
| `EmptyGenerateStaticParamsError` | Vercel build | `cacheComponents: true` requires ≥1 static param; empty DB returns `[]` | Return a placeholder param when empty (§4.10) |
| `Invalid environment variables { SOME_URL: ['Invalid URL'] }` | seed / build | `z.string().url().optional()` rejects `""`, which `.env` commonly has for unused vars | Use the `optionalUrlEnv()` helper in `src/config/env.ts`, which normalizes `""` → `undefined` first |
| `blocked-hostname` at admin startup | Render runtime | Missing `NEXT_PUBLIC_APP_URL` fell back to `http://localhost:3000`, correctly rejected by the SSRF check | Don't fall back to localhost in production; log a warning and disable thumbnails instead |
| `Cannot GET /` on the admin domain | Render runtime | AdminJS only mounts routes under `/admin`; bare `/` has no handler | `app.get('/', ...) => res.redirect(301, admin.options.rootPath)` in `src/admin/server.mts` |
| 502 on `/admin` page load | Render runtime | Session store's `pg.Pool` had no SSL config, hung on first query | Route the session store through `createAdminPgPool()` |
| 502 on login POST (~60s) | Render runtime | `requireActiveAdminUser` → `prisma.user.findUnique()` → pool's first connection hung (bad URL params, no timeout) | `createAdminPgPool()` fixes both; consider `ADMINJS_REQUIRE_ACTIVE_USER=false` if unneeded |
| `FATAL ERROR: Ineffective mark-compacts near heap limit` | Render build/runtime | AdminJS bundles ~48 components with Rollup at runtime by default; OOMs on 512MB free tier | Pre-bundle during build (`render:build`), set `ADMIN_JS_SKIP_BUNDLE=true` at runtime (§4.9) |
| `[admin:bundle] FAILED — expected .../bundle.js to exist` | Render build | `ADMIN_JS_SKIP_BUNDLE=true` leaked from Render's env into the build step too, so bundling no-oped | Pre-bundle script `delete`s the var from its own env first (§4.9) |
| Dashboard generic + `Component "X" has not been bundled`, despite `[admin:bundle] OK` in build logs | Render runtime | Bundle exists but its directory has a dot segment (`.adminjs` or `public/.adminjs`) — `send`'s dotfile check 404s it unconditionally | Point `ADMIN_JS_TMP_DIR` at a dot-free dir (`adminjs-bundle`), identically at build and runtime (§4.9 — the big one) |
| `/bin/sh: eval: line N: bash: not found` | GitLab `deploy:*`/`smoke:production` | `node:22-alpine`'s default shell is busybox `ash`; deploy/smoke scripts need real `bash` (`set -o pipefail`) | `apk add --no-cache curl bash` in `before_script`, not just `curl` |
| smoke-test FAIL: webhook → HTTP 500 (expected 405/404/400) | `smoke:production` | Test hit `/api/stripe/webhook` (wrong, nonexistent); real route is `/api/payments/stripe/webhook` | Fixed the URL in `scripts/smoke-test.sh` |
| smoke-test FAIL: admin login → HTTP 301 (expected 200) | `smoke:production` | `ADMINJS_PUBLIC_URL` hits our own `/` → `/admin` redirect; `curl` doesn't follow redirects by default | Added `-L` to `smoke-test.sh`'s `check()` helper |

### 4.12 Debugging checklist + local reproduction recipe

1. Match the error text against §4.11 first.
2. Identify which platform is actually failing — a GitLab pipeline failure is unrelated to a Vercel
   build failure even though both come from the same repo push.
3. **Prefer local reproduction over iterating on real deploys**, especially for AdminJS/Render issues —
   every fix in §4.9 was proven locally before being declared fixed:
   ```bash
   rm -rf adminjs-bundle
   npm run admin:bundle
   ADMINJS_PORT=3799 ADMINJS_EMAIL=admin@example.com \
     ADMINJS_PASSWORD=LocalTestPassword123 \
     ADMINJS_SESSION_SECRET=local-test-session-secret-abcdefghijklmnop \
     ADMINJS_COOKIE_PASSWORD=local-test-cookie-password-zyxwvutsrqponml \
     ADMINJS_REQUIRE_ACTIVE_USER=false \
     NEXT_PUBLIC_APP_URL=https://shop.foghornbay.com \
     npm run admin:start &
   sleep 5
   curl -o /dev/null -w '%{http_code}\n' http://localhost:3799/admin/frontend/assets/components.bundle.js
   ```
   (production-mode secret-strength guards reject weak local defaults — use secrets like the ones
   above that satisfy `hasStrongSecret()` in `src/admin/server.mts`.)
4. **Never assume a fix worked because the theory sounds plausible.** Multiple rounds in this repo's
   history involved a reasonable-sounding fix that didn't address the actual root cause. Prove it — curl
   the real endpoint, check the real file on disk, read the actual library source
   (`node_modules/adminjs/lib/...`, `node_modules/send/index.js`) instead of trusting assumptions about
   framework behavior.
5. Check `git log origin/main` vs `git log github/main` if "what I pushed" and "what deployed" seem out
   of sync (§1).
6. `build-check` failing in GitLab is a leading indicator for Vercel, since it runs the literal same
   `npm run build` command — fix it there first.

### 4.13 Known inconsistency (not yet broken, worth knowing)

`.nvmrc` pins Node **20** (`package.json`'s `engines.node` is `>=20.9.0`), but GitLab CI's
`default.image` is `node:22-alpine`. Render honors `.nvmrc` (Node 20); GitLab CI uses whatever `image:`
says (Node 22), ignoring `.nvmrc`. Both currently work since nothing depends on a specific Node major
version, but this is where a future "works in CI, breaks on Render" (or vice versa) report will
originate if a dependency ever becomes version-sensitive.

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

### 5.3b Scheduled cache revalidation (time-boundary sweep)

**File:** `src/app/api/cache/revalidate/windows/route.ts`

This is a *different* endpoint from 5.3 — it doesn't take an explicit tag list. Instead, on every call it queries for products/banners/pages whose scheduled boundary (`discountStartAt`, `discountEndAt`, `publishStartAt`, `publishEndAt`, banner `startsAt`/`endsAt`, page `publishedAt`) fell inside a trailing `lookbackSeconds` window, and revalidates the relevant cache tags for anything it finds. This is what makes a scheduled discount or scheduled publish actually go live/end on the storefront without a human clicking anything.

- `POST` or `GET /api/cache/revalidate/windows?lookbackSeconds=N&limit=N&dryRun=true`
- Same auth as 5.3 (`x-revalidate-secret` / `Bearer`, `CACHE_REVALIDATE_SECRET` or `CRON_SECRET`)
- `lookbackSeconds` is clamped server-side to **30–3600** regardless of what's passed in the query string — you cannot get a wider window by requesting one.

#### Why this needs frequent invocation, and how that's wired up

The window this endpoint sweeps is only as wide as `lookbackSeconds` (max 3600s = 1 hour). **If it's called less often than that window is wide, boundary events can fall in the gap between two calls and never get picked up** — e.g. calling it once daily with a 3-minute lookback (the original config) only ever covers the last 3 minutes before each midnight run; a discount that started at 2pm would silently not show up as active on the storefront until someone else's mutation happened to revalidate that tag some other way.

Two schedulers call this endpoint, deliberately overlapping:

1. **`vercel.json` cron** — `0 0 * * *` (once daily) with `lookbackSeconds=3600`. Vercel's **Hobby plan caps cron jobs at once per day**, so this cannot be the primary mechanism — it's a coarse safety net that guarantees at least the last hour before each midnight gets swept even if everything else fails.
2. **`.github/workflows/scheduled-cache-revalidate.yml`** — a GitHub Actions scheduled workflow (`*/5 * * * *`, every 5 minutes) that runs `scripts/revalidate-window-boundaries.ts --lookback=600 --limit=500`. This is the real mechanism: a 600s (10 min) lookback on a 5-minute cadence gives a 2x safety margin against GitHub Actions' own scheduling jitter (scheduled workflows can run a few minutes late under platform load), so no boundary crossing goes unswept.

**Required GitHub repo secrets** (Settings → Secrets and variables → Actions): `NEXT_PUBLIC_APP_URL` (the production storefront URL) and `CACHE_REVALIDATE_SECRET` (same value as the Vercel env var). Without these the workflow runs and fails loudly (script exits non-zero) rather than silently no-oping.

If GitHub Actions scheduling is ever migrated away from (e.g. moving CI off GitHub), replace this workflow with any external scheduler capable of an HTTP call every few minutes — `scripts/revalidate-window-boundaries.ts` is a plain Node script and doesn't care who invokes it.

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
- **Only exports `POST`** — any other HTTP method automatically gets Next.js's built-in `405`, no
  custom code needed. (This route's exact path matters for the smoke test — see §4.8/§4.11.)

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
  - Postgres-backed store: `createAdminSessionStore` (built on `createAdminPgPool()` — see §4.9)
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
- Requires `NEXT_PUBLIC_APP_URL` (or `ADMIN_THUMBNAIL_APP_URL`) to be set in production, or thumbnails
  are disabled with a warning rather than falling back to `localhost` (§4.11 "blocked-hostname" row)

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
- In production:
  - logs bundle presence/size (`[admin-bundle] ...`) before proceeding — see §4.9; check this log line
    first if the admin UI ever shows fallback components again
  - unbuffered `[admin:boot]` stderr breadcrumbs trace startup step-by-step (added while debugging a
    silent startup hang on Render — useful if the process ever again exits with no error before
    binding a port)
- Uses `AdminJSExpress.buildAuthenticatedRouter(...)` to create authenticated admin router.
- `GET /` redirects (301) to `admin.options.rootPath` (`/admin` by default)

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
- Prisma client: `src/admin/prisma.mts` builds its `PrismaClient` on top of `createAdminPgPool()` (§4.9)
  — do not construct a separate ad-hoc Prisma/pg client for admin-side code.

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

### 6.4 Cloudinary (product image storage)

**Files:** `src/admin/utils/cloudinary.mts`, `src/admin/actions/product-csv-actions.mts`

Cloudinary is used by the **admin panel only**, exclusively during **product CSV import**. The storefront never talks to Cloudinary directly — it just renders whatever image URL is stored on the product row (which may or may not be a Cloudinary URL, depending on whether Cloudinary was configured at import time).

#### When uploads happen

- **Not on CI/CD, not on deploy, not on user browsing.** Cloudinary uploads are triggered synchronously inside `uploadProductImageToCloudinary(...)` while an admin is running a CSV import in AdminJS (`src/admin/actions/product-csv-actions.mts:677` and `:1329`).
- The trigger flow: admin uploads a `products.csv` → admin action reads each row's image URL → if Cloudinary is configured, downloads the image from the source URL and re-uploads it to Cloudinary → stores the resulting `secure_url` on the product row.
- Category images use the same helper.

#### What gets uploaded, what doesn't

`uploadProductImageToCloudinary` short-circuits (does not upload) when:

- The source URL is empty
- Cloudinary is not configured (missing env vars — see below)
- The source URL is a local/relative path (not `data:` or `http(s)://`)
- The source URL is already a `res.cloudinary.com` URL for the configured cloud (idempotent — a CSV re-import doesn't re-upload the same asset)

When it does upload, it uses a deterministic `public_id` of `<productCode|productSlug>-<assetKey>` under the folder from `CLOUDINARY_UPLOAD_FOLDER` (default: `online-store/products`). `overwrite: true` + `invalidate: true` means a re-import with the same product code replaces the asset and busts Cloudinary's CDN cache.

#### Configuration

Set **one of** these on the AdminJS runtime (Render):

- `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` — single-var form Cloudinary's own SDK expects
- OR the three-var form: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Optional:

- `CLOUDINARY_UPLOAD_FOLDER` (defaults to `online-store/products`)

**Not required on Vercel** — the storefront doesn't use these vars. Setting them on Vercel is harmless but pointless.

#### Verifying it's actually working

There's no automated check. To verify manually:

1. In AdminJS, run a product CSV import with a row whose image URL is an external `https://…` (not already a `res.cloudinary.com/<your-cloud>/…` URL).
2. After import completes, open that product in AdminJS and inspect its stored image URL. If Cloudinary is configured, it should now be `https://res.cloudinary.com/<cloud>/…`. If it's still the original external URL, Cloudinary was silently disabled (missing env vars) — `uploadProductImageToCloudinary` returns `ok: true, uploaded: false` in that case, so import doesn't fail.
3. Check the Cloudinary dashboard → Media Library → your upload folder → the new asset should be there.

#### Failure mode

If Cloudinary rejects the upload (rate limit, invalid credentials, unreachable source URL), the helper returns `{ ok: false, error }`. The CSV import logs the failure per row but continues with other rows — the failed row is simply not persisted with a Cloudinary URL. It is **not** a hard fail of the whole import.

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

**Gotcha:** optional URL env vars must use the `optionalUrlEnv()` helper, not
`z.string().url().optional()` — the latter rejects `""` (empty string), which `.env` files commonly
have for unused optional vars, and will crash the seed/build with `Invalid environment variables`
(§4.11).

### Admin env validation

**File:** `src/admin/server.mts`

Required in production (and required generally at runtime by the server):

- `ADMINJS_EMAIL`
- `ADMINJS_PASSWORD`
- `ADMINJS_SESSION_SECRET`
- `ADMINJS_COOKIE_PASSWORD` (must be set and differ from session secret)
- `DATABASE_URL`

**Required for the admin UI to actually render correctly on Render (easy to forget, silently breaks
things if missing — see §4.9):**

- `ADMIN_JS_SKIP_BUNDLE=true`
- `ADMIN_JS_TMP_DIR=adminjs-bundle`

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

### 8.4 Push to production (full CI/CD flow)

1. Push a commit to **both** git remotes (`git push && git push origin main`) — GitHub for Vercel,
   GitLab for the CI pipeline that deploys Render.
2. GitLab `validate` stage runs automatically: `lint-and-test` + `build-check` in parallel.
3. If on `main`, `migrate:production` appears and waits for a manual click.
4. A human clicks `migrate:production` → Prisma applies any pending migrations to the real DB.
5. `deploy:storefront` and `deploy:admin` fire automatically → Vercel and Render deploy hooks are hit.
6. Vercel builds independently (`npm run build` — seeds the DB, then builds Next.js) and goes live.
7. Render builds independently (`npm run render:build` — installs deps, pre-bundles AdminJS) and starts
   the admin server (`npm run admin:start`).
8. `smoke:production` waits 90s, then curls both live services to confirm they're actually responding
   correctly (§4.8).

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

### Deployment/CI-CD caveats worth internalizing

- **Every Vercel deploy re-seeds the production database** (§4.10) — this is intentional while the
  store uses fake/demo data, but must change before real customer data goes in.
- **A bare `git push` does not redeploy the admin panel** — Render is driven by the GitLab pipeline, and
  a bare push typically only reaches GitHub. Always `git push && git push origin main` (§1).
- **`ADMIN_JS_TMP_DIR` must never be changed back to a dot-prefixed path** (`.adminjs`,
  `public/.adminjs`) — this single setting is responsible for the majority of AdminJS-on-Render
  debugging time to date (§4.9).
- **Don't construct `pg.Pool` directly against `DATABASE_URL` in `src/admin/`** — always go through
  `createAdminPgPool()` (§4.9), or you will reintroduce TLS/timeout/param-parsing failures that already
  cost multiple debugging rounds.

---

## 10) How to Run Locally

### First-time machine setup

```bash
npm install
```

Configure `.env` / `.env.local` (see `docs/env.storefront.example` and `docs/env.admin.example` for the
full list of vars each runtime needs — the admin server reads the same `.env` plus its own
`ADMINJS_*`/`ADMIN_*` vars).

One-shot local setup (installs deps, applies local migrations, generates Prisma client, seeds the DB):
```bash
npm run setup:local
```

Or step by step:
```bash
npm run db:migrate:dev      # apply/create local migrations + generate Prisma client
npm run db:generate         # regenerate Prisma client only, if schema changed without a new migration
```

### Running both runtimes side by side

```bash
npm run dev          # storefront — http://localhost:3000
npm run admin:dev     # admin panel — http://localhost:3001/admin (uses admin.watch(), no bundling step needed)
```

They share the same local Postgres via `DATABASE_URL` in `.env`.

### Other useful local scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint + typecheck |
| `npm test` | Node's built-in test runner over `src/**/*.test.ts(x)` / `.test.mts` |
| `npm run db:seed` | `db:migrate:deploy` then `prisma db seed` — full reseed against whatever `DATABASE_URL` points to (careful: this writes real rows to whatever DB is configured) |
| `npm run admin:bundle` | Manually run the AdminJS pre-bundle step locally (see §4.12 for the full local-repro recipe using this) |
| `npm run clean:next` | `rm -rf .next` |

**Never point `db:migrate:dev`, `db:seed`, or any destructive local script at the production
`DATABASE_URL`.** Always double-check `.env`'s active `DATABASE_URL` before running anything with
"migrate", "seed", "push", or "reset" in the name.

---

## 11) File References (quick index)

### Storefront

- `src/app/[locale]/layout.tsx` — root providers, session bootstrap, catalog/cart hydration, UI layout
- `src/proxy.ts` — middleware/proxy matcher behavior
- `src/config/env.ts` — storefront env validation schema
- `src/actions/products/getCatalogStaticParams.ts` — static param generation + empty-DB placeholder logic (§4.10)
- `src/app/api/cache/revalidate/route.ts` — revalidation endpoint contract and security
- `src/app/api/payments/stripe/route.ts` — Stripe checkout session creation
- `src/app/api/payments/stripe/webhook/route.ts` — Stripe webhook verification and order finalize

### AdminJS

- `src/admin/server.mts` — Express server runtime with security/session/rate-limits/origin gating/thumb proxy/startup diagnostics
- `src/admin/admin.mts` — AdminJS instance config: theme, dashboard, i18n, rootPath, resources
- `src/admin/resources/index.mts` — resources definitions + localization hooks + cache revalidation after-mutations
- `src/admin/utils/create-pg-pool.mts` — the one correct way to build a `pg.Pool` against Supabase (§4.9)
- `src/admin/config/components.mts` — registers all custom components with AdminJS's ComponentLoader (what gets bundled)

### CI/CD & deployment

- `.gitlab-ci.yml` — full pipeline definition (§4)
- `scripts/admin-prebundle.mts` — pre-bundles AdminJS components at Render build time (§4.9)
- `scripts/deploy-vercel.sh` / `scripts/deploy-render.sh` — deploy-hook triggers
- `scripts/smoke-test.sh` — post-deploy endpoint checks (§4.8)
- `docs/cicd-pipeline.md` — exhaustive CI/CD deep-dive (error table + repro recipes in full detail)
- `docs/env.admin.example` / `docs/env.storefront.example` — env var templates

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
5. If the resource needs a new custom component (filter, action, show view), register it in
   `src/admin/config/components.mts` — remember it will only actually render in production after the
   next `npm run render:build` re-bundles it (§4.9); a build without a fresh bundle will silently keep
   serving the old component set.

### Add a new storefront cache tag

1. Extend tag constants in admin resources file
2. Ensure admin mutations revalidate those tags
3. Verify tags used by storefront `revalidateTag(tag, 'default')` calls align with Next cache strategy

### Add new Stripe webhook event

1. Update switch statement in `src/app/api/payments/stripe/webhook/route.ts`
2. Implement finalize handler logic similarly to:
   - `finalizeStripeOrderAsSystem(session.id)`
3. Add operational logging via existing ops monitoring helpers

### Change anything about the Render build/bundle process

Read §4.9 in full first. This area has the highest ratio of "looked like a 2-minute fix, took six
rounds to actually resolve" in the whole repo. Verify any change with the local reproduction recipe in
§4.12 before pushing — a Render deploy round-trip costs minutes and burns free-tier build quota; a local
repro costs about 30 seconds.

---

## 13) For AI Agents: Meta-Guidance on Debugging This Repo

If you are an AI agent that has just been dropped into this repository with a failing pipeline, a
broken deploy, or a "the admin panel looks wrong" report, and you have no other context:

1. **Read §4.11 (error message → fix table) first.** Most failures you'll encounter here are variations
   on something already solved. Grep the exact error text before theorizing.
2. **Distinguish the failing surface before investigating**: GitLab CI pipeline failure, Vercel build
   failure, and Render runtime failure are three different logs, three different root-cause spaces, and
   only loosely related by sharing a codebase. Don't cross-apply a GitLab fix to a Vercel symptom or
   vice versa without checking the assumption holds.
3. **For anything AdminJS/Render-shaped, reproduce locally before iterating on real deploys.** The
   recipe in §4.12 takes about 30 seconds and lets you `curl` the exact failing endpoint directly,
   instead of waiting on a multi-minute Render deploy cycle per guess.
4. **Do not declare a fix "done" on the strength of a plausible theory.** The dot-free-bundle-directory
   bug (§4.9) took multiple rounds specifically because each preceding "fix" (checking gitignore, moving
   the directory under `public/`, adding diagnostics) was a reasonable-sounding theory that turned out to
   be wrong. The thing that actually worked was reading `node_modules/send/index.js` directly and
   reproducing the exact 404 locally with a minimal Express server. When in doubt, read the library
   source and prove behavior with a throwaway script rather than reasoning from framework documentation
   or intuition alone.
5. **Remember the dual-remote git setup** (§1) — if you push a fix and the user reports "still broken,"
   check whether the push actually reached GitLab (`origin`), not just GitHub (`github`), before
   assuming your fix was wrong.
6. **When you fix something in `.gitlab-ci.yml`, `scripts/*.sh`, or `src/admin/`, check whether
   `docs/cicd-pipeline.md` and this file's §4 need a matching update.** Both documents are meant to stay
   accurate as a debugging aid for the *next* agent — stale docs that contradict the current code are
   actively worse than no docs, because they cause confident wrong fixes.
7. **Prefer editing existing docs over creating new ones.** This repo already consolidates deployment
   knowledge into `docs/cicd-pipeline.md` (deep-dive) and this file's §4 (condensed + cross-referenced).
   A third competing doc fragments knowledge and increases the odds of drift.

---

_End of document._
