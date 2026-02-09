# Artify

AI-powered custom artwork marketplace built with Next.js App Router, Tailwind, shadcn/ui, and MongoDB.

## Project Structure (high-level)

- `app/*`: route handlers and pages (App Router). Co-located UI under `_components/` within routes where helpful.
- `lib/db/*`: low-level MongoDB repositories and collection helpers.
- `lib/schemas/*`: shared zod schemas used by both API routes and client forms (DRY validation).
-   - Includes `commission`, `artwork`, and `auth` (re-exporting existing auth schemas)
- `lib/authz.ts`: small authorization helpers to standardize API guards.
- `components/shared/*`: shared client utilities (e.g., `route-refresher`, `refresh-hint`).
- `components/ui/*`: shadcn/ui primitives.

## Navigation & UX

- Role-aware navbar: avatar account menu when logged in (Dashboard, Profile, My favorites, Commissions) and an Add artwork button for artists.
- Active link highlighting: selected nav items display a subtle underline badge.
- Loading states: skeleton UIs for key pages (e.g., Artists list, Commissions, Profile, New Commission, New Artwork) improve perceived performance.
- Dashboard: polished hero with user avatar, quick actions grid, and tips.

## Profile & Settings

- Page: `/dashboard/profile` — update name, avatar URL, bio, and role (Customer/Artist).
- API: `GET /api/me/profile` returns current user details; `PATCH /api/me/profile` updates fields.
- Notes: Role changes are temporarily disabled (UI disabled and server ignores role updates).

## Error Handling

- Route-level error boundaries provide friendly fallbacks:
  - `app/commissions/error.tsx` and `app/explore/error.tsx` render retry UIs on failure.
  - Global fallbacks: `app/error.tsx` and `app/not-found.tsx` for unexpected errors and 404s.

## Environment
- Copy `.env.example` to `.env.local` for local dev.
- On Vercel, add the same keys in Project Settings → Environment Variables (set the Target for Production / Preview / Development as needed).

### Database configuration
- `MONGODB_URI` must point at the cluster/replica set for the current environment (e.g., prod cluster for Production target, free cluster for local/preview).
- `MONGODB_DB_NAME` selects the database inside that cluster. It defaults to `artify`, so set it only when you need a different database per environment.
- The app resolves the database through `getMongoDatabase()` (`lib/db.ts`), so changing the env vars is enough—no code edits required when you add new clusters.
- Suggested workflow:
  1. Create two MongoDB Atlas clusters (or two databases inside one cluster) named for prod and dev/testing.
  2. Copy each connection string into the proper environment’s `MONGODB_URI` and, if the DB name differs, set `MONGODB_DB_NAME` alongside it.
  3. Sync local values by running `cp .env.example .env.local` and filling in your dev credentials; optionally pull from Vercel with `npx vercel env pull .env.local`.
- Verify connectivity after updates with `curl http://localhost:3000/api/health/db` locally or the deployed equivalent.

## Health Check
Endpoint to verify live MongoDB connectivity.

- Route: `GET /api/health/db`
- Success: `200 { "status": "ok" }`
- Failure: `500 { "status": "error" }`
- Caching: disabled (force-dynamic + `Cache-Control: no-store`)

Use it to quickly confirm environment variables and DB access on local and Vercel.

### Try it
- Local: `http://localhost:3000/api/health/db`
- Vercel: `https://<your-app>.vercel.app/api/health/db`

```bash
# Optional: quick check
curl -sS http://localhost:3000/api/health/db | jq
```

## Commissions

- Hub: `/commissions`
  - Guest: short explainer with Login/Browse CTAs
  - Customer: tabs — “My Requests” and “New Request”
  - Artist: tabs — “Incoming” (REQUESTED) and “Archive” (ACCEPTED/DECLINED/COMPLETED)
  - Live UX: auto-refresh on focus (artist also every 15s) and in‑app toasts for actions

### API

- POST `/api/commissions` — Auth required
  - Body: `{ artistId: string, brief: string, title?: string, referenceUrls?: string[], budget?: number, dueDate?: string | Date }`
  - Validation: `brief` min 10 chars, `budget` ≥ 0, `referenceUrls` are valid URLs
  - Restriction: self‑commission is blocked (you cannot request from yourself)
  - Returns: `{ id }`

- GET `/api/commissions/[id]` — Auth required, only artist or customer on the commission
  - Returns commission details (fields above) with status and timestamps

- PATCH `/api/commissions/[id]` — Artist only
  - Body: `{ status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' }`
  - Transitions enforced: `REQUESTED→ACCEPTED|DECLINED`, `ACCEPTED→COMPLETED`

- GET `/api/artists?q=<name>&limit=<n>` — Search artists by name for the commission form picker

## Favorites

- Favorite any artwork using the heart button. Signed-out users are redirected to login and returned to the same page.
- Pages hydrate favorite state server-side to avoid N+1 client calls:
  - Explore grid, Artist profile grid, Artwork detail.
- Toggle API: `POST /api/favorites/toggle` → `{ favorited, count }`
- Status API: `GET /api/favorites/status?artworkId=...` → `{ favorited, count }`
- My Favorites page: `/dashboard/favorites` (auto-refreshes on mount/focus; no stale prefetch)

## SEO

- Per-page metadata via Next.js Metadata API (titles/descriptions, dynamic on detail pages).
- Sitemap and robots routes under `app/`:
  - `app/sitemap.ts` — includes key static routes and recent artists/artworks.
  - `app/robots.ts` — allows public content; disallows `/api`, `/dashboard`, `/login`, `/signup`.

### New Commission form

- Page: `/commissions/new?artistId=<id>` preselects artist when coming from profile
- Fields: Artist (searchable), optional Title, Brief (min 10 chars), optional Budget, optional Reference URLs (one per line), optional Due Date
- On submit: shows a toast and navigates to the Commissions hub
- Self‑commission is disabled in UI and rejected server‑side

## Artist Portfolio

- Explore filter: artists can view only their work via `/explore?my=1` or by toggling “My Artworks” on the Explore page. The “Add artwork” button is visible to artists on Explore.
- Create page: `/dashboard/artworks/new` lets artists add new pieces using a remote image URL (no binary uploads in MVP).
- Manage: delete your own artworks from your Artist Profile page (only visible to you on your profile’s portfolio grid).

### Artwork API

- GET `/api/my/artworks` — Auth (artist): return current artist’s artworks (paginated in code).
- POST `/api/my/artworks` — Auth (artist): create artwork.
  - Body: `{ title: string, imageUrl: string (URL), price: number, description?: string, tags?: string[] (<=5) }`
  - Validation: title ≥ 3, price ≥ 0; URL must be valid; description is sanitized.
- DELETE `/api/my/artworks/[id]` — Auth (artist): delete own artwork by id (ownership enforced).
