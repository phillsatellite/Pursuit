# Pursuit — MVP for Critique

**What it is:** A full-stack job-application tracker — log applications, companies,
contacts, and interviews, with a pipeline dashboard and an AI "autofill from a job
description" feature.

**Status:** Runs locally (Flask API + React/Vite frontend). Setup steps are in the README.

## What's working in the MVP
- Email/password auth (server sessions + bcrypt); each account's data is private
- Applications: create / edit / delete, status pipeline, search, status filter, pagination
- Companies and contacts (a contact can optionally be linked to a company)
- Interviews logged per application (round type, scheduled time, interviewer, outcome)
- Dashboard: totals, in-flight count, average days to first response, upcoming interviews
  (next 14 days), recent activity
- AI autofill: paste a posting → fields populate → review → save

**Tech:** Flask + SQLAlchemy + SQLite, Flask-Login; React 19 + Vite + Tailwind;
OpenAI-compatible AI call (runs on OpenAI, Groq's free tier, or a local model).

## Feedback I'm looking for
1. **Dashboard** — are these the right at-a-glance metrics, or is something missing / noisy?
2. **AI autofill UX** — is "paste description → autofill" intuitive? Worth also accepting a URL?
3. **Application form** — anything clunky about the company "type-to-create" flow?
4. **Auth** — sessions vs JWT for a single-user-focused tool: any concerns?
5. **First impressions** — anything confusing in the first two minutes of using it?

## Known limitations / next steps
- No automatic scraping of arbitrary job URLs (paste-the-text only, by design)
- Not hosted (local run)
- Single-user focus; no team/sharing yet
