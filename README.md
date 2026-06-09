# Unisphere_web — Sprint 2 Monorepo

Full-stack registration and login flow with a layered Express backend and Next.js frontend.

## Structure

```
unisphere_web/
├── backend/     # Express + TypeScript + MongoDB
├── frontend/    # Next.js 16 + React 19
└── README.md
```

## Backend (`backend/`)

**Stack:** Express 5, MongoDB, Mongoose, Zod, bcryptjs, JWT

**Architecture:** Route → Controller → Service → Repository → Model

**Endpoints:**
- `POST /api/v1/auth/register` — register a new user
- `POST /api/v1/auth/login` — login and receive JWT

### Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server runs at `http://localhost:8089`

## Frontend (`frontend/`)

**Stack:** Next.js 16, React 19, Tailwind CSS v4, react-hook-form, Zod, axios

**Architecture:** Component → Server Action → API → Backend

**Pages:**
- `/` — homepage
- `/register` — registration form
- `/login` — login form (sets cookies, redirects to dashboard)
- `/dashboard` — protected welcome page

### Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Test Flow

1. Start MongoDB locally
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Register at `/register`
5. Login at `/login`
6. Dashboard shows "Welcome, {firstName}"
