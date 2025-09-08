# Artify – MVP Roadmap (Vercel + Free stack)

## P0 — Launchable MVP (step-by-step)

1) Deployment & Environment
- [x] Add `.env.example` with `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [x] Verify Vercel env vars and project build on a preview deployment
- [x] Health endpoint: implement `app/api/health/db/route.ts` to ping Mongo and return 200


2) Data layer (MongoDB via `lib/db.ts`)
- [x] Define collections + indexes:
  - `artworks` (title, description, price, imageUrl, artistId, tags[], createdAt)
  - `commissions` (customerId, artistId, brief, budget, status, createdAt, updatedAt)
  - `favorites` (userId, artworkId, createdAt)
- [x] Seed demo data: imported ~20 artworks and ~6 artists via Atlas/Compass (manual import)
- [x] Minimal typed helpers for CRUD using `mongodb` driver (no ORM)

3) Public pages wired to DB
- [x] Explore page: fetch paginated artworks from DB (replace mock data)
- [x] Artists page (`app/artists/page.tsx`): list users with role=ARTIST (no filters in MVP)
- [x] Artwork detail (`app/artwork/[id]/page.tsx`): show image, description, artist, price, favorite button
- [x] Artist profile (`app/artist/[id]/page.tsx`): bio from user, portfolio grid (their artworks), “Request commission” CTA

4) Commission request flow
 - [x] API: `POST /api/commissions` to create a commission (auth required)
 - [x] Page: commission form (from artwork or artist profile) → creates doc with status `REQUESTED`
 - [x] Form upgrades (MVP polish): add optional `title`, optional `referenceUrls[]`, optional `dueDate`; add searchable artist picker when not prefilled
 - [x] Commissions hub (`/commissions`): role-aware tabs with SSR lists
   - Customer: “My Requests” + “New Request”
   - Artist: “Incoming” + “Archive”
 - [x] Status lifecycle: REQUESTED → ACCEPTED/DECLINED → COMPLETED (API + UI actions)
 - [x] API for status/detail:
   - [x] `GET /api/commissions/[id]` (authorized)
   - [x] `PATCH /api/commissions/[id]` (artist accept/decline)
 - [ ] In-app notifications: use toasts and hub badges (no external email)
 - [x] In-app notifications: use toasts and hub badges (no external email)

 - [x] Decide on `/commissions` route/link: keep as role-aware hub (guest explainer; logged-in land on role tab)

5) User profile & settings
- [ ] Profile settings page (e.g., `/dashboard/profile`): update name, avatarUrl, optional bio; allow switching role if needed
- [ ] Extend middleware/guards: ensure settings and commission APIs require session

6) Navigation & UX
- [ ] Navbar: role-aware links and active state highlighting
- [ ] Loading skeletons and empty states for lists/detail pages
- [ ] Friendly error UX: custom `not-found` and `error` pages in `app/`

7) SEO & Discoverability (free only)
- [ ] Per-page metadata (title/description)
- [ ] `sitemap.xml` and `robots.txt` routes

8) Testing & CI (lean)
- [ ] Unit tests for zod validation (`registerSchema`, `loginSchema`)
- [ ] API tests for signup and health
- [ ] GitHub Actions: install, lint, typecheck, build (tests optional if time-constrained)

9) Cleanup
- [x] Remove unused Prisma and Supabase files (project uses Mongo driver)
- [ ] Tighten `next.config.js` later (stop ignoring TS/ESLint errors before production)
- [ ] Pin dependency versions and run a quick audit

10) Performance
- [ ] Next.js image optimization (free)
  - Description: Serve remote images via `next/image` with on-the-fly resizing, modern formats, and Vercel caching for better LCP/CLS.
  - Why: Smaller payloads and faster pages without adding any paid service.
  - Current implementation: `images.unoptimized = true` in `next.config.js` (keeps things flexible while image sources are undecided; simplest MVP path).
  - Choose one now, switch later if needed:
    - [ ] Keep `images.unoptimized = true` (maximum flexibility while image sources are undecided)
    - [ ] Enable optimization by allowlisting hosts with `images.remotePatterns` (recommended once sources stabilize)
  - Change required (when enabling optimization):
    - Update `next.config.js` → set `images.remotePatterns` with each remote host you use (e.g., `images.unsplash.com`), and remove `unoptimized: true`.
    - Add new hosts to `remotePatterns` as you introduce them.
  - Current usage hint: Explore page uses Unsplash; first host to add would be `images.unsplash.com`.

## P1 — Portfolio polish (free-friendly)
- [ ] Favorites/likes with optimistic UI; list “My favorites” under dashboard
- [ ] Search + basic filters powered by Mongo queries and indexes (post-launch)
- [ ] Add filters to Explore (tags, price) and Artists (role/keyword) pages
- [ ] Demo users + README walkthrough with screenshots
- [ ] Accessibility sweep (landmarks, alt text, keyboard, color contrast)

## P1.5 — Commission details (nice-to-have)
- [ ] Commission detail page `/commissions/[id]` with status history and actions
- [ ] Simple message thread on commission (no realtime)

## P2 — Optional later (skip paid services)
- [ ] Social auth (Google/GitHub) via NextAuth if desired (free)
- [ ] Image uploads: defer until picking a free storage option; continue using seeded remote image URLs
- [ ] Payments: mock checkout flow (no external gateway) for portfolio demo
- [ ] Email: skip; rely on in-app notifications and dashboard views
- [ ] Analytics: skip paid services; consider adding later if a free/self-hosted option fits

## Acceptance criteria (MVP)
- [ ] Browse artworks and artists without login
- [ ] Sign up, log in, update profile
- [ ] Submit commission requests and view them in the `/commissions` hub
- [ ] Artists can view incoming requests and accept/decline
- [ ] `/api/health/db` returns 200 when DB is reachable
- [ ] Deployed on Vercel with seed data producing visible demo content

## Notes
- Keep everything within Vercel + MongoDB (free tiers acceptable); avoid features requiring paid subscriptions.
- No external email, payments, or storage are required for MVP; use in-app flows and seeded images.
