import { NextRequest, NextResponse } from "next/server"

const TOKEN_KEY = "acost_token"

const PUBLIC_PATHS = ["/login", "/signup", "/onboarding"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_KEY)?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
