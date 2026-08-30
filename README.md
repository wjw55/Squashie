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
- Lets visitors submit source-backed corrections for editorial review.
- Gives allowlisted administrators a protected moderation queue with an audit trail.
- Works across phone, tablet, and desktop layouts.

This release deliberately focuses on community discovery. Accounts, player profiles, match creation, chat, booking, and payments are outside the pilot scope.

## Product and engineering highlights

- **Trust-aware content:** unknown fees are labelled “Not publicly listed—contact organizer” instead of being guessed.
- **PostgreSQL-backed directory:** 13 representative communities are migrated and seeded through a typed repository/service boundary.
- **Runtime validation:** Zod validates database-to-domain mapping and every public API query and response.
- **Editorial safety:** corrections remain pending until an administrator approves or rejects them; approvals update the listing and audit record in one transaction.
- **Protected moderation:** Better Auth provides GitHub OAuth sessions while a server-only email allowlist controls administrator access.
- **Abuse controls:** public submissions have strict schemas, size and URL limits, a honeypot, same-origin checks, and database-backed rate limiting.
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
- Better Auth with GitHub OAuth
- Zod boundary validation
- PGlite for isolated PostgreSQL integration and browser tests
- Node's built-in test runner
- Playwright and axe-core
- Oxlint and Oxfmt
- GitHub Actions

## Project structure

```text
app/
  admin/moderation/          Protected correction moderation queue
  api/auth/                  Better Auth request handler
  api/communities/           Validated public list and detail endpoints
  api/corrections/           Public correction submission endpoint
  api/admin/corrections/     Protected moderation decision endpoint
  communities/[slug]/       Shareable community detail pages
  corrections/              Accessible public correction form
  methodology/              Trust, sourcing, and verification guidance
components/
  discovery-client.tsx      Thin discovery feature coordinator
  discovery/                State hook and focused discovery presentation
  ui/                       Reusable Base UI-backed controls
db/
  auth-schema.ts             Better Auth database records
  migrations/               Version-controlled PostgreSQL migrations
  schema.ts                  Community, correction, rate-limit, and audit records
  seed-data.ts              Original editorial records, used only for seeding
  seed.ts                   Deterministic idempotent seed
lib/
  api/                       Public response contracts
  data/                      PostgreSQL repository implementation
  domain/                    Runtime-validated domain model
  discovery.ts              Pure filtering, URL, quick-filter, and comparison logic
  server/                    Database, auth, request security, services, and loaders
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CORRECTION_RATE_LIMIT_SALT=replace-with-an-independent-random-secret
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
ADMIN_EMAILS=maintainer@example.com
```

`DATABASE_URL`, `CORRECTION_RATE_LIMIT_SALT`, `BETTER_AUTH_SECRET`, and `GITHUB_CLIENT_SECRET` are server-only secrets and must never be committed. Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle; do not put passwords or tokens in them. `ADMIN_EMAILS` accepts a comma-separated, case-insensitive allowlist.

`npm run db:migrate` applies committed migrations and records them in PostgreSQL's `drizzle.__drizzle_migrations` table. The second migration adds correction requests, database-backed rate limits, moderation audit records, and Better Auth's user, account, session, and verification tables. `npm run db:seed` safely upserts every current community, its source relationships, and its initial verification event. Running either command again is safe.

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

### Editorial correction and moderation workflow

Visitors submit corrections at `/corrections`, optionally preselected from a community detail page. A request identifies the community and field, provides a proposed value, and includes either a source URL or an explanation. Optional contact information is stored for editorial follow-up but is never returned by public community endpoints.

`POST /api/corrections` accepts JSON bodies up to 16 KB. It validates the origin, content type, community, field, URL, text lengths, and honeypot, then permits at most five submissions per hashed network fingerprint in a rolling one-hour window. Set `CORRECTION_RATE_LIMIT_SALT` to an independent random secret so stored fingerprints cannot be compared with raw addresses. The live Vercel target uses its trusted forwarding header; deployments behind another proxy should review the trusted-address order in `lib/server/request-security.ts`.

Correction states are `pending`, `approved`, and `rejected`. Public submissions never edit a listing directly. An approval atomically updates the selected published field, marks the listing for re-checking, attaches the submitted source when present, creates a verification event, resolves the request, and writes an immutable moderation audit record. Rejection resolves the request and records the audit action without changing public data. A database claim and unique audit constraint prevent duplicate processing.

Administrators use `/admin/moderation`. GitHub OAuth is handled by Better Auth; Squashie does not store or verify passwords. Create a GitHub OAuth app with these callback URLs:

- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://your-domain.example/api/auth/callback/github`

Set the app credentials in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, make `BETTER_AUTH_URL` exactly match the deployment origin, generate a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters, and add authorized GitHub account emails to `ADMIN_EMAILS`. GitHub must make the account's verified email available to the OAuth app. Authentication alone is insufficient: any signed-in address outside the allowlist receives `403`. Internal notes, administrator identity, submitter fingerprints, and optional contact details are not exposed through public APIs.

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

For a database-backed local runtime smoke test, run `npm run dev:test` and check the home page, methodology page, correction form, administrator sign-in boundary, public list API, and a representative community detail page at [http://localhost:3000](http://localhost:3000). `dev:test` uses fake, isolated test-only authentication settings and cannot authenticate a real GitHub account. The validation report for a release should record the exact routes and status codes checked.

### Manual browser checks

Before describing a release as complete:

- Inspect the home, filtered, empty, comparison, and detail states at desktop and mobile widths.
- Tab through navigation, search, quick filters, filter controls, comparison checkboxes, and the comparison dock.
- Confirm every focused control has a visible focus indicator.
- Open the comparison dialog with the keyboard, confirm focus enters and remains inside it, dismiss it with Escape, and confirm focus returns to “Compare now”.
- Check that no principal page has unexpected horizontal overflow or obscured content.
- Submit an invalid and a valid correction with the keyboard, then confirm the success message is announced.
- Confirm an anonymous visitor sees the administrator sign-in boundary and cannot call a moderation endpoint.
- With real OAuth settings, sign in using an allowlisted GitHub account; verify dashboard focus order, source links, approve/reject controls, optional note handling, sign-out, and the public result of an approval.

## Continuous integration

GitHub Actions runs on every pull request targeting `main` and every push to `main`. The workflow uses Node 22 and `npm ci`, then runs type-checking, linting, unit and isolated PostgreSQL integration tests, `vinext check`, both production builds, Chromium end-to-end tests, and axe accessibility tests. Playwright reports, traces, and failure screenshots are retained as workflow artifacts when available.

## Vinext compatibility

With Vinext 1.0.0-beta.8, `vinext check` reports 97% compatibility, with Better Auth recognized as compatible and no unsupported features or detected issues. The only partial result is `next/font/google`: Vinext loads those fonts from a CDN rather than self-hosting them at build time. Keep this check in the validation workflow while Vinext remains in beta.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Leave the root directory as `./`.
3. The committed `vercel.json` supplies `npm run build:vercel`.
4. Add `NEXT_PUBLIC_SITE_URL=https://squashie.vercel.app` as a **Config** value.
5. Add a pooled `DATABASE_URL`, `CORRECTION_RATE_LIMIT_SALT`, `BETTER_AUTH_SECRET`, and `GITHUB_CLIENT_SECRET` as **Secret** values.
6. Add `DATABASE_POOL_MAX`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, and `ADMIN_EMAILS` as server-side configuration values.
7. Configure the production GitHub OAuth callback described above.
8. Apply `npm run db:migrate` and `npm run db:seed` against that database before sending traffic to the deployment.
9. Deploy. Future pushes to `main` create new production deployments.

## Data and methodology

Squashie publishes only organizational information and official public contact channels. Every community record includes source links, a last-checked date, and one of three verification states:

- **Organizer verified**
- **Unverified**
- **Needs re-checking**

Squashie is an independent discovery guide. It does not endorse listed organizations or guarantee externally maintained fees, schedules, eligibility, or availability.

## Product boundaries

The editorial correction and protected moderation workflow is implemented for project maintainers. Player accounts, profiles, matching, chat, booking, and payments remain outside the product scope.
