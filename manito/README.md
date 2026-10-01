# Manito

A marketplace that connects people with home-service pros in Mexico City —
plumbers, electricians, HVAC techs, handymen and appliance repair.

This is a **semester project mockup**: a polished UI on a real (if small)
backend. Everything persists to a database and every route is genuinely
authenticated, but the matching is a fixed formula, the ratings are seeded, and
there are no payments. The code is organised so those pieces can be replaced
one at a time.

---

## Quick start

```bash
npm install
cp .env.example .env          # then edit it — see "Environment variables"
npm run db:reset              # creates the SQLite file and seeds it
npm run dev
```

Open http://localhost:3000.

### Demo accounts

Every seeded account uses the password **`manito123`**.

| Role     | Email                 | What they have                              |
| -------- | --------------------- | ------------------------------------------- |
| Consumer | `sofia@manito.demo`   | One open job, one with a pending request     |
| Consumer | `emilio@manito.demo`  | One accepted job                             |
| Consumer | `paula@manito.demo`   | One completed job                            |
| Pro      | `rafael@manito.demo`  | Plumbing · Roma, Condesa · 4.9 ★             |
| Pro      | `marco@manito.demo`   | Electrical · Polanco, Santa Fe · 4.8 ★       |
| Pro      | `nacho@manito.demo`   | Handyman · Coyoacán, Roma · 4.9 ★            |

Five more pros are seeded — see `prisma/seed.ts`.

### Environment variables

Both are required, locally and on Vercel.

| Variable       | What it is                            | Local value                            |
| -------------- | ------------------------------------- | -------------------------------------- |
| `DATABASE_URL` | Prisma datasource                     | `file:./dev.db`                        |
| `AUTH_SECRET`  | Signs the Auth.js session cookie      | `openssl rand -base64 32`              |

### Scripts

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Dev server                                         |
| `npm run build`     | `prisma generate` then `next build`                |
| `npm run db:push`   | Apply `schema.prisma` to the database              |
| `npm run db:seed`   | Wipe and re-seed (destructive)                     |
| `npm run db:reset`  | `db:push --force-reset` + seed                     |
| `npm run db:studio` | Prisma Studio, to poke at rows directly            |
| `npm run lint`      | ESLint                                             |

---

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma** + **SQLite** locally (Postgres-ready — see below)
- **Auth.js v5** (NextAuth) Credentials provider, JWT sessions, bcrypt hashes
- **Zod** for request validation, shared by the API routes and the forms

## Project layout

```
prisma/
  schema.prisma          data model (portable to Postgres)
  seed.ts                8 pros, 3 consumers, 4 jobs in 4 statuses
src/
  app/
    page.tsx             landing page (static, no DB)
    (auth)/              login + signup
    consumer/            consumer dashboard, post-a-job, job detail + matches
    provider/            provider inbox + profile editor
    api/                 the mock backend (route handlers)
  components/
    ui/                  shadcn primitives
    shared/              cards, badges, empty states used by both roles
    consumer/ provider/  role-specific client components
  lib/
    matching.ts    ★ THE MATCHER — the piece meant to be replaced
    constants.ts     trades, neighborhoods, urgency, statuses + labels
    strings.ts       every user-facing string, in one object
    jobs.ts          job lifecycle rules + ownership checks
    providers.ts     provider queries, maps rows into the matcher's shape
    auth.ts          Auth.js config
    session.ts       page-level guards (requireUser / requireRole)
    validation.ts    Zod schemas
    api.ts           `{ data }` / `{ error, fields }` response helpers
```

### API routes

| Method | Route                        | Who       | Does                               |
| ------ | ---------------------------- | --------- | ---------------------------------- |
| POST   | `/api/auth/signup`           | anyone    | Create an account                  |
| \*     | `/api/auth/[...nextauth]`    | anyone    | Auth.js login / session / logout   |
| GET    | `/api/jobs`                  | consumer  | Your jobs                          |
| POST   | `/api/jobs`                  | consumer  | Post a problem                     |
| GET    | `/api/jobs/:id`              | owner     | One job                            |
| GET    | `/api/jobs/:id/matches`      | owner     | Ranked pros for that job           |
| POST   | `/api/jobs/:id/requests`     | owner     | Request one specific pro           |
| POST   | `/api/jobs/:id/complete`     | owner     | Mark the work done                 |
| POST   | `/api/requests/:id/respond`  | that pro  | Accept or decline                  |
| GET    | `/api/provider/profile`      | pro       | Your own profile                   |
| PUT    | `/api/provider/profile`      | pro       | Create or replace it               |
| GET    | `/api/providers`             | anyone    | Run the matcher without a job — handy for tuning |

Every route re-checks the session and ownership. "The button was hidden" is not
a permission check, and these endpoints are reachable directly.

---

## How the mock matching works

All of it lives in **`src/lib/matching.ts`**. Nothing else in the app scores or
sorts providers, so replacing that one file replaces the entire algorithm.

`findMatches(criteria, providers)` does three things:

1. **Hard filter on trade.** A plumber never appears for an electrical job.
2. **Split into two tiers by location.**
   - `direct` — the pro lists the job's neighborhood as a service area.
   - `nearby` — the pro works an *adjacent* neighborhood (`ADJACENT_AREAS` in
     `constants.ts`). Rendered as a clearly-labelled second group so the UI
     never dead-ends when a neighborhood has no coverage yet.
3. **Score and sort.** A fixed linear formula:

   | Term                    | Points | Notes                                      |
   | ----------------------- | ------ | ------------------------------------------ |
   | Trade match             | 40     | Required, so constant across all results   |
   | Exact neighborhood      | 30     | `direct` tier                              |
   | Adjacent neighborhood   | 12     | `nearby` tier                              |
   | Rating                  | 0–25   | `rating / 5 × 25`                          |
   | Years of experience     | 0–4    | `min(years, 15) / 15 × 4`                  |
   | Verified badge          | 1      | Flat bonus                                 |

   Inside a tier every pro has already matched on trade *and* location, so the
   only terms that vary are rating, experience and the verified flag. In
   practice that means **each tier is ordered by rating**, with experience
   breaking ties — the specified behaviour, expressed as weights you can re-tune
   instead of a hardcoded `sort()`.

The matcher is a pure function over plain objects (`MatchableProvider`), not
Prisma models, so it can be unit-tested with literals and does not care where
the data came from. The database narrows the candidate pool by trade only
(`getCandidateProviders`); all location logic stays in the one file.

It also returns a `reasons: string[]` per match, which is what the chips on each
card show ("Serves Roma", "Top rated", "14 years experience"). Anything a future
ranker considers should show up there too — a ranking a user can't understand is
a ranking they won't trust.

### Job lifecycle

```
OPEN ──request a pro──▶ REQUESTED ──pro accepts──▶ ACCEPTED ──consumer──▶ COMPLETED
                             │
                             └──last pending request declined──▶ back to OPEN
```

A consumer can have several requests out at once. **First accept wins**: the job
is claimed and every other pending request on it is auto-declined in the same
transaction, so two pros never both think they have the work (`src/lib/jobs.ts`).

---

## Deploying to Vercel

The app deploys as-is — but **read the SQLite note first.**

1. Push the repo to GitHub and import it at vercel.com.
2. **Set Root Directory to `manito`.** This app lives in a subfolder of the
   repo, so Vercel will not find it otherwise — it falls back to publishing the
   repository as raw static files, and every URL returns a plain-text
   `NOT_FOUND` because there is no `index.html` at the root. Set it in the
   import wizard (Root Directory → Edit → pick `manito`); the Framework Preset
   should flip to "Next.js" as soon as you do. Changing it later, on an
   existing project, is less reliable — re-importing is often faster.
3. Add both environment variables (`DATABASE_URL`, `AUTH_SECRET`) in
   Project → Settings → Environment Variables.
4. Deploy. `npm run build` already runs `prisma generate`, and `postinstall`
   does too, so no extra build configuration is needed.

### Getting the first production deployment

Connecting the Git repository does **not** by itself produce a production
deployment. Vercel builds production only when a commit lands on the default
branch *after* the project exists, so a freshly connected project sits at
"No Production Deployment" and its domain returns `DEPLOYMENT_NOT_FOUND`.

Push any commit to `main` to trigger the first one — an empty commit
(`git commit --allow-empty`) is enough. Alternatively, open Deployments, find a
preview build, and use "Promote to Production".

### ⚠️ SQLite does not persist on Vercel

Vercel's serverless filesystem is ephemeral and read-only at runtime. A SQLite
deployment will build and render pages, but **every write fails or vanishes** —
signups, posted jobs, accepted requests. SQLite here is a local-development
convenience, nothing more.

For a live demo, switch to Postgres. It is a two-line change because the schema
deliberately avoids SQLite-only features:

1. In `prisma/schema.prisma`, change the datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Create a free Postgres database (Vercel Postgres, Neon, or Supabase) and set
   `DATABASE_URL` to its connection string, locally and on Vercel.

3. Push the schema and seed it:

   ```bash
   npm run db:push
   npm run db:seed
   ```

Nothing else changes — no query, model or component is SQLite-specific. Note
that the schema uses string columns instead of Prisma enums for exactly this
reason (SQLite has no enum type); the allowed values are enforced by Zod and
listed in `src/lib/constants.ts`.

---

## Going to Spanish

Manito is built for CDMX, so it will almost certainly ship in Spanish. Every
user-facing string is already centralised in `src/lib/strings.ts`, and domain
labels (trades, neighborhoods, statuses) in `src/lib/constants.ts`. No component
contains a hardcoded sentence.

- **Quick:** translate the values in those two files in place.
- **Proper:** rename the `t` object to `en`, add an `es` object with the same
  shape, and export whichever the locale selects. Components already read from
  `t`, so none of them change. Moving to `next-intl` from there is mechanical.

---

## What's mocked vs. what a real version needs

### Mocked today

| Thing               | How it's faked                                                     |
| ------------------- | ------------------------------------------------------------------ |
| Matching            | Fixed linear formula, recomputed on every page load                 |
| Location            | Neighborhood string equality + a hand-written adjacency map         |
| Ratings and reviews | Seeded numbers on `ProviderProfile`. Nothing in the app writes one  |
| "Verified" badge    | A boolean in the seed. No identity or license check exists          |
| Availability        | Not modelled at all — a pro is always assumed free                  |
| Pricing             | A display-only hourly rate. No quotes, no invoices, no money        |
| Notifications       | None. A pro finds out about a request by reloading the dashboard    |
| Auth                | Email + password only. No verification, reset, or rate limiting     |
| Photos              | Initials in a coloured tile instead of profile pictures             |

### What a real version would need

- **Real-time matching** — availability, calendars, current workload, and
  urgency-aware ranking (a HIGH-urgency job should prefer whoever can show up
  today over whoever has the best average rating).
- **Real geography** — coordinates and travel time instead of neighborhood
  names, so "close enough" is a distance, not a string comparison.
- **Payments** — quotes, deposits, escrow until completion, payouts, refunds,
  and the tax paperwork that comes with paying contractors in Mexico.
- **Verified reviews** — only from consumers with a COMPLETED job, one per job,
  with the provider able to respond. Rating becomes derived, not stored.
- **Identity and license verification** — the "verified" badge has to mean
  something before it's shown.
- **Chat** — consumers and pros currently have no way to ask a question before
  committing. Needs a message model, real-time delivery, and moderation.
- **Notifications** — push, email and WhatsApp. A marketplace where a pro has to
  poll a dashboard does not work in practice.
- **Photos** — on the job (a picture of the leak is worth three paragraphs) and
  on the profile.
- **Dispute handling, cancellations, and no-shows** — the statuses here cover
  only the happy path.
- **Operational hardening** — rate limiting, audit logging, a real migration
  history (`prisma migrate` instead of `db push`), and tests. `matching.ts` is a
  pure function and is the obvious first thing to unit-test.

---

## Known rough edges

- `npm audit` reports a high-severity advisory in `deepmerge-ts`, reached through the
  Prisma **CLI's** config parser. It is a dev-time dependency and does not ship
  in the deployed app.
- Auth.js's own `/api/auth/signout` page is unstyled. The app's Log out menu
  item does not use it, so you'll only see it by typing that URL directly.
- `prisma db push` is used instead of migrations, which is right for a mockup
  that gets re-seeded but should become `prisma migrate` before any real data
  exists.
- Sessions are JWTs, so a cookie outlives the row it points at. After
  `npm run db:seed` the browser still looks logged in as the deleted account —
  the app degrades to an empty dashboard rather than erroring, and logging out
  clears it. Re-seed *before* you start demoing, or check the session against
  the database in `getCurrentUser` if you'd rather pay a query per request.
