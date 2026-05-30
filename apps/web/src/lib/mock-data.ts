export const mockSpendTrend = [
  { date: "May 24", cost: 42.1 },
  { date: "May 25", cost: 38.5 },
  { date: "May 26", cost: 51.2 },
  { date: "May 27", cost: 47.8 },
  { date: "May 28", cost: 63.4 },
  { date: "May 29", cost: 58.9 },
  { date: "May 30", cost: 71.2 },
]

export const mockFeatureCosts = [
  { feature: "PDF Chat", cost: 241.4, requests: 1842, avgLatency: 1240, profitability: -12 },
  { feature: "AI Summarizer", cost: 182.7, requests: 3201, avgLatency: 890, profitability: 34 },
  { feature: "Support Bot", cost: 134.2, requests: 5420, avgLatency: 620, profitability: 61 },
  { feature: "Content Gen", cost: 98.5, requests: 712, avgLatency: 2100, profitability: -8 },
  { feature: "Image Alt Text", cost: 41.3, requests: 2890, avgLatency: 340, profitability: 78 },
]

export const mockModelUsage = [
  { model: "GPT-4o", cost: 312.4, pct: 44 },
  { model: "Claude 3.5", cost: 198.1, pct: 28 },
  { model: "Gemini 1.5", cost: 112.6, pct: 16 },
  { model: "GPT-3.5", cost: 84.9, pct: 12 },
]

export const mockTopUsers = [
  { userId: "usr_a1b2c3", cost: 48.2, requests: 312, flag: true },
  { userId: "usr_d4e5f6", cost: 31.7, requests: 241, flag: false },
  { userId: "usr_g7h8i9", cost: 28.4, requests: 198, flag: false },
  { userId: "usr_j0k1l2", cost: 22.1, requests: 167, flag: false },
  { userId: "usr_m3n4o5", cost: 19.8, requests: 143, flag: false },
]

export const mockAlerts = [
  {
    id: "alt_1",
    type: "cost_spike",
    severity: "HIGH",
    message: "Sudden AI cost spike detected — PDF Chat costs up 84% in last 2 hours",
    isRead: false,
    createdAt: "2026-05-30T04:12:00Z",
  },
  {
    id: "alt_2",
    type: "unprofitable_feature",
    severity: "HIGH",
    message: "PDF Chat feature profitability dropped below threshold (revenue: $320, cost: $441)",
    isRead: false,
    createdAt: "2026-05-30T02:45:00Z",
  },
  {
    id: "alt_3",
    type: "model_overuse",
    severity: "MEDIUM",
    message: "GPT-4o overusage detected — 44% of requests could use a cheaper model",
    isRead: false,
    createdAt: "2026-05-29T18:30:00Z",
  },
  {
    id: "alt_4",
    type: "prompt_size",
    severity: "MEDIUM",
    message: "Prompt size unusually high in Content Gen feature — avg 4,200 tokens",
    isRead: true,
    createdAt: "2026-05-29T11:00:00Z",
  },
  {
    id: "alt_5",
    type: "high_cost_user",
    severity: "LOW",
    message: "User usr_a1b2c3 cost is 2.4x above average this week",
    isRead: true,
    createdAt: "2026-05-28T09:15:00Z",
  },
]

export const mockInsights = [
  {
    id: "ins_1",
    title: "Switch PDF Chat to GPT-4o-mini",
    description:
      "PDF Chat uses GPT-4o for all requests. 78% of these are simple retrieval tasks that GPT-4o-mini handles equally well at 10x lower cost.",
    estimatedSavings: 182,
    confidence: "HIGH",
    affectedFeature: "PDF Chat",
  },
  {
    id: "ins_2",
    title: "Reduce prompt verbosity in Content Gen",
    description:
      "Content Gen prompts average 4,200 tokens. Trimming system prompts and removing redundant context could reduce this by ~40% with no quality loss.",
    estimatedSavings: 39,
    confidence: "HIGH",
    affectedFeature: "Content Gen",
  },
  {
    id: "ins_3",
    title: "Cache repeated AI Summarizer requests",
    description:
      "23% of AI Summarizer requests are near-identical. Implementing semantic caching would eliminate these redundant API calls.",
    estimatedSavings: 42,
    confidence: "MEDIUM",
    affectedFeature: "AI Summarizer",
  },
  {
    id: "ins_4",
    title: "Set per-user cost limits",
    description:
      "User usr_a1b2c3 accounts for 6.8% of total costs. Adding soft limits or rate throttling for heavy users would protect margins.",
    estimatedSavings: 28,
    confidence: "MEDIUM",
    affectedFeature: null,
  },
]

export const mockApiKeys = [
  {
    id: "key_1",
    name: "Production",
    key: "act_prod_sk_••••••••••••••••3f9a",
    lastUsed: "2026-05-30T04:12:00Z",
    createdAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "key_2",
    name: "Staging",
    key: "act_stg_sk_••••••••••••••••7c2b",
    lastUsed: "2026-05-28T16:40:00Z",
    createdAt: "2026-04-15T00:00:00Z",
  },
]
