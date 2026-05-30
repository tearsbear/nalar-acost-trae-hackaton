-- 1. Create table (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  UNIQUE(user_id, workspace_id)
);

-- 2. Enable RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (DROP IF EXISTS to avoid duplication)
DROP POLICY IF EXISTS "Users can view fellow workspace members" ON public.workspace_members;
CREATE POLICY "Users can view fellow workspace members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can join/be added to workspaces" ON public.workspace_members;
CREATE POLICY "Authenticated users can join/be added to workspaces" ON public.workspace_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
