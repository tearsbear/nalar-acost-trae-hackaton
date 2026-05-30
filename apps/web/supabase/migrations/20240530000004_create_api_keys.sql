-- 1. Create table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (DROP IF EXISTS to avoid duplication)
DROP POLICY IF EXISTS "Users can view API keys for their workspaces" ON public.api_keys;
CREATE POLICY "Users can view API keys for their workspaces" ON public.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = public.api_keys.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create API keys for their workspaces" ON public.api_keys;
CREATE POLICY "Users can create API keys for their workspaces" ON public.api_keys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = public.api_keys.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete API keys for their workspaces" ON public.api_keys;
CREATE POLICY "Users can delete API keys for their workspaces" ON public.api_keys
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = public.api_keys.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );
