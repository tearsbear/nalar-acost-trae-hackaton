# nalar-acost-trae-hackaton (Monorepo)

Monorepo dengan pnpm workspaces:

- `apps/web`: Next.js + Tailwind + TypeScript
- `apps/api`: Elysia.js + TypeScript + Drizzle ORM
- Database: Supabase (PostgreSQL)

## Prerequisites

- Node.js >= 18
- pnpm (direkomendasikan via Corepack)

## Setup

Install dependencies di root:

```bash
pnpm install
```

Setup environment variables:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

Lalu isi value berikut:

- `apps/web/.env`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)
- `apps/api/.env`
  - `DATABASE_URL` (Postgres connection string Supabase)
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT` (default: `3001`)

## Run (Development)

Jalankan semua workspace sekaligus dari root:

```bash
pnpm dev
```

Atau jalankan satu per satu:

```bash
pnpm --filter @nalar-acost/web dev
pnpm --filter @nalar-acost/api dev
```

## Endpoints (API)

- `GET /health` → healthcheck
- Swagger UI tersedia di `/swagger` (default Elysia swagger)

## Drizzle (Migrations)

File schema ada di `apps/api/src/db/schema.ts` dan config di `apps/api/drizzle.config.ts`.

Contoh generate migrations:

```bash
pnpm --filter @nalar-acost/api drizzle-kit generate
```

Push schema (opsional, tergantung workflow):

```bash
pnpm --filter @nalar-acost/api drizzle-kit push
```

## Struktur Repo

```text
.
├── apps
│   ├── api
│   └── web
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```
