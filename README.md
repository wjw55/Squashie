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
- **Accessible interface:** semantic structure, keyboard-friendly controls, visible focus states, responsive comparison layouts, and reduced-motion support.
- **Deployment portability:** one Vite configuration supports both Vercel and the OpenAI Sites-compatible build.

## Tech stack

- React 19 and TypeScript
- Vinext and Vite
- Tailwind CSS 4 and Base UI
- Nitro's Vercel adapter
- Node's built-in test runner
- Oxlint and Oxfmt

## Project structure

```text
app/
  communities/[slug]/   Shareable community detail pages
  methodology/          Trust, sourcing, and verification guidance
components/
  discovery-client.tsx  Search, filtering, URL state, and comparison
lib/
  communities.ts        Editorial community dataset
  discovery.ts          Pure discovery and URL-state logic
  validation.ts         Pre-release data validation
tests/                  Dataset and discovery behaviour tests
```

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Configure these public values in `.env.local`:

```dotenv
NEXT_PUBLIC_CORRECTION_EMAIL=your-public-project-inbox@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Variables prefixed with `NEXT_PUBLIC_` are included in the browser bundle. Do not put passwords, tokens, or other secrets in them.

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run build:vercel
```

The standard build verifies the Sites-compatible path. The Vercel build verifies the production adapter and writes the deployment output expected by Vercel.

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

The next product step is to test the directory with current students and recent graduates, improve unclear fields, and establish a regular listing-review workflow. Organizer-claimed listings may follow. Player and game matching should only be considered after the directory demonstrates enough recurring local demand to overcome the cold-start problem.
