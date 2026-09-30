# NileLink Market

Undergraduate CS project (Kabarak University): marketplace connecting **South Sudanese suppliers** with **South Sudanese consumers in Kenya**.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express, REST APIs |
| Database | **Supabase (PostgreSQL)** |
| Auth | JWT + bcrypt + role-based access |
| Payments | M-Pesa Daraja + **mock mode** |

## Quick start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run `backend/database/schema.sql`
3. Copy URL + secret key into `backend/.env`

### 2. Backend

```bash
cd backend
copy .env.example .env   # if needed
npm install
node scripts/seedAdmin.js
node scripts/seedDemoData.js
npm run dev
```

API: http://localhost:5001  
Health: http://localhost:5001/health

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App: http://localhost:5173 (or next free Vite port)

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@nilelink.local` | `Admin@12345` |
| Seller | `seller.demo@nilelink.local` | `Seller@12345` |
| Customer | register via UI, or `customer.phase3@test.local` | `Test1234` |

## Features delivered

- Auth (register/login/logout, customer & seller, JWT, profile)
- Categories & products (search, filter, sort, pagination)
- Cart, checkout, orders (one order per seller group)
- M-Pesa STK (mock auto-pay when credentials missing)
- Order tracking timeline
- Seller dashboard (products, orders, profile, messages)
- Admin dashboard (users, sellers, products, orders, categories, reports)
- Reviews, messaging, notifications

## Main API groups

`/api/auth` · `/api/users` · `/api/categories` · `/api/products` · `/api/cart` · `/api/orders` · `/api/payments` · `/api/reviews` · `/api/messages` · `/api/notifications` · `/api/seller` · `/api/admin`

## Env notes

- Never commit `.env`
- Set `MPESA_MOCK_MODE=true` for development without Daraja keys
- Default API port is **5001**

## Project layout

```
backend/   Express API + Supabase models
frontend/  React SPA
```
