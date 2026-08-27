---
name: deploy-pipeline
description: Ship code to production (Vercel storefront + Render admin), debug a failed CI/CD run, or reproduce the pipeline locally before pushing. Use whenever the user asks to deploy, release, ship, "push to prod", or a GitHub Actions / Vercel / Render build/deploy is failing.
---

# Deploy pipeline

Full reference: [`docs/cicd-pipeline.md`](../../../docs/cicd-pipeline.md) (deep-dive,
every gotcha with root cause) and [`docs/universal-app-doc.md`](../../../docs/universal-app-doc.md)
§4 (condensed, in context of the whole app). Read the relevant section there before
guessing — this file is a fast-path index, not a replacement.

## The one thing to know

**A plain `git push` to the `github` remote's `main` branch deploys both runtimes end
to end.** No manual step needed: GitHub Actions (`.github/workflows/deploy-production.yml`)
runs validate → migrate → deploy-storefront (Vercel) + deploy-admin (Render) → smoke,
automatically. Vercel's own auto-deploy-on-push is deliberately disabled
(`vercel.json`'s `git.deploymentEnabled.main = false`) so this workflow is the only
trigger — don't re-enable it, that recreates a double-deploy bug.

Two remotes exist (`github` = canonical, `origin` = GitLab, validate-only/optional).
Push to `github`. GitLab no longer deploys anything.

## Before pushing: reproduce validate locally (~1 min, avoids burning a CI run)

```bash
npm run db:migrate:deploy   # point DATABASE_URL at your own reachable Postgres
npm run lint
npm test
npm run build                # runs `npx prisma db seed && next build` — same as Vercel
```

## If a pipeline/deploy is failing

1. Read the actual error text, then check the **"Error message → fix" table**
   in `docs/cicd-pipeline.md` §7 first — nearly every failure mode already
   happened once and is documented there verbatim (wrong Node/npm dev-dep
   omission, `EmptyGenerateStaticParamsError`, Supabase pooler/SSL quirks,
   AdminJS Rollup OOM, the `.adminjs` dot-segment 404, GitHub Actions
   `secrets.*` in `environment.url`, etc).
2. Identify which of the four independent surfaces is actually failing —
   GitHub Actions, GitLab CI (informational only, never blocks prod), Vercel
   build, or Render runtime. Don't cross-apply a fix from one to a symptom on
   another.
3. `validate`'s build step runs the literal `npm run build` Vercel runs — a
   failure there is a leading indicator for a Vercel build failure too; fix it
   there first.
4. For AdminJS/Render issues specifically: reproduce locally
   (`docs/cicd-pipeline.md` §8, step 3 has the exact repro commands) rather than
   iterating on real Render deploys — a local repro is ~30s, a Render
   round-trip is minutes and burns free-tier build quota.
5. Never declare a fix confirmed because the theory sounds plausible — curl
   the real endpoint / check the real file on disk / read the real library
   source, per `docs/cicd-pipeline.md` §8 step 4.

## Secrets/vars (only if touching the workflow itself)

Real credentials live in a GitHub **Environment** named `production`, split
across **Secrets** (`DATABASE_URL`, `VERCEL_DEPLOY_HOOK_URL`,
`RENDER_DEPLOY_HOOK_URL`) and **Variables** (`NEXT_PUBLIC_APP_URL`,
`ADMINJS_PUBLIC_URL` — these MUST be Variables, not Secrets, because
`environment.url` can't reference `secrets.*` and a single bad reference fails
the whole workflow file's parse). See `docs/cicd-pipeline.md` §4 for the full
table and reasoning.

## Re-running without a new push

Actions → Deploy Production → **Run workflow** (`workflow_dispatch`), or re-run
failed jobs from a past run's page. Safe to re-run `migrate` even with zero
pending migrations.
