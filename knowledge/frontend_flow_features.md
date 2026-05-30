# Frontend — Flow & Features

## Stack

- Next.js (App Router)
- TailwindCSS
- shadcn/ui
- Recharts
- pnpm

---

## User Flow

```txt
Landing Page
    ↓
Signup / Login (Supabase Auth — magic link)
    ↓
Onboarding: Create Workspace
    ↓
Generate API Key → Copy snippet
    ↓
Dashboard (Overview)
    ↓
├── Features Analytics
├── User-Level Costs
├── Alerts
├── Optimization Suggestions
└── Settings
```

---

## Pages & Routes

### Public

| Route | Deskripsi |
|---|---|
| `/` | Landing page |
| `/login` | Login dengan magic link |
| `/signup` | Signup baru |

### Dashboard (Protected)

| Route | Deskripsi |
|---|---|
| `/dashboard` | Overview: total spend, trends, summary |
| `/dashboard/features` | Feature-level cost analytics |
| `/dashboard/users` | User-level cost tracking |
| `/dashboard/alerts` | Cost spike alerts & notifications |
| `/dashboard/insights` | AI optimization recommendations |
| `/dashboard/settings` | Workspace settings, API keys, notifications |
| `/dashboard/settings/api-keys` | Generate & manage API keys |
| `/dashboard/settings/notifications` | Setup Telegram & email alerts |
| `/onboarding` | Create workspace + generate first API key |

---

## Features per Page

### `/dashboard` — Overview

- Total AI spend bulan ini
- Spend trend chart (7 hari / 30 hari)
- Top 3 most expensive features
- Top 3 most expensive users
- AI-generated weekly summary (text)
- Cost spike badge jika ada anomali

### `/dashboard/features` — Feature Analytics

- Tabel semua fitur + total cost
- Cost per feature chart (bar chart)
- Per-feature detail: model usage, avg tokens, avg latency
- Profitability indicator (revenue vs cost jika diinput)
- Filter: 7 hari / 30 hari / custom range

### `/dashboard/users` — User Cost Tracking

- Tabel user dengan cost tertinggi
- Cost per user chart
- Flag: high-cost user (cost > 2x average)
- Filter: 7 hari / 30 hari

### `/dashboard/alerts` — Alerts

- List semua alerts (cost spike, unprofitable feature, high-cost user)
- Badge severity: HIGH / MEDIUM / LOW
- Mark as read
- Filter: unread / all

### `/dashboard/insights` — Optimization Suggestions

- List rekomendasi (max 5)
- Per rekomendasi: title, description, estimated savings, action
- Badge confidence: HIGH / MEDIUM / LOW
- Link ke feature/user yang terdampak

### `/dashboard/settings/api-keys`

- List API keys aktif
- Generate API key baru (dengan nama)
- Revoke API key
- Copy installation snippet (JS/TS, Python, PHP, Go)

### `/dashboard/settings/notifications`

- Setup Telegram: input BOT_TOKEN + CHAT_ID
- Setup Email: input email address
- Toggle: weekly report on/off
- Toggle: cost spike alert on/off

### `/onboarding`

- Step 1: Input nama workspace
- Step 2: Generate API key
- Step 3: Copy snippet & instruksi integrasi

---

## Components

### Charts

- `SpendTrendChart` — line chart total spend per hari
- `FeatureCostChart` — bar chart cost per feature
- `ModelUsageChart` — pie chart model distribution
- `UserCostChart` — bar chart top users by cost

### Tables

- `FeatureTable` — fitur + cost + requests + profitability
- `UserTable` — user + cost + requests + flag
- `AlertTable` — alerts + severity + timestamp
- `ApiKeyTable` — api keys + last used + revoke

### UI

- `CostBadge` — format cost ($0.0042 / $1.24 / $482)
- `SeverityBadge` — HIGH / MEDIUM / LOW dengan warna
- `TrendIndicator` — naik/turun % vs periode sebelumnya
- `InsightCard` — rekomendasi dengan estimated savings
- `SummaryCard` — AI-generated weekly summary text

---

## Data Fetching

- Semua dashboard data fetch dari Backend API (Elysia.js)
- Gunakan `fetch` di Server Components untuk data awal
- Gunakan SWR atau React Query untuk client-side refresh
- Auth header: `Authorization: Bearer <supabase_jwt>`

---

## Auth Flow

```txt
User klik "Login"
    ↓
Input email → Supabase kirim magic link
    ↓
User klik link → redirect ke /dashboard
    ↓
Supabase session tersimpan di cookie
    ↓
Middleware Next.js validasi session di setiap request
    ↓
Jika tidak ada session → redirect ke /login
```

---

## State Management

- Server Components untuk data statis (dashboard awal)
- Client Components untuk interaktif (charts, tables dengan filter)
- Supabase client untuk auth state
- URL params untuk filter (period, feature, dll)
