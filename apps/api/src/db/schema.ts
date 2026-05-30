import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  role: text("role").notNull().default("member"),
});

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
    feature: text("feature").notNull(),
    userId: text("user_id"),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    estimatedCost: numeric("estimated_cost", { precision: 10, scale: 8 }).notNull(),
    latency: integer("latency").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceCreatedAtIdx: index("events_workspace_created_at_idx").on(
      t.workspaceId,
      t.createdAt
    ),
    workspaceFeatureIdx: index("events_workspace_feature_idx").on(
      t.workspaceId,
      t.feature
    ),
  })
);

export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
    date: date("date").notNull(),
    feature: text("feature").notNull(),
    totalCost: numeric("total_cost", { precision: 10, scale: 6 }).notNull(),
    totalRequests: integer("total_requests").notNull(),
    totalTokens: integer("total_tokens").notNull(),
    avgLatency: integer("avg_latency").notNull(),
  },
  (t) => ({
    uniqueMetric: uniqueIndex("daily_metrics_unique_idx").on(
      t.workspaceId,
      t.date,
      t.feature
    ),
    workspaceDateIdx: index("daily_metrics_workspace_date_idx").on(
      t.workspaceId,
      t.date
    ),
  })
);

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().unique().references(() => workspaces.id),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at"),
});
