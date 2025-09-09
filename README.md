# Artify

AI-powered custom artwork marketplace built with Next.js App Router, Tailwind, shadcn/ui, and MongoDB.

## Project Structure (high-level)

- `app/*`: route handlers and pages (App Router). Co-located UI under `_components/` within routes where helpful.
- `lib/db/*`: low-level MongoDB repositories and collection helpers.
- `lib/schemas/*`: shared zod schemas used by both API routes and client forms (DRY validation).
- `lib/authz.ts`: small authorization helpers to standardize API guards.
- `components/shared/*`: shared client utilities (e.g., `route-refresher`, `refresh-hint`).
- `components/ui/*`: shadcn/ui primitives.

## Environment
- Copy `.env.example` to `.env.local` for local dev.
- On Vercel, set env vars in Project Settings:
	- `MONGODB_URI`
	- `NEXTAUTH_SECRET`
	- `NEXTAUTH_URL`

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
