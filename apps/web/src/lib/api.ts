import { supabase } from "./supabase"

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ApiKey {
  id: string
  name: string
  key?: string // Only returned on creation
  last_used_at: string | null
  created_at: string
}

async function hashKey(key: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `ack_${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export const workspacesApi = {
  list: async (): Promise<Workspace[]> => {
    const { data, error } = await supabase
      .from("workspaces")
      .select(`
        *,
        workspace_members!inner(user_id)
      `)
      .eq("workspace_members.user_id", (await supabase.auth.getUser()).data.user?.id)
    
    if (error) throw error
    return data || []
  },
  create: async (name: string): Promise<Workspace> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
    
    // 1. Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name, slug })
      .select()
      .single()
    
    if (wsError) throw wsError

    // 2. Add creator as owner member
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner"
      })
    
    if (memberError) throw memberError

    return workspace
  },
  update: async (id: string, name: string): Promise<Workspace> => {
    const { data, error } = await supabase
      .from("workspaces")
      .update({ name })
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

export const apiKeysApi = {
  list: async (workspaceId: string): Promise<ApiKey[]> => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("workspace_id", workspaceId)
    
    if (error) throw error
    return data || []
  },
  create: async (workspaceId: string, name: string): Promise<ApiKey> => {
    const key = generateKey()
    const keyHash = await hashKey(key)
    
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        workspace_id: workspaceId,
        name,
        key_hash: keyHash,
      })
      .select()
      .single()
    
    if (error) throw error
    return { ...data, key }
  },
  revoke: async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
    
    if (error) throw error
    return { success: true }
  },
}

export const metricsApi = {
  getDailyMetrics: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("date", { ascending: true })
    
    if (error) throw error
    return data || []
  },
  getTopFeatures: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from("daily_metrics")
      .select("feature, total_cost, total_requests")
      .eq("workspace_id", workspaceId)
    
    if (error) throw error
    
    // Aggregate by feature
    const aggregated = data.reduce((acc: any, curr) => {
      if (!acc[curr.feature]) {
        acc[curr.feature] = { feature: curr.feature, cost: 0, requests: 0 }
      }
      acc[curr.feature].cost += parseFloat(curr.total_cost)
      acc[curr.feature].requests += curr.total_requests
      return acc
    }, {})
    
    return Object.values(aggregated)
  }
}
