# Pursuit — Project Brief

## 1. Overview
Pursuit is a personal job-application tracker: one place to log every role you apply
to, the companies and people behind them, and the interviews that follow — with a
dashboard that summarizes your pipeline and an AI assist that fills in an application
from a pasted job description.

## 2. Business case

**Problem.** Active job seekers juggle dozens of applications across spreadsheets,
email threads, and memory. Statuses slip, follow-ups get missed, and there's no single
view of "where am I with everything?"

**Solution.** Pursuit centralizes the whole search:
- Track applications through a clear pipeline (Applied → Contacted → Interview → Offer / Rejected / Withdrawn).
- Keep companies and contacts linked to those applications.
- Log interview rounds (type, time, interviewer, outcome).
- See a dashboard: totals, in-flight count, average days to first response, upcoming interviews, recent activity.
- Paste a job description and let AI pre-fill the application form.

**Who it's for.** Primarily me — a job seeker who wants one organized system. More
broadly, any individual running a multi-company search. Each account's data is private
to that user.

**Why it matters (success criteria).**
- Fewer dropped follow-ups: pipeline status and upcoming interviews are visible at a glance.
- Less data-entry friction: AI autofill turns a pasted posting into a populated form.
- As a portfolio piece: a complete, secure, full-stack CRUD app with authentication, a
  real relational data model, and a practical AI integration.

**In scope (MVP).** Auth; per-user CRUD for applications, companies, contacts, and
interviews; dashboard stats; search + status filter + pagination; AI autofill.

**Out of scope (for now).** Email integration, browser extension, automatic scraping of
arbitrary job URLs, team/multi-user sharing, public hosting.

## 3. Data flow plan

**Auth + request flow (single origin in dev via the Vite proxy):**
```
Browser (React SPA, :5173)
  │  fetch('/api/...', { credentials: 'include' })
  ▼
Vite dev proxy ──/api──►  Flask API (:5000)
                            │
                            ├─ Flask-Login (signed HttpOnly session cookie)
                            ├─ Flask-Bcrypt (password hashing)
                            ├─ Blueprints: auth, applications, companies,
                            │    contacts, interviews, stats, ai
                            ▼
                        SQLAlchemy ORM ──► SQLite (tracker.db)
```

**AI autofill flow:**
```
ApplicationForm: user pastes a job description, clicks "Autofill with AI"
  │  POST /api/ai/parse-job { text }
  ▼
Flask /api/ai/parse-job  (@login_required)
  │  OpenAI-compatible Chat Completions call, JSON mode
  ▼
LLM provider (OpenAI gpt-4o-mini by default; Groq or local Ollama via env)
  │  returns { role_title, company_name, salary_range, source, notes }
  ▼
Form fields pre-filled → user reviews/edits → Save (normal CRUD path)
```

**Data model (ownership + relationships):**
```
User 1───* Company
User 1───* Application *───1 Company
User 1───* Contact      *───1 Company   (company optional)
Application 1───* Interview
```
- Every Company / Application / Contact carries a `user_id`; all queries scope to the
  logged-in user. A request for another user's row returns **404, not 403**, so the app
  never leaks whether that row exists.
- Deleting a company cascades to its applications, contacts, and their interviews;
  deleting an application cascades to its interviews.

**Auth lifecycle:** signup/login → server sets a signed, HttpOnly session cookie →
React `AuthContext` calls `/api/auth/me` on load to hydrate session state → `ProtectedRoute`
gates private routes; `RedirectIfAuthed` keeps logged-in users off `/login` and `/signup`.

## 4. Tech stack

**Backend**
- Python / Flask (app factory + blueprints)
- Flask-SQLAlchemy (ORM), Flask-Migrate / Alembic (schema migrations)
- Flask-Login (session auth), Flask-Bcrypt (password hashing)
- Flask-CORS (credentialed cross-origin support)
- python-dotenv (config), gunicorn (production server)
- SQLite (dev database; `DATABASE_URL` also supports Postgres for prod)
- openai SDK (AI autofill — OpenAI-compatible, also runs against Groq or local Ollama)

**Frontend**
- React 19 + Vite
- React Router 7 (BrowserRouter, protected routes)
- Tailwind CSS (dark theme)
- Fetch wrapper with `credentials: 'include'`; Vite proxy for single-origin dev

**Tooling:** ESLint (flat config — recommended + react-hooks + react-refresh), Git / GitHub.

**Key decisions (rationale)**
- **Sessions, not JWT** — single-origin SPA; an HttpOnly cookie can't be read by XSS; the
  server loads a fresh user every request; less to build and easier to truly log out.
- **SQLite in dev** — zero setup; the `postgres://` → `postgresql://` normalization means
  it can move to Postgres later without code changes.
- **OpenAI-compatible AI layer** — one code path runs against OpenAI, Groq's free tier, or
  a local Ollama model by changing environment variables only.

## 5. Timeline
Phased plan — map the phases to your real dates.

| Phase | Focus |
|------|-------|
| 1 — Foundation | Data model, migrations, auth (signup/login/logout/me), per-user scoping |
| 2 — Core CRUD + UI | Applications/companies/contacts/interviews endpoints; React pages; search, status filter, pagination |
| 3 — Dashboard + polish | Stats endpoint (pipeline, avg days to response, upcoming interviews, recent activity); dark theme; form UX |
| 4 — AI + hardening | AI autofill (paste JD → fill form); code cleanup (shared date helpers, auth module split); fixed the openai/httpx client bug |
| 5 — Deliverables | Project brief, MVP critique post, README, showcase video + reflection |
