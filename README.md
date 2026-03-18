<div align="center">

# 🎨 Artify

### Custom Artwork Marketplace

A modern, full-stack marketplace connecting artists with customers for custom artwork requests. Built with Next.js 15, MongoDB, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](./DOCUMENTATION.md) • [User Guide](./WORKING.md)

</div>

---

## 📖 Overview

**Artify** is a comprehensive marketplace platform that bridges artists and art enthusiasts. Whether you're an artist looking to showcase your portfolio and accept requests, or a customer searching for unique artwork and custom pieces, Artify provides an intuitive, feature-rich experience.

### What It Does

- **🖼️ Artwork Discovery** - Browse and explore curated artworks from talented artists
- **👨‍🎨 Artist Profiles** - Showcase portfolios with detailed artist bios and collections
- **📝 Request Management** - Seamless request-accept-complete workflow for custom art
- **❤️ Favorites System** - Bookmark and manage your favorite artworks
- **🔐 Secure Authentication** - Role-based access for customers and artists
- **📱 Responsive Design** - Beautiful UI that works on all devices

---

## ✨ Features

### For Customers
- 🔍 **Browse & Discover** - Explore paginated artwork collections with tag filtering
- ❤️ **Favorites** - Save artworks you love to your personal collection
- 📋 **Custom Requests** - Request custom artwork from your favorite artists
- 👤 **Personal Dashboard** - Manage your profile, favorites, and custom requests
- 🔔 **Status Notifications** - Get in-app toast notifications about request updates

### For Artists
- 🎨 **Portfolio Management** - Upload and manage your artwork collection
- 📬 **Requests Hub** - View incoming custom requests in a centralized dashboard
- ✅ **Request Workflow** - Accept, decline, or mark requests as completed
- 💼 **Artist Profile** - Showcase your bio, skills, and portfolio
- 🎯 **Role-based Features** - Access artist-specific tools and dashboards

### Platform Features
- 🔐 **Secure Authentication** - NextAuth.js with credential-based login
- 🌓 **Dark/Light Mode** - Theme switching for comfortable viewing
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Fast Performance** - Server-side rendering and optimized MongoDB queries
- 🎭 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS
- 🗺️ **SEO Optimized** - Dynamic metadata, sitemaps, and robots.txt

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, RSC, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Database:** [MongoDB](https://www.mongodb.com/) (Atlas)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Password Hashing:** bcryptjs
- **Validation:** Zod schemas

### Deployment & DevOps
- **Hosting:** [Vercel](https://vercel.com/)
- **Database Hosting:** MongoDB Atlas (Free Tier)
- **Analytics:** Vercel Analytics

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB** account (Atlas free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/artify.git
   cd artify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=artify
   
   # NextAuth
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=http://localhost:3000
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   > **Generate NextAuth Secret:** Run `openssl rand -base64 32`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Usage

### For Artists

1. **Sign Up** as an artist
2. **Complete your profile** with bio and avatar
3. **Add artworks** to your portfolio via Dashboard → Add Artwork
4. **Manage requests** in the Requests hub

### For Customers

1. **Browse artworks** on the Explore page
2. **Favorite** artworks you love
3. **Visit artist profiles** to see their full portfolio
4. **Request custom artwork** from any artist
5. **Track requests** in your Requests dashboard

### API Health Check

Verify your setup is working:
```bash
curl http://localhost:3000/api/health/db
```

Expected response:
```json
{
  "status": "ok"
}
```

---

## 📂 Project Structure

```
artify/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── api/               # API endpoints
│   ├── explore/           # Artwork discovery page
│   ├── artists/           # Artist listing page
│   ├── requests/       # Request management
│   └── dashboard/         # User dashboard & settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page components
│   └── shared/           # Reusable components
├── lib/                   # Utilities & configurations
│   ├── db/               # MongoDB repositories
│   ├── schemas/          # Zod validation schemas (auth, artwork, request, favorite, user)
│   └── authOptions.ts    # NextAuth configuration
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware (auth protection)
```

---

## 🔑 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes | - |
| `MONGODB_DB_NAME` | Database name | ❌ No | `artify` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | ✅ Yes | - |
| `NEXTAUTH_URL` | Application URL | ✅ Yes | - |
| `NEXT_PUBLIC_APP_URL` | Public app URL for SEO | ❌ No | `NEXTAUTH_URL` |

---

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/artify)

---

## 📖 Documentation

For detailed API documentation and development guides, see [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary and confidential. All rights reserved.
