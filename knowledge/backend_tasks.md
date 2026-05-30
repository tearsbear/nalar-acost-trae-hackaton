# Backend — Task Todo

## Setup & Infrastruktur

- [ ] Init project Elysia.js dengan Bun (`bun create elysia backend`)
- [ ] Setup folder structure (`src/routes/`, `src/plugins/`, `src/services/`, `src/db/`, `src/lib/`)
- [ ] Install Drizzle ORM + `drizzle-orm/pg-core` + `postgres` driver
- [ ] Install `@supabase/supabase-js`
- [ ] Setup `drizzle.config.ts`
- [ ] Setup environment variables (`.env`)
- [ ] Setup `src/db/client.ts` — Drizzle + Supabase connection
- [ ] Setup `src/lib/supabase.ts` — Supabase admin client

---

## Database Schema

- [ ] Buat `src/db/schema.ts` dengan semua tabel:
  - [ ] `users`
  - [ ] `workspaces`
  - [ ] `workspace_members`
  - [ ] `api_keys`
  - [ ] `events`
  - [ ] `daily_metrics`
  - [ ] `alerts`
  - [ ] `subscriptions`
  - [ ] `notification_settings`
- [ ] Jalankan `drizzle-kit generate` untuk generate migration SQL
- [ ] Apply migration ke Supabase
- [ ] Enable RLS di semua tabel via Supabase dashboard
- [ ] Setup RLS policies: workspace isolation per user

---

## Plugins

- [ ] Buat `src/plugins/auth.plugin.ts`
  - [ ] Validasi `X-API-Key` header → resolve `workspaceId`
  - [ ] Validasi `Authorization: Bearer <jwt>` → resolve `userId` + `workspaceId`
  - [ ] Inject `workspaceId` ke context
  - [ ] Return `401` jika tidak valid
- [ ] Buat `src/plugins/rateLimit.plugin.ts`
  - [ ] Rate limit per API key: 100 req/menit untuk `/track`
  - [ ] Rate limit per IP: 1000 req/menit untuk dashboard routes
  - [ ] Return `429` jika exceeded

---

## Services

- [ ] Buat `src/services/cost-calculator.service.ts`
  - [ ] Static pricing table fallback
  - [ ] `calculateCost(model, inputTokens, outputTokens): number`
  - [ ] `getPricingForModel(model)` — lookup dari cache
- [ ] Buat `src/services/model-mapping.service.ts`
  - [ ] Fetch dari `https://openrouter.ai/api/v1/models` saat server start
  - [ ] Cache di memory
  - [ ] `refreshPricing()` — refresh setiap 24 jam
  - [ ] Fallback ke static table jika fetch gagal
- [ ] Buat `src/services/recommendations.service.ts`
  - [ ] `runRules(workspaceId)` — jalankan semua rule
  - [ ] Rule: model terlalu mahal untuk prompt pendek
  - [ ] Rule: feature cost > feature revenue → flag unprofitable
  - [ ] Rule: user cost > 3x average → flag high-cost user
  - [ ] Rule: daily cost > 1.5x average → buat cost spike alert
  - [ ] Simpan hasil ke `alerts` table
- [ ] Buat `src/services/notifications/telegram.service.ts`
  - [ ] `sendMessage(botToken, chatId, message)` — kirim via Telegram Bot API
  - [ ] Template: weekly report
  - [ ] Template: cost spike alert
- [ ] Buat `src/services/notifications/email.service.ts`
  - [ ] Setup Resend client
  - [ ] `sendEmail(to, subject, html)` — kirim via Resend
  - [ ] Template: weekly report
  - [ ] Template: cost spike alert

---

## Routes — Public (SDK)

- [ ] Buat `src/routes/track.route.ts`
  - [ ] `POST /track` — terima single event
    - [ ] Validasi payload (Elysia schema): `feature`, `model`, `provider`, `inputTokens`, `outputTokens`, `latency`
    - [ ] Hitung `estimatedCost` via cost-calculator
    - [ ] Insert ke `events` table (Drizzle)
    - [ ] Trigger async: aggregate daily_metrics
    - [ ] Trigger async: cek threshold → buat alert
    - [ ] Return `200 { success: true }`
  - [ ] `POST /track/batch` — terima array events (max 100)
    - [ ] Validasi setiap item
    - [ ] Bulk insert ke `events` table
    - [ ] Return `200 { inserted: N }`

---

## Routes — Analytics

- [ ] Buat `src/routes/analytics.route.ts`
  - [ ] `GET /analytics/overview`
    - [ ] Query `daily_metrics` untuk period (7/30 hari)
    - [ ] Return: totalSpend, totalRequests, topFeatures, topUsers, trendPercent
  - [ ] `GET /analytics/features`
    - [ ] Group by feature: totalCost, totalRequests, avgLatency, models used
    - [ ] Return array features dengan detail
  - [ ] `GET /analytics/users`
    - [ ] Group by userId: totalCost, totalRequests
    - [ ] Flag high-cost users
    - [ ] Return array users
  - [ ] `GET /analytics/models`
    - [ ] Group by model: totalCost, totalRequests, percentage
    - [ ] Return model distribution
  - [ ] `GET /analytics/daily`
    - [ ] Return daily_metrics per hari untuk chart
    - [ ] Query param: `period` (7 / 30)

---

## Routes — Insights

- [ ] Buat `src/routes/insights.route.ts`
  - [ ] `GET /insights/recommendations`
    - [ ] Query `alerts` table dengan type recommendation
    - [ ] Return max 5 rekomendasi, sorted by severity
  - [ ] `POST /insights/summary`
    - [ ] Ambil analytics data workspace
    - [ ] Generate summary via LLM (OpenAI / Gemini)
    - [ ] Return summary text

---

## Routes — Workspace

- [ ] Buat `src/routes/workspace.route.ts`
  - [ ] `GET /workspace` — get workspace info
  - [ ] `POST /workspace` — create workspace baru
    - [ ] Generate slug dari nama
    - [ ] Insert ke `workspaces` + `workspace_members`
  - [ ] `PATCH /workspace` — update nama workspace

---

## Routes — API Keys

- [ ] Buat `src/routes/api-keys.route.ts`
  - [ ] `GET /api-keys` — list semua API keys workspace
  - [ ] `POST /api-keys` — generate API key baru
    - [ ] Generate random key (`ak_` prefix + 32 char random)
    - [ ] Hash key dengan SHA-256 sebelum simpan
    - [ ] Return key plaintext sekali saja
  - [ ] `DELETE /api-keys/:id` — revoke API key

---

## Routes — Alerts

- [ ] Buat `src/routes/alerts.route.ts`
  - [ ] `GET /alerts` — list alerts workspace
    - [ ] Query param: `unread` (boolean)
  - [ ] `PATCH /alerts/:id/read` — mark as read

---

## Routes — Notifications

- [ ] Buat `src/routes/notifications.route.ts`
  - [ ] `GET /notifications/settings` — get settings
  - [ ] `PUT /notifications/settings` — update Telegram + email settings
    - [ ] Simpan ke `notification_settings` table
  - [ ] `POST /notifications/test` — kirim test notification
    - [ ] Kirim ke Telegram jika configured
    - [ ] Kirim ke email jika configured

---

## Background Jobs (Cron)

- [ ] Setup cron runner (Bun native atau `node-cron`)
- [ ] `aggregate-daily-metrics` — setiap jam
  - [ ] Query events sejak last aggregation
  - [ ] Upsert ke `daily_metrics` (group by workspace + date + feature)
- [ ] `refresh-model-pricing` — setiap 24 jam
  - [ ] Fetch dari OpenRouter API
  - [ ] Update in-memory cache
- [ ] `run-recommendations` — setiap 6 jam
  - [ ] Jalankan `recommendations.service.runRules()` untuk semua workspace aktif
- [ ] `send-weekly-report` — Senin 09.00
  - [ ] Generate summary per workspace
  - [ ] Kirim via Telegram + email
- [ ] `detect-cost-spikes` — setiap 30 menit
  - [ ] Cek daily cost vs average
  - [ ] Buat alert jika > 1.5x average

---

## Entry Point

- [ ] Buat `src/index.ts`
  - [ ] Init Elysia app
  - [ ] Register plugins: auth, rateLimit
  - [ ] Register semua routes
  - [ ] Start cron jobs saat server start
  - [ ] Fetch & cache model pricing saat server start
  - [ ] Listen di `PORT` dari env

---

## Testing & Validasi

- [ ] Test `POST /track` dengan payload valid
- [ ] Test `POST /track` dengan API key tidak valid → expect 401
- [ ] Test `POST /track/batch` dengan 50 events
- [ ] Test `GET /analytics/overview` dengan JWT valid
- [ ] Test rate limiting: kirim > 100 req/menit → expect 429
- [ ] Test generate API key → revoke → pastikan tidak bisa dipakai lagi
- [ ] Test cost calculation untuk beberapa model
- [ ] Test recommendations rule engine dengan data dummy
