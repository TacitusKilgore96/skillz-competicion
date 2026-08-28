# Skills Competition

A Next.js competition tracking system with real-time station timings, live leaderboards, and administrative controls.

## Running with Docker Compose (Recommended)

To start the application and PostgreSQL database together:

```bash
docker compose up --build
```

- **App:** [http://localhost:3000](http://localhost:3000)
- **PostgreSQL:** `localhost:5432` (`user: postgres`, `password: postgres`, `db: skills_competition`)

To run in detached mode:

```bash
docker compose up -d
```

To stop and remove containers:

```bash
docker compose down
```

To reset the database data volume:

```bash
docker compose down -v
```

---

## Local Development

1. Start PostgreSQL (e.g. via Docker Compose with only db service):
```bash
docker compose up -d postgres
```

2. Run development server:
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
