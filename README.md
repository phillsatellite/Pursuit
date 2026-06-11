# Pursuit — Job Application Tracker

A full-stack productivity app for tracking job applications, companies you've
applied to, the interviews lined up for each application, and the recruiters
and hiring managers you've talked to along the way.

## Tech stack

**Backend**
- Python 3.9, Flask 3
- SQLAlchemy + Flask-Migrate (Alembic)
- Flask-Login for session-based auth, Flask-Bcrypt for password hashing
- PostgreSQL in production, SQLite for local development (selectable via `DATABASE_URL`)
- Gunicorn for the production WSGI server
- openai SDK for the AI autofill endpoint (OpenAI-compatible — also works with Groq's free tier or a local Ollama model)

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS

## Core functionality

- **Authentication.** Email + password signup, login, and logout, using
  server-side sessions and bcrypt-hashed passwords. The frontend remembers the
  session across reloads via cookies.
- **Ownership-based access control.** Every resource is scoped to the
  authenticated user; a request for another user's row returns `404` rather
  than `403`, so we don't leak whether a record exists.
- **Companies** (CRUD). Track the companies you're applying to, with industry,
  size, website, and notes. Deleting a company cascades to its applications
  and contacts.
- **Applications** (CRUD). Track each role you've applied to, with status
  (`Applied → Contacted → Interview → Offer / Rejected / Withdrawn`), source,
  salary range, JD text, and notes. Filterable by status and company,
  searchable by role title.
- **Interviews** (CRUD, nested under Applications). Round type, scheduled
  time, interviewer, outcome, notes.
- **Contacts** (CRUD). Recruiters, hiring managers, referrers — optionally
  linked to a company, with a last-contacted date for follow-up cadence.
- **Pagination.** All `GET` collection routes accept `?page=` and
  `?per_page=` and respond with `items`, `page`, `per_page`, `total`,
  `pages`, `has_next`, `has_prev`.
- **Dashboard.** Pipeline counts by status, upcoming interviews in the next
  14 days, average days to first response, and a recent-activity list.
- **AI autofill.** On the new-application form, paste a job description and the
  app extracts the role title, company, salary range, source, and a short summary
  to pre-fill the form — you review before saving. Works with any OpenAI-compatible
  API: OpenAI by default, or Groq's free tier / a local Ollama model via env vars.
  With no API key set, the button shows a friendly "not configured" message.

## Project layout

```
Pursuit/
├── backend/                 Flask app
│   ├── app.py               app factory + login manager + CORS
│   ├── extensions.py        SQLAlchemy, Migrate, Bcrypt, LoginManager
│   ├── models.py            User, Company, Application, Interview, Contact
│   ├── routes/              auth, companies, applications, interviews, contacts, stats, ai
│   ├── migrations/          Alembic migrations
│   └── requirements.txt
├── frontend/                Vite + React app
│   └── src/
│       ├── api.js           fetch wrapper + per-resource clients
│       ├── auth/            AuthProvider, useAuth, context, ProtectedRoute
│       ├── components/      Layout, Pagination, Modal, StatusBadge
│       ├── utils/           dates.js (shared date formatters)
│       ├── pages/           Dashboard, Login, Signup, Welcome, Applications*, CompaniesList, ContactsList
│       └── App.jsx          router
└── README.md
```

## Setup and run

### Prerequisites

- Python 3.9+
- Node 20.19+ (Vite 8 dropped support for Node 18)
- Optionally Postgres 14+ (SQLite is the default for local dev)

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# create an env file
cp .env.example .env
# edit .env: set SECRET_KEY to a long random string;
# leave DATABASE_URL as the default sqlite for local dev, or point it at postgres,
# e.g. DATABASE_URL=postgresql://localhost/pursuit

export FLASK_APP=app.py
flask db upgrade        # apply migrations
python app.py           # serves on http://127.0.0.1:5000
```

A full `.env` (this is what `.env.example` ships):

```
FLASK_APP=app.py
FLASK_DEBUG=1
DATABASE_URL=sqlite:///tracker.db
SECRET_KEY=replace-with-a-long-random-string
CORS_ORIGINS=http://localhost:5173

# Optional — enables AI autofill on the new-application form.
# Works with any OpenAI-compatible API; leave OPENAI_API_KEY blank to disable.
#   OpenAI (default): set OPENAI_API_KEY, leave OPENAI_BASE_URL blank, AI_MODEL=gpt-4o-mini
#   Groq (free tier): OPENAI_BASE_URL=https://api.groq.com/openai/v1  AI_MODEL=llama-3.3-70b-versatile
#   Local (Ollama):   OPENAI_BASE_URL=http://localhost:11434/v1       AI_MODEL=llama3.1
OPENAI_API_KEY=
OPENAI_BASE_URL=
AI_MODEL=gpt-4o-mini
```

Enabling AI autofill
You should have an OpenAI API key ready. 

- Open backend/.env (the file you copied from .env.example above).
- Find the OPENAI_API_KEY= line and paste your key right after the = — no spaces, no quotes:
- OPENAI_API_KEY=sk-proj-...paste-your-key-here...
- Save the file.
- Restart the backend (stop python app.py with Ctrl+C, then start it again). The key is only read at startup, so a running server won't see it.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev             # serves on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:5000`, so the
browser sees a single origin and the session cookie works without any CORS
gymnastics.

Open `http://localhost:5173`. If you're not logged in you'll be redirected to
`/login`; use the **Sign up** link there to create an account, then start
adding companies and applications.

## How to test the application

### Auth + ownership checks (curl)

The backend can be exercised directly. Cookie jar carries the session:

```bash
BASE=http://127.0.0.1:5000/api

# signup
curl -c jar.txt -b jar.txt -X POST $BASE/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@example.com","password":"hunter2!!"}'

# create a company
curl -c jar.txt -b jar.txt -X POST $BASE/companies \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme"}'

# list with pagination
curl -c jar.txt -b jar.txt "$BASE/companies?page=1&per_page=5"

# log out — subsequent requests should now be 401
curl -c jar.txt -b jar.txt -X POST $BASE/auth/logout
curl -w '\nHTTP %{http_code}\n' $BASE/companies        # -> 401
```

To verify ownership isolation, sign up as a second user with a different
cookie jar (`-c jar2.txt -b jar2.txt`) and confirm that the first user's
records return `404` on direct `GET /api/companies/<id>` requests.

## API reference

All routes are JSON. All routes except `/api/health`, `/api/auth/signup`,
`/api/auth/login`, and `/api/auth/me` require a logged-in session.

| Method  | Path                                            | Notes                                         |
| ------- | ----------------------------------------------- | --------------------------------------------- |
| GET     | `/api/health`                                   | liveness                                      |
| POST    | `/api/auth/signup`                              | `{email, password, display_name?}`            |
| POST    | `/api/auth/login`                               | `{email, password}`                           |
| POST    | `/api/auth/logout`                              |                                               |
| GET     | `/api/auth/me`                                  | returns `{user: null}` when anonymous         |
| GET     | `/api/companies`                                | `?page=&per_page=&q=`                         |
| POST    | `/api/companies`                                |                                               |
| GET     | `/api/companies/:id`                            |                                               |
| PATCH   | `/api/companies/:id`                            |                                               |
| DELETE  | `/api/companies/:id`                            | cascades to apps + contacts                   |
| GET     | `/api/applications`                             | `?page=&per_page=&status=&company_id=&q=`     |
| POST    | `/api/applications`                             |                                               |
| GET     | `/api/applications/:id`                         | includes nested interviews                    |
| PATCH   | `/api/applications/:id`                         |                                               |
| DELETE  | `/api/applications/:id`                         | cascades to interviews                        |
| GET     | `/api/applications/:id/interviews`              |                                               |
| POST    | `/api/applications/:id/interviews`              |                                               |
| PATCH   | `/api/interviews/:id`                           |                                               |
| DELETE  | `/api/interviews/:id`                           |                                               |
| GET     | `/api/contacts`                                 | `?page=&per_page=&company_id=&q=`             |
| POST    | `/api/contacts`                                 |                                               |
| GET     | `/api/contacts/:id`                             |                                               |
| PATCH   | `/api/contacts/:id`                             |                                               |
| DELETE  | `/api/contacts/:id`                             |                                               |
| GET     | `/api/stats`                                    | dashboard data                                |
| POST    | `/api/ai/parse-job`                             | `{text}` → extracted application fields (AI)   |

## Deployment

The backend is a standard Flask app and runs under gunicorn:

```bash
gunicorn -w 2 -b 0.0.0.0:$PORT app:app
```

Set `DATABASE_URL` to a Postgres connection string and a strong
`SECRET_KEY` in your environment. The frontend builds to static files
via `npm run build` and can be served from any static host or behind
the same gunicorn process via a reverse proxy.
