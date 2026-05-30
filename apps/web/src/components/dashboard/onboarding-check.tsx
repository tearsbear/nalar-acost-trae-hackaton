"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function OnboardingCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only check if we are in the dashboard and not already on onboarding
    if (pathname.startsWith("/dashboard")) {
      const onboarded = localStorage.getItem("acost_onboarded")
      if (onboarded !== "true") {
        router.push("/onboarding")
      }
    }
  }, [pathname, router])

  return null
}
