# Frontend — Task Todo

## Setup & Infrastruktur

- [ ] Init project Next.js dengan App Router (`pnpm create next-app`)
- [ ] Setup TailwindCSS
- [ ] Install & setup shadcn/ui
- [ ] Install Recharts
- [ ] Setup Supabase client (browser + server)
- [ ] Setup middleware Next.js untuk auth guard
- [ ] Setup environment variables (`.env.local`)
- [ ] Setup folder structure (`app/`, `components/`, `hooks/`, `lib/`, `types/`)

---

## Auth

- [ ] Buat halaman `/login` — form magic link
- [ ] Buat halaman `/signup` — form email signup
- [ ] Implementasi Supabase magic link flow
- [ ] Handle redirect setelah login → `/dashboard`
- [ ] Handle redirect jika belum login → `/login`
- [ ] Buat middleware auth guard untuk semua `/dashboard/*` routes

---

## Onboarding

- [ ] Buat halaman `/onboarding`
- [ ] Step 1: Form input nama workspace
- [ ] Step 2: Tampilkan API key yang baru di-generate
- [ ] Step 3: Tampilkan snippet integrasi (JS/TS, Python, PHP, Go)
- [ ] Copy to clipboard untuk API key & snippet
- [ ] Redirect ke `/dashboard` setelah selesai

---

## Layout & Navigation

- [ ] Buat dashboard layout dengan sidebar
- [ ] Sidebar: link ke Overview, Features, Users, Alerts, Insights, Settings
- [ ] Header: workspace name, user avatar, logout
- [ ] Responsive layout (mobile-friendly)
- [ ] Active state pada sidebar link

---

## Dashboard — Overview (`/dashboard`)

- [ ] Card: Total AI spend bulan ini
- [ ] Card: Total requests bulan ini
- [ ] Card: Top feature by cost
- [ ] Card: Cost trend (naik/turun % vs bulan lalu)
- [ ] `SpendTrendChart` — line chart spend 7/30 hari
- [ ] Tabel top 3 features by cost
- [ ] Tabel top 3 users by cost
- [ ] `SummaryCard` — AI-generated weekly summary
- [ ] `CostBadge` — format cost display
- [ ] `TrendIndicator` — % change indicator
- [ ] Filter toggle: 7 hari / 30 hari

---

## Features Analytics (`/dashboard/features`)

- [ ] `FeatureCostChart` — bar chart cost per feature
- [ ] `FeatureTable` — tabel fitur + cost + requests + avg latency
- [ ] Per-feature detail: model usage, avg tokens
- [ ] Profitability indicator (revenue input optional)
- [ ] Filter: 7 hari / 30 hari / custom range
- [ ] Sort tabel by cost / requests / latency

---

## User Cost Tracking (`/dashboard/users`)

- [ ] `UserCostChart` — bar chart top users by cost
- [ ] `UserTable` — tabel user + cost + requests
- [ ] Flag high-cost user badge (cost > 2x average)
- [ ] Filter: 7 hari / 30 hari

---

## Alerts (`/dashboard/alerts`)

- [ ] `AlertTable` — list alerts + severity + timestamp
- [ ] `SeverityBadge` — HIGH / MEDIUM / LOW dengan warna
- [ ] Mark as read (single & bulk)
- [ ] Filter: unread / all
- [ ] Badge count di sidebar untuk unread alerts

---

## Insights (`/dashboard/insights`)

- [ ] `InsightCard` — rekomendasi + estimated savings + action
- [ ] Badge confidence: HIGH / MEDIUM / LOW
- [ ] Link ke feature/user yang terdampak
- [ ] Tombol "Generate Summary" (trigger on-demand)
- [ ] Empty state jika belum ada rekomendasi

---

## Settings — API Keys (`/dashboard/settings/api-keys`)

- [ ] `ApiKeyTable` — list API keys + nama + last used
- [ ] Form generate API key baru (input nama)
- [ ] Tombol revoke API key (dengan konfirmasi)
- [ ] Copy API key ke clipboard
- [ ] Snippet integrasi per bahasa (JS/TS, Python, PHP, Go)
- [ ] Tab switcher untuk pilih bahasa snippet

---

## Settings — Notifications (`/dashboard/settings/notifications`)

- [ ] Form input Telegram BOT_TOKEN + CHAT_ID
- [ ] Form input email address
- [ ] Toggle: weekly report on/off
- [ ] Toggle: cost spike alert on/off
- [ ] Tombol "Test Notification" (kirim test message)
- [ ] Simpan settings ke backend

---

## Components Shared

- [ ] `CostBadge` — format $0.0042 / $1.24 / $482
- [ ] `SeverityBadge` — HIGH / MEDIUM / LOW
- [ ] `TrendIndicator` — ↑ 14% / ↓ 8%
- [ ] `InsightCard`
- [ ] `SummaryCard`
- [ ] `EmptyState` — tampilan kosong generik
- [ ] `LoadingSkeleton` — skeleton loader untuk charts & tables
- [ ] `ConfirmDialog` — dialog konfirmasi untuk aksi destructive

---

## API Integration (lib/api/)

- [ ] Setup base fetch helper dengan auth header
- [ ] `getOverview(period)` — fetch `/analytics/overview`
- [ ] `getFeatures(period)` — fetch `/analytics/features`
- [ ] `getUsers(period)` — fetch `/analytics/users`
- [ ] `getDailyMetrics(period)` — fetch `/analytics/daily`
- [ ] `getAlerts()` — fetch `/alerts`
- [ ] `markAlertRead(id)` — PATCH `/alerts/:id/read`
- [ ] `getRecommendations()` — fetch `/insights/recommendations`
- [ ] `generateSummary()` — POST `/insights/summary`
- [ ] `getApiKeys()` — fetch `/api-keys`
- [ ] `createApiKey(name)` — POST `/api-keys`
- [ ] `revokeApiKey(id)` — DELETE `/api-keys/:id`
- [ ] `getNotificationSettings()` — fetch `/notifications/settings`
- [ ] `updateNotificationSettings(data)` — PUT `/notifications/settings`
- [ ] `testNotification()` — POST `/notifications/test`

---

## Polish & UX

- [ ] Loading states untuk semua data fetch
- [ ] Error states dengan pesan yang jelas
- [ ] Empty states untuk semua halaman
- [ ] Toast notifications untuk aksi (copy, save, error)
- [ ] Responsive design semua halaman
- [ ] Dark mode support (opsional)
