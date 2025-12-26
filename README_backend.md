Backend (Postgres + Prisma + Express)

Quick start with Docker Compose:

1. Copy env example:

```bash
cp server/.env.example server/.env
```

2. Start services:

```bash
docker compose up --build
```

3. Run migrations inside the `server` container (optional during dev):

```bash
docker compose exec server npx prisma migrate deploy
docker compose exec server node prisma/seed.js
```

API endpoints:

- `GET /health` — health check
- `POST /api/register` — { email, password, name }
- `POST /api/login` — { email, password } -> { token }
- `GET /api/me` — Bearer token
