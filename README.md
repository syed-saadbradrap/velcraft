# Custom Shoes — Production-Grade Shoe Customization Platform

Monorepo for a luxury shoe customization experience with Next.js frontend, Laravel REST API, PostgreSQL, JWT authentication, and Stripe-ready architecture.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| 3D (Phase 3) | Three.js, React Three Fiber, `@react-three/drei` |
| Backend | Laravel 12 REST API |
| Database | PostgreSQL |
| Auth | JWT (`php-open-source-saver/jwt-auth`) |
| Payments (Phase 5+) | Stripe + COD + Bank Transfer |

## Project Structure

```
custom-shoes/
├── frontend/          # Next.js App Router storefront
├── backend/           # Laravel API + admin foundation
├── scripts/           # Asset utilities (placeholder GLB generator)
└── docker-compose.yml # Local PostgreSQL
```

## Requirements

- **Node.js** 20+
- **PHP** 8.2+ (Laravel 12 requirement — XAMPP PHP 8.0 is insufficient)
- **Composer** 2.x
- **PostgreSQL** 16 (Docker compose provided)

## Phase 1 — Completed Scope

- Laravel 12 API scaffold with relational schema, seeders, JWT-ready auth endpoints
- PostgreSQL migrations for catalog, customization options, homepage content
- Placeholder GLB models (replaceable without logic changes)
- Luxury home page with API-driven sections + graceful fallback data
- SEO foundations: metadata, sitemap, robots.txt, route stubs

## Quick Start

### 1. Database

```bash
docker compose up -d
```

### 2. Backend (PHP 8.2+)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan storage:link
php artisan migrate --seed
php artisan serve
```

### 3. Placeholder GLB Assets

```bash
node scripts/generate-placeholder-glb.mjs
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Default Accounts (Seeded)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@customshoes.com | password |
| Customer | customer@customshoes.com | password |

## API Endpoints (v1)

- `GET /api/v1/homepage`
- `GET /api/v1/shoes`
- `GET /api/v1/shoes/featured`
- `GET /api/v1/shoes/{slug}`
- `GET /api/v1/collections`
- `GET /api/v1/contact`
- `POST /api/v1/contact`
- `POST /api/v1/newsletter/subscribe`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

## Phase 2 — Completed Scope

- Collection page with API-driven grid, collection filters, and shoe detail pages
- Reusable `ShoeCard` component shared across home and collection views
- Contact page with concierge details and API-backed message submission
- Expanded API client with catalog + contact endpoints and graceful fallbacks

## Phase 3 — Completed Scope

- Interactive 3D customization studio with React Three Fiber and `@react-three/drei`
- Left-side controls: material, type, color, sole, buckle, size
- Right-side viewer: rotate, zoom, pan with OrbitControls
- Live updates for body color, sole color, material profile, and buckle model swapping
- Lazy GLB loading via `useGLTF` with preload and dynamic import (no SSR)
- API-driven configuration with local placeholder model fallbacks

## Upcoming Phases

1. **Phase 4** — Cart, wishlist, checkout, coupons, shipping addresses, order history
2. **Phase 5** — Stripe + COD + bank transfer, webhooks
3. **Phase 6** — Admin panel (dashboard, CRUD, orders, customers, homepage CMS)

## Production Notes

- Replace placeholder GLB files in `backend/storage/app/public/models/` — paths are database-driven
- Swap `FILESYSTEM_DISK=public` with S3 disk configuration when ready
- Deploy frontend to Vercel, backend to VPS with PostgreSQL
