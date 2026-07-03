# Deploy Runbook

## Architecture

| Service | Platform | Entry point |
|---------|----------|-------------|
| Storefront | Vercel | `npm run build` → `npm run start` |
| Admin panel | Render | `npm run admin:start` |
| Database | Supabase (Postgres) | shared between both services |
| Media | Cloudinary | |
| Email | Resend | |
| Payments | Stripe | |
| Errors | Sentry | separate DSNs per service |

## GitLab CI/CD Variables

Set in **GitLab → Settings → CI/CD → Variables**. Mark production secrets as **Protected** and **Masked**.

### Required for every pipeline run

| Variable | Job | Notes |
|----------|-----|-------|
| `DATABASE_URL` | `migrate:production` | Production Supabase connection string |

### Required for deploys

| Variable | Job | Where to get it |
|----------|-----|-----------------|
| `VERCEL_DEPLOY_HOOK_URL` | `deploy:storefront` | Vercel → Project → Settings → Git → Deploy Hooks |
| `RENDER_DEPLOY_HOOK_URL` | `deploy:admin` | Render → Service → Settings → Deploy Hook |
| `NEXT_PUBLIC_APP_URL` | `smoke:production` | e.g. `https://shop.example.com` |
| `ADMINJS_PUBLIC_URL` | `smoke:production` | e.g. `https://admin.example.com/admin` |

## First-time Setup

1. **Supabase**: create project, copy the connection string (Session mode, port 5432) as `DATABASE_URL`.
2. **Vercel**: import this repo, set all vars from `docs/env.storefront.example`. Note the project ID for the deploy hook.
3. **Render**: create a Web Service.
   - Build command: `npm run render:build` (installs deps incl. devDependencies,
     then pre-bundles AdminJS components — see `docs/cicd-pipeline.md` for why
     a plain `npm install` OOMs the free tier)
   - Start command: `npm run admin:start`
   - Set all vars from `docs/env.admin.example`, plus `ADMIN_JS_SKIP_BUNDLE=true`.
4. **GitLab CI/CD variables**: add `DATABASE_URL`, `VERCEL_DEPLOY_HOOK_URL`, `RENDER_DEPLOY_HOOK_URL`, `NEXT_PUBLIC_APP_URL`, `ADMINJS_PUBLIC_URL` (all Protected).
5. Push to `main`. Pipeline runs lint + test + build automatically.
6. Click **migrate:production** in the pipeline to apply the initial Prisma migrations.
7. `deploy:storefront` and `deploy:admin` run automatically after migrate.

## Routine Deploy (merge to main)

```
push / merge MR → main
  └─ validate (auto)
       ├─ lint-and-test
       └─ build-check
  └─ security (auto, MR only)
       └─ npm-audit
  └─ migrate (manual click)
       └─ migrate:production   ← click this
  └─ deploy (auto after migrate)
       ├─ deploy:storefront
       ├─ deploy:admin
       └─ smoke:production
```

If there are no schema changes, you can skip `migrate:production` by re-running `deploy:storefront` and `deploy:admin` directly (Pipeline → Jobs → Run manually).

## Database Migrations

| Command | When to use |
|---------|-------------|
| `npm run db:migrate:dev` | Local dev — creates a new migration file and applies it |
| `npm run db:migrate:deploy` | CI / production — applies existing pending migrations only |

Never run `db:migrate:dev` against a shared or production database.

To create a new migration:
```bash
npm run db:migrate:dev -- --name describe_the_change
```
Commit the generated file in `prisma/migrations/` as part of your MR.

## Rollback

**Storefront**: Vercel → Project → Deployments → select an older deployment → "Promote to Production".

**Admin**: Render → Service → Manual Deploy → select the previous commit.

**Database**: Prisma does not auto-rollback. Write a forward migration that reverses the schema change, commit it, and run `migrate:production`.

## Smoke Test

The `smoke:production` job hits these endpoints and expects the listed status codes:

| Endpoint | Expected |
|----------|----------|
| `GET /` | 200 |
| `GET /sign-in` | 200 |
| `GET /api/cache/revalidate/windows` (no auth) | 401 / 403 |
| `GET /api/payments/stripe/webhook` | 404 / 405 |
| `GET $ADMINJS_PUBLIC_URL` | 200 |

Run the smoke test manually at any time:
```bash
NEXT_PUBLIC_APP_URL=https://shop.example.com \
ADMINJS_PUBLIC_URL=https://admin.example.com/admin \
SMOKE_WAIT_SECONDS=0 \
bash scripts/smoke-test.sh
```
