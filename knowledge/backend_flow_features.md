# Backend — Flow & Features

## Stack

- Elysia.js (REST API)
- Bun runtime
- Drizzle ORM
- Supabase (PostgreSQL)
- Supabase Auth
- pnpm

---

## Request Flow

```txt
Client / SDK kirim POST /track
    ↓
Rate limiter plugin (per API key)
    ↓
Auth plugin: validasi X-API-Key → resolve workspaceId
    ↓
Input validation (Elysia schema)
    ↓
cost-calculator.service: hitung estimatedCost
    ↓
Simpan ke events table (Drizzle insert)
    ↓
Background: aggregate ke daily_metrics
    ↓
Background: jalankan rule-based recommendations
    ↓
Background: kirim alert jika threshold tercapai
    ↓
Response: 200 OK
```

---

## API Endpoints

### Public (SDK)

| Method | Route | Deskripsi |
|---|---|---|
| `POST` | `/track` | Terima tracking event dari SDK |
| `POST` | `/track/batch` | Terima batch events (20-100) |

### Dashboard API (Protected — Supabase JWT)

#### Analytics

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/analytics/overview` | Total spend, trends, top features, top users |
| `GET` | `/analytics/features` | Cost per feature + detail |
| `GET` | `/analytics/users` | Cost per user |
| `GET` | `/analytics/models` | Model usage distribution |
| `GET` | `/analytics/daily` | Daily metrics untuk chart |

#### Insights

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/insights/recommendations` | List rekomendasi optimisasi |
| `POST` | `/insights/summary` | Generate AI weekly summary |

#### Workspace

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/workspace` | Get workspace info |
| `POST` | `/workspace` | Create workspace |
| `PATCH` | `/workspace` | Update workspace |

#### API Keys

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/api-keys` | List semua API keys |
| `POST` | `/api-keys` | Generate API key baru |
| `DELETE` | `/api-keys/:id` | Revoke API key |

#### Alerts

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/alerts` | List alerts workspace |
| `PATCH` | `/alerts/:id/read` | Mark alert as read |

#### Notifications

| Method | Route | Deskripsi |
|---|---|---|
| `GET` | `/notifications/settings` | Get notification settings |
| `PUT` | `/notifications/settings` | Update Telegram/email settings |
| `POST` | `/notifications/test` | Kirim test notification |

---

## Plugins

### `auth.plugin.ts`

- Validasi `X-API-Key` header untuk public routes (`/track`)
- Validasi `Authorization: Bearer <jwt>` untuk dashboard routes
- Resolve `workspaceId` dari API key atau JWT
- Inject `ctx.workspaceId` ke semua handlers

### `rateLimit.plugin.ts`

- Rate limit per API key: 100 req/menit untuk `/track`
- Rate limit per IP: 1000 req/menit untuk dashboard API
- Return `429 Too Many Requests` jika exceeded

---

## Services

### `cost-calculator.service.ts`

```txt
Input: model, inputTokens, outputTokens
    ↓
Lookup pricing dari in-memory cache
    ↓
estimatedCost = (inputTokens × inputPrice) + (outputTokens × outputPrice)
    ↓
Output: estimatedCost (number)
```

- Pricing di-cache saat server start
- Refresh setiap 24 jam dari OpenRouter API
- Fallback ke static pricing table jika fetch gagal

### `model-mapping.service.ts`

- Fetch model list dari `GET https://openrouter.ai/api/v1/models`
- Normalize model ID (gpt-4o, claude-3-5-sonnet, dll)
- Map ke provider (openai, anthropic, google, dll)
- Cache di memory, refresh setiap 24 jam

### `recommendations.service.ts`

Rule-based engine:

```txt
IF model IN ["gpt-4o", "claude-3-5-sonnet"]
AND avg_input_tokens < 500
→ rekomendasikan model lebih murah

IF feature_cost > feature_revenue
→ flag unprofitable

IF user_cost > (avg_user_cost × 3)
→ flag high-cost user

IF daily_cost > (avg_daily_cost × 1.5)
→ kirim cost spike alert
```

### `notifications/telegram.service.ts`

- Kirim pesan via Telegram Bot API
- Format: weekly report, cost spike alert, monthly summary
- Trigger: cron job (Senin 09.00) + real-time threshold

### `notifications/email.service.ts`

- Kirim email via Resend
- Template: weekly report, alert, monthly summary
- Fallback jika Telegram tidak di-setup

---

## Database Flow

### Event Ingestion

```txt
POST /track
    ↓
Drizzle insert → events table
    ↓
(async) aggregate ke daily_metrics
    ↓
(async) cek threshold → buat alert jika perlu
```

### Dashboard Query

```txt
GET /analytics/overview
    ↓
Query daily_metrics (bukan raw events)
    ↓
Aggregate: sum(total_cost), sum(total_requests)
    ↓
Group by: feature / user / model
    ↓
Return JSON ke frontend
```

---

## Background Jobs (Cron)

| Job | Schedule | Deskripsi |
|---|---|---|
| `aggregate-daily-metrics` | Setiap jam | Aggregate events → daily_metrics |
| `refresh-model-pricing` | Setiap 24 jam | Fetch pricing terbaru dari OpenRouter |
| `run-recommendations` | Setiap 6 jam | Jalankan rule engine, update recommendations |
| `send-weekly-report` | Senin 09.00 | Generate summary + kirim Telegram/email |
| `detect-cost-spikes` | Setiap 30 menit | Cek anomali cost, buat alert |

---

## Security

- API key di-hash (SHA-256) sebelum disimpan ke DB
- Semua dashboard routes wajib Supabase JWT
- Workspace isolation: semua query filter by `workspaceId`
- Input validation via Elysia schema (type-safe)
- Rate limiting per API key dan per IP
- Supabase RLS aktif di semua tabel

---

## Error Handling

| Status | Kondisi |
|---|---|
| `400` | Payload tidak valid / missing field |
| `401` | API key tidak valid / JWT expired |
| `403` | Workspace tidak match |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

Semua error return format:

```json
{
  "error": "string",
  "message": "string"
}
```

---

## Environment Variables

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
OPENROUTER_API_KEY
RESEND_API_KEY
PORT
```
