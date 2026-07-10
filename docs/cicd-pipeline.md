# CI/CD Pipeline — Complete Reference

This document explains how this repo actually ships code to production, and — more
importantly — documents every non-obvious failure mode that was hit and fixed while
building this pipeline. It is written for two audiences at once: a human operating
the pipeline day-to-day, and an AI agent (Claude Code or otherwise) debugging a
failed pipeline run with no other context. If you are an AI agent reading this
because a pipeline failed, jump straight to **"Error message → fix" quick reference**
near the bottom before reading anything else.

Companion docs: [`docs/universal-app-doc.md`](./universal-app-doc.md) §4 (condensed version of this
same knowledge, woven into the full application architecture — good starting point for "how does the
whole system work" rather than "why did this specific pipeline step fail"),
[`docs/env.admin.example`](./env.admin.example), [`docs/env.storefront.example`](./env.storefront.example).

---

## 1. Architecture: one repo, two deploy targets, one canonical CI/CD remote

This is a single monorepo containing **two independently deployed runtimes**:

| Runtime | What it is | Entry point | Deploy platform | Triggered from |
|---|---|---|---|---|
| Storefront | Next.js 16 App Router customer-facing site | `npm run build` → `npm start` | **Vercel** | GitHub Actions (`.github/workflows/deploy-production.yml`) |
| Admin panel | Standalone Express + AdminJS server | `npm run admin:start` | **Render** | GitHub Actions (same workflow) |

Both runtimes share one Postgres database (Supabase) via Prisma, but run as
completely separate processes with separate `package.json` "entry points" and
separate env var sets.

### The two-remote git setup (legacy — GitLab is now optional)

```
$ git remote -v
github  https://github.com/roman951t-code/foghorn-storefront.git (fetch/push)
origin  git@gitlab.com:foghorn_studio-group/store.git (fetch/push)
```

This setup used to be load-bearing: GitLab drove CI/CD and Render only cloned
from GitLab, so a push that missed `origin` silently left Render undeployed and
GitLab out of sync. **That's no longer true as of the GitHub Actions cutover:**

- **`.github/workflows/deploy-production.yml`** is the canonical CD pipeline. It
  runs on every push to `main` on the **GitHub** remote and triggers *both*
  deploys — Vercel via `VERCEL_DEPLOY_HOOK_URL`, Render via
  `RENDER_DEPLOY_HOOK_URL` (§4 has the exact secrets).
- **Vercel's own Git integration auto-deploy is disabled** for `main` via
  `vercel.json`'s `git.deploymentEnabled.main = false`. Without this, Vercel would
  *also* auto-deploy on the same GitHub push, on top of the deploy-hook call above
  — that double-trigger was the original bug this cutover fixes. Deploy Hooks and
  CLI-triggered deploys are unaffected by this setting; only the automatic
  build-on-push behavior is switched off.
- **Render's Git source must be repointed from GitLab to GitHub** (Render
  dashboard → service → Settings → Git), with Render's own **Auto-Deploy setting
  turned off** — otherwise Render keeps auto-building on every push to whichever
  repo it's connected to, on top of the deploy-hook call, which is the same
  duplicate-deploy bug on the Render side.
- **`.gitlab-ci.yml` no longer deploys anything.** It's a validate-only pipeline
  (lint/test/build-check) kept as an optional secondary check. Nothing breaks if
  you stop pushing to `origin` (GitLab) entirely, and nothing breaks if you keep
  pushing there — it just lints and builds, with no path to production anymore.

**Consequence: a bare `git push` (to `github`, the tracked upstream) is now
sufficient to deploy both runtimes end to end.** Pushing to `origin` (GitLab) is
optional — useful only if you still want its secondary lint/build check.

---

## 2. Pipeline stages and job graph

### GitHub Actions — the canonical CD pipeline (`.github/workflows/deploy-production.yml`)

```
push to GitHub main (or workflow_dispatch)
  │
  └─ validate    (lint + test + build, ephemeral Postgres — same npm run build Vercel runs)
       └─ migrate            (applies Prisma migrations to the real prod DB — no manual gate)
            ├─ deploy-storefront   (needs: migrate) → hits Vercel deploy hook
            ├─ deploy-admin        (needs: migrate) → hits Render deploy hook
            └─ smoke               (needs: deploy-storefront, deploy-admin) → curls live URLs
```

Key structural facts:

- **No manual approval gate on `migrate`** — a deliberate choice made when this
  pipeline replaced GitLab's (GitLab's old `migrate:production` required a manual
  click; this one runs automatically once `validate` passes). If you want that
  gate back, add a **required reviewer** rule to the `production` GitHub
  Environment (Settings → Environments → `production` → Deployment protection
  rules) — but note every job below that declares `environment: { name:
  production }` would then pause for approval, not just `migrate`. Give `migrate`
  its own environment name first if you want a single click instead of three.
- **`deploy-storefront` and `deploy-admin` only trigger deploy hooks** — same
  fire-and-forget contract as the old GitLab jobs of the same purpose. They return
  as soon as the hook HTTP call succeeds; Vercel/Render build asynchronously on
  their own infrastructure afterward.
- **`smoke` runs after both deploys are *triggered*, not after they're *live***
  — this is why `scripts/smoke-test.sh` starts with `sleep
  ${SMOKE_WAIT_SECONDS:-90}` before checking anything. If Vercel/Render take
  longer than 90s to actually go live, smoke checks can false-fail on a
  stale/mid-deploy response. Re-run the job manually if that happens rather than
  assuming the code is broken.
- **`smoke` has `continue-on-error: true`** (GitHub's equivalent of GitLab's
  `allow_failure: true`) — a smoke-test failure doesn't fail the workflow run;
  it's a signal to check manually, not a gate.
- **`concurrency: { group: deploy-production, cancel-in-progress: false }`** —
  a second push while a run is still in flight queues instead of cancelling it,
  which matters because cancelling mid-`migrate` would be dangerous.

### Running the pipeline

It runs automatically on every push to `main` on GitHub — no manual step. To
re-run without a new push (e.g. to retry a failed deploy), use **Actions → Deploy
Production → Run workflow** (the `workflow_dispatch` trigger), or re-run failed
jobs directly from a past run's page.

### GitLab CI (`.gitlab-ci.yml`) — validate-only, optional, no longer deploys

```
push to GitLab main (or open an MR)
  │
  ├─ validate (parallel, automatic)
  │    ├─ lint-and-test   (real Postgres service, npm run lint && npm test)
  │    └─ build-check     (real Postgres service, npm run build — same command Vercel runs)
  │
  └─ security (MR only, automatic)
       └─ npm-audit       (allow_failure: true — informational only)
```

Same validate/security logic as GitHub Actions' `validate` job (just split into
two jobs instead of one). Kept as a secondary check if you still push to GitLab —
nothing downstream depends on it, and there is no `migrate`/`deploy` stage in this
file anymore.

---

## 3. Job-by-job reference

### `lint-and-test`
Spins up a real `postgres:16-alpine` service, runs `npm run db:migrate:deploy`
(applies all committed migrations to a throwaway DB), then `npm run lint` and `npm
test`. `NODE_ENV: test`.

### `build-check`
Runs the **exact command Vercel runs in production**: `npm run build`, which is
`npx prisma db seed && next build` (see §5 for why seeding is in the build step).
`NODE_ENV: production`. This job has its **own** `postgres:16-alpine` service and
`DATABASE_URL` — it must, because:
1. The seed step needs a real DB to write to.
2. `next build`'s prerendering calls `getCategoryStaticParams()` /
   `getSubcategoryStaticParams()` / `getProductStaticParams()`
   ([`src/actions/products/getCatalogStaticParams.ts`](../src/actions/products/getCatalogStaticParams.ts)),
   which query Prisma directly with **no try/catch around connection failures**. A
   dead/placeholder `DATABASE_URL` doesn't degrade gracefully here — it throws and
   fails the whole build. `db:migrate:deploy` runs first so the schema exists
   before seed/build touch it.

### `npm-audit`
MR-only, `allow_failure: true`. Purely informational — never blocks anything.

### `migrate` *(GitHub Actions, `.github/workflows/deploy-production.yml`)*
The only job that touches the **real** production `DATABASE_URL` (a GitHub
Environment secret scoped to `production` — see §4). Runs `npm run
db:migrate:deploy` (`prisma migrate deploy && prisma generate` — applies only
pending migrations, never generates new ones, never resets anything). Safe to
re-run even with zero pending migrations. No manual approval gate by default —
see §2 for how to add one back.

### `deploy-storefront` / `deploy-admin` *(GitHub Actions)*
Both just check out the repo and run a one-shot script
([`scripts/deploy-vercel.sh`](../scripts/deploy-vercel.sh) /
[`scripts/deploy-render.sh`](../scripts/deploy-render.sh)) that POSTs to a
deploy-hook URL and prints whatever ID Vercel/Render returns — the same scripts
GitLab used to call, unchanged. They do not build, test, or wait. The actual
build happens on Vercel's/Render's own infrastructure, outside GitHub Actions
entirely — check the **Vercel dashboard** or **Render dashboard** directly for
real build logs.

### `smoke` *(GitHub Actions)*
Waits `SMOKE_WAIT_SECONDS` (default 90s), then curls 5 endpoints (3 storefront, 1
webhook, 1 admin) and checks status codes. See [`scripts/smoke-test.sh`](../scripts/smoke-test.sh)
for the exact list. `continue-on-error: true` — same "informational, not a gate"
contract GitLab's `allow_failure: true` had.

---

## 4. Required GitHub Actions secrets + variables (GitLab no longer needs any)

`.gitlab-ci.yml`'s jobs are validate-only now and use inline placeholder values —
no GitLab CI/CD Variables are required anymore. Everything real lives on a
GitHub **Environment** named `production` (Settings → Environments → New
environment → name it `production`), which every real job below declares via
`environment: { name: production }` — the GitHub equivalent of GitLab's
"Protected variable" scoping.

**They are split across two different GitHub stores, and the split is not
optional — it's a real GitHub Actions syntax rule, not a style choice:**

| Name | Store | Used by | Notes |
|---|---|---|---|
| `DATABASE_URL` | **Secret** | `migrate` | Real Supabase connection string. Only this job sees the real one — `validate` defines its own throwaway `DATABASE_URL` inline. |
| `VERCEL_DEPLOY_HOOK_URL` | **Secret** | `deploy-storefront` | Vercel → Project → Settings → Git → Deploy Hooks — the same hook GitLab used to call. |
| `RENDER_DEPLOY_HOOK_URL` | **Secret** | `deploy-admin` | Render → Service → Settings → Deploy Hook — the same hook GitLab used to call. |
| `NEXT_PUBLIC_APP_URL` | **Variable** | `deploy-storefront` (environment URL), `smoke` | e.g. `https://shop.foghornbay.com` (no trailing slash) — public URL, not sensitive |
| `ADMINJS_PUBLIC_URL` | **Variable** | `deploy-admin` (environment URL), `smoke` | Bare domain or `/admin` path both work — `smoke-test.sh`'s `check()` follows redirects (`curl -L`) — public URL, not sensitive |

**Why `NEXT_PUBLIC_APP_URL`/`ADMINJS_PUBLIC_URL` must be Variables (`vars.*`), not
Secrets:** `deploy-storefront`/`deploy-admin` show these as the job's
`environment.url` (the clickable link in GitHub's deployment UI), and
`environment.url` only supports the `vars`/`github`/`needs`/`inputs`/`strategy`/
`matrix` contexts — **not** `secrets`. Referencing `secrets.NEXT_PUBLIC_APP_URL`
(or any secret) there makes the *entire workflow file* fail to parse with
`Unrecognized named-value: 'secrets'`, blocking every job, not just the one
using it — see §7. Putting them in Environment *Variables* instead of *Secrets*
is also more correct anyway: they're public URLs, not credentials.

If `NEXT_PUBLIC_APP_URL` / `ADMINJS_PUBLIC_URL` aren't set, `smoke-test.sh` exits 1
immediately with `ERROR: ... is not set.` before making any HTTP calls — same
behavior as before, just running in GitHub Actions instead of GitLab.

---

## 5. Why `npm run build` seeds the production database

`package.json`'s `build` script is:
```json
"build": "npx prisma db seed && next build"
```

This is unusual and worth understanding before "fixing" it. Vercel's build command
*is* `npm run build` — there is no separate post-deploy hook available on Vercel's
Hobby/Pro plan for arbitrary scripts. Seeding was folded into `build` specifically
so that pushing to `main` results in `shop.foghornbay.com` having fake catalog data,
without a separate manual step. **This means every single Vercel deploy re-runs the
seed script** ([`prisma/seed.ts`](../prisma/seed.ts), ~1900 lines, `@faker-js/faker`-based,
gated by `SEED_GENERATE_CATEGORIES` / `SEED_GENERATE_PRODUCTS` env toggles that
default to `'true'`).

**Caveats:**
- `prisma migrate deploy` is deliberately **not** in this chain. It needs a direct
  (non-pooled) DB connection and breaks against Supabase's transaction-pooler URL.
  Migrations are applied separately via the manual `migrate:production` CI job.
- If you ever put real (non-fake) customer data in this production DB, **stop
  running the seed on every deploy** — split `build` back into just `next build`
  and move seeding to a one-time manual script. As of this writing the store is
  intentionally using fake/demo data, so this is fine.
- `build-check` (§3) exercises this exact same seed-then-build path against a
  throwaway CI Postgres — if the seed script ever becomes non-idempotent or starts
  depending on external services, `build-check` will catch it before it reaches
  Vercel.

---

## 6. AdminJS on Render: the hardest-won section in this document

This took **six separate iterations** to get right. Every one of these steps is
load-bearing; skipping any one of them reproduces a real failure that was already
hit and fixed. Read this whole section before touching anything related to the
admin panel's Render deploy.

### 6.1 Render build command

Must be exactly:
```
npm run render:build
```
which expands to:
```json
"render:build": "npm install --legacy-peer-deps --include=dev && npm run admin:bundle",
"admin:bundle": "NODE_ENV=production node --max-old-space-size=2048 --import tsx/esm scripts/admin-prebundle.mts",
```

**Why `--include=dev`:** Render sets `NODE_ENV=production` for the build
environment. npm derives `omit: ['dev']` from `NODE_ENV=production` automatically —
this is npm's own config default, not a Render-specific behavior, and it also bit
the GitLab `build-check` job (§7 table, row 1). `prisma` and `tsx` are
devDependencies (needed to run the admin server, which is TypeScript executed
directly via `tsx`, not pre-compiled). Without `--include=dev`, `postinstall`
(`prisma generate`) fails with `sh: prisma: not found` before the build even gets
to bundling.

**Why a separate bundle step:** AdminJS's `admin.initialize()` bundles ~48 custom
React components (Dashboard, TopBar, per-resource filters/actions — see
[`src/admin/config/components.mts`](../src/admin/config/components.mts)) using
Rollup, at **runtime**, the first time it's called — *unless* you've pre-bundled
during build and set `ADMIN_JS_SKIP_BUNDLE=true`. Bundling ~48 components with
Rollup needs more heap than Render's 512MB free-tier runtime has, and the process
OOMs with `FATAL ERROR: Ineffective mark-compacts near heap limit`. Render's
**build** step has more memory available than the always-on **runtime** dyno, so
[`scripts/admin-prebundle.mts`](../scripts/admin-prebundle.mts) runs
`admin.initialize()` once during build (with `--max-old-space-size=2048` for extra
headroom) and writes the bundle to disk. At runtime, `ADMIN_JS_SKIP_BUNDLE=true`
tells AdminJS to skip bundling and just serve the pre-built file.

### 6.2 The dot-free bundle directory — THE critical gotcha

**`ADMIN_JS_TMP_DIR` must be a directory whose path contains NO segment starting
with a dot.** Currently set to `adminjs-bundle` (not AdminJS's own default,
`.adminjs`). This one line is the difference between a working admin panel and one
that silently serves the *default* AdminJS UI forever, no matter how correct
everything else is.

**Root cause, proven by direct reproduction (not guessed):** AdminJS serves
`components.bundle.js` via Express's `res.sendFile()`, which delegates to the
`send` npm package. `send` defaults to `dotfiles: 'ignore'`, and its
`containsDotFile()` check runs on **every segment of the resolved absolute path** —
so `/opt/render/project/src/.adminjs/bundle.js` 404s **unconditionally**, even
though the file exists on disk and is perfectly valid. There is no code path in
AdminJS or Express that changes this; it's the HTTP static-file layer refusing to
serve the path, full stop.

Symptom when this is wrong: the admin panel loads, login works, but the dashboard
shows a generic fallback (not the custom "Daily focus" / "Performance snapshot"
dashboard), and clicking into any resource with a custom filter/action throws, in
the browser console:
```
Error: Component "SelectFilterWithPlaceholder" has not been bundled, ensure it was
added to your ComponentLoader instance (the one included in AdminJS options).
```
or in the UI: *"Ви повинні заімплементувати ActionComponent для своєї дії"* (locale
string for "You must implement an ActionComponent for your action"). **This is not
a bundling failure** — the bundle built fine and exists on disk. It's a **serving**
failure: the browser requested `/admin/frontend/assets/components.bundle.js`, got a
plain 404, and `AdminJS.UserComponents` is simply empty in the browser, so every
custom component silently falls back to nothing.

Reproduce/verify locally in 30 seconds if this regresses:
```bash
rm -rf adminjs-bundle .adminjs
ADMIN_JS_TMP_DIR=.adminjs npm run admin:bundle    # old, WRONG default dir
ADMINJS_PORT=3799 <run admin:start with test env vars>
curl -o /dev/null -w '%{http_code}\n' http://localhost:3799/admin/frontend/assets/components.bundle.js
# -> 404, because .adminjs contains a dot segment

rm -rf adminjs-bundle .adminjs
npm run admin:bundle   # current, correct — writes to adminjs-bundle/
# restart admin:start, repeat the curl
# -> 200, 1.4MB, all 48 UserComponents assignments present
```

Both `scripts/admin-prebundle.mts` (build time) and the `admin:start` npm script
(runtime) must set **the same** `ADMIN_JS_TMP_DIR` value, and must set it **before**
importing `admin.mts` — AdminJS's `constants.js` reads the env var once at module
load and never re-reads it.

Also gitignored: `/adminjs-bundle/`, `/.adminjs/`, `/public/.adminjs/` (an earlier,
also-wrong attempt at fixing this — see §7 row 5 for why "just move it under
`public/`" doesn't work: `public/.adminjs` still contains a `.adminjs` segment).

### 6.3 `ADMIN_JS_SKIP_BUNDLE` is a build-vs-runtime double-edged env var

Render exposes environment variables to **both** the build step and the runtime
process by default (it's one "Environment" tab for the whole service). Runtime
*needs* `ADMIN_JS_SKIP_BUNDLE=true` set. But if it's set as a Render env var, it
also leaks into the **build** step — where the pre-bundle script needs it
**unset** so bundling actually happens. `scripts/admin-prebundle.mts` handles this
defensively by `delete`-ing `ADMIN_JS_SKIP_BUNDLE` from its own process env before
calling `admin.initialize()`, regardless of what Render has configured globally. Do
not remove that line assuming it's redundant — it isn't.

### 6.4 Required Render environment variables (admin service)

Everything in [`docs/env.admin.example`](./env.admin.example), **plus**:
```
ADMIN_JS_SKIP_BUNDLE=true
ADMIN_JS_TMP_DIR=adminjs-bundle
```
and ideally:
```
NEXT_PUBLIC_APP_URL=https://shop.foghornbay.com   # so product thumbnails render in the admin UI
ADMINJS_REQUIRE_ACTIVE_USER=false                 # unless you've deliberately opted into the admin-user DB gate
```

### 6.5 Supabase/pg connection quirks (also admin-service-specific)

All raw `pg.Pool` instances in `src/admin/` (Prisma adapter, session store) go
through [`src/admin/utils/create-pg-pool.mts`](../src/admin/utils/create-pg-pool.mts)'s
`createAdminPgPool()`. Do not construct a `pg.Pool` directly against
`process.env.DATABASE_URL` anywhere in `src/admin/` — you will reintroduce one of:
- **`sslmode=require` in the URL** makes `pg` v8 enforce `verify-full` independent
  of any `ssl` option passed to `Pool` — this rejects Supabase's pooler cert chain.
  `createAdminPgPool` strips `sslmode` from the URL and sets an explicit
  `ssl: { rejectUnauthorized: false }` instead.
- **Prisma-only URL params** (`pgbouncer=true`, `connection_limit=1`, etc.) are
  signals for Prisma's own internals, not valid Postgres startup parameters —
  passing them straight to `pg.Pool` confuses it. `createAdminPgPool` strips them.
- **No connection timeout** means a bad connection hangs for the OS/TCP default
  (60s+) before failing, which reads as a mysterious 502 on whatever HTTP request
  triggered it (this exact symptom cost an entire debugging round on the admin
  login POST). `createAdminPgPool` sets `connectionTimeoutMillis: 10_000`.

---

## 7. Error message → fix quick reference

If you (AI agent or human) are staring at a failed pipeline or a broken deploy,
match the error text here first — every row below was a real failure hit while
building this pipeline, in the order encountered.

| Error text you'll see | Where | Root cause | Fix |
|---|---|---|---|
| `sh: prisma: not found` | Render build, or GitLab `build-check`/`lint-and-test` | `NODE_ENV=production` makes npm auto-omit devDependencies (`prisma` lives there) | Add `--include=dev` to the install command |
| `EmptyGenerateStaticParamsError` | Vercel build | `cacheComponents: true` (next.config) requires `generateStaticParams` to return ≥1 entry; empty DB returns `[]` | [`getCatalogStaticParams.ts`](../src/actions/products/getCatalogStaticParams.ts) returns a `{ locale, category: '_' }` placeholder when empty; placeholder 404s cleanly at request time via `notFound()` |
| `Invalid environment variables { SOME_URL: ['Invalid URL'] }` | seed / build / any `src/config/env.ts` consumer | `z.string().url().optional()` rejects `""` (empty string), which `.env` files commonly have for unused optional vars | Use the `optionalUrlEnv()` helper in `env.ts`, which normalizes `""` → `undefined` before validating |
| `blocked-hostname` thrown at admin startup | Render runtime | `NEXT_PUBLIC_APP_URL` unset → server fell back to `http://localhost:3000` → the SSRF-safety check (`verifyServerFetchUrl`) correctly refuses to fetch `localhost` in production | Don't fall back to localhost in production; treat a missing URL as "thumbnails disabled" (log a warning) instead of a fake default |
| `Cannot GET /` on the admin domain | Render runtime | AdminJS only mounts routes under `/admin`; bare `/` has no handler | `app.get('/', ...) => res.redirect(301, admin.options.rootPath)` in `src/admin/server.mts` |
| 502 on `/admin` page load (no login attempted yet) | Render runtime | Session store's `pg.Pool` had no SSL config, hung on first query, Express never called `next()`, Render's proxy timed out | Route the session store's pool through `createAdminPgPool()` (§6.5) |
| 502 on login POST, ~60s delay | Render runtime | `requireActiveAdminUser` (default `true` in prod) → `prisma.user.findUnique()` → pool's first connection hung (Prisma-only URL params confusing `pg`, no timeout) | `createAdminPgPool()` strips those params and sets a 10s `connectionTimeoutMillis`; also consider `ADMINJS_REQUIRE_ACTIVE_USER=false` if you don't need the DB-backed active-user gate |
| `FATAL ERROR: Ineffective mark-compacts near heap limit` during deploy | Render build/runtime | AdminJS bundles ~48 components with Rollup at runtime by default; OOMs on the 512MB free tier | Pre-bundle during the **build** step (`npm run render:build` → `admin:bundle`), then set `ADMIN_JS_SKIP_BUNDLE=true` at runtime (§6.1) |
| `[admin:bundle] FAILED — expected .../bundle.js to exist` | Render build | `ADMIN_JS_SKIP_BUNDLE=true` was set as a Render env var, and it leaked into the *build* step too, so `admin.initialize()` skipped bundling entirely (`admin:bundle` script no-oped) | Pre-bundle script now `delete`s `ADMIN_JS_SKIP_BUNDLE` from its own env before initializing (§6.3) — don't remove this |
| Admin loads, but dashboard is generic + `Component "X" has not been bundled` in console, even though build logs say `[admin:bundle] OK` | Render runtime | Bundle file exists on disk but its directory contains a dot segment (`.adminjs`, or `public/.adminjs`) — Express `res.sendFile` → `send` package 404s ANY dot-segment path unconditionally | Point `ADMIN_JS_TMP_DIR` at a **dot-free** directory (`adminjs-bundle`) — set identically at build time and runtime, before `admin.mts` is imported (§6.2 — this is the single most expensive bug in this whole pipeline's history, verify with the repro recipe in §6.2 before assuming it's fixed by anything else) |
| `/bin/sh: eval: line N: bash: not found` | *(historical)* GitLab `deploy:*`/`smoke:production`, before the GitHub Actions cutover | `node:22-alpine`'s default shell is busybox `ash`, not `bash`; the deploy/smoke scripts declare `#!/usr/bin/env bash` and use `set -o pipefail` (not POSIX-sh compatible) | `apk add --no-cache curl bash` in `before_script`. Moot on GitHub Actions' `ubuntu-latest` runners, which ship real `bash` by default — only matters if these scripts ever run under Alpine/`ash` again |
| smoke test FAIL: `Stripe webhook (no POST) → HTTP 500 (expected 405/404/400)` | `smoke` job (GitLab's old `smoke:production`, now GitHub Actions' `smoke`) | The test hit `/api/stripe/webhook`, but the real route is `/api/payments/stripe/webhook` — the wrong (nonexistent) path fell through to something that 500s instead of 404ing | Fixed the URL in `scripts/smoke-test.sh` to the real path; the real route only exports `POST` so a `GET` there correctly gets Next.js's automatic `405` |
| smoke test FAIL: `Admin login page → HTTP 301 (expected 200)` | `smoke` job (GitLab's old `smoke:production`, now GitHub Actions' `smoke`) | `ADMINJS_PUBLIC_URL` points at the bare domain, which we ourselves 301-redirect to `/admin` (§ "Cannot GET /" row above); `curl` doesn't follow redirects by default | Added `-L` to the `curl` call in `smoke-test.sh`'s shared `check()` helper so it follows redirects and checks the *final* page's status |
| `Invalid workflow file ... Unrecognized named-value: 'secrets'. Located at position 1 within expression: secrets.NEXT_PUBLIC_APP_URL` (or `ADMINJS_PUBLIC_URL`) | GitHub Actions workflow parse, before any job runs (`deploy-production.yml`) | `jobs.<id>.environment.url` only allows the `vars`/`github`/`needs`/`inputs`/`strategy`/`matrix` contexts — `secrets` isn't one of them. A single bad reference fails the *whole file's* validation, blocking every job | Use `vars.NEXT_PUBLIC_APP_URL`/`vars.ADMINJS_PUBLIC_URL` there instead, and store those two as GitHub Environment **Variables**, not Secrets (§4) — they're public URLs anyway |

---

## 8. Debugging checklist for an AI agent picking this up cold

1. **Read the actual error text first**, then check §7 above for an exact or
   near-exact match before doing any original investigation — most failures in
   this pipeline's history repeat in some form.
2. **Identify which surface is actually failing**: a GitHub Actions pipeline
   failure (`.github/workflows/deploy-production.yml` — the canonical CD path), a
   GitLab pipeline failure (`.gitlab-ci.yml` — validate-only, never blocks
   production), a Vercel build failure, and a Render runtime failure are four
   different logs, four different root-cause spaces, only loosely related by
   sharing a codebase. Don't cross-apply a fix from one to a symptom on another
   without checking the assumption holds.
3. **For Render/AdminJS issues specifically**, prefer reproducing locally over
   iterating on real deploys — every fix in §6 was verified with a local
   `admin:bundle` + `admin:start` + `curl` cycle before being declared fixed. A
   local repro takes ~30 seconds; a Render deploy round-trip takes minutes and
   burns the free tier's build-time quota. Pattern:
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
   (production-mode secret-strength guards in `src/admin/server.mts` reject weak
   local defaults — use secrets that satisfy `hasStrongSecret()`, as above.)
4. **Never assume a fix worked because the theory sounds right.** Multiple rounds
   in this pipeline's history involved a plausible-sounding fix (gitignore, wrong
   directory, wrong env var) that didn't address the actual root cause. Prove it —
   curl the real endpoint, check the real file on disk, read the actual library
   source (`node_modules/adminjs/lib/...`, `node_modules/send/index.js`) rather than
   trusting documentation or assumptions about framework behavior.
5. **If GitLab still matters to you** (i.e. you still push to `origin` for its
   secondary validate check) and something there seems out of sync with what's on
   GitHub, check `git log origin/main` vs `git log github/main` — but this no
   longer affects production, since GitLab has no deploy path anymore. What
   *does* matter for production: whether Render's Git source (Render dashboard →
   Settings → Git) is actually pointed at GitHub, not GitLab. If that repoint
   never happened, `deploy-admin`'s hook call still triggers a Render build, but
   of whatever commit is HEAD on GitLab — which can silently drift from GitHub.
6. **`validate`'s build step failing is a leading indicator for Vercel**, since it
   runs the literal same `npm run build` command. Fix it there before assuming a
   Vercel-specific issue.

---

## 9. Local reproduction of the full validate stage

Useful before pushing, to avoid burning a pipeline run on something checkable
locally in under a minute:

```bash
# mirrors lint-and-test (minus the ephemeral Postgres — point DATABASE_URL at
# your own local/dev Postgres instead)
npm run db:migrate:deploy
npm run lint
npm test

# mirrors build-check (again, point DATABASE_URL at a real reachable Postgres —
# this WILL seed whatever database you point it at, see §5)
npm run build
```

---

## 10. Known inconsistency (not yet broken, worth knowing)

`.nvmrc` pins Node **20**, and `package.json`'s `engines.node` is `>=20.9.0` — but
GitLab CI's `default.image` is `node:22-alpine`, and GitHub Actions'
`actions/setup-node@v4` steps pin `node-version: 22`. Render honors `.nvmrc`
(Node 20); neither CI system reads `.nvmrc`, both use Node 22. All three
currently work because nothing in this codebase depends on a Node-20-specific or
Node-22-specific behavior, but if a dependency ever requires an exact Node major
version, this mismatch is where a "works in CI, breaks on Render" (or vice versa)
report will originate. If you standardize this, update `.gitlab-ci.yml`'s
`image:`, every `node-version:` in `.github/workflows/*.yml`, and `.nvmrc`
together.
