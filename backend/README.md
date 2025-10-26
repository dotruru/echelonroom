# the-echelon-room backend

Express + TypeScript service that powers the marketplace, puzzle tracking, and toolbox APIs.

## Prerequisites

- Node.js 18.20.x
- PostgreSQL 16+ (local or hosted). A `docker-compose.yml` is included for quick local setup.

## Setup

```bash
npm install
npx prisma generate
# Option A: Run migrations locally once your database connection works
npx prisma migrate dev --name init
# Option B: Apply the generated SQL manually (prisma/migrations/*/migration.sql)
```

Copy `.env.example` to `.env`. The default values target the local Docker Postgres container.

### Using the included Docker setup

```bash
cd backend
docker compose up -d
```

This launches a Postgres 16 instance listening on `localhost:5432` with database `the_echelon_room`, user `postgres`, password `postgres`.

Once the container is healthy, run:

```bash
npx prisma migrate dev --name init
```

## Scripts

- `npm run dev` – Start the API in watch mode (ts-node-dev)
- `npm run build` – Type-check and emit compiled JS in `dist/`
- `npm start` – Run the compiled server
- `npm run lint` – Type-check without emitting files

## API Surface (initial draft)

All routes expect an `x-agent-principal` header (temporary stub for auth) to identify the caller.

| Method | Route              | Description                                   |
| ------ | ------------------ | --------------------------------------------- |
| GET    | `/api/health`      | Basic service health status                   |
| GET    | `/api/profiles/me` | Fetch profile for the caller (creates on fly) |
| PUT    | `/api/profiles/me` | Update caller profile (codename/avatar)       |
| GET    | `/api/nfts/mine`   | List NFTs owned by the caller                 |
| GET    | `/api/listings`    | List active marketplace listings              |

More endpoints (minting, bids, toolbox CRUD, credits, puzzle runs) will be layered on as persistence and Solana integrations are wired in.

## Next Steps

1. Ensure the Postgres instance is running locally (`docker compose ps`) and then run `npx prisma migrate dev`.
2. Replace the temporary principal header approach with wallet authentication.
3. Implement write operations (minting, listing creation, bidding) leveraging Solana program clients.
4. Add subscriptions or polling from Solana indexers to keep listings/transactions synchronized.
