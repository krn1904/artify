# Artify - API & Technical Documentation

> Complete API reference and data models for developers

## Table of Contents

- [Quick Reference](#quick-reference)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Configuration](#configuration)

---

## Quick Reference

**For setup, installation, and general project information, see [README.md](./README.md)**

This document focuses on:
- **API Endpoints** - Complete endpoint reference with request/response examples
- **Data Models** - TypeScript schemas and validation rules
- **Technical Configuration** - Development-specific configuration details

**Base URL (Local):** `http://localhost:3000`
**Base URL (Production):** `https://your-domain.com`

---

## API Documentation

### Authentication

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "CUSTOMER" // or "ARTIST"
}
```

**Response:**
```json
{
  "id": "user_id"
}
```

#### POST `/api/auth/[...nextauth]`
NextAuth.js authentication endpoints (login, logout, session).

---

### Artists

#### GET `/api/artists`
Search for artists by name.

**Query Parameters:**
- `q` (string) - Search query for artist name
- `limit` (number, optional) - Results limit (default: 10)

**Response:**
```json
[
  {
    "_id": "artist_id",
    "name": "Artist Name",
    "email": "artist@example.com",
    "avatarUrl": "https://...",
    "bio": "Artist bio"
  }
]
```

---

### Artworks

#### GET `/api/artworks/[id]`
Get artwork details by ID.

**Response:**
```json
{
  "_id": "artwork_id",
  "artistId": "artist_id",
  "title": "Artwork Title",
  "imageUrl": "https://...",
  "price": 299.99,
  "description": "Artwork description",
  "tags": ["abstract", "modern"],
  "createdAt": "2026-02-12T00:00:00.000Z"
}
```

#### POST `/api/my/artworks`
Create a new artwork (Artist only, authenticated).

**Request Body:**
```json
{
  "title": "Artwork Title",
  "imageUrl": "https://...",
  "price": 299.99,
  "description": "Optional description",
  "tags": ["tag1", "tag2"] // max 5 tags
}
```

**Response:**
```json
{
  "id": "artwork_id"
}
```

#### PATCH `/api/my/artworks/[id]`
Update an existing artwork (Artist only, authenticated).

**Request Body:** Same as POST (all fields optional)

**Response:**
```json
{
  "id": "artwork_id"
}
```

#### DELETE `/api/my/artworks/[id]`
Delete an artwork (Artist only, authenticated).

**Response:**
```json
{
  "message": "Artwork deleted"
}
```

---

### Commissions

#### POST `/api/commissions`
Create a new commission request (authenticated).

**Request Body:**
```json
{
  "artistId": "artist_id",
  "title": "Optional title",
  "brief": "Commission description (min 10 chars)",
  "budget": 500.00,
  "referenceUrls": ["https://...", "https://..."], // max 10
  "dueDate": "2026-03-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "commission_id"
}
```

#### GET `/api/commissions/[id]`
Get commission details (authenticated, only artist or customer).

**Response:**
```json
{
  "_id": "commission_id",
  "customerId": "customer_id",
  "artistId": "artist_id",
  "title": "Commission Title",
  "brief": "Description",
  "budget": 500.00,
  "status": "REQUESTED", // REQUESTED | ACCEPTED | DECLINED | COMPLETED
  "referenceUrls": ["https://..."],
  "dueDate": "2026-03-15T00:00:00.000Z",
  "createdAt": "2026-02-12T00:00:00.000Z"
}
```

#### PATCH `/api/commissions/[id]`
Update commission status (Artist only, authenticated).

**Request Body:**
```json
{
  "status": "ACCEPTED" // REQUESTED | ACCEPTED | DECLINED | COMPLETED
}
```

**Status Transitions:**
- `REQUESTED` → `ACCEPTED` or `DECLINED`
- `ACCEPTED` → `COMPLETED`

**Response:**
```json
{
  "id": "commission_id"
}
```

---

### Favorites

#### POST `/api/favorites/toggle`
Toggle favorite status for an artwork (authenticated).

**Request Body:**
```json
{
  "artworkId": "artwork_id"
}
```

**Response:**
```json
{
  "favorited": true,
  "count": 42
}
```

#### GET `/api/favorites/status`
Get favorite status and count for an artwork.

**Query Parameters:**
- `artworkId` (string) - Artwork ID

**Response:**
```json
{
  "favorited": true,
  "count": 42
}
```

---

### User Profile

#### GET `/api/me/profile`
Get current user's profile (authenticated).

**Response:**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ARTIST",
  "avatarUrl": "https://...",
  "bio": "User bio"
}
```

#### PATCH `/api/me/profile`
Update current user's profile (authenticated).

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatarUrl": "https://...",
  "bio": "Updated bio"
}
```

**Note:** Role updates are currently disabled.

**Response:**
```json
{
  "id": "user_id"
}
```

---

### Health Check

#### GET `/api/health/db`
Check MongoDB connection status.

**Response (Success):**
```json
{
  "status": "ok"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Error details"
}
```

**Usage:**
```bash
curl http://localhost:3000/api/health/db
```

---

### Contact

#### POST `/api/contact`
Submit a contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "message": "Contact message"
}
```

**Response:**
```json
{
  "message": "Message received"
}
```

---

## Data Models

### User
```typescript
{
  _id: ObjectId
  email: string           // Unique, lowercase
  password: string        // Bcrypt hashed
  name: string
  role: 'CUSTOMER' | 'ARTIST'
  avatarUrl?: string
  bio?: string
  createdAt: Date
}
```

### Artwork
```typescript
{
  _id: ObjectId
  artistId: ObjectId      // Reference to User
  title: string           // 3-120 chars
  imageUrl: string        // Valid URL
  price: number           // Non-negative
  description?: string    // Max 2000 chars
  tags?: string[]         // Max 5 tags
  createdAt: Date
}
```

### Commission
```typescript
{
  _id: ObjectId
  customerId: ObjectId    // Reference to User
  artistId: ObjectId      // Reference to User
  title?: string          // 3-120 chars
  brief: string           // 10-2000 chars
  budget?: number         // Non-negative
  status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
  referenceUrls?: string[] // Max 10 URLs
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Favorite
```typescript
{
  _id: ObjectId
  userId: ObjectId        // Reference to User
  artworkId: ObjectId     // Reference to Artwork
  createdAt: Date
}
```

---

## Configuration

### Next.js Configuration

Key configurations in `next.config.js` (Next.js 15):

```javascript
{
  images: { unoptimized: true },
  serverExternalPackages: ['mongodb'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}
```

**MongoDB Driver:** Configured as external package for server components to prevent bundling issues. In Next.js 15, this moved from `experimental.serverComponentsExternalPackages` to the top-level `serverExternalPackages` config.

**Server Actions:** In Next.js 15, Server Actions are enabled by default. The configuration now uses an object format instead of a boolean, allowing you to set options like `bodySizeLimit`.

**Image Optimization:** Currently disabled (`unoptimized: true`). To enable:
- Add `images.remotePatterns` for allowed image hosts (e.g., Unsplash)
- Remove `unoptimized: true` flag

### Next.js 15 Migration Notes

This project has been upgraded to Next.js 15, which includes several breaking changes:

**Async Route Parameters:**
- `params` in route handlers and page components are now asynchronous
- `searchParams` in page components are now asynchronous
- Must be awaited: `const { id } = await params`

**Example - Route Handler:**
```typescript
export async function GET(
  _req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ... use id
}
```

**Example - Page Component:**
```typescript
export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page } = await searchParams
  // ... use id and page
}
```

**Suspense Boundaries:**
- Client components using `useSearchParams()` must be wrapped in `<Suspense>`
- This prevents build-time errors related to dynamic rendering

**Example:**
```tsx
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams() // Uses search params
  // ... component logic
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
```

### MongoDB Connection Pooling

Connection pooling is configured for optimal performance. The MongoDB client is instantiated once and reused across requests.

### Middleware Configuration

The middleware (`middleware.ts`) handles:
- Authentication checks for protected routes
- Public path allowlisting (defined in `lib/publicPaths.ts`)
- HEAD request handling for prefetch optimization

**Protected Routes:**
- `/dashboard/*`
- `/commissions/*` (except guest view)
- `/api/my/*`
- `/api/me/*`

**Public Routes:**
- `/`, `/explore`, `/artists`, `/artist/*`, `/artwork/*`
- `/login`, `/signup`
- `/about`, `/contact`, `/privacy`, `/terms`

---

## Additional Resources

- **[README.md](./README.md)** - Project overview, setup guide, and getting started
- **[TODO.md](./TODO.md)** - Development roadmap and pending tasks

---

**Last Updated:** February 2026
