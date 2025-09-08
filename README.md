# Artify

AI-powered custom artwork marketplace built with Next.js App Router, Tailwind, shadcn/ui, and MongoDB.

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

## Commissions API

- POST /api/commissions — Auth required. Body: `{ artistId: string, brief: string, budget?: number }`. Returns `{ id }` on success.
- Page: `/commissions/new?artistId=<id>` provides a simple form that posts to the API. Unauthenticated users are redirected to login.
