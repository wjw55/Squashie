# Squashie

Squashie is a mobile-first directory that helps students and recent graduates find a suitable squash community in Singapore.

[Live pilot](https://squashie.vercel.app) · [How listings work](https://squashie.vercel.app/methodology)

![Squashie community discovery preview](public/og.png)

## Why I built it

I play squash at NUS Raffles Hall, but information about Singapore squash clubs was scattered across membership pages, programme listings, and social platforms. It was difficult to tell who could join, what it would cost, or whether structured training was available.

The problem becomes more visible after graduation: players lose their campus network and may not know where to find a convenient community. Squashie turns that fragmented information into a clear, source-backed starting point.

## What the pilot does

- Searches communities by name and neighbourhood.
- Filters by region, community type, access, playing level, and structured training.
- Preserves discovery state in the URL so a shortlist can be shared.
- Compares up to three communities side by side.
- Shows eligibility, indicative costs, training intensity, social play, sources, and last-checked dates.
- Links players to official websites, forms, email addresses, and directions.
- Links visitors to the current public correction contact.
- Works across phone, tablet, and desktop layouts.

This release deliberately focuses on community discovery. Accounts, player profiles, match creation, chat, booking, and payments are outside the pilot scope.

## Product and engineering highlights

- **Trust-aware content:** unknown fees are labelled “Not publicly listed—contact organizer” instead of being guessed.
- **PostgreSQL-backed directory:** 13 representative communities are migrated and seeded through a typed repository/service boundary.
- **Runtime validation:** Zod validates database-to-domain mapping and every public API query and response.
- **Shareable state:** search, filters, and comparison selections round-trip through query parameters.
- **Accessible interface:** semantic structure, keyboard-friendly controls, visible focus states, responsive comparison layouts, reduced-motion support, and automated axe checks.
- **Deployment portability:** one Vite configuration supports both Vercel and the OpenAI Sites-compatible build.
- **Reproducible validation:** GitHub Actions installs from the lockfile and runs type, lint, unit, compatibility, browser, accessibility, and dual-build checks.

## Tech stack

- React 19 and TypeScript
- Vinext and Vite
- Tailwind CSS 4 and Base UI
- Nitro's Vercel adapter
- PostgreSQL, Drizzle ORM, and postgres.js
- Zod boundary validation
- PGlite for isolated PostgreSQL integration and browser tests
- Node's built-in test runner
- Playwright and axe-core
- Oxlint and Oxfmt
- GitHub Actions

## Project structure

```text
app/
  api/communities/           Validated public list and detail endpoints
  communities/[slug]/       Shareable community detail pages
  methodology/              Trust, sourcing, and verification guidance
components/
  discovery-client.tsx      Thin discovery feature coordinator
  discovery/                State hook and focused discovery presentation
  ui/                       Reusable Base UI-backed controls
db/
  migrations/               Version-controlled PostgreSQL migrations
  schema.ts                 Drizzle database records
  seed-data.ts              Original editorial records, used only for seeding
  seed.ts                   Deterministic idempotent seed
lib/
  api/                       Public response contracts
  data/                      PostgreSQL repository implementation
  domain/                    Runtime-validated domain model
  discovery.ts              Pure filtering, URL, quick-filter, and comparison logic
  server/                    Database client, query validation, service, and loaders
tests/
  communities.test.ts       Dataset and pure discovery behaviour
  integration/              Migration, seed, repository, service, and API checks
  e2e/                      Playwright journeys and accessibility checks
.github/workflows/ci.yml     Pull-request and main-branch validation
```

## Database and local development

Requires Node.js 22.13 or newer and PostgreSQL 15 or newer. Use a pooled PostgreSQL connection URL for Vercel.

```bash
npm ci
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev:vercel
```

On macOS or Linux, use `cp .env.example .env.local` instead of `copy`. Create the `squashie` database before applying migrations, set its connection string, and then open [http://localhost:3000](http://localhost:3000).

Configure these values in `.env.local`:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/squashie
DATABASE_POOL_MAX=5
NEXT_PUBLIC_CORRECTION_EMAIL=your-public-project-inbox@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`DATABASE_URL` is server-only and must never be committed. Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle; do not put passwords or tokens in them.

`npm run db:migrate` applies committed migrations and records them in PostgreSQL's `drizzle.__drizzle_migrations` table. `npm run db:seed` safely upserts every current community, its source relationships, and its initial verification event. Running either command again is safe.

For a zero-install local database, run:

```bash
npm run dev:test
```

This starts an in-memory PGlite PostgreSQL server, applies migrations, seeds all records, and starts the stable Sites-compatible Vinext development path. It is intended for development and automated tests, never for production data.

The live PostgreSQL runtime target is Nitro's Vercel Node 22 output. The Sites-compatible Cloudflare build remains a validation target, but hosted Sites cannot make raw PostgreSQL TCP connections; using that runtime for live data would require an HTTP database gateway or platform binding.

### Public read API

- `GET /api/communities` lists communities.
- `GET /api/communities/:slug` retrieves one community.
- List filters are `q`, `region`, `category`, `access`, `level`, and `training=true|false`.
- Unknown or invalid parameters receive a safe `400` response, missing slugs receive `404`, and database failures receive a non-diagnostic `503`.

## Complete validation workflow

Install dependencies reproducibly and install the Chromium browser used by Playwright:

```bash
npm ci
npx playwright install chromium
```

Linux and CI environments should install the required system packages too:

```bash
npx playwright install --with-deps chromium
```

Run all engineering checks:

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run check:vinext
npm run build
npm run build:vercel
npm run test:e2e
npm run test:a11y
```

The standard build validates the OpenAI Sites-compatible Cloudflare Worker path. The Vercel build validates the live Nitro/Vercel Node database runtime and writes the Build Output API files expected by Vercel. Integration and browser tests use a fresh isolated PGlite database and never touch `DATABASE_URL` or a production database.

For a database-backed local runtime smoke test, run `npm run dev:test` and check the home page, methodology page, public list API, and a representative community detail page at [http://localhost:3000](http://localhost:3000). The validation report for a release should record the exact routes and status codes checked.

### Manual browser checks

Before describing a release as complete:

- Inspect the home, filtered, empty, comparison, and detail states at desktop and mobile widths.
- Tab through navigation, search, quick filters, filter controls, comparison checkboxes, and the comparison dock.
- Confirm every focused control has a visible focus indicator.
- Open the comparison dialog with the keyboard, confirm focus enters and remains inside it, dismiss it with Escape, and confirm focus returns to “Compare now”.
- Check that no principal page has unexpected horizontal overflow or obscured content.

## Continuous integration

GitHub Actions runs on every pull request targeting `main` and every push to `main`. The workflow uses Node 22 and `npm ci`, then runs type-checking, linting, unit and isolated PostgreSQL integration tests, `vinext check`, both production builds, Chromium end-to-end tests, and axe accessibility tests. Playwright reports, traces, and failure screenshots are retained as workflow artifacts when available.

## Vinext compatibility

With Vinext 1.0.0-beta.8, `vinext check` reports 96% compatibility, with no unsupported features or detected issues. The only partial result is `next/font/google`: Vinext loads those fonts from a CDN rather than self-hosting them at build time. Keep this check in the validation workflow while Vinext remains in beta.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Leave the root directory as `./`.
3. The committed `vercel.json` supplies `npm run build:vercel`.
4. Add `NEXT_PUBLIC_SITE_URL=https://squashie.vercel.app` as a **Config** value.
5. Add `NEXT_PUBLIC_CORRECTION_EMAIL` as a **Config** value using a public-facing inbox.
6. Add a pooled `DATABASE_URL` as a **Secret** and optionally set `DATABASE_POOL_MAX` as a **Config** value.
7. Apply `npm run db:migrate` and `npm run db:seed` against that database before sending traffic to the deployment.
8. Deploy. Future pushes to `main` create new production deployments.

## Data and methodology

Squashie publishes only organizational information and official public contact channels. Every community record includes source links, a last-checked date, and one of three verification states:

- **Organizer verified**
- **Unverified**
- **Needs re-checking**

Squashie is an independent discovery guide. It does not endorse listed organizations or guarantee externally maintained fees, schedules, eligibility, or availability.

## Roadmap

The next product step is the editorial correction and protected moderation workflow. Accounts, player matching, chat, booking, and payments remain outside the current product scope.
