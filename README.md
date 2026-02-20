# TeraLead Take-Home: AI-Powered Dental Patient Assistant

## Architecture
- `backend` is source of truth for auth, authorization, database, and AI orchestration.
- `frontend` is UI only (Next.js App Router) and calls backend REST APIs.
- `ai-service` is optional; backend uses mock fallback when unavailable.

## Monorepo Layout
- `backend` Express + TypeScript + Prisma + PostgreSQL
- `frontend` Next.js + TypeScript + Tailwind + TanStack Query
- `ai-service` FastAPI optional service
- `docker-compose.yml` local stack

## Backend API
### Auth
- `POST /auth/register` `{ email, password }` -> `{ token }`
- `POST /auth/login` `{ email, password }` -> `{ token }`

### Patients (JWT required)
- `GET /patients?page=1&limit=10` -> `{ items, page, limit, total }`
- `POST /patients`
- `GET /patients/:id`
- `PUT /patients/:id`
- `DELETE /patients/:id` -> `{ ok: true }`

### Chat (JWT required)
- `GET /patients/:id/messages?limit=50` -> `{ items }`
- `POST /chat` `{ patientId, message }` -> `{ reply }`

### Health
- `GET /health`
- `GET /openapi.json` (OpenAPI spec)
- `GET /docs` (Swagger UI)

## Security Notes
- JWT auth with ownership scoping on patient and message access.
- IDOR prevention via user-bound queries (`userId` filters).
- Helmet, CORS allowlist, auth route rate limiting.
- Consistent error shape: `{ error: { code, message } }`.

## Prisma Data Model
- `User(id uuid, email unique, passwordHash, createdAt)`
- `Patient(id uuid, userId FK, name, email, phone, dob, medicalNotes, createdAt, updatedAt)`
- `Message(id uuid, patientId FK, role USER|AI, content, createdAt)`

Indexes:
- `Patient @@index([userId, createdAt])`
- `Patient @@unique([userId, email])`
- `Message @@index([patientId, createdAt])`

## Local Development (without Docker)
1. Backend
- `cd backend`
- `cp .env.example .env`
- `npm install`
- `npx prisma migrate dev --name init`
- `npm run prisma:generate`
- `npm run prisma:seed`
- `npm run dev`

2. Frontend
- `cd frontend`
- `cp .env.example .env.local`
- `npm install`
- `npm run dev`

3. AI service (optional)
- `cd ai-service`
- `python -m venv .venv && source .venv/bin/activate`
- `pip install -r requirements.txt`
- `uvicorn app.main:app --reload --port 8000`

## Docker Development
- `docker compose up --build`
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/health`
- AI service: `http://localhost:8000/health`

## Demo Seed Data
- Run: `cd backend && npm run prisma:seed`
- Demo login:
- Email: `demo@teralead.app`
- Password: `DemoPass123!`

## Environment Variables
### backend
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `AI_SERVICE_URL`
- `AI_TIMEOUT_MS`

### frontend
- `NEXT_PUBLIC_API_BASE_URL`

### ai-service
- `AI_PROVIDER` (`mock` or `openai`)
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `REQUEST_TIMEOUT`

## Deployment Notes
- Frontend URL: `<to be filled>`
- Backend URL: `<to be filled>`
- AI service URL: `<to be filled>`
- Managed DB provider: `<Supabase/Neon project URL>`

## AI Usage Disclosure (placeholder)
- This app may generate assistant responses using an LLM provider.
- Responses are advisory only and not medical diagnosis.
- No PHI policy and retention details should be documented before production use.
