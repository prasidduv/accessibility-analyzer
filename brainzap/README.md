# BrainZap

Production-ready AI-powered quiz app monorepo.

## Tech Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind + Framer Motion + Zustand + React Router + Axios
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis + JWT + Zod

## Folder Structure

```txt
brainzap/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── api/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── prisma/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── server.ts
└── README.md
```

## Setup

1. Copy env templates:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
2. Install deps:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Prisma:
   - `cd ../backend`
   - `npx prisma migrate dev --name init`
   - `npx prisma db seed` (optional)
4. Run:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## Build Order

1. Backend first:
   - Prisma schema and migration
   - Auth and API routes
2. Frontend next:
   - Login/register flow
   - Dashboard, quiz, result, leaderboard, chat pages

## Environment Variables

### Backend

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `ANTHROPIC_API_KEY`
- `FRONTEND_URL`

### Frontend

- `VITE_API_BASE_URL`

## Deployment

- Frontend: Vercel
- Backend: Railway or Render
- Database: Supabase or Neon
- Redis: Upstash

## Notes

- Access token is kept in memory (Zustand).
- Refresh token is sent as httpOnly cookie.
- Axios interceptors auto-refresh access tokens.
- Backend uses `express-rate-limit` and Redis-backed limiter middleware.
- Configure secure cookies in production (`secure: true`, HTTPS).
