# Artify – MVP Roadmap (Vercel + Free stack)

---

## 🔴 PENDING - High Priority

### P0 - Cleanup & Production Readiness
- [ ] **Tighten `next.config.js`**: Stop ignoring TS/ESLint errors before production
- [ ] **Pin dependency versions** and run security audit (`npm audit`)

### P0 - Performance & Image Optimization
- [ ] **Next.js image optimization decision**:
  - Current: `images.unoptimized = true` (flexible but misses optimization benefits)
  - Recommended: Enable optimization with `images.remotePatterns` for Unsplash and other hosts
  - Action: Update `next.config.js` with remote patterns, remove `unoptimized: true`
  - First host to add: `images.unsplash.com`

### P0 - Acceptance Criteria (Core MVP)
- [ ] **Browse artworks and artists without login** (verify guest access)
- [ ] **Sign up, log in, update profile** (verify complete flow)
- [ ] **Submit commission requests** and view in `/commissions` hub
- [ ] **Artists can view incoming requests** and accept/decline
- [ ] **`/api/health/db`** returns 200 when DB is reachable
- [ ] **Deployed on Vercel** with seed data producing visible demo content

---

## 🟡 PENDING - Medium Priority

### P1 - Search & Filters
- [ ] **Search + basic filters** powered by Mongo queries and indexes
- [ ] **Add filters to Explore**: tags, price range
- [ ] **Add filters to Artists**: role/keyword search

### P1 - Polish & UX
- [ ] **Bulk favorite status** for grids (avoid N client fetches)
- [ ] **Demo users + README walkthrough** with screenshots
- [ ] **Accessibility sweep**: landmarks, alt text, keyboard nav, color contrast (WCAG AA)

### Structure & Consistency
- [ ] **Move ad-hoc schemas** into `lib/schemas` (auth register/login schemas)

---

## 🟢 PENDING - Nice to Have (P1.5 & P2)

### P1.5 - Commission Features
- [ ] **Commission detail page** `/commissions/[id]` with status history and action buttons
- [ ] **Simple message thread** on commission (no realtime required)

### P2 - Optional Future Enhancements
- [ ] **Social auth** (Google/GitHub) via NextAuth (free)
- [ ] **Binary image uploads**: Choose free storage option:
  - Vercel Blob (generous free tier) OR Cloudinary free plan
  - Add `POST /api/upload` with signed URLs
  - Update forms to support drag-and-drop; keep URL-paste fallback
- [ ] **Role switching**: Re-enable UI, persist change, refresh session with `unstable_update`
- [ ] **Payments mock**: Mock checkout flow (no real gateway) for portfolio demo
- [ ] **Email notifications**: Skip for now; rely on in-app notifications only
- [ ] **Analytics**: Consider free/self-hosted option later

## 📋 Notes
- Keep everything within Vercel + MongoDB (free tiers)
- No external email, payments, or storage required for MVP
- Use in-app flows and seeded images only
