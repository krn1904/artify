# Building Artify: the “simple” custom art marketplace that turned into my favorite full‑stack playground

I’ve always loved the *idea* of commissioning art. The reality is usually a chaotic mix of DMs, screenshots, “what’s your budget?”, and one cursed Google Drive folder that nobody opens again.

So I built **Artify** — a place where you can:

- **Discover** artwork (fast, scrollable, filterable)
- **Meet** artists through real portfolios (not just one highlight post)
- **Favorite** pieces so you don’t lose them to the algorithm
- **Request a commission** with a clear brief, optional budget, references, and a due date
- And if you’re an artist: **add / manage your portfolio** without jumping through hoops

This post is my “dev diary” version of Artify: what I built, why I built it this way, what the architecture looks like under the hood, and what I learned along the way.

---

## The constraints (aka: why I didn’t over-engineer it)

I treated Artify like an MVP that still needed to feel *real*.

My non-negotiables:

- **Free-friendly stack** (deployable on Vercel + MongoDB Atlas free tier)
- **Great UX by default** (loading states, empty states, not a “blank white page” app)
- **SEO + shareable pages** (public Explore/Artists/Artwork/Artist pages should be indexable)
- **Clean data model** (commissions aren’t just “messages”; they have status + lifecycle)

My “scope control” decisions:

- No payments (yet)
- No email sending (in-app status + dashboard is enough for MVP)
- No binary image uploads (URL-based images keeps the product usable without adding storage complexity)
- “AI-powered” is the *direction*, not the first release (more on that later)

---

## The tech stack (and the honest reasons I picked it)

### Next.js (App Router)
I wanted server rendering for public pages, route-level layouts, and API routes in the same project. With App Router I can fetch data **server-side by default**, keep pages SEO-friendly, and sprinkle client components only where the UI needs interactivity (favorites, dialogs, forms).

### Tailwind CSS + shadcn/ui (Radix)
I’m not trying to invent a design system for every project. Tailwind lets me move fast, and shadcn/ui gives me *good* primitives (dialogs, dropdowns, tabs, alerts) without the “component library tax”.

### MongoDB Atlas + the official `mongodb` driver (no ORM)
For this project I wanted:

- direct control over queries
- predictable indexes
- simple data modeling with ObjectIds

So I skipped Prisma/Mongoose and used the native driver with a small repository layer in `lib/db/*`.

### NextAuth (Credentials provider)
I kept auth lean and practical:

- email + password
- bcrypt hashing
- JWT session strategy (works nicely in serverless environments)

---

## The product model: what “solving complexity” actually meant here

Artify revolves around four collections:

1. **users**
   - roles: `CUSTOMER` or `ARTIST`
   - profile fields: name, avatar URL, bio
2. **artworks**
   - `artistId` links the creator
   - tags for filtering
3. **favorites**
   - mapping table: `{ userId, artworkId }`
   - enforced uniqueness so you can’t double-like the same piece
4. **commissions**
   - `{ customerId, artistId, title?, brief, budget?, referenceUrls?, dueDate?, status }`
   - statuses: `REQUESTED → ACCEPTED/DECLINED → COMPLETED`

That lifecycle is the first “real complexity” I wanted to model properly. Commissions are not a chat thread. They’re a **workflow**.

---

## My favorite implementation pattern: shared validation (Zod) everywhere

I’m slightly allergic to “validation only on the client” or “validation only on the server”.

So I split validation into shared schemas:

- `lib/schemas/artwork.ts`
- `lib/schemas/commission.ts`
- (auth schemas live in `lib/auth/validation.ts` right now)

This solved a bunch of annoying real-world issues:

- budgets arrive as strings from inputs → preprocess into numbers
- reference URLs come as multi-line text → preprocess into an array
- due dates come as strings → preprocess into `Date`

It also made error handling consistent: client forms can `safeParse()` before calling the API, and the API can `safeParse()` again before writing to the database.

Yes, it’s “double validation”. It’s also how I sleep at night.

---

## Explore: fast grid, no N+1, and a “Quick View” that doesn’t make the homepage heavy

The Explore page is server-rendered and paginated. The important bit is favorites:

If I naïvely checked favorite status on the client for each card, I’d create an N+1 storm of requests.

Instead, I SSR-hydrate favorite state in **one query**:

- fetch artworks
- fetch favorites for the logged-in user where `artworkId ∈ artworkIds`
- build a `Set` and pass `initialFavorited` into each `FavoriteButton`

That’s why the heart icon feels instant *without* spamming the API.

Then there’s **Quick View**:

- the card opens a dialog immediately with minimal props
- once opened, the dialog fetches `/api/artworks/[id]` to load full details

That’s a tradeoff I really like: fast grid render, rich detail on demand.

---

## Favorites: optimistic UI + database guarantees

I made favorites feel “snappy” with optimistic updates:

- update the heart state immediately
- update the count immediately
- call `POST /api/favorites/toggle`
- revert if the request fails

On the database side, the favorites collection has a unique index on `(userId, artworkId)`. So even if two requests race, duplicates don’t appear.

Also: if you’re logged out and hit favorite, the UI redirects you to login **with a callback back to the same page**. Little detail, big UX win.

---

## Commissions: role-aware UX + server-enforced state transitions

The commissions hub at `/commissions` behaves differently depending on who you are:

- **Guest:** short explainer + “Login” / “Browse artists”
- **Customer:** “My Requests” + “New Request”
- **Artist:** “Incoming” (REQUESTED) + “Archive” (everything else)

The part I cared about most: **status transitions are enforced on the server**.

Artists can’t randomly jump a request from `REQUESTED` to `COMPLETED`.

Valid transitions:

- `REQUESTED → ACCEPTED | DECLINED`
- `ACCEPTED → COMPLETED`

That’s implemented in `PATCH /api/commissions/[id]` with a simple transition map. It’s boring code — which is exactly what you want for business rules.

### “Feels live” without websockets
I didn’t add realtime infra for MVP, but I still wanted artists to see incoming requests without smashing refresh.

So I built a small client utility: `components/shared/route-refresher.tsx`.

It calls `router.refresh()`:

- on mount
- on window focus
- and (for artists) every 15 seconds

It’s basically “poor man’s realtime”, and for an MVP it’s honestly perfect.

---

## Artist portfolio: the “URL-based uploads” decision

Letting artists add work is core to the product — but file uploads are a whole product by themselves (storage, signed URLs, image transformations, security).

So I chose a simple MVP approach:

- artists paste an **image URL**
- we validate it (must be a URL)
- we render a preview
- we save it to MongoDB

Artists can also delete their own artwork, and I made that delete **atomic with an ownership filter**:

- only delete where `{ _id, artistId: currentUserId }`

That prevents both accidental deletes and the “oops I can delete other users’ content” class of bugs.

---

## Auth & authorization: small helpers, consistent rules

NextAuth provides identity, but I still needed authorization rules to be consistent.

I kept it intentionally small:

- `requireAuth(session)`
- `requireArtist(session)`

Then I used those guards across API routes like:

- `POST /api/commissions`
- `POST /api/my/artworks`
- `DELETE /api/my/artworks/[id]`

I also added middleware-based protection for non-public pages using `next-auth/jwt` and a centralized public route list in `lib/publicPaths.ts`.

One thing I’m weirdly proud of: the login flow avoids open redirects. Callback URLs are validated to prevent “redirect to a random domain” issues.

---

## SEO & discoverability: not glamorous, very worth it

Art marketplaces live and die by discoverability, so I treated SEO as part of the MVP:

- per-page metadata (including dynamic metadata on artwork + artist pages)
- `robots.txt` route disallowing private pages (`/dashboard`, `/api`, etc.)
- `sitemap.xml` route that includes static pages + recent artworks/artists (capped)

It’s not “growth hacking”, it’s just baseline hygiene — and Next.js makes it pleasantly straightforward.

---

## The unsexy problem I *had* to solve: MongoDB + Next.js bundling

If you’ve mixed App Router + the MongoDB driver, you’ve probably seen bundling weirdness:

- Node core module polyfills trying to sneak into client bundles
- optional dependencies getting dragged along

I fixed this in `next.config.js` by:

- forcing Node core modules to be `false` on the client
- aliasing `mongodb` to `false` in client builds
- allowing the MongoDB driver as a server component external package

It’s one of those problems that isn’t a “feature”… but you don’t really have a project until you’ve fought your bundler at least once.

---

## What I learned building Artify

1. **An MVP still needs real business rules.**  
   The commission status lifecycle makes everything else cleaner: UI, API, future features.

2. **Sharing schemas pays off fast.**  
   Zod preprocessors saved me from “string vs number” bugs, and made forms much calmer to maintain.

3. **“Feels live” beats “is realtime” (sometimes).**  
   `router.refresh()` on focus + interval delivered 80% of the value with 10% of the complexity.

4. **Indexes aren’t an optimization later — they’re a feature now.**  
   Explore, favorites, and commissions all depend on fast lookups. I created indexes as part of collection setup.

5. **Design polish changes how people judge your engineering.**  
   Skeletons, empty states, and small UX touches make the app feel trustworthy — even when the backend is simple.

---

## “AI-powered”… but where’s the AI?

Fair call.

The *direction* for Artify is AI-assisted creation and discovery — but I deliberately didn’t start there.

I’ve learned the hard way that adding AI on top of a shaky product foundation just creates a fancier mess.

So the first version is the marketplace core:

- accounts + roles
- portfolios
- commissions workflow
- favorites and discovery

Once the fundamentals are stable, AI features become additive instead of distracting — things like:

- helping customers write a better commission brief
- tag/category suggestions for artists
- “show me art like this” recommendations

---

## What’s next (if I keep iterating)

- enable role switching properly (requires a clean session refresh strategy)
- add Explore filters (price range, multi-tag, search)
- turn on `next/image` optimization once image hosts stabilize
- add lightweight tests for schemas + critical API routes
- optional: real uploads (Vercel Blob / Cloudinary) and a basic messaging thread per commission

---

## Final thoughts

Artify was a reminder that “simple marketplace” apps are only simple on the surface.

The fun part isn’t just wiring up pages — it’s choosing the right tradeoffs:

- where to keep things server-rendered
- where to go client-side
- what to validate and where
- how to design data so features don’t fight each other later

And honestly… this is the kind of project I’d love to keep expanding, because the foundation is finally solid enough that every new feature feels like building *forward* instead of patching *around*.

If you’re building something similar and want to compare notes, I’m always down to nerd out about it.

