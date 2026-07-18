# Aryora — Light. Legacy. You.
Full-stack scaffold for the Aryora luxury jewellery e-commerce site.

This is a **runnable starting codebase**, not a hosted product — you run it
locally or deploy it to your own infrastructure. It implements the core
architecture end to end (auth, catalog, cart, checkout, orders, admin,
lead → cloud-spreadsheet sync) with representative pages matching the
approved design direction (emerald / champagne / ivory / black, serif
display type). Extend page-by-page from here — the patterns repeat.

```
aryora/
├── frontend/            Next.js 14 + TypeScript + Tailwind (App Router)
├── backend/              Express + TypeScript + Prisma (PostgreSQL)
└── excel-integration/    Workbook template + cloud spreadsheet sync guide
```

## Quick start

### 1. Database & backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT secrets, SMTP, sheet sync
npm install
npx prisma migrate dev --name init
npm run seed                  # creates admin@aryora.com / Aryora@Admin123 + sample product
npm run dev                   # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### 3. Cloud spreadsheet sync (optional but core to Step 6/7/8)
See `excel-integration/README.md` — 10-minute setup for either Google
Sheets or OneDrive/Excel Online. Everything works without it; leads just
accumulate in Postgres (`GET /api/admin/leads`) until you connect one.

## What's implemented

| Area | Status |
|---|---|
| Auth (register, OTP verify, login, JWT) | ✅ full |
| Product catalog, search, filters, reviews | ✅ full |
| Cart, wishlist, addresses | ✅ full |
| Checkout, coupons, order placement & tracking | ✅ full |
| Admin: products, inventory, orders, coupons, customers, analytics | ✅ API complete, dashboard UI has the overview screen — extend with the same pattern for product/coupon CRUD screens |
| Lead capture → DB → cloud spreadsheet sync with retry queue | ✅ full |
| Email (OTP, welcome, order confirmation) | ✅ full — plug in real SMTP creds |
| Frontend pages | Home, Shop, Product, Cart, Checkout, Login, Register, Account/Orders, Wishlist, Admin overview, About, Sustainability, Bridal, Contact, Collections — all wired to the live API |
| Payment gateway | Stubbed (`paymentMethod`/`paymentRef` fields ready) — plug in Razorpay/Stripe at `frontend/src/app/checkout/page.tsx` + `backend/src/routes/order.routes.ts` |
| SEO | Dynamic metadata, sitemap.xml, robots.txt, Open Graph tags on root layout |
| Security | Helmet, CORS allowlist, rate limiting, XSS/HPP sanitization, JWT auth, bcrypt password hashing, Prisma parameterized queries (SQL-injection safe by default) |

## Environment variables
Full lists with comments are in `backend/.env.example` and
`frontend/.env.example`. Never commit real `.env` files.

## Deployment

**Frontend** → Vercel (native Next.js support):
```bash
cd frontend && vercel deploy --prod
```
Set `NEXT_PUBLIC_API_URL` in the Vercel project settings to your deployed
backend URL.

**Backend** → Railway / Render / any Node host with PostgreSQL:
1. Provision a PostgreSQL instance, set `DATABASE_URL`.
2. Set all vars from `.env.example` in the host's environment settings.
3. Build command: `npm install && npm run build && npx prisma migrate deploy`
4. Start command: `npm start`

**Database** → managed PostgreSQL (Railway, Supabase, RDS, Neon). Run
`npx prisma migrate deploy` against it once at deploy time.

## API documentation
Base URL: `/api`. All protected routes expect `Authorization: Bearer <token>`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, sends OTP |
| POST | `/auth/verify-otp` | — | Verify email, returns tokens |
| POST | `/auth/login` | — | Login, returns tokens |
| GET | `/auth/me` | ✅ | Current user |
| GET | `/products` | — | List with `?category&metal&minPrice&maxPrice&search&sort&page` |
| GET | `/products/:slug` | — | Product detail + related |
| POST | `/products/:slug/reviews` | ✅ | Submit review (pending approval) |
| GET/POST/PATCH/DELETE | `/cart` | ✅ | Manage bag |
| GET/POST/PUT/DELETE | `/addresses` | ✅ | Manage delivery addresses |
| GET/POST/DELETE | `/wishlist` | ✅ | Manage wishlist |
| POST | `/orders/checkout-start` | ✅ | Price preview + coupon apply |
| POST | `/orders` | ✅ | Place order |
| GET | `/orders` / `/orders/:orderNumber` | ✅ | Order history / tracking |
| POST | `/leads/newsletter` \| `/enquiry` \| `/appointment` | — | Lead capture forms |
| `/admin/*` | ✅ Admin | Products, inventory, orders, customers, coupons, reviews, analytics, leads |

Full request/response shapes are typed directly in each route file under
`backend/src/routes/` — they're the source of truth.

## Brand reference
- **Name / tagline:** Aryora — Light. Legacy. You.
- **Palette:** Emerald `#0B3D2E`, Champagne `#B08D57`, Ivory `#F7F5F0`, Ink `#111111`
- **Type:** Fraunces (display) + Inter (body)
- **Contact:** aryora.legacy@hotmail.com · +91 8808828646 · Lucknow, UP · @aryora.legacy

## Next steps to take this to production
1. Replace placeholder image paths (`/images/...`) with real product photography.
2. Wire a payment gateway (Razorpay is standard for India) at checkout.
3. Add remaining admin CRUD screens (products, coupons) using the `AdminDashboard` pattern.
4. Add automated tests (Jest/Vitest + Supertest for the API, Playwright for e2e).
5. Configure a CI pipeline (GitHub Actions) to run `prisma migrate deploy` + build on push.
