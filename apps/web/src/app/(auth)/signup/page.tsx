"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FaultyTerminal } from "@/components/ui/faulty-terminal"
import { apiSignup, apiLogin } from "@/lib/auth"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiSignup(email, password, name)
      await apiLogin(email, password)
      router.push("/onboarding")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#000000] flex items-center justify-center px-4">
      <FaultyTerminal
        tint="#ffffff"
        brightness={0.18}
        scale={1.8}
        digitSize={1.0}
        timeScale={0.4}
        scanlineIntensity={0.6}
        glitchAmount={0.8}
        flickerAmount={1}
        noiseAmp={0.8}
        curvature={0.05}
        mouseReact={true}
        mouseStrength={0.3}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-[8px] bg-white">
                <span className="text-[12px] font-bold text-black">AI</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">Acost</span>
            </div>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Start tracking AI costs in minutes
          </p>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-[8px] border border-[#c22b10]/30 bg-[#c22b10]/10 px-3 py-2 text-xs text-[#ff6b4a]">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 rounded-[10px] border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-[10px] border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 w-full rounded-[10px] border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/70" htmlFor="confirm">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="h-10 w-full rounded-[10px] border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full rounded-[10px] bg-white text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/30">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white/60 hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/20">
          By creating an account you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
