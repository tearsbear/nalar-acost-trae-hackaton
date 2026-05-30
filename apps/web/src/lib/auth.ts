const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.acost.io/v1"
const TOKEN_KEY = "acost_token"

export function getToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setToken(token: string) {
  const maxAge = 60 * 60 * 24 * 7
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function clearToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? "Login failed")
  }
  const data = await res.json()
  const token: string = data?.session?.access_token
  if (!token) throw new Error("No access token returned")
  setToken(token)
  return data
}

export async function apiSignup(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? "Signup failed")
  }
  return res.json()
}

export function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
