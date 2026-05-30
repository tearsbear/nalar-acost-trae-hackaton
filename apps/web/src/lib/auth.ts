import { supabase } from "./supabase"

export async function apiLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      throw new Error("CONFIRM_EMAIL")
    }
    throw error
  }

  // Sync session to cookie for middleware
  if (data.session) {
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`
  }

  return data
}

export async function apiSignup(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })
  
  if (error) throw error
  
  // If no session is returned, it means email confirmation is required
  if (!data.session) {
    throw new Error("CONFIRM_EMAIL")
  }

  // Sync session to cookie for middleware
  if (data.session) {
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`
  }
  
  return data
}

export async function apiLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  // Clear cookie
  document.cookie = "sb-access-token=; path=/; max-age=0; SameSite=Lax"
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
