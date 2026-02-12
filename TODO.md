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
- [ ] Implement basic search functionality
- [ ] Add filters to Explore page (tags, price range)
- [ ] Add artist search with filters

### Code Organization
- [x] Move auth schemas to `lib/schemas`
- [x] Consolidate validation schemas

---

## 🟢 Nice to Have

### Enhanced Commission Features
- [ ] Commission detail page at `/commissions/[id]`
- [ ] Commission status history
- [ ] Simple messaging system (no realtime)

### Future Enhancements
- [ ] Social authentication (Google/GitHub)
- [ ] File upload system (Vercel Blob or Cloudinary)
- [ ] Role switching functionality
- [ ] Mock payment checkout flow
- [ ] Email notifications system
---

## 📋 Technical Constraints
- Vercel hosting (free tier)
- MongoDB Atlas (free tier)
- No external email service for MVP
- No real payment gateway
- URL-based images only
