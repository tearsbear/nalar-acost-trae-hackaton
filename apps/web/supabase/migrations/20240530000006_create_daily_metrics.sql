CREATE TABLE public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feature TEXT NOT NULL,
  total_cost NUMERIC(10, 6) NOT NULL,
  total_requests INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  avg_latency INTEGER NOT NULL,
  UNIQUE(workspace_id, date, feature)
);

CREATE INDEX daily_metrics_workspace_date_idx ON public.daily_metrics (workspace_id, date);
