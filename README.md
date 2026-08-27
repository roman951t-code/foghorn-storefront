# FOGHORNBAY Online Store

A production-focused, multilingual ecommerce application built with Next.js, PostgreSQL, Prisma, and AdminJS.

- Live storefront: [shop.foghornbay.com](https://shop.foghornbay.com)
- Storefront runtime: Next.js App Router on port `3000`
- Admin runtime: separate AdminJS/Express server on port `3001`

## What is included

- Ukrainian and English storefronts with localized metadata and URLs
- Product categories, filters, search, cart, wishlist, reviews, and checkout
- Stripe payments, Resend email flows, and Better Auth authentication
- AdminJS catalog and order management
- PostgreSQL schema, Prisma migrations, and demo seed data
- SEO essentials: canonical URLs, hreflang, XML sitemap, robots rules, and product structured data
- Sentry, Vercel Analytics, Speed Insights, rate limiting, and hardened security headers

## Run locally from a fresh clone

### Prerequisites

Install these tools before starting:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) `20.9` or newer (the repository includes `.nvmrc`)
- npm, which is included with Node.js
- [PostgreSQL](https://www.postgresql.org/download/) with an empty local database

### 1. Download the project

```bash
git clone https://github.com/roman951t-code/foghorn-storefront.git
cd foghorn-storefront
```

If you use `nvm`, select the repository's Node.js version:

```bash
nvm install
nvm use
```

### 2. Create a local PostgreSQL database

Create a dedicated empty database. With the PostgreSQL command-line tools, for example:

```bash
createdb foghorn_store
```

Do not point the local setup command at a production or shared database: when Prisma detects migration drift, the setup can reset the configured database.

### 3. Configure local environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and replace the placeholders. The minimum configuration needed to install, migrate, seed, and start the storefront is:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foghorn_store
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=local-development-placeholder
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
```

Change the PostgreSQL username, password, port, and database name to match your machine. Optional integrations such as Stripe, Google OAuth, Supabase, Cloudinary, Upstash, Sentry, and real email delivery can remain as placeholders until you want to test those features.

Never commit `.env.local`; it is already ignored by Git.

### 4. Install dependencies and prepare demo data

```bash
npm run setup:local
```

This command installs dependencies, generates Prisma Client, applies the repository migrations, and seeds the local database with demo catalog data.

### 5. Start the storefront

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Stop the server with `Ctrl+C`.

## Optional: run the admin panel

Configure the `ADMINJS_*` variables in `.env.local`, then open a second terminal in the project directory and run:

```bash
npm run admin:dev
```

Open [http://localhost:3001/admin](http://localhost:3001/admin). AdminJS is a separate Express application and is not bundled into the Vercel storefront deployment.

## Verify the project

Before submitting changes, run:

```bash
npm test
npm run lint
npm run build
```

To preview the production storefront locally:

```bash
npm run start
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run setup:local` | Install packages, migrate, generate, and seed a local database |
| `npm run db:migrate:dev` | Create/apply a development migration and regenerate Prisma Client |
| `npm run db:migrate:deploy` | Apply existing migrations without creating a new one |
| `npm run db:seed` | Apply deployment migrations and seed demo data |
| `npm run admin:dev` | Start AdminJS in development mode |
| `npm test` | Run the automated test suite |
| `npm run lint` | Run ESLint and TypeScript checks |
| `npm run build` | Create a production Next.js build |
| `npm run start` | Serve the completed production build |

## Production deployment

The Vercel target in this repository deploys only the storefront. The AdminJS server in `src/admin/server.mts` must be deployed separately.

Production setup references:

- `docs/deployment/vercel-storefront.md`
- `docs/deployment/production-roadmap.md`
- `.env.example` for the complete environment-variable inventory

At minimum, production requires a PostgreSQL `DATABASE_URL`, the public canonical `NEXT_PUBLIC_APP_URL`, authentication/encryption secrets, cache revalidation secrets, and the provider credentials for each enabled integration. Use a verified sender domain for `EMAIL_FROM`; do not use `@resend.dev` in production.
