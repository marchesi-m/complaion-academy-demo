# Complaion Academy Demo

A full-stack quiz demo: FastAPI backend, React/Vite/Tailwind frontend, MongoDB — all wired together with Docker Compose.

Demo credentials: `demo@complaion.com` / `demo1234`

---

## Option A — Docker Compose (recommended)

Runs everything (MongoDB + backend + frontend) in one command. MongoDB is seeded automatically on first start.

```bash
cp .env.example .env
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API docs | http://localhost:8000/docs |

To stop: `docker compose down`  
To reset the database: `docker compose down -v && docker compose up --build`

---

## Option B — Run locally (without Docker)

Requires: Python 3.12+, Node.js 22+, a running MongoDB instance.

### 1. MongoDB

Start a local MongoDB on the default port (27017), then seed it:

```bash
mongosh mongodb://localhost:27017 mongo-init/seed.js
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit ACADEMY_JWT_SECRET if needed
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000 — interactive docs at http://localhost:8000/docs.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173.

> **Note:** when running locally the backend must be started from the `backend/` directory so the `app` package is on the Python path.
