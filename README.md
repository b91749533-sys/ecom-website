# Lumière Parfums

**By Youssef Manssouri**

> **Live website:** [https://lumiere-parfums.vercel.app](https://lumiere-parfums.vercel.app)  
> The GitHub repo page shows this README — not the actual website. Use the link above to visit the store.

A professional luxury perfume e-commerce website with a full Next.js backend.

## Features

- Curated catalog of 10 premium fragrances with real retail prices
- Product search, filtering, and sorting
- Shopping cart with session persistence
- Checkout and order management
- User authentication (register/login)
- Admin dashboard with order management and analytics
- Contact form and newsletter signup

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** SQLite with Prisma ORM (local) / cookie fallback (Vercel)
- **Auth:** JWT with HTTP-only cookies
- **Hosting:** Vercel

## Getting Started (Local)

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

- Email: `admin@lumiere.com`
- Password: `admin123`

## Products

| Fragrance | Price |
|-----------|-------|
| Dior Sauvage EDP (100ml) | $165 |
| Creed Aventus (100ml) | $495 |
| Bleu de Chanel EDP (100ml) | $165 |
| MFK Baccarat Rouge 540 (70ml) | $325 |
| Tom Ford Ombré Leather (100ml) | $240 |
| YSL Y EDP (100ml) | $165 |
| Acqua di Giò Profondo (100ml) | $135 |
| Parfums de Marly Layton (125ml) | $400 |
| JPG Le Male Le Parfum (125ml) | $160 |
| Xerjoff Naxos (100ml) | $236 |
