# The Keeper's Log — Zoo Management System

A full-stack zoo management system: Django 5 + DRF backend, React + TypeScript
frontend, PostgreSQL-ready database. Built as a POC to test AI-assisted,
agentic development.

## What it does

1. **Add an occupant** to any vacant enclosure (name, species, diet category,
   food type, quantity per feeding, feeding times)
2. **Check enclosure occupancy** — a grid of every enclosure and who's in it
3. **Generate a feeding schedule** — every feeding today, in time order
4. **Generate the day's total food quantity** — overall, and broken down by
   diet category and food type
5. **Remove an occupant** — marks the enclosure vacant again
6. **Save & Restore** — export the entire zoo as a JSON snapshot, or restore
   one back

Design note: each enclosure holds **one active occupant at a time** (enforced
by a database constraint), matching the "mark empty" language in the original
brief. See the blueprint doc from our planning conversation if you want to
change this to multiple occupants per enclosure.

## Project layout

```
zoo-management/
├── backend/     Django 5 + DRF API
├── frontend/    React + Vite + TypeScript
└── docker-compose.yml   optional local Postgres
```

## Run it locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults to SQLite, no DB setup needed
python manage.py migrate
python manage.py seed_data      # sample enclosures/occupants + staff login
python manage.py runserver
```

API is now at `http://localhost:8000/api/`. Admin site at `/admin/`.
Seeded staff login: **admin / ChangeMe123!** — change this before you show
it to anyone.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env            # points at http://localhost:8000/api by default
npm run dev
```

App is now at `http://localhost:5173/`.

### Using Postgres locally instead of SQLite (optional)

```bash
docker compose up -d            # starts Postgres on localhost:5432
```

Then set in `backend/.env`:
```
DATABASE_URL=postgres://zoo:zoo@localhost:5432/zoodb
```

## Deploying (free tier)

1. Push this repo to GitHub.
2. **Database:** create a free Postgres instance on [Neon](https://neon.tech)
   (no card required, doesn't expire). Copy its connection string.
3. **Backend:** deploy `backend/` to [Render](https://render.com) as a free
   Web Service.
   - Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data`
   - Start command: `gunicorn config.wsgi`
   - Environment variables: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL` (from Neon),
     `ALLOWED_HOSTS=<your-app>.onrender.com`, `CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`
   - Note: Render's free tier sleeps after 15 minutes idle — the first request
     after a while takes 30–60 seconds to wake up. Worth mentioning in a demo.
4. **Frontend:** deploy `frontend/` to [Vercel](https://vercel.com) (free
   Hobby tier). Set `VITE_API_BASE_URL` to your Render backend's `/api` URL
   in Vercel's project environment variables.

## API reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/enclosures/` | open | List enclosures + current occupant |
| POST | `/api/occupants/` | staff | Add occupant to a vacant enclosure |
| PATCH | `/api/occupants/{id}/remove/` | staff | Remove occupant, mark enclosure vacant |
| GET | `/api/feeding/schedule/` | open | Today's feeding schedule |
| GET | `/api/feeding/daily-total/` | open | Total food required today |
| GET | `/api/backup/export/` | staff | Download full JSON snapshot |
| POST | `/api/backup/import/` | staff | Restore from a JSON snapshot |
| POST | `/api/auth/login/` | — | Get a JWT access/refresh token pair |

## Tested

Every endpoint above was exercised end-to-end during development: occupant
creation, the one-occupant-per-enclosure constraint rejecting a duplicate,
401s on unauthenticated writes, removal, and a full backup export. The
frontend builds clean with zero TypeScript errors (`npm run build`).
