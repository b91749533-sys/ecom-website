# Lumière Parfums

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
- **Database:** SQLite with Prisma ORM
- **Auth:** JWT with HTTP-only cookies

## Getting Started

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

- Email: `admin@lumiere.com`
- Password: `admin123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, sort) |
| GET | `/api/products/[slug]` | Product details |
| GET/DELETE | `/api/cart` | Get or clear cart |
| POST/PATCH/DELETE | `/api/cart/items` | Manage cart items |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | List orders |
| POST | `/api/auth` | Login / register |
| GET | `/api/admin/stats` | Admin dashboard stats |

## Products

All prices reflect authorized US retail MSRP:

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
