# SG Job Finder 🇸🇬

A production-ready job search platform built for Singapore, featuring real-time job ingest, full-text search, saved jobs, and smart alerts.

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Full-text search | PostgreSQL `tsvector` + `pg_trgm` fuzzy matching |
| 📥 Data ingest | Auto-fetches from SG Jobs JSON URL with retry/backoff |
| 🔐 Authentication | GitHub, Google OAuth + email magic link (NextAuth v5) |
| 🔔 Job alerts | DAILY/WEEKLY alerts with history |
| 💾 Saved jobs | Save with personal notes |
| 📊 Dashboard | Activity overview and ingest status |
| 🐳 Docker | Production-ready compose setup |
| 🧪 Tests | Unit tests for mapper, salary parser, query builder |

---

## 🚀 Quick Start

### Prerequisites
- **Node 20+**
- **PostgreSQL 14+** (or use Docker)
- **Git**

---

### 1. Clone & Install

```bash
git clone <repo>
cd sg-job-finder
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | App URL (use `http://localhost:3000` for dev) |
| `JOB_JSON_URL` | ✅ | Source URL for job data |
| `ADMIN_EMAILS` | – | Comma-separated admin emails |
| `GITHUB_CLIENT_ID` | – | GitHub OAuth app credentials |
| `GITHUB_CLIENT_SECRET` | – | GitHub OAuth app credentials |
| `GOOGLE_CLIENT_ID` | – | Google OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | – | Google OAuth credentials |
| `EMAIL_SERVER_*` | – | SMTP config for magic link emails |

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables + full-text search triggers)
npm run db:migrate

# (Optional) Seed with 10 mock jobs for testing
npm run db:seed
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker / Production

```bash
# Copy and configure env
cp .env.example .env

# Start database + app
docker compose up -d

# The app automatically runs migrations on startup
```

The compose stack includes:
- **Postgres 16** with persistent volume
- **Next.js App** with standalone build

---

## 📥 Data Ingest

### Manual Trigger (Admin UI)

1. Sign in with an admin email
2. Visit `/dashboard`
3. The admin panel shows ingest history — you can trigger a run from there

### API (Admin Only)

```bash
# Trigger ingest (requires admin cookie/session)
curl -X POST http://localhost:3000/api/ingest \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Preview Ingest (Dev)

```bash
# See what the ingest would map (unprotected in dev)
curl http://localhost:3000/api/ingest/preview
```

> ⚠️ Set `DISABLE_INGEST_PREVIEW=true` in production.

### Cron (Local Dev)

```bash
# Run hourly cron scheduler locally
npx ts-node --project tsconfig.json scripts/cron.ts
```

---

## 🧪 Running Tests

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch
```

Test coverage:
- `tests/salary-parser.test.ts` — 8 test cases
- `tests/job-mapper.test.ts` — 10 test cases  
- `tests/query-builder.test.ts` — 8 test cases

---

## 🔍 API Reference

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jobs` | List/search jobs |
| `GET` | `/api/jobs/[id]` | Get single job |
| `GET` | `/api/ingest/preview` | Preview ingest mapping (disable in prod) |

### Authenticated Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/saved/[jobId]` | Toggle save/unsave job |
| `PATCH` | `/api/saved/[jobId]` | Update note |
| `GET` | `/api/alerts` | List user's alerts |
| `POST` | `/api/alerts` | Create alert |
| `PATCH` | `/api/alerts/[alertId]` | Update alert |
| `DELETE` | `/api/alerts/[alertId]` | Delete alert |
| `POST` | `/api/alerts/[alertId]` | Run alert now |

### Admin Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ingest` | Trigger data ingest |
| `GET` | `/api/ingest` | View ingest logs |

### Job Query Parameters

```
GET /api/jobs?query=&location=&employmentType=&seniority=&tags=&salaryMin=&salaryMax=&postedWithin=&sort=&page=&limit=
```

| Param | Values | Description |
|---|---|---|
| `query` | string | Full-text + fuzzy search |
| `location` | string | Location filter (partial match) |
| `employmentType` | `Full-time`, `Part-time`, `Internship`, `Contract` | Employment type |
| `seniority` | `Entry`, `Mid`, `Senior`, `Executive` | Seniority level |
| `tags` | comma-separated | Industry tags |
| `salaryMin` | integer | Minimum salary (SGD/month) |
| `salaryMax` | integer | Maximum salary (SGD/month) |
| `postedWithin` | `24h`, `7d`, `30d`, `custom` | Date filter |
| `sort` | `newest`, `relevance`, `salary` | Sort order |
| `page` | integer ≥ 1 | Page number |
| `limit` | integer 1-100 | Results per page |

---

## 🗄️ Database Schema

```
users ──< accounts
       ──< sessions
       ──< saved_jobs >── jobs
       ──< alerts ──< alert_runs ──< alert_run_jobs >── jobs

ingest_logs (standalone)
```

Full-text search is maintained via a **Postgres trigger** on `INSERT/UPDATE`:
```sql
-- Weights: title=A, company=B, location=C, description=D
searchVector := setweight(to_tsvector('english', title), 'A') || ...
```

Fuzzy matching uses `pg_trgm` trigram indexes on `title` and `company`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── health/          # GET /api/health
│   │   ├── ingest/          # POST + GET /api/ingest
│   │   │   └── preview/     # GET /api/ingest/preview
│   │   ├── jobs/            # GET /api/jobs
│   │   │   └── [id]/        # GET /api/jobs/[id]
│   │   ├── saved/[jobId]/   # POST/PATCH /api/saved/:id
│   │   └── alerts/          # CRUD /api/alerts
│   ├── auth/signin/         # Sign-in page
│   ├── dashboard/           # Protected dashboard
│   ├── jobs/                # Job listing + detail
│   ├── saved/               # Saved jobs
│   └── alerts/              # Job alerts
├── components/
│   ├── layout/navbar.tsx
│   ├── jobs/                # JobCard, JobFilters, JobDetailClient
│   └── alerts/              # AlertsClient
└── lib/
    ├── auth.ts              # NextAuth config
    ├── prisma.ts            # Prisma singleton
    ├── ingest.ts            # Ingest pipeline
    ├── job-mapper.ts        # Raw JSON → normalized Job
    ├── salary-parser.ts     # Salary string parsing
    ├── query-builder.ts     # Filter → Prisma WHERE/orderBy
    └── utils.ts             # Shared helpers

prisma/
├── schema.prisma
├── seed.ts
└── migrations/

tests/
├── salary-parser.test.ts
├── job-mapper.test.ts
└── query-builder.test.ts

scripts/
└── cron.ts                  # Local dev hourly cron
```

---

## 🔒 Security Notes

1. **Never expose `NEXTAUTH_SECRET`** or OAuth secrets client-side
2. **`/api/ingest`** is admin-only — protected by session + `ADMIN_EMAILS` env var
3. **`/api/ingest/preview`** — set `DISABLE_INGEST_PREVIEW=true` in production
4. **RLS** — implement Postgres Row Level Security in a production environment
5. **Rate limiting** — add Upstash Redis rate limiting for public endpoints in production
6. All inputs validated with **Zod** before database operations
7. SQL injection protected — raw queries use **parameterized Prisma raw** syntax

---

## 🛠️ OAuth Setup

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App with callback: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret to `.env.local`

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client with redirect: `http://localhost:3000/api/auth/callback/google`
3. Copy credentials to `.env.local`
