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
- Provides a public correction and organizer-verification workflow.
- Works across phone, tablet, and desktop layouts.

This release deliberately focuses on community discovery. Accounts, player profiles, match creation, chat, booking, and payments are outside the pilot scope.

## Product and engineering highlights

- **Trust-aware content:** unknown fees are labelled “Not publicly listed—contact organizer” instead of being guessed.
- **Version-controlled data:** 13 representative communities live in a validated TypeScript dataset, keeping the pilot easy to review and maintain.
- **Shareable state:** search, filters, and comparison selections round-trip through query parameters.
- **Accessible interface:** semantic structure, keyboard-friendly controls, visible focus states, responsive comparison layouts, reduced-motion support, and automated axe checks.
- **Deployment portability:** one Vite configuration supports both Vercel and the OpenAI Sites-compatible build.
- **Reproducible validation:** GitHub Actions installs from the lockfile and runs type, lint, unit, compatibility, browser, accessibility, and dual-build checks.

## Tech stack

- React 19 and TypeScript
- Vinext and Vite
- Tailwind CSS 4 and Base UI
- Nitro's Vercel adapter
- Node's built-in test runner
- Playwright and axe-core
- Oxlint and Oxfmt
- GitHub Actions

## Project structure

```text
app/
  communities/[slug]/       Shareable community detail pages
  methodology/              Trust, sourcing, and verification guidance
components/
  discovery-client.tsx      Thin discovery feature coordinator
  discovery/                State hook and focused discovery presentation
  ui/                       Reusable Base UI-backed controls
lib/
  communities.ts            Editorial community dataset and domain types
  discovery.ts              Pure filtering, URL, quick-filter, and comparison logic
tests/
  communities.test.ts       Dataset and pure discovery behaviour
  e2e/                      Playwright journeys and accessibility checks
.github/workflows/ci.yml     Pull-request and main-branch validation
```

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local` instead of `copy`. Then open [http://localhost:3000](http://localhost:3000).

Configure these public values in `.env.local`:

```dotenv
NEXT_PUBLIC_CORRECTION_EMAIL=your-public-project-inbox@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle. Do not put passwords, tokens, or other secrets in them.

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
npm run check:vinext
npm run build
npm run build:vercel
npm run test:e2e
npm run test:a11y
```

The standard build validates the OpenAI Sites-compatible Cloudflare Worker path. The Vercel build validates the Nitro Vercel adapter and writes the Build Output API files expected by Vercel. Playwright starts the Vinext development server automatically unless one is already running.

To smoke-test the standard production output after `npm run build`, run `npm start` and check the home page, methodology page, and a representative community detail page at [http://127.0.0.1:8787](http://127.0.0.1:8787).

### Manual browser checks

Before describing a release as complete:

- Inspect the home, filtered, empty, comparison, and detail states at desktop and mobile widths.
- Tab through navigation, search, quick filters, filter controls, comparison checkboxes, and the comparison dock.
- Confirm every focused control has a visible focus indicator.
- Open the comparison dialog with the keyboard, confirm focus enters and remains inside it, dismiss it with Escape, and confirm focus returns to “Compare now”.
- Check that no principal page has unexpected horizontal overflow or obscured content.

## Continuous integration

GitHub Actions runs on every pull request targeting `main` and every push to `main`. The workflow uses Node 22 and `npm ci`, then runs type-checking, linting, unit tests, `vinext check`, both production builds, Chromium end-to-end tests, and axe accessibility tests. Playwright reports, traces, and failure screenshots are retained as workflow artifacts when available.

## Vinext compatibility

With Vinext 1.0.0-beta.8, `vinext check` reports 94% compatibility, with no unsupported features or detected issues. The only partial result is `next/font/google`: Vinext loads those fonts from a CDN rather than self-hosting them at build time. Keep this check in the validation workflow while Vinext remains in beta.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Leave the root directory as `./`.
3. The committed `vercel.json` supplies `npm run build:vercel`.
4. Add `NEXT_PUBLIC_SITE_URL=https://squashie.vercel.app` as a **Config** value.
5. Add `NEXT_PUBLIC_CORRECTION_EMAIL` as a **Config** value using a public-facing inbox.
6. Deploy. Future pushes to `main` create new production deployments.

## Data and methodology

Squashie publishes only organizational information and official public contact channels. Every community record includes source links, a last-checked date, and one of three verification states:

- **Organizer verified**
- **Unverified**
- **Needs re-checking**

Squashie is an independent discovery guide. It does not endorse listed organizations or guarantee externally maintained fees, schedules, eligibility, or availability.

## Roadmap

The next product step is to move the source-backed read path to PostgreSQL while preserving the current discovery experience. Editorial correction and moderation follow as a separate stage. Accounts, player matching, chat, booking, and payments remain outside the current product scope.
