# Artify – Development Roadmap

---

## 🔴 High Priority

### Image Optimization
- [ ] Enable Next.js image optimization
- [ ] Configure `images.remotePatterns` for image hosts
- [ ] Remove `unoptimized: true` from config

---

## 🟡 Medium Priority

### Search & Discovery
- [ ] Implement basic artwork search functionality
- [x] Add tag filters to Explore page
- [ ] Add price range filters to Explore page
- [ ] Add artist search with filters

### Code Organization
- [x] Move auth schemas to `lib/schemas`
- [x] Consolidate validation schemas

---

## 🟢 Nice to Have

### Enhanced Request Features
- [ ] Request detail page at `/requests/[id]`
- [ ] Request status history
- [ ] Simple messaging system (no realtime)

### Future Enhancements
- [ ] Social authentication (Google/GitHub)
- [ ] File upload system (Vercel Blob or Cloudinary)
- [ ] Role switching functionality
- [ ] Stripe payment integration for custom requests
- [ ] Payment intent / checkout flow for accepted requests
- [ ] Payment status tracking and webhook handling
- [ ] Email notifications system
---

## 📋 Technical Constraints
- Vercel hosting (free tier)
- MongoDB Atlas (free tier)
- No external email service for MVP
- Stripe not integrated yet
- URL-based images only
